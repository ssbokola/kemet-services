/**
 * Student-facing routes for the final quiz (quiz de certification).
 *
 * Flow:
 *   1. GET  /api/final-quiz/:courseId/status    — can I attempt? when's cooldown over? best score?
 *   2. POST /api/final-quiz/:courseId/start     — draw 10 random Qs, shuffle A/B/C/D, create attempt
 *   3. POST /api/final-quiz/attempts/:id/submit — grade answers, mark pass/fail, trigger cert on pass
 *
 * Business rules:
 *   - The student must be enrolled in the course (getEnrollment).
 *   - Unlimited retries but 1 hour cooldown between the starts of consecutive
 *     attempts (FINAL_QUIZ_COOLDOWN_MS in schema).
 *   - Pass = score >= 8/10 (FINAL_QUIZ_PASS_THRESHOLD).
 *   - We draw 10 questions (FINAL_QUIZ_QUESTIONS_PER_ATTEMPT) from the pool
 *     of 30 and shuffle both the order AND each question's A/B/C/D options.
 *     The shuffled snapshot is stored on the attempt so grading + display
 *     later use the exact version the student saw.
 *   - Correct answers are NEVER sent to the client while an attempt is in
 *     progress. They're only returned after submission as part of the result.
 */
import { Router } from 'express';
import { isAuthenticated } from '../replitAuth';
import { storage } from '../storage';
import { db } from '../db';
import { eq, and } from 'drizzle-orm';
import { sendCertificateEmail } from '../emails/certificate-delivery';
import {
  type FinalQuizQuestion,
  type FinalQuizAnswerSnapshot,
  FINAL_QUIZ_PASS_THRESHOLD,
  FINAL_QUIZ_QUESTIONS_PER_ATTEMPT,
  FINAL_QUIZ_COOLDOWN_MS,
  enrollments,
  certificates,
} from '@shared/schema';

const router = Router();

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/** Fisher-Yates shuffle — returns a new array, does not mutate. */
function shuffle<T>(input: T[]): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Shuffle a single question's options and remap the correct answer letter.
 * The raw options are stored as ["A) ...", "B) ...", "C) ...", "D) ..."].
 * After shuffle we rewrite the prefixes so the student always sees A/B/C/D
 * in order, and we recompute which letter corresponds to the original
 * correct answer.
 */
function shuffleQuestionOptions(q: FinalQuizQuestion): FinalQuizQuestion {
  // Strip any existing "A) " / "B) " prefix so we can reapply cleanly.
  const stripped = q.options.map((opt) => opt.replace(/^[A-D]\)\s*/i, ''));

  // Pair each option text with its original letter (A/B/C/D) so we can
  // locate the correct one after shuffling.
  const pairs = stripped.map((text, idx) => ({
    text,
    originalLetter: (['A', 'B', 'C', 'D'][idx] as 'A' | 'B' | 'C' | 'D'),
  }));

  const shuffled = shuffle(pairs);

  // Rewrite with new A/B/C/D prefixes and recompute correct letter.
  const newLetters: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
  const newOptions = shuffled.map((p, i) => `${newLetters[i]}) ${p.text}`);
  const newAnswerIdx = shuffled.findIndex((p) => p.originalLetter === q.answer);
  const newAnswer = newLetters[newAnswerIdx >= 0 ? newAnswerIdx : 0];

  return {
    question: q.question,
    options: newOptions,
    answer: newAnswer,
    explanation: q.explanation,
  };
}

/** Strip correct answers + explanations from a question for client display. */
function publicQuestion(q: FinalQuizQuestion): { question: string; options: string[] } {
  return {
    question: q.question,
    options: q.options,
  };
}

/** Generate a verification code in the format KMT-YYYY-NNNN (zero-padded). */
function generateVerificationCode(): string {
  const year = new Date().getFullYear();
  // 4-digit random — collisions are tolerable (DB unique index will reject dups
  // and the caller can retry). Simpler + more readable than a sequence table.
  const n = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `KMT-${year}-${n}`;
}

// ----------------------------------------------------------------------
// Middleware: require authenticated + enrolled in course
// ----------------------------------------------------------------------

