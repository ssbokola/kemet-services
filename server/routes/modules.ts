import { Router } from 'express';
import { storage } from '../storage';
import { insertModuleSchema } from '@shared/schema';
import { z } from 'zod';

const router = Router();

// GET /api/modules/course/:courseId - Liste des modules d'un cours (auth required)
router.get('/course/:courseId', async (req: any, res) => {
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
        error: 'Vous devez être inscrit à ce cours pour accéder aux modules' 
      });
    }
    
    const modules = await storage.getModulesByCourseId(courseId);
    res.json({ success: true, modules });
  } catch (error) {
    console.error('Error fetching modules:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de la récupération des modules' 
    });
  }
});

// POST /api/modules - Créer un module (admin)
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
    const validatedData = insertModuleSchema.parse(req.body);
    
    // Create module
    const module = await storage.createModule(validatedData);
    
    res.status(201).json({ success: true, module });
  } catch (error) {
    console.error('Error creating module:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Données invalides',
        details: error.errors
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de la création du module' 
    });
  }
});

// PUT /api/modules/:id - Modifier un module (admin)
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
    const partialSchema = insertModuleSchema.partial();
    const validatedData = partialSchema.parse(req.body);
    
    // Update module
    const module = await storage.updateModule(id, validatedData);
    
    if (!module) {
      return res.status(404).json({ 
        success: false, 
        error: 'Module non trouvé' 
      });
    }
    
    res.json({ success: true, module });
  } catch (error) {
    console.error('Error updating module:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Données invalides',
        details: error.errors
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de la modification du module' 
    });
  }
});

// DELETE /api/modules/:id - Supprimer un module (admin)
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
    const deleted = await storage.deleteModule(id);
    
    if (!deleted) {
      return res.status(404).json({ 
        success: false, 
        error: 'Module non trouvé' 
      });
    }
    
    res.json({ success: true, message: 'Module supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting module:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de la suppression du module' 
    });
  }
});

export default router;
