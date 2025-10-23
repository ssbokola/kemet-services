import { Router } from 'express';
import { db } from '../db';
import { courses, trainingSessions, sessionRegistrations } from '@shared/schema';
import { eq, and, gte, desc, sql } from 'drizzle-orm';

const router = Router();

/**
 * GET /api/onsite-trainings
 * Récupère toutes les formations en présentiel avec leurs sessions à venir
 * OPTIMISÉ : Utilise un LEFT JOIN au lieu de boucles de requêtes (réduit de 130+ requêtes à 1 seule)
 */
router.get('/', async (req, res) => {
  try {
    // UNE SEULE requête avec LEFT JOINs pour tout récupérer
    const results = await db
      .select({
        // Cours
        courseId: courses.id,
        courseTitle: courses.title,
        courseSlug: courses.slug,
        courseDescription: courses.description,
        courseCategories: courses.categories,
        courseDeliveryMode: courses.deliveryMode,
        courseDefaultDuration: courses.defaultDuration,
        courseDefaultPrice: courses.defaultPrice,
        courseDefaultLocation: courses.defaultLocation,
        courseObjectives: courses.objectives,
        coursePrerequisites: courses.prerequisites,
        courseTargetAudience: courses.targetAudience,
        courseIsPublished: courses.isPublished,
        courseIsSessionBased: courses.isSessionBased,
        // Session
        sessionId: trainingSessions.id,
        sessionCode: trainingSessions.sessionCode,
        sessionVenue: trainingSessions.venue,
        sessionAddress: trainingSessions.address,
        sessionCity: trainingSessions.city,
        sessionStartDate: trainingSessions.startDate,
        sessionEndDate: trainingSessions.endDate,
        sessionMaxCapacity: trainingSessions.maxCapacity,
        sessionPricePerPerson: trainingSessions.pricePerPerson,
        sessionStatus: trainingSessions.status,
        // Comptage des inscriptions (agrégé)
        registrationCount: sql<number>`COUNT(CASE WHEN ${sessionRegistrations.isCancelled} = false THEN 1 END)`.as('registration_count')
      })
      .from(courses)
      .leftJoin(
        trainingSessions,
        and(
          eq(trainingSessions.courseId, courses.id),
          gte(trainingSessions.startDate, new Date()),
          eq(trainingSessions.status, 'open')
        )
      )
      .leftJoin(
        sessionRegistrations,
        eq(sessionRegistrations.sessionId, trainingSessions.id)
      )
      .where(and(
        eq(courses.deliveryMode, 'onsite'),
        eq(courses.isPublished, true)
      ))
      .groupBy(
        courses.id,
        trainingSessions.id
      )
      .orderBy(courses.title, trainingSessions.startDate);

    // Grouper les résultats par formation
    const trainingsMap = new Map();
    
    for (const row of results) {
      if (!trainingsMap.has(row.courseId)) {
        trainingsMap.set(row.courseId, {
          id: row.courseId,
          title: row.courseTitle,
          slug: row.courseSlug,
          description: row.courseDescription,
          categories: row.courseCategories,
          deliveryMode: row.courseDeliveryMode,
          defaultDuration: row.courseDefaultDuration,
          defaultPrice: row.courseDefaultPrice,
          defaultLocation: row.courseDefaultLocation,
          objectives: row.courseObjectives,
          prerequisites: row.coursePrerequisites,
          targetAudience: row.courseTargetAudience,
          isPublished: row.courseIsPublished,
          isSessionBased: row.courseIsSessionBased,
          sessions: []
        });
      }

      // Ajouter la session si elle existe
      if (row.sessionId) {
        const training = trainingsMap.get(row.courseId);
        // Vérifier si cette session n'est pas déjà ajoutée
        if (!training.sessions.find((s: any) => s.id === row.sessionId)) {
          training.sessions.push({
            id: row.sessionId,
            sessionCode: row.sessionCode,
            venue: row.sessionVenue,
            address: row.sessionAddress,
            city: row.sessionCity,
            startDate: row.sessionStartDate,
            endDate: row.sessionEndDate,
            maxCapacity: row.sessionMaxCapacity,
            pricePerPerson: row.sessionPricePerPerson,
            status: row.sessionStatus,
            currentRegistrations: Number(row.registrationCount) || 0
          });
        }
      }
    }

    const trainingsWithSessions = Array.from(trainingsMap.values());
    res.json(trainingsWithSessions);
  } catch (error) {
    console.error('Error fetching onsite trainings:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des formations' });
  }
});

/**
 * GET /api/onsite-trainings/sessions/:sessionId
 * Récupère les détails d'une session spécifique
 * NOTE: This route MUST be defined BEFORE the /:slug route to avoid conflict
 */
router.get('/sessions/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Récupérer la session
    const session = await db
      .select()
      .from(trainingSessions)
      .where(eq(trainingSessions.id, sessionId))
      .limit(1);

    if (!session || session.length === 0) {
      return res.status(404).json({ message: 'Session non trouvée' });
    }

    // Récupérer la formation associée
    const training = await db
      .select()
      .from(courses)
      .where(eq(courses.id, session[0].courseId))
      .limit(1);

    // Récupérer le nombre d'inscriptions pour cette session
    const registrations = await db
      .select()
      .from(sessionRegistrations)
      .where(and(
        eq(sessionRegistrations.sessionId, sessionId),
        eq(sessionRegistrations.isCancelled, false)
      ));

    res.json({
      session: session[0],
      training: training[0],
      registrationsCount: registrations.length,
      availableSeats: session[0].maxCapacity - registrations.length
    });
  } catch (error) {
    console.error('Error fetching session details:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de la session' });
  }
});

/**
 * GET /api/onsite-trainings/:slug
 * Récupère une formation en présentiel par son slug avec ses sessions
 * NOTE: This route is defined AFTER /sessions/:sessionId to avoid route conflict
 */
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    // Récupérer la formation
    const training = await db
      .select()
      .from(courses)
      .where(and(
        eq(courses.slug, slug),
        eq(courses.deliveryMode, 'onsite'),
        eq(courses.isPublished, true)
      ))
      .limit(1);

    if (!training || training.length === 0) {
      return res.status(404).json({ message: 'Formation non trouvée' });
    }

    // Récupérer toutes les sessions à venir pour cette formation
    const upcomingSessions = await db
      .select()
      .from(trainingSessions)
      .where(and(
        eq(trainingSessions.courseId, training[0].id),
        gte(trainingSessions.startDate, new Date())
      ))
      .orderBy(trainingSessions.startDate);

    // Pour chaque session, compter les inscriptions
    const sessionsWithCounts = await Promise.all(
      upcomingSessions.map(async (session) => {
        const registrations = await db
          .select()
          .from(sessionRegistrations)
          .where(and(
            eq(sessionRegistrations.sessionId, session.id),
            eq(sessionRegistrations.isCancelled, false)
          ));
        
        return {
          ...session,
          currentRegistrations: registrations.length
        };
      })
    );

    res.json({
      ...training[0],
      sessions: sessionsWithCounts
    });
  } catch (error) {
    console.error('Error fetching onsite training:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de la formation' });
  }
});

export default router;
