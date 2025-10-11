import { Router } from 'express';
import { storage } from '../storage';
import { insertLessonSchema } from '@shared/schema';
import { z } from 'zod';

const router = Router();

// GET /api/lessons/module/:moduleId - Liste des leçons d'un module (auth required)
router.get('/module/:moduleId', async (req: any, res) => {
  try {
    // Check authentication
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentification requise' 
      });
    }

    const { moduleId } = req.params;
    const userId = req.user.claims.sub;
    
    // Get all lessons for the module
    const lessons = await storage.getLessonsByModuleId(moduleId);
    
    // Check accessibility for each lesson
    const lessonsWithAccess = await Promise.all(
      lessons.map(async (lesson) => {
        const accessible = await storage.isLessonAccessible(userId, lesson.id);
        return {
          ...lesson,
          accessible,
          // Don't return full content if not accessible (unless free preview)
          content: accessible || lesson.isFree ? lesson.content : undefined,
          videoUrl: accessible || lesson.isFree ? lesson.videoUrl : undefined,
        };
      })
    );
    
    res.json({ success: true, lessons: lessonsWithAccess });
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de la récupération des leçons' 
    });
  }
});

// GET /api/lessons/:id - Détail d'une leçon (auth required + progression check)
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
    const userId = req.user.claims.sub;
    
    const lesson = await storage.getLessonById(id);
    
    if (!lesson) {
      return res.status(404).json({ 
        success: false, 
        error: 'Leçon non trouvée' 
      });
    }
    
    // Check if lesson is accessible (progression lock)
    const accessible = await storage.isLessonAccessible(userId, id);
    
    // If not accessible and not a free preview, deny access
    if (!accessible && !lesson.isFree) {
      return res.status(403).json({ 
        success: false, 
        error: 'Vous devez compléter les leçons précédentes pour accéder à celle-ci',
        accessible: false
      });
    }
    
    // Get user's progress for this lesson
    const progress = await storage.getLessonProgress(userId, id);
    
    res.json({ 
      success: true, 
      lesson: {
        ...lesson,
        accessible,
        progress
      }
    });
  } catch (error) {
    console.error('Error fetching lesson:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de la récupération de la leçon' 
    });
  }
});

// GET /api/lessons/:id/accessible - Vérifier si accessible (auth)
router.get('/:id/accessible', async (req: any, res) => {
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
    
    const isAccessible = await storage.isLessonAccessible(userId, id);
    
    res.json({ 
      success: true, 
      accessible: isAccessible 
    });
  } catch (error) {
    console.error('Error checking lesson accessibility:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de la vérification de l\'accessibilité' 
    });
  }
});

// POST /api/lessons - Créer une leçon (admin)
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
    const validatedData = insertLessonSchema.parse(req.body);
    
    // Create lesson
    const lesson = await storage.createLesson(validatedData);
    
    res.status(201).json({ success: true, lesson });
  } catch (error) {
    console.error('Error creating lesson:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Données invalides',
        details: error.errors
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de la création de la leçon' 
    });
  }
});

// PUT /api/lessons/:id - Modifier une leçon (admin)
router.put('/:id', async (req: any, res) => {
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
    
    // Validate partial update
    const partialSchema = insertLessonSchema.partial();
    const validatedData = partialSchema.parse(req.body);
    
    // Update lesson
    const lesson = await storage.updateLesson(id, validatedData);
    
    if (!lesson) {
      return res.status(404).json({ 
        success: false, 
        error: 'Leçon non trouvée' 
      });
    }
    
    res.json({ success: true, lesson });
  } catch (error) {
    console.error('Error updating lesson:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Données invalides',
        details: error.errors
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de la modification de la leçon' 
    });
  }
});

// PUT /api/lessons/:id/progress - Mettre à jour la progression (auth)
router.put('/:id/progress', async (req: any, res) => {
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
    
    // Validate progress data
    const progressSchema = z.object({
      status: z.enum(['not_started', 'in_progress', 'completed']).optional(),
      timeSpent: z.number().min(0).optional(),
      completedAt: z.string().datetime().optional(),
    });
    
    const progressData = progressSchema.parse(req.body);
    
    // Convert completedAt string to Date if present
    const progressWithDate = {
      ...progressData,
      completedAt: progressData.completedAt ? new Date(progressData.completedAt) : undefined,
    };
    
    // Update lesson progress
    await storage.updateLessonProgress(userId, id, progressWithDate);
    
    res.json({ 
      success: true, 
      message: 'Progression mise à jour avec succès' 
    });
  } catch (error) {
    console.error('Error updating lesson progress:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Données invalides',
        details: error.errors
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de la mise à jour de la progression' 
    });
  }
});

// DELETE /api/lessons/:id - Supprimer une leçon (admin)
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
    const deleted = await storage.deleteLesson(id);
    
    if (!deleted) {
      return res.status(404).json({ 
        success: false, 
        error: 'Leçon non trouvée' 
      });
    }
    
    res.json({ success: true, message: 'Leçon supprimée avec succès' });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de la suppression de la leçon' 
    });
  }
});

export default router;
