import express from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../replitAuth";
import { insertCourseSchema, type Course, courseResources } from "@shared/schema";
import { z } from "zod";
import { sendEnrollmentConfirmation } from "../emails/enrollment";
import { db } from "../db";
import { eq, asc } from "drizzle-orm";

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

// GET /api/formations/my-enrollments - Mes inscriptions (auth requis)
// IMPORTANT: Cette route doit être AVANT /:id pour éviter que "my-enrollments" soit traité comme un ID
router.get("/my-enrollments", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    const enrollments = await storage.getUserEnrollments(userId);
    
    // Get all quiz results for this user
    const allQuizResults = await storage.getUserQuizResults(userId);
    
    // Group quiz results by courseId
    const quizResultsByCourse: Record<string, any[]> = {};
    for (const qr of allQuizResults) {
      // Get courseId from quiz (either directly or via lesson->module)
      const courseId = qr.quiz.courseId || qr.module?.courseId;
      if (courseId) {
        if (!quizResultsByCourse[courseId]) {
          quizResultsByCourse[courseId] = [];
        }
        quizResultsByCourse[courseId].push(qr);
      }
    }
    
    // Enrich enrollments with quiz results
    const enrichedEnrollments = enrollments.map(({ enrollment, course }) => ({
      enrollment,
      course,
      quizResults: quizResultsByCourse[course.id] || [],
    }));
    
    res.json({ success: true, enrollments: enrichedEnrollments });
  } catch (error) {
    console.error("Error fetching user enrollments:", error);
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

// GET /api/formations/:id - Détail d'une formation
// IMPORTANT: Cette route doit être APRÈS les routes spécifiques (my-enrollments, slug/:slug)
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

// POST /api/formations/:id/enroll - S'inscrire à une formation (auth requis)
router.post("/:id/enroll", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    const { id: courseId } = req.params;
    
    // Vérifier si la formation existe
    const course = await storage.getCourseById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, error: "Formation non trouvée" });
    }

    // SÉCURITÉ : bloquer l'inscription gratuite aux formations payantes.
    // Pour les formations dont le prix > 0, le seul chemin autorisé est le
    // checkout Wave (/api/payments/wave/checkout). Sans ce guard, n'importe
    // quel utilisateur authentifié pourrait contourner le paiement en appelant
    // cette route directement.
    const coursePrice = course.price ?? course.defaultPrice ?? 0;
    if (coursePrice > 0) {
      return res.status(403).json({
        success: false,
        error: "Cette formation est payante. Veuillez procéder au paiement via Wave.",
        requiresPayment: true,
        courseId: course.id,
        slug: course.slug,
        price: coursePrice,
      });
    }

    // Vérifier si l'utilisateur est déjà inscrit
    const existingEnrollment = await storage.getEnrollment(userId, courseId);
    if (existingEnrollment) {
      return res.status(400).json({ 
        success: false, 
        error: "Vous êtes déjà inscrit à cette formation" 
      });
    }
    
    // Créer l'inscription
    const enrollment = await storage.enrollUser(userId, courseId);
    
    // Envoyer l'email de confirmation (asynchrone, ne pas bloquer la réponse)
    const user = await storage.getUser(userId);
    if (user && user.email) {
      sendEnrollmentConfirmation(user, course, enrollment.id)
        .catch(error => {
          console.error('Erreur envoi email de confirmation:', error);
        });
    }
    
    res.status(201).json({ 
      success: true, 
      enrollment,
      message: "Inscription réussie ! Un email de confirmation vous a été envoyé." 
    });
  } catch (error) {
    console.error("Error enrolling user:", error);
    res.status(500).json({ success: false, error: "Erreur serveur" });
  }
});

// GET /api/formations/:id/enrollment-status - Vérifier si inscrit (auth requis)
router.get("/:id/enrollment-status", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    const { id: courseId } = req.params;
    
    const enrollment = await storage.getEnrollment(userId, courseId);
    
    res.json({ 
      success: true, 
      isEnrolled: !!enrollment,
      enrollment: enrollment || null
    });
  } catch (error) {
    console.error("Error checking enrollment status:", error);
    res.status(500).json({ success: false, error: "Erreur serveur" });
  }
});

// GET /api/formations/:id/resources - Récupérer les ressources d'un cours (réservé aux inscrits)
router.get("/:id/resources", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    const { id: courseId } = req.params;
    
    // Vérifier que l'utilisateur est inscrit au cours
    const enrollment = await storage.getEnrollment(userId, courseId);
    
    if (!enrollment) {
      return res.status(403).json({ 
        success: false, 
        error: "Vous devez être inscrit à ce cours pour accéder aux ressources" 
      });
    }
    
    const resources = await db
      .select()
      .from(courseResources)
      .where(eq(courseResources.courseId, courseId))
      .orderBy(asc(courseResources.order));
    
    // Filter only published resources
    const publishedResources = resources.filter(r => r.isPublished);
    
    res.json({ 
      success: true, 
      resources: publishedResources 
    });
  } catch (error) {
    console.error("Error fetching course resources:", error);
    res.status(500).json({ success: false, error: "Erreur serveur" });
  }
});

export default router;
