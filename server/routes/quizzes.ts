import { Router } from 'express';
import { storage } from '../storage';
import { insertQuizSchema, insertQuizQuestionSchema } from '@shared/schema';
import { z } from 'zod';

const router = Router();

// GET /api/quizzes/:id - Détail d'un quiz avec questions (auth required)
router.get('/:id', async (req: any, res) => {
  try {
    // Check authentication
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentification requise' 
      });
    }

    const { id } = req.params;
    const quiz = await storage.getQuizById(id);
    
    if (!quiz) {
      return res.status(404).json({ 
        success: false, 
        error: 'Quiz non trouvé' 
      });
    }
    
    // Get questions for this quiz but HIDE correct answers
    const questions = await storage.getQuestionsByQuizId(id);
    const questionsWithoutAnswers = questions.map(q => ({
      id: q.id,
      questionText: q.questionText,
      questionType: q.questionType,
      options: q.options,
      points: q.points,
      order: q.order,
      // correctAnswer is NOT included - only revealed after submission
    }));
    
    res.json({ 
      success: true, 
      quiz: {
        ...quiz,
        questions: questionsWithoutAnswers
      }
    });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de la récupération du quiz' 
    });
  }
});

// GET /api/quizzes/lesson/:lessonId - Quiz d'une leçon (auth required + progression check)
router.get('/lesson/:lessonId', async (req: any, res) => {
  try {
    // Check authentication
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentification requise' 
      });
    }

    const { lessonId } = req.params;
    const userId = req.user.claims.sub;
    
    // Check if lesson is accessible
    const accessible = await storage.isLessonAccessible(userId, lessonId);
    if (!accessible) {
      return res.status(403).json({ 
        success: false, 
        error: 'Vous devez compléter les leçons précédentes pour accéder à ce quiz' 
      });
    }
    
    const quiz = await storage.getQuizByLessonId(lessonId);
    
    if (!quiz) {
      return res.status(404).json({ 
        success: false, 
        error: 'Aucun quiz trouvé pour cette leçon' 
      });
    }
    
    // Get questions but HIDE correct answers
    const questions = await storage.getQuestionsByQuizId(quiz.id);
    const questionsWithoutAnswers = questions.map(q => ({
      id: q.id,
      questionText: q.questionText,
      questionType: q.questionType,
      options: q.options,
      points: q.points,
      order: q.order,
    }));
    
    res.json({ 
      success: true, 
      quiz: {
        ...quiz,
        questions: questionsWithoutAnswers
      }
    });
  } catch (error) {
    console.error('Error fetching lesson quiz:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de la récupération du quiz' 
    });
  }
});

// GET /api/quizzes/course/:courseId/final - Quiz final d'un cours (auth required + enrollment check)
router.get('/course/:courseId/final', async (req: any, res) => {
  try {
    // Check authentication
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentification requise' 
      });
    }

    const { courseId } = req.params;
    const userId = req.user.claims.sub;
    
    // Check if user is enrolled in the course
    const enrollment = await storage.getEnrollment(userId, courseId);
    if (!enrollment) {
      return res.status(403).json({ 
        success: false, 
        error: 'Vous devez être inscrit à ce cours pour accéder au quiz final' 
      });
    }
    
    const quiz = await storage.getQuizByCourseId(courseId);
    
    if (!quiz) {
      return res.status(404).json({ 
        success: false, 
        error: 'Aucun quiz final trouvé pour ce cours' 
      });
    }
    
    // Get questions but HIDE correct answers
    const questions = await storage.getQuestionsByQuizId(quiz.id);
    const questionsWithoutAnswers = questions.map(q => ({
      id: q.id,
      questionText: q.questionText,
      questionType: q.questionType,
      options: q.options,
      points: q.points,
      order: q.order,
    }));
    
    res.json({ 
      success: true, 
      quiz: {
        ...quiz,
        questions: questionsWithoutAnswers
      }
    });
  } catch (error) {
    console.error('Error fetching final quiz:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de la récupération du quiz final' 
    });
  }
});

// POST /api/quizzes - Créer un quiz (admin)
router.post('/', async (req: any, res) => {
  try {
    // Check authentication
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentification requise' 
      });
    }

    // Check admin role
    if (req.user.claims?.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        error: 'Accès réservé aux administrateurs' 
      });
    }

    // Validate request body
    const validatedData = insertQuizSchema.parse(req.body);
    
    // Create quiz
    const quiz = await storage.createQuiz(validatedData);
    
    res.status(201).json({ success: true, quiz });
  } catch (error) {
    console.error('Error creating quiz:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Données invalides',
        details: error.errors
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de la création du quiz' 
    });
  }
});

