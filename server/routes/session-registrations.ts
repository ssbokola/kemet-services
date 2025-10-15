import { Router } from 'express';
import { db } from '../db';
import { sessionRegistrations, trainingSessions, courses, orders } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { createWaveCheckout } from '../payments/wave';
import { sendEmail } from '../email';

const router = Router();

/**
 * POST /api/session-registrations
 * Create a new session registration with Wave payment
 */
router.post('/', async (req, res) => {
  try {
    const {
      sessionId,
      fullName,
      email,
      phone,
      role,
      organization
    } = req.body;

    // Validate required fields (amount is NOT accepted from client)
    if (!sessionId || !fullName || !email || !phone || !role || !organization) {
      return res.status(400).json({ 
        message: 'Tous les champs obligatoires doivent être remplis' 
      });
    }

    // Fetch session details
    const session = await db
      .select()
      .from(trainingSessions)
      .where(eq(trainingSessions.id, sessionId))
      .limit(1);

    if (!session || session.length === 0) {
      return res.status(404).json({ message: 'Session non trouvée' });
    }

    const sessionData = session[0];
    
    // Calculate amount SERVER-SIDE from session data (never trust client)
    const amount = sessionData.pricePerPerson || 0;
    
    if (amount <= 0) {
      return res.status(400).json({ 
        message: 'Le prix de la session est invalide' 
      });
    }

    // Check if session is open
    if (sessionData.status !== 'open') {
      return res.status(400).json({ 
        message: 'Cette session n\'est plus disponible pour les inscriptions' 
      });
    }

    // Check capacity
    const existingRegistrations = await db
      .select()
      .from(sessionRegistrations)
      .where(and(
        eq(sessionRegistrations.sessionId, sessionId),
        eq(sessionRegistrations.isCancelled, false)
      ));

    if (existingRegistrations.length >= sessionData.maxCapacity) {
      return res.status(400).json({ 
        message: 'Cette session est complète' 
      });
    }

    // Fetch course details for order reference
    const course = await db
      .select()
      .from(courses)
      .where(eq(courses.id, sessionData.courseId))
      .limit(1);

    if (!course || course.length === 0) {
      return res.status(404).json({ message: 'Formation non trouvée' });
    }

    const courseData = course[0];

    // Create order first (userId is null for anonymous registration)
    const orderId = `SES-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const [order] = await db.insert(orders).values({
      userId: null, // Anonymous registration (no user account required)
      orderType: 'onsite_session',
      sessionId: sessionId,
      referenceId: orderId,
      amount: amount,
      currency: 'XOF',
      status: 'pending',
      paymentMethod: 'wave'
    }).returning();

    // Create registration (pending payment)
    const [registration] = await db.insert(sessionRegistrations).values({
      sessionId: sessionId,
      participantName: fullName,
      participantEmail: email,
      participantPhone: phone,
      participantRole: role,
      organization: organization,
      orderId: order.id,
      paymentStatus: 'pending',
      amountPaid: amount
    }).returning();

    // Create Wave checkout
    const waveCheckout = await createWaveCheckout({
      amount: amount,
      customerName: fullName,
      customerEmail: email,
      customerPhone: phone,
      orderId: orderId,
      description: `Formation: ${courseData.title} - Session du ${new Date(sessionData.startDate).toLocaleDateString('fr-FR')}`,
      returnUrl: `${process.env.APP_BASE_URL}/inscription-confirmee?registrationId=${registration.id}`,
      cancelUrl: `${process.env.APP_BASE_URL}/formation-presentiel/${courseData.slug}`
    });

    if (!waveCheckout.success) {
      // Cleanup: delete registration and order if payment creation fails
      await db.delete(sessionRegistrations).where(eq(sessionRegistrations.id, registration.id));
      await db.delete(orders).where(eq(orders.id, order.id));
      
      // Provide user-friendly error messages
      const errorMessage = waveCheckout.error?.includes('Invalid Masterkey') || waveCheckout.error?.includes('Masterkey')
        ? 'Le système de paiement Wave Mobile Money n\'est pas encore configuré. Veuillez contacter l\'administrateur.'
        : waveCheckout.error || 'Erreur lors de la création du paiement Wave Mobile Money';
      
      return res.status(503).json({ 
        message: errorMessage
      });
    }

    res.json({
      success: true,
      registrationId: registration.id,
      orderId: orderId,
      paymentUrl: waveCheckout.paymentUrl,
      message: 'Redirection vers la page de paiement...'
    });

  } catch (error) {
    console.error('Error creating session registration:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la création de l\'inscription' 
    });
  }
});

/**
 * GET /api/session-registrations/:id
 * Get registration details
 */
router.get('/:id', async (req, res) => {
  try {
    const registrationId = req.params.id;

    const registration = await db
      .select()
      .from(sessionRegistrations)
      .where(eq(sessionRegistrations.id, registrationId))
      .limit(1);

    if (!registration || registration.length === 0) {
      return res.status(404).json({ message: 'Inscription non trouvée' });
    }

    res.json(registration[0]);

  } catch (error) {
    console.error('Error fetching registration:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération de l\'inscription' 
    });
  }
});

export default router;
