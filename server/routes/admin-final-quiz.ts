/**
 * Admin routes for managing the final quiz (quiz de certification) of a course.
 *
 * Flow: the instructor uploads the course PDF → Claude generates a pool of
 * 30 MCQ questions → we store the pool in `final_quizzes`. Each student
 * attempt later draws 10 questions randomly from that pool.
 *
 * Routes (all protected by requireAdminAuth):
 *   GET    /api/admin/courses/:id/final-quiz           — read current pool
 *   POST   /api/admin/courses/:id/final-quiz/generate  — upload PDF + generate
 *   DELETE /api/admin/courses/:id/final-quiz           — clear pool (for regen)
 */
import { Router } from 'express';
import multer from 'multer';
import { requireAdminAuth } from '../auth';
import { storage } from '../storage';
import {
  generateQuizFromPdf,
  describeAiError,
  MAX_PDF_SIZE_BYTES,
} from '../ai/quiz-generator';
import { FINAL_QUIZ_POOL_SIZE } from '@shared/schema';

const router = Router();

// In-memory storage — PDFs are forwarded straight to Claude as base64; we
// never need to persist the file itself. 30 MB ceiling matches the AI limit.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_PDF_SIZE_BYTES,
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('ONLY_PDF_ACCEPTED'));
    }
    cb(null, true);
  },
});

/**
 * GET /api/admin/courses/:id/final-quiz
 * Returns the current pool summary for the given course (without exposing
 * the full questions content in this endpoint — instructors can regenerate,
 * not browse individually — kept minimal for now).
 */
router.get('/:id/final-quiz', requireAdminAuth(), async (req, res) => {
  try {
    const courseId = req.params.id;
    const course = await storage.getCourseById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Formation introuvable.' });
    }

    const quiz = await storage.getFinalQuizByCourseId(courseId);
    if (!quiz) {
      return res.json({ exists: false });
    }

    return res.json({
      exists: true,
      id: quiz.id,
      questionsCount: quiz.questionsCount,
      sourcePdfName: quiz.sourcePdfName,
      sourcePdfSizeBytes: quiz.sourcePdfSizeBytes,
      aiModel: quiz.aiModel,
      generatedAt: quiz.generatedAt,
      updatedAt: quiz.updatedAt,
    });
  } catch (err) {
    console.error('[ADMIN-FINAL-QUIZ] GET error:', err);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

/**
 * POST /api/admin/courses/:id/final-quiz/generate
 * Accepts: multipart/form-data with a `pdf` field.
 * Triggers Claude generation and upserts the pool.
 */
router.post(
  '/:id/final-quiz/generate',
  requireAdminAuth(),
  // Wrap multer to translate its errors into our JSON format
  (req, res, next) => {
    upload.single('pdf')(req, res, (err: any) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({ error: 'Le fichier PDF dépasse 30 Mo.' });
        }
        if (err.message === 'ONLY_PDF_ACCEPTED') {
          return res.status(415).json({ error: 'Seuls les fichiers PDF sont acceptés.' });
        }
        console.error('[ADMIN-FINAL-QUIZ] Upload error:', err);
        return res.status(400).json({ error: 'Erreur de téléversement du fichier.' });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      const courseId = req.params.id;
      const course = await storage.getCourseById(courseId);
      if (!course) {
        return res.status(404).json({ error: 'Formation introuvable.' });
      }

      const file = (req as any).file as Express.Multer.File | undefined;
      if (!file) {
        return res.status(400).json({ error: 'Aucun fichier PDF fourni.' });
      }

      // Call Claude. Errors surface as 'AI_*' codes — translate to FR.
      let result;
      try {
        result = await generateQuizFromPdf({
          pdfBuffer: file.buffer,
          courseTitle: course.title,
          poolSize: FINAL_QUIZ_POOL_SIZE,
        });
      } catch (err: any) {
        const code: string = err?.message || 'AI_UNKNOWN';
        const userMessage = describeAiError(code);
        // 400 for client-fixable issues, 502 for Claude API failures.
        const status =
          code === 'AI_NO_API_KEY' ? 500 :
          code === 'AI_API_ERROR' ? 502 :
          400;
        return res.status(status).json({ error: userMessage, code });
      }

      // Persist (upsert — regenerating overwrites).
      const saved = await storage.upsertFinalQuiz({
        courseId,
        questions: result.questions,
        questionsCount: result.questions.length,
        sourcePdfName: file.originalname,
        sourcePdfSizeBytes: file.size,
        aiModel: result.model,
      });

      return res.status(201).json({
        message: 'Quiz généré avec succès.',
        id: saved.id,
        questionsCount: saved.questionsCount,
        sourcePdfName: saved.sourcePdfName,
        sourcePdfSizeBytes: saved.sourcePdfSizeBytes,
        aiModel: saved.aiModel,
        generatedAt: saved.generatedAt,
        updatedAt: saved.updatedAt,
        usage: {
          inputTokens: result.inputTokens,
          outputTokens: result.outputTokens,
        },
      });
    } catch (err) {
      console.error('[ADMIN-FINAL-QUIZ] Generate error:', err);
      res.status(500).json({ error: 'Erreur interne du serveur.' });
    }
  },
);

/**
 * DELETE /api/admin/courses/:id/final-quiz
 * Clears the pool for a course. Use case: admin wants to upload a different
 * PDF and regenerate from scratch. (The POST route also overwrites, so DELETE
 * is mainly an explicit "reset" action.)
 */
router.delete('/:id/final-quiz', requireAdminAuth(), async (req, res) => {
  try {
    const courseId = req.params.id;
    const course = await storage.getCourseById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Formation introuvable.' });
    }

    const deleted = await storage.deleteFinalQuizByCourseId(courseId);
    if (!deleted) {
      return res.status(404).json({ error: 'Aucun quiz à supprimer pour cette formation.' });
    }

    res.json({ message: 'Quiz supprimé avec succès.' });
  } catch (err) {
    console.error('[ADMIN-FINAL-QUIZ] Delete error:', err);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

export default router;