// POST /api/quizzes/:id/questions - Ajouter une question (admin)
router.post('/:id/questions', async (req: any, res) => {
  try {
    // Check authentication
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentification requise' 
      });
    }

    // Check admin role
    if (req.user.claims?.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        error: 'Accès réservé aux administrateurs' 
      });
    }

    const { id } = req.params;
    
    // Verify quiz exists
    const quiz = await storage.getQuizById(id);
    if (!quiz) {
      return res.status(404).json({ 
        success: false, 
        error: 'Quiz non trouvé' 
      });
    }

    // Validate request body
    const questionData = insertQuizQuestionSchema.parse({
      ...req.body,
      quizId: id
    });
    
    // Create question
    const question = await storage.createQuestion(questionData);
    
    res.status(201).json({ success: true, question });
  } catch (error) {
    console.error('Error creating question:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Données invalides',
        details: error.errors
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de la création de la question' 
    });
  }
});

// POST /api/quizzes/:id/submit - Soumettre des réponses (auth)
router.post('/:id/submit', async (req: any, res) => {
  try {
    // Check authentication
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentification requise' 
      });
    }

    const { id } = req.params;
    const userId = req.user.claims.sub;
    
    // Get quiz and questions
    const quiz = await storage.getQuizById(id);
    if (!quiz) {
      return res.status(404).json({ 
        success: false, 
        error: 'Quiz non trouvé' 
      });
    }
    
    const questions = await storage.getQuestionsByQuizId(id);
    
    // Validate submission
    const submissionSchema = z.object({
      answers: z.record(z.string()), // questionId: answer
      startedAt: z.string().datetime(),
      timeSpent: z.number().min(0).optional(),
    });
    
    const { answers, startedAt, timeSpent } = submissionSchema.parse(req.body);
    
    // Calculate score
    let earnedPoints = 0;
    let totalPoints = 0;
    
    questions.forEach(question => {
      totalPoints += question.points;
      const userAnswer = answers[question.id];
      
      if (userAnswer && userAnswer === question.correctAnswer) {
        earnedPoints += question.points;
      }
    });
    
    const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const passed = score >= quiz.passingScore;
    
    // Check attempt number
    const previousResults = await storage.getQuizResultsByUserId(userId, id);
    const attemptNumber = previousResults.length + 1;
    
    // Check max attempts
    if (quiz.maxAttempts && attemptNumber > quiz.maxAttempts) {
      return res.status(400).json({
        success: false,
        error: `Nombre maximum de tentatives atteint (${quiz.maxAttempts})`
      });
    }
    
    // Create quiz result
    const result = await storage.createQuizResult({
      userId,
      quizId: id,
      score,
      totalPoints,
      earnedPoints,
      answers,
      passed,
      attemptNumber,
      timeSpent: timeSpent || null,
      startedAt: new Date(startedAt),
      completedAt: new Date(),
    });
    
    res.status(201).json({ 
      success: true, 
      result: {
        ...result,
        passed,
        score,
        earnedPoints,
        totalPoints
      }
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Données invalides',
        details: error.errors
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de la soumission du quiz' 
    });
  }
});

// GET /api/quizzes/:id/results - Résultats de l'utilisateur (auth)
router.get('/:id/results', async (req: any, res) => {
  try {
    // Check authentication
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentification requise' 
      });
    }

    const { id } = req.params;
    const userId = req.user.claims.sub;
    
    // Get all results for this user and quiz
    const results = await storage.getQuizResultsByUserId(userId, id);
    const bestResult = await storage.getBestQuizResult(userId, id);
    
    res.json({ 
      success: true, 
      results,
      bestResult
    });
  } catch (error) {
    console.error('Error fetching quiz results:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de la récupération des résultats' 
    });
  }
});

// DELETE /api/quizzes/:id - Supprimer un quiz (admin)
router.delete('/:id', async (req: any, res) => {
  try {
    // Check authentication
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentification requise' 
      });
    }

    // Check admin role
    if (req.user.claims?.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        error: 'Accès réservé aux administrateurs' 
      });
    }

    const { id } = req.params;
    const deleted = await storage.deleteQuiz(id);
    
    if (!deleted) {
      return res.status(404).json({ 
        success: false, 
        error: 'Quiz non trouvé' 
      });
    }
    
    res.json({ success: true, message: 'Quiz supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de la suppression du quiz' 
    });
  }
});

export default router;
