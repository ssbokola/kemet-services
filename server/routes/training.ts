// Routes sécurisées pour les formations - blueprint:javascript_log_in_with_replit
import express from 'express';
import { z } from 'zod';
import { isAuthenticated } from '../replitAuth';
import { db } from '../db';
import { 
  courses, 
  courseModules, 
  courseLessons, 
  enrollments, 
  lessonProgress,
  users,
  insertCourseSchema
} from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';

const router = express.Router();

// Protection: Toutes les routes requirent une authentification
router.use(isAuthenticated);

// GET /api/training/courses - Liste des cours disponibles
router.get('/courses', async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    
    // Récupérer tous les cours publiés
    const availableCourses = await db
      .select()
      .from(courses)
      .where(eq(courses.isPublished, true))
      .orderBy(desc(courses.createdAt));
    
    // Vérifier les inscriptions de l'utilisateur
    const userEnrollments = await db
      .select()
      .from(enrollments)
      .where(eq(enrollments.userId, userId));
    
    const enrollmentMap = new Map(
      userEnrollments.map(e => [e.courseId, e])
    );
    
    const coursesWithEnrollment = availableCourses.map(course => ({
      ...course,
      enrollment: enrollmentMap.get(course.id) || null
    }));
    
    res.json(coursesWithEnrollment);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Failed to fetch courses' });
  }
});

// GET /api/training/courses/:courseId - Détails d'un cours spécifique
router.get('/courses/:courseId', async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { courseId } = req.params;
    
    // Récupérer le cours
    const [course] = await db
      .select()
      .from(courses)
      .where(and(eq(courses.id, courseId), eq(courses.isPublished, true)));
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Vérifier l'inscription de l'utilisateur
    const [enrollment] = await db
      .select()
      .from(enrollments)
      .where(and(
        eq(enrollments.userId, userId),
        eq(enrollments.courseId, courseId)
      ));
    
    // Récupérer les modules et leçons (seulement si inscrit ou cours gratuit)
    let modules: any[] = [];
    if (enrollment || course.price === 0) {
      modules = await db
        .select()
        .from(courseModules)
        .where(and(
          eq(courseModules.courseId, courseId),
          eq(courseModules.isPublished, true)
        ))
        .orderBy(courseModules.order);
      
      // Récupérer les leçons pour chaque module
      for (const module of modules) {
        const lessons = await db
          .select()
          .from(courseLessons)
          .where(and(
            eq(courseLessons.moduleId, module.id),
            eq(courseLessons.isPublished, true)
          ))
          .orderBy(courseLessons.order);
        
        (module as any).lessons = lessons;
      }
    }
    
    res.json({
      ...course,
      enrollment,
      modules,
      hasAccess: !!enrollment || course.price === 0
    });
  } catch (error) {
    console.error('Error fetching course details:', error);
    res.status(500).json({ message: 'Failed to fetch course details' });
  }
});

// POST /api/training/enroll/:courseId - S'inscrire à un cours
const enrollmentSchema = z.object({
  courseId: z.string().min(1),
});

router.post('/enroll/:courseId', async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const userClaims = req.user.claims;
    const { courseId } = req.params;
    
    const validatedData = enrollmentSchema.parse({ courseId });
    
    // Vérifier que le cours existe et est publié
    const [course] = await db
      .select()
      .from(courses)
      .where(and(eq(courses.id, courseId), eq(courses.isPublished, true)));
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // S'assurer que l'utilisateur existe dans la base de données
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    
    if (!existingUser) {
      // Générer un username pour l'utilisateur OIDC
      let username = null;
      if (userClaims.email) {
        // Utiliser la partie avant @ de l'email comme username
        username = userClaims.email.split('@')[0];
      } else {
        // Utiliser le sub en dernier recours
        username = `user_${userId.substring(0, 8)}`;
      }
      
      // Créer l'utilisateur depuis les claims OIDC
      await db
        .insert(users)
        .values({
          id: userId,
          username: username,
          email: userClaims.email || null,
          firstName: userClaims.first_name || null,
          lastName: userClaims.last_name || null,
          profileImageUrl: userClaims.profile_image_url || null,
          role: 'participant',
          authType: 'replit',
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date()
        });
    }
    
    // Vérifier qu'il n'y a pas déjà une inscription
    const [existingEnrollment] = await db
      .select()
      .from(enrollments)
      .where(and(
        eq(enrollments.userId, userId),
        eq(enrollments.courseId, courseId)
      ));
    
    if (existingEnrollment) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }
    
    // Créer l'inscription
    const [enrollment] = await db
      .insert(enrollments)
      .values({
        userId,
        courseId,
        status: 'active',
        enrolledAt: new Date(),
        progressPercent: 0
      })
      .returning();
    
    res.status(201).json(enrollment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid request data', errors: error.errors });
    }
    console.error('Error enrolling in course:', error);
    res.status(500).json({ message: 'Failed to enroll in course' });
  }
});

