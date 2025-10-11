import express from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../replitAuth";
import { insertCourseSchema, type Course } from "@shared/schema";
import { z } from "zod";

const router = express.Router();

// GET /api/formations - Liste des formations publiques
router.get("/", async (req, res) => {
  try {
    const formations = await storage.getPublishedCourses();
    res.json({ success: true, formations });
  } catch (error) {
    console.error("Error fetching formations:", error);
    res.status(500).json({ success: false, error: "Erreur serveur" });
  }
});

// GET /api/formations/:id - Détail d'une formation
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const formation = await storage.getCourseById(id);
    
    if (!formation) {
      return res.status(404).json({ success: false, error: "Formation non trouvée" });
    }
    
    res.json({ success: true, formation });
  } catch (error) {
    console.error("Error fetching formation:", error);
    res.status(500).json({ success: false, error: "Erreur serveur" });
  }
});

// GET /api/formations/slug/:slug - Détail par slug
router.get("/slug/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const formation = await storage.getCourseBySlug(slug);
    
    if (!formation) {
      return res.status(404).json({ success: false, error: "Formation non trouvée" });
    }
    
    res.json({ success: true, formation });
  } catch (error) {
    console.error("Error fetching formation by slug:", error);
    res.status(500).json({ success: false, error: "Erreur serveur" });
  }
});

// POST /api/formations - Créer une formation (admin seulement)
router.post("/", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    const user = await storage.getUser(userId);
    
    // Vérifier si l'utilisateur est admin
    if (user?.role !== 'admin') {
      return res.status(403).json({ success: false, error: "Accès refusé" });
    }
    
    const validatedData = insertCourseSchema.parse(req.body);
    const formation = await storage.createCourse(validatedData);
    
    res.status(201).json({ success: true, formation });
  } catch (error) {
    console.error("Error creating formation:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Données invalides",
        details: error.errors
      });
    }
    
    res.status(500).json({ success: false, error: "Erreur serveur" });
  }
});

// PUT /api/formations/:id - Modifier une formation (admin seulement)
router.put("/:id", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    const user = await storage.getUser(userId);
    
    // Vérifier si l'utilisateur est admin
    if (user?.role !== 'admin') {
      return res.status(403).json({ success: false, error: "Accès refusé" });
    }
    
    const { id } = req.params;
    const validatedData = insertCourseSchema.partial().parse(req.body);
    const formation = await storage.updateCourse(id, validatedData);
    
    if (!formation) {
      return res.status(404).json({ success: false, error: "Formation non trouvée" });
    }
    
    res.json({ success: true, formation });
  } catch (error) {
    console.error("Error updating formation:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Données invalides",
        details: error.errors
      });
    }
    
    res.status(500).json({ success: false, error: "Erreur serveur" });
  }
});

// DELETE /api/formations/:id - Supprimer une formation (admin seulement)
router.delete("/:id", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    const user = await storage.getUser(userId);
    
    // Vérifier si l'utilisateur est admin
    if (user?.role !== 'admin') {
      return res.status(403).json({ success: false, error: "Accès refusé" });
    }
    
    const { id } = req.params;
    const success = await storage.deleteCourse(id);
    
    if (!success) {
      return res.status(404).json({ success: false, error: "Formation non trouvée" });
    }
    
    res.json({ success: true, message: "Formation supprimée" });
  } catch (error) {
    console.error("Error deleting formation:", error);
    res.status(500).json({ success: false, error: "Erreur serveur" });
  }
});

export default router;