async function requireEnrollment(req: any, res: any, next: any) {
  try {
    const userId = req.user?.claims?.sub;
    const courseId = req.params.courseId || req.body?.courseId;
    if (!userId) return res.status(401).json({ error: 'Authentification requise.' });
    if (!courseId) return res.status(400).json({ error: 'ID de formation manquant.' });

    const enrollment = await storage.getEnrollment(userId, courseId);
    if (!enrollment) {
      return res.status(403).json({
        error: "Vous n'êtes pas inscrit à cette formation.",
      });
    }
    req.enrollment = enrollment;
    next();
  } catch (err) {
    console.error('[FINAL-QUIZ] Enrollment check error:', err);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
}

// ----------------------------------------------------------------------
// GET /api/final-quiz/:courseId/status
// Returns everything the client needs to decide: is the quiz ready,
// is there a cooldown, has the student already passed, best score, etc.
// ----------------------------------------------------------------------

router.get('/:courseId/status', isAuthenticated, requireEnrollment, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const courseId = req.params.courseId;

    const quiz = await storage.getFinalQuizByCourseId(courseId);
    if (!quiz) {
      return res.json({
        exists: false,
        message: "Le quiz de certification n'est pas encore disponible pour cette formation.",
      });
    }

    const attempts = await storage.getFinalQuizAttemptsByUser(userId, courseId);
    const lastAttempt = attempts[0]; // getFinalQuizAttemptsByUser returns desc by startedAt

    // Check cooldown: the student cannot START a new attempt until 1h after
    // the previous START. (We gate on startedAt so students can't farm retries
    // by starting and immediately abandoning.)
    let cooldownUntil: Date | null = null;
    if (lastAttempt) {
      const cooldownEnd = new Date(lastAttempt.startedAt.getTime() + FINAL_QUIZ_COOLDOWN_MS);
      if (cooldownEnd > new Date()) cooldownUntil = cooldownEnd;
    }

    // Best score (among submitted attempts only — null scores mean in-progress).
    const submitted = attempts.filter((a) => a.score !== null && a.score !== undefined);
    const bestScore = submitted.length
      ? Math.max(...submitted.map((a) => a.score as number))
      : null;
    const hasPassed = submitted.some((a) => a.passed === true);

    res.json({
      exists: true,
      questionsPerAttempt: FINAL_QUIZ_QUESTIONS_PER_ATTEMPT,
      passThreshold: FINAL_QUIZ_PASS_THRESHOLD,
      totalAttempts: attempts.length,
      bestScore,
      hasPassed,
      cooldownUntil: cooldownUntil ? cooldownUntil.toISOString() : null,
      // Surface the last attempt summary for the UI history list
      lastAttempt: lastAttempt
        ? {
            id: lastAttempt.id,
            score: lastAttempt.score,
            passed: lastAttempt.passed,
            startedAt: lastAttempt.startedAt,
            submittedAt: lastAttempt.submittedAt,
          }
        : null,
      recentAttempts: submitted.slice(0, 5).map((a) => ({
        id: a.id,
        score: a.score,
        passed: a.passed,
        startedAt: a.startedAt,
        submittedAt: a.submittedAt,
      })),
    });
  } catch (err) {
    console.error('[FINAL-QUIZ] Status error:', err);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// ----------------------------------------------------------------------
// POST /api/final-quiz/:courseId/start
// Draws 10 questions, shuffles them + their options, creates an attempt.
// Returns the attempt id + the 10 questions WITHOUT correct answers.
// ----------------------------------------------------------------------

router.post('/:courseId/start', isAuthenticated, requireEnrollment, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const courseId = req.params.courseId;

    const quiz = await storage.getFinalQuizByCourseId(courseId);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz introuvable pour cette formation.' });
    }

    // Enforce cooldown: 1h between the starts of consecutive attempts.
    const lastAttempt = await storage.getLastFinalQuizAttempt(userId, courseId);
    if (lastAttempt) {
      const cooldownEnd = new Date(lastAttempt.startedAt.getTime() + FINAL_QUIZ_COOLDOWN_MS);
      if (cooldownEnd > new Date()) {
        return res.status(429).json({
          error: 'Vous devez attendre avant de relancer une nouvelle tentative.',
          cooldownUntil: cooldownEnd.toISOString(),
        });
      }
      // Also — if the student has a previous attempt still "in progress"
      // (no submittedAt), we let them start a new one (the old one stays
      // orphaned as started-but-not-submitted — acceptable trade-off vs.
      // forcing them back into a stale attempt they may have abandoned).
    }

    const pool = (quiz.questions || []) as FinalQuizQuestion[];
    if (pool.length < FINAL_QUIZ_QUESTIONS_PER_ATTEMPT) {
      console.error(
        `[FINAL-QUIZ] Pool has only ${pool.length} questions for course ${courseId}`,
      );
      return res.status(500).json({
        error: 'Le pool de questions est incomplet. Contactez un administrateur.',
      });
    }

    // Draw N random questions + shuffle each question's options.
    const drawn = shuffle(pool).slice(0, FINAL_QUIZ_QUESTIONS_PER_ATTEMPT);
    const snapshot: FinalQuizQuestion[] = drawn.map(shuffleQuestionOptions);

    const attempt = await storage.createFinalQuizAttempt({
      userId,
      courseId,
      finalQuizId: quiz.id,
      questionsSnapshot: snapshot,
      total: FINAL_QUIZ_QUESTIONS_PER_ATTEMPT,
    });

    // Strip correct answers before sending to client.
    const publicQuestions = snapshot.map(publicQuestion);

    res.status(201).json({
      attemptId: attempt.id,
      questions: publicQuestions,
      questionsCount: publicQuestions.length,
      passThreshold: FINAL_QUIZ_PASS_THRESHOLD,
      startedAt: attempt.startedAt,
    });
  } catch (err) {
    console.error('[FINAL-QUIZ] Start error:', err);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// ----------------------------------------------------------------------
// POST /api/final-quiz/attempts/:id/submit
// Body: { answers: Array<'A'|'B'|'C'|'D'|null> } — same order as the snapshot.
// Grades on the server using the snapshot's stored correct answer.
// ----------------------------------------------------------------------

router.post('/attempts/:id/submit', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const attemptId = req.params.id;

    const attempt = await storage.getFinalQuizAttemptById(attemptId);
    if (!attempt) {
      return res.status(404).json({ error: 'Tentative introuvable.' });
    }
    if (attempt.userId !== userId) {
      return res.status(403).json({ error: 'Cette tentative ne vous appartient pas.' });
    }
    if (attempt.submittedAt) {
      return res.status(409).json({ error: 'Cette tentative est déjà soumise.' });
    }

    const snapshot = (attempt.questionsSnapshot || []) as FinalQuizQuestion[];
    const rawAnswers: unknown = req.body?.answers;
    if (!Array.isArray(rawAnswers) || rawAnswers.length !== snapshot.length) {
      return res.status(400).json({
        error: `Format des réponses invalide (attendu : ${snapshot.length} réponses).`,
      });
    }

    // Validate each answer shape — 'A'|'B'|'C'|'D'|null (null = unanswered).
    const cleanAnswers: (('A' | 'B' | 'C' | 'D') | null)[] = rawAnswers.map((a) => {
      if (a === null || a === undefined) return null;
      if (typeof a !== 'string') return null;
      const upper = a.trim().toUpperCase();
      return (['A', 'B', 'C', 'D'].includes(upper) ? (upper as 'A' | 'B' | 'C' | 'D') : null);
    });

    // Grade.
    let score = 0;
    const answersSnapshot: FinalQuizAnswerSnapshot[] = snapshot.map((q, i) => {
      const userAnswer = cleanAnswers[i];
      const isCorrect = userAnswer !== null && userAnswer === q.answer;
      if (isCorrect) score += 1;
      return {
        questionIndex: i,
        userAnswer,
        correctAnswer: q.answer,
        isCorrect,
      };
    });

    const passed = score >= FINAL_QUIZ_PASS_THRESHOLD;
    const submittedAt = new Date();

    const updated = await storage.submitFinalQuizAttempt(attemptId, {
      score,
      passed,
      answersSnapshot,
      submittedAt,
    });

    // On pass: mark enrollment as 100% complete + create a certificate stub.
    // The actual PDF URL is filled in by Lot 3 (we only create the DB record
    // with the verification code here so the record exists as soon as the
    // student earns it).
    let certificate: { verificationCode: string; id: string } | null = null;
    if (passed) {
      try {
        // Complete the enrollment (idempotent — setting to 100 is fine on
        // repeat calls).
        await db
          .update(enrollments)
          .set({ progressPercent: 100, completedAt: submittedAt })
          .where(and(
            eq(enrollments.userId, userId),
            eq(enrollments.courseId, attempt.courseId),
          ));

        // Check if a certificate already exists for this enrollment
        // (e.g. student passed a second time) — don't create a duplicate.
        const [existingCert] = await db
          .select()
          .from(certificates)
          .where(and(
            eq(certificates.userId, userId),
            eq(certificates.courseId, attempt.courseId),
          ))
          .limit(1);

        if (existingCert) {
          certificate = {
            id: existingCert.id,
            verificationCode: existingCert.verificationCode,
          };
        } else {
          // Create new certificate stub. The PDF URL is filled in Lot 3.
          // Retry up to 3 times on verification code collision.
          let created = null;
          for (let retry = 0; retry < 3 && !created; retry++) {
            try {
              const verificationCode = generateVerificationCode();
              const certificateNumber = verificationCode; // reuse as human-readable number
              const [row] = await db
                .insert(certificates)
                .values({
                  userId,
                  courseId: attempt.courseId,
                  certificateNumber,
                  verificationCode,
                  finalScore: Math.round((score / snapshot.length) * 100),
                  completedAt: submittedAt,
                  pdfUrl: null,
                })
                .returning();
              created = row;
            } catch (e: any) {
              // Duplicate verification code — retry with a new one.
              if (retry === 2) throw e;
            }
          }
          if (created) {
            certificate = {
              id: created.id,
              verificationCode: created.verificationCode,
            };

            // Fire-and-forget : envoi de l'email de délivrance. On ne bloque
            // pas la réponse, et on ne renvoie l'email qu'à la création
            // initiale du cert (pas sur les re-passages réussis).
            const newCode = created.verificationCode;
            (async () => {
              try {
                const ctx = await storage.getCertificateWithContext(newCode);
                if (!ctx?.holder.email) {
                  console.warn(
                    `[FINAL-QUIZ] Cert ${newCode} : pas d'email pour le titulaire, skip envoi.`,
                  );
                  return;
                }
                const baseUrl = (
                  process.env.APP_BASE_URL ||
                  (process.env.NODE_ENV === 'production'
                    ? 'https://kemetservices.com'
                    : 'http://localhost:5000')
                ).replace(/\/$/, '');

                await sendCertificateEmail({
                  to: ctx.holder.email,
                  firstName: ctx.holder.firstName,
                  courseTitle: ctx.course.title,
                  finalScore: ctx.certificate.finalScore,
                  verificationCode: ctx.certificate.verificationCode,
                  baseUrl,
                });
              } catch (emailErr) {
                console.error(
                  '[FINAL-QUIZ] Cert email send failed (non-fatal):',
                  emailErr,
                );
              }
            })();
          }
        }
      } catch (certErr) {
        // Don't fail the submit if certificate creation hiccups — the student
        // still sees their result. Log loudly so we can fix.
        console.error('[FINAL-QUIZ] Cert creation failed after pass:', certErr);
      }
    }

    // Build the per-question correction for the UI — now that the attempt
    // is submitted, we can safely return everything.
    const review = snapshot.map((q, i) => ({
      index: i,
      question: q.question,
      options: q.options,
      userAnswer: cleanAnswers[i],
      correctAnswer: q.answer,
      isCorrect: answersSnapshot[i].isCorrect,
      explanation: q.explanation,
    }));

    res.json({
      attemptId: updated?.id,
      score,
      total: snapshot.length,
      passed,
      passThreshold: FINAL_QUIZ_PASS_THRESHOLD,
      submittedAt,
      review,
      certificate, // null if failed, { id, verificationCode } if passed
    });
  } catch (err) {
    console.error('[FINAL-QUIZ] Submit error:', err);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

export default router;