// GET /api/training/my-courses - Mes cours inscrits
router.get('/my-courses', async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    
    const myEnrollments = await db
      .select({
        course: courses,
        enrollment: enrollments
      })
      .from(enrollments)
      .innerJoin(courses, eq(courses.id, enrollments.courseId))
      .where(eq(enrollments.userId, userId))
      .orderBy(desc(enrollments.enrolledAt));
    
    res.json(myEnrollments);
  } catch (error) {
    console.error('Error fetching my courses:', error);
    res.status(500).json({ message: 'Failed to fetch enrolled courses' });
  }
});

// GET /api/training/lessons/:lessonId - Accéder au contenu d'une leçon
router.get('/lessons/:lessonId', async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { lessonId } = req.params;
    
    // Récupérer la leçon avec le module et cours associés
    const [lessonData] = await db
      .select({
        lesson: courseLessons,
        module: courseModules,
        course: courses
      })
      .from(courseLessons)
      .innerJoin(courseModules, eq(courseModules.id, courseLessons.moduleId))
      .innerJoin(courses, eq(courses.id, courseModules.courseId))
      .where(and(
        eq(courseLessons.id, lessonId),
        eq(courseLessons.isPublished, true)
      ));
    
    if (!lessonData) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    
    // Vérifier l'accès : inscrit au cours ou leçon gratuite
    let hasAccess = lessonData.lesson.isFree;
    
    if (!hasAccess) {
      const [enrollment] = await db
        .select()
        .from(enrollments)
        .where(and(
          eq(enrollments.userId, userId),
          eq(enrollments.courseId, lessonData.course.id),
          eq(enrollments.status, 'active')
        ));
      
      hasAccess = !!enrollment;
    }
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied. Enrollment required.' });
    }
    
    // Enregistrer l'accès à la leçon
    await db
      .insert(lessonProgress)
      .values({
        userId,
        lessonId,
        status: 'in_progress',
        lastAccessedAt: new Date()
      })
      .onConflictDoUpdate({
        target: [lessonProgress.userId, lessonProgress.lessonId],
        set: {
          lastAccessedAt: new Date()
        }
      });
    
    res.json({
      ...lessonData.lesson,
      module: lessonData.module,
      course: lessonData.course
    });
  } catch (error) {
    console.error('Error accessing lesson:', error);
    res.status(500).json({ message: 'Failed to access lesson' });
  }
});

// POST /api/training/lessons/:lessonId/complete - Marquer une leçon comme terminée
router.post('/lessons/:lessonId/complete', async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { lessonId } = req.params;
    
    // Mettre à jour le statut de la leçon
    await db
      .insert(lessonProgress)
      .values({
        userId,
        lessonId,
        status: 'completed',
        completedAt: new Date(),
        lastAccessedAt: new Date()
      })
      .onConflictDoUpdate({
        target: [lessonProgress.userId, lessonProgress.lessonId],
        set: {
          status: 'completed',
          completedAt: new Date(),
          lastAccessedAt: new Date()
        }
      });
    
    // TODO: Calculer et mettre à jour le pourcentage de progression du cours
    
    res.json({ message: 'Lesson marked as completed' });
  } catch (error) {
    console.error('Error completing lesson:', error);
    res.status(500).json({ message: 'Failed to complete lesson' });
  }
});

// GET /api/training/progress/:courseId - Progression dans un cours
router.get('/progress/:courseId', async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { courseId } = req.params;
    
    // Vérifier l'inscription
    const [enrollment] = await db
      .select()
      .from(enrollments)
      .where(and(
        eq(enrollments.userId, userId),
        eq(enrollments.courseId, courseId)
      ));
    
    if (!enrollment) {
      return res.status(403).json({ message: 'Not enrolled in this course' });
    }
    
    // Récupérer la progression des leçons
    const lessonProgressData = await db
      .select({
        progress: lessonProgress,
        lesson: courseLessons,
        module: courseModules
      })
      .from(lessonProgress)
      .innerJoin(courseLessons, eq(courseLessons.id, lessonProgress.lessonId))
      .innerJoin(courseModules, eq(courseModules.id, courseLessons.moduleId))
      .where(and(
        eq(lessonProgress.userId, userId),
        eq(courseModules.courseId, courseId)
      ));
    
    res.json({
      enrollment,
      lessonProgress: lessonProgressData
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ message: 'Failed to fetch progress' });
  }
});

export default router;