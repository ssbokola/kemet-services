/**
 * AI Quiz Generator — generates a pool of MCQ questions from a course PDF
 * using Claude. Called from the admin route when an instructor uploads the
 * course material.
 *
 * Strategy: send the PDF to Claude as a base64 `document` block (Claude
 * reads PDFs natively, no local text extraction needed — same approach as
 * our existing kemet-quiz reference app).
 *
 * Pool size: 30 questions (each student's attempt draws 10 randomly).
 *
 * Required env var: ANTHROPIC_API_KEY
 */
import Anthropic from '@anthropic-ai/sdk';
import type { FinalQuizQuestion } from '@shared/schema';
import { FINAL_QUIZ_POOL_SIZE } from '@shared/schema';

/**
 * Claude model used for generation. Pinned to a specific version for
 * reproducibility. Update carefully — newer models may change prompt
 * adherence and JSON-strict output quality.
 */
const CLAUDE_MODEL = 'claude-sonnet-4-20250514';

/** Maximum PDF size accepted, in bytes. 30 MB matches the ref app. */
export const MAX_PDF_SIZE_BYTES = 30 * 1024 * 1024;

/** Maximum tokens Claude may output. 30 questions w/ explanations ≈ 6k tokens. */
const MAX_OUTPUT_TOKENS = 8000;

function buildPrompt(courseTitle: string, poolSize: number): string {
  return `Tu es un générateur de quiz pédagogique expert pour une plateforme de formation professionnelle pharmaceutique.

À partir du contenu du document joint, génère EXACTEMENT ${poolSize} questions à choix multiple (QCM) destinées à évaluer la compréhension de l'apprenant ayant suivi la formation intitulée : « ${courseTitle} ».

Consignes strictes :
- Chaque question doit avoir exactement 4 options (A, B, C, D)
- Une seule bonne réponse par question
- Les 3 options incorrectes (distracteurs) doivent être plausibles et tirées du domaine du document — pas absurdes
- Varier la difficulté : environ 30% faciles, 50% moyennes, 20% difficiles
- Couvrir l'ensemble des thèmes et concepts du document, pas seulement une partie
- Formuler les questions en français, de manière claire et sans ambiguïté
- Éviter les questions-piège injustes ou les formulations tordues
- Inclure une brève explication (1-2 phrases) de la bonne réponse, utile pour le feedback pédagogique

Ta réponse doit être UNIQUEMENT du JSON valide, au format exact suivant, sans markdown, sans texte avant ou après :

{
  "questions": [
    {
      "question": "Formulation de la question ?",
      "options": ["A) première option", "B) deuxième option", "C) troisième option", "D) quatrième option"],
      "answer": "A",
      "explanation": "Justification brève de la bonne réponse."
    }
  ]
}

Le tableau "questions" doit contenir EXACTEMENT ${poolSize} éléments. Commence directement par l'accolade ouvrante.`;
}

/** Result of a successful generation. */
export interface QuizGenerationResult {
  questions: FinalQuizQuestion[];
  model: string;
  inputTokens?: number;
  outputTokens?: number;
}

/**
 * Generate a quiz pool from a PDF buffer.
 * @throws Error with prefix 'AI_' for expected failures (missing key, bad PDF, bad JSON, wrong count)
 */
