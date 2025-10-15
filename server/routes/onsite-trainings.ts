import { Router } from 'express';
import { db } from '../db';
import { courses, trainingSessions, sessionRegistrations } from '@shared/schema';
import { eq, and, gte, desc } from 'drizzle-orm';

const router = Router();

/**
 * GET /api/onsite-trainings
 * Récupère toutes les formations en présentiel avec leurs sessions à venir
 */
router.get('/', async (req, res) => {
  try {
    // Récupérer toutes les formations en présentiel publiées
    const onsiteTrainings = await db
      .select()
      .from(courses)
      .where(and(
        eq(courses.deliveryMode, 'onsite'),
        eq(courses.isPublished, true)
      ));

    // Pour chaque formation, récupérer les sessions à venir avec le nombre d'inscriptions
    const trainingsWithSessions = await Promise.all(
      onsiteTrainings.map(async (training) => {
        const upcomingSessions = await db
          .select()
          .from(trainingSessions)
          .where(and(
            eq(trainingSessions.courseId, training.id),
            gte(trainingSessions.startDate, new Date()),
            eq(trainingSessions.status, 'open')
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

        return {
          ...training,
          sessions: sessionsWithCounts
        };
      })
    );

    res.json(trainingsWithSessions);
  } catch (error) {
    console.error('Error fetching onsite trainings:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des formations' });
  }
});

/**
 * GET /api/onsite-trainings/:slug
 * Récupère une formation en présentiel par son slug avec ses sessions
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

/**
 * GET /api/onsite-trainings/sessions/:sessionId
 * Récupère les détails d'une session spécifique
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

export default router;