export async function generateQuizFromPdf(params: {
  pdfBuffer: Buffer;
  courseTitle: string;
  poolSize?: number;
}): Promise<QuizGenerationResult> {
  const { pdfBuffer, courseTitle } = params;
  const poolSize = params.poolSize ?? FINAL_QUIZ_POOL_SIZE;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('AI_NO_API_KEY');
  }

  if (pdfBuffer.length === 0) {
    throw new Error('AI_EMPTY_PDF');
  }
  if (pdfBuffer.length > MAX_PDF_SIZE_BYTES) {
    throw new Error('AI_PDF_TOO_LARGE');
  }

  const client = new Anthropic({ apiKey });
  const pdfBase64 = pdfBuffer.toString('base64');
  const prompt = buildPrompt(courseTitle, poolSize);

  let response;
  try {
    response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: MAX_OUTPUT_TOKENS,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: pdfBase64,
              },
            },
            { type: 'text', text: prompt },
          ],
        },
      ],
    });
  } catch (err: any) {
    console.error('[QUIZ-GEN] Claude API error:', err?.message || err);
    throw new Error('AI_API_ERROR');
  }

  // Extract text from the first text block
  const textBlock = response.content.find((block: any) => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    console.error('[QUIZ-GEN] No text block in response');
    throw new Error('AI_NO_TEXT_RESPONSE');
  }

  const rawText = textBlock.text.trim();

  // Claude sometimes wraps JSON in markdown despite the prompt — strip it
  const jsonText = rawText
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();

  let parsed: { questions: unknown };
  try {
    parsed = JSON.parse(jsonText);
  } catch (err) {
    console.error('[QUIZ-GEN] Invalid JSON. First 500 chars:', jsonText.slice(0, 500));
    throw new Error('AI_INVALID_JSON');
  }

  if (!parsed || !Array.isArray(parsed.questions)) {
    throw new Error('AI_MISSING_QUESTIONS_ARRAY');
  }

  const validated = validateQuestions(parsed.questions);

  // Strict count check — if Claude returned fewer/more than asked, reject so
  // the admin can regenerate. We don't silently truncate because coverage matters.
  if (validated.length !== poolSize) {
    console.error(`[QUIZ-GEN] Expected ${poolSize} questions, got ${validated.length}`);
    throw new Error('AI_WRONG_QUESTION_COUNT');
  }

  return {
    questions: validated,
    model: CLAUDE_MODEL,
    inputTokens: response.usage?.input_tokens,
    outputTokens: response.usage?.output_tokens,
  };
}

/** Validates + normalizes each raw question from Claude. Drops malformed items. */
function validateQuestions(raw: unknown[]): FinalQuizQuestion[] {
  const valid: FinalQuizQuestion[] = [];

  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const q = item as Record<string, unknown>;

    const question = typeof q.question === 'string' ? q.question.trim() : null;
    const options = Array.isArray(q.options) ? q.options : null;
    const answer = typeof q.answer === 'string' ? q.answer.trim().toUpperCase() : null;
    const explanation = typeof q.explanation === 'string' ? q.explanation.trim() : undefined;

    if (!question) continue;
    if (!options || options.length !== 4) continue;
    if (!options.every((o: unknown) => typeof o === 'string' && o.trim().length > 0)) continue;
    if (!answer || !['A', 'B', 'C', 'D'].includes(answer)) continue;

    valid.push({
      question,
      options: options.map((o: unknown) => String(o).trim()),
      answer: answer as 'A' | 'B' | 'C' | 'D',
      ...(explanation ? { explanation } : {}),
    });
  }

  return valid;
}

/**
 * Human-readable error message for each AI_* error code (French, for the admin UI).
 */
export function describeAiError(errorCode: string): string {
  switch (errorCode) {
    case 'AI_NO_API_KEY':
      return 'Clé API Anthropic non configurée sur le serveur (ANTHROPIC_API_KEY manquante).';
    case 'AI_EMPTY_PDF':
      return 'Le fichier PDF est vide.';
    case 'AI_PDF_TOO_LARGE':
      return 'Le fichier PDF dépasse la taille maximale autorisée (30 Mo).';
    case 'AI_API_ERROR':
      return 'Erreur de communication avec Claude. Réessayez dans un instant.';
    case 'AI_NO_TEXT_RESPONSE':
      return 'Claude n\'a pas renvoyé de contenu textuel exploitable.';
    case 'AI_INVALID_JSON':
      return 'Claude a renvoyé une réponse au format invalide. Relancez la génération.';
    case 'AI_MISSING_QUESTIONS_ARRAY':
      return 'La réponse de Claude ne contient pas la structure attendue (tableau "questions").';
    case 'AI_WRONG_QUESTION_COUNT':
      return 'Claude n\'a pas généré le bon nombre de questions. Relancez la génération.';
    default:
      return 'Erreur inconnue lors de la génération du quiz.';
  }
}
