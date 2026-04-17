import { Router } from 'express';
import { storage } from '../storage';
import { createWaveCheckout, verifyWaveWebhook, processWaveWebhook, checkWavePaymentStatus } from '../payments/wave';
import { sendPaymentConfirmation } from '../emails/payment-confirmation';
import { generateReceiptPdf } from '../services/receipt-pdf';
import { z } from 'zod';

const router = Router();

/**
 * Envoi de l'email de confirmation de paiement en fire-and-forget.
 * N'interrompt JAMAIS le flow HTTP : tout échec est loggé mais non propagé.
 *
 * Utilisé aux deux endroits où une order passe en "completed" :
 *   - webhook IPN PayDunya (cas nominal)
 *   - polling de statut /wave/status/:orderId (cas où le webhook n'arrive pas,
 *     typiquement en dev localhost)
 */
function dispatchPaymentConfirmationEmail(orderId: string, logPrefix: string = '[PAYMENT-EMAIL]') {
  (async () => {
    try {
      const order = await storage.getOrderById(orderId);
      if (!order || order.status !== 'completed' || !order.userId || !order.courseId) return;

      const user = await storage.getUserById(order.userId);
      const course = await storage.getCourseById(order.courseId);
      if (!user || !course) {
        console.warn(`${logPrefix} User ou course introuvable, skip`, { orderId, userId: order.userId, courseId: order.courseId });
        return;
      }

      await sendPaymentConfirmation(user, course, order);
    } catch (error) {
      console.error(`${logPrefix} Échec envoi email (non-fatal):`, error);
    }
  })();
}

// POST /api/payments/wave/checkout - Create Wave checkout session
router.post('/wave/checkout', async (req: any, res) => {
  try {
    // Check authentication
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentification requise' 
      });
    }

    const userId = req.user.claims.sub;
    
    // Validate request
    // customerPhone: le numéro Wave du client est indispensable pour PayDunya
    // SOFTPAY. On l'accepte ici depuis le frontend (modale avant redirection).
    // Format accepté : avec ou sans +225/225 (CI) ou +221/221 (SN), 8 chiffres
    // minimum après le code pays.
    const checkoutSchema = z.object({
      courseId: z.string().min(1),
      customerPhone: z
        .string()
        .trim()
        .min(8, 'Numéro de téléphone invalide')
        .max(20, 'Numéro de téléphone invalide')
        .optional(),
      returnUrl: z.string().optional(),
      cancelUrl: z.string().optional(),
    });

    const { courseId, customerPhone, returnUrl, cancelUrl } = checkoutSchema.parse(req.body);
    
    // Get course details
    const course = await storage.getCourseById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Formation non trouvée'
      });
    }

    // Validate course has a valid price (prevent free checkouts on misconfigured courses)
    if (!course.price || course.price <= 0) {
      console.error(`[CHECKOUT] Course ${courseId} has invalid price:`, course.price);
      return res.status(400).json({
        success: false,
        error: 'Formation sans prix configuré — contactez l\'administrateur'
      });
    }
    const coursePrice: number = course.price;

    // Check if user already enrolled
    const existingEnrollment = await storage.getEnrollment(userId, courseId);
    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        error: 'Vous êtes déjà inscrit à cette formation'
      });
    }

    // Get user details
    const user = await storage.getUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }

    // Create order record
    const order = await storage.createOrder({
      userId,
      courseId,
      orderType: 'online_course',
      referenceId: courseId,
      amount: coursePrice,
      currency: 'XOF',
      status: 'pending',
      paymentMethod: 'wave',
    });

    // Create Wave checkout.
    // customerPhone : celui fourni par le frontend (modale avant redirection).
    // Fallback sur un numéro par défaut uniquement si le front n'en fournit pas
    // (ne devrait pas arriver en prod, mais on garde le fallback par sécurité).
    const defaultPhone = process.env.WAVE_COUNTRY === 'CI' ? '+2250000000000' : '+2210000000000';
    const phoneForWave = (customerPhone && customerPhone.trim()) || defaultPhone;

    // Base URL pour les callbacks / returns. En dev on tolère l'absence d'APP_BASE_URL
    // en utilisant l'URL construite depuis l'entête Host (PayDunya callback_url doit
    // être publique en prod, donc APP_BASE_URL doit être défini en production).
    const appBaseUrl = process.env.APP_BASE_URL || `${req.protocol}://${req.get('host')}`;

    const waveResult = await createWaveCheckout({
      amount: coursePrice,
      customerName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Utilisateur',
      customerEmail: user.email || `user-${userId}@kemetservices.com`,
      customerPhone: phoneForWave,
      orderId: order.id,
      description: `Formation: ${course.title}`,
      // Après paiement, PayDunya redirige vers la page de retour côté client,
      // qui polle /api/payments/wave/status/:orderId pour afficher le résultat.
      returnUrl: returnUrl || `${appBaseUrl}/paiement/retour/${order.id}`,
      cancelUrl: cancelUrl || `${appBaseUrl}/paiement/retour/${order.id}?cancelled=1`,
    });

    if (!waveResult.success) {
      // Update order status to failed
      await storage.updateOrder(order.id, { 
        status: 'failed',
        failureReason: waveResult.error 
      });
      
      return res.status(500).json({ 
        success: false, 
        error: waveResult.error || 'Erreur lors de la création du paiement' 
      });
    }

    // Update order with checkout ID
    await storage.updateOrder(order.id, {
      waveCheckoutId: waveResult.checkoutId,
    });

    res.json({
      success: true,
      paymentUrl: waveResult.paymentUrl,
      orderId: order.id,
      checkoutId: waveResult.checkoutId,
      fees: waveResult.fees,
    });

  } catch (error) {
    console.error('Checkout error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Données invalides',
        details: error.errors
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de la création du paiement' 
    });
  }
});

// POST /api/payments/wave/webhook - Handle PayDunya IPN notifications
//
// PayDunya sends IPN as application/x-www-form-urlencoded.
// All fields are nested under `data.*` and `data.hash` is SHA-512(MasterKey).
// See server/payments/wave.ts for the verification mechanism.
router.post('/wave/webhook', async (req, res) => {
  // Generate trace ID for this webhook call (for log correlation)
  const traceId = `wh_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const logPrefix = `[WAVE-WEBHOOK ${traceId}]`;

  try {
    const sourceIp = (req.headers['x-forwarded-for'] as string) || req.ip || 'unknown';
    const contentType = req.headers['content-type'] || 'unknown';

    console.log(`${logPrefix} Received`, {
      ip: sourceIp,
      contentType,
      hasData: !!req.body?.data,
      hasHash: !!req.body?.data?.hash,
    });

    // --- STEP 1: Validate payload structure (must have data.* nested object) ---
    const payload = req.body;
    if (!payload || typeof payload !== 'object' || !payload.data || typeof payload.data !== 'object') {
      console.error(`${logPrefix} REJECTED: invalid payload structure — expected data.* object`);
      return res.status(400).json({
        success: false,
        error: 'Payload invalide'
      });
    }

    // --- STEP 2: Verify PayDunya IPN hash (SHA-512 of MasterKey) ---
    const isValid = verifyWaveWebhook(payload);
    if (!isValid) {
      console.error(`${logPrefix} REJECTED: invalid hash — not from PayDunya`);
      return res.status(401).json({
        success: false,
        error: 'Webhook non autorisé'
      });
    }

    // --- STEP 3: Process webhook payload ---
    const webhookData = processWaveWebhook(payload);
    console.log(`${logPrefix} Parsed`, {
      orderId: webhookData.orderId,
      status: webhookData.status,
      transactionId: webhookData.transactionId,
      amount: webhookData.amount,
    });

    if (!webhookData.orderId) {
      console.error(`${logPrefix} REJECTED: no orderId in custom_data`);
      return res.status(400).json({
        success: false,
        error: 'OrderId manquant'
      });
    }

    // --- STEP 4: Fetch order ---
    const order = await storage.getOrderById(webhookData.orderId);
    if (!order) {
      console.error(`${logPrefix} REJECTED: order not found`, { orderId: webhookData.orderId });
      return res.status(404).json({
        success: false,
        error: 'Commande non trouvée'
      });
    }

    // --- STEP 5: Validate amount (CRITICAL: never trust the gateway blindly) ---
    if (webhookData.amount !== undefined && webhookData.amount !== null) {
      const expectedAmount = Number(order.amount);
      const receivedAmount = Number(webhookData.amount);

      if (!Number.isFinite(receivedAmount) || receivedAmount !== expectedAmount) {
        console.error(`${logPrefix} REJECTED: amount mismatch`, {
          orderId: order.id,
          expected: expectedAmount,
          received: receivedAmount,
        });
        // Mark order as failed for investigation
        await storage.updateOrder(order.id, {
          status: 'failed',
          failureReason: `Amount mismatch: expected ${expectedAmount} XOF, received ${receivedAmount} XOF`,
        });
        return res.status(400).json({
          success: false,
          error: 'Montant incohérent'
        });
      }
    } else {
      // If gateway doesn't send amount, log a warning but don't reject
      // (PayDunya to confirm whether amount is always present)
      console.warn(`${logPrefix} No amount in payload — cannot validate against order`, {
        orderId: order.id,
        orderAmount: order.amount,
      });
    }

    // --- STEP 6: Idempotency — skip if order already in final state ---
    if (order.status === 'completed' && webhookData.status === 'completed') {
      console.log(`${logPrefix} Already completed, idempotent skip`, { orderId: order.id });
      return res.json({
        success: true,
        message: 'Webhook déjà traité (idempotence)'
      });
    }

    // --- STEP 7: Update order status ---
    await storage.updateOrder(order.id, {
      status: webhookData.status,
      waveTransactionId: webhookData.transactionId,
      paidAt: webhookData.status === 'completed' ? new Date() : undefined,
    });
    console.log(`${logPrefix} Order updated`, {
      orderId: order.id,
      newStatus: webhookData.status,
    });

    // --- STEP 8: If payment completed, create enrollment (online courses only, with DB-level idempotency) ---
    if (
      webhookData.status === 'completed' &&
      order.orderType === 'online_course' &&
      order.userId &&
      order.courseId
    ) {
      try {
        const existingEnrollment = await storage.getEnrollment(order.userId, order.courseId);

        if (!existingEnrollment) {
          await storage.createEnrollment({
            userId: order.userId,
            courseId: order.courseId,
            status: 'active',
            progressPercent: 0,
          });
          console.log(`${logPrefix} Enrollment created`, {
            userId: order.userId,
            courseId: order.courseId,
          });
        } else {
          console.log(`${logPrefix} Enrollment already exists`, {
            userId: order.userId,
            courseId: order.courseId,
          });
        }
      } catch (enrollmentError: any) {
        // The UNIQUE constraint (userId, courseId) acts as a safety net for concurrent webhooks
        if (enrollmentError?.code === '23505') {
          console.log(`${logPrefix} Enrollment race condition avoided by UNIQUE constraint`);
        } else {
          console.error(`${logPrefix} Enrollment creation failed`, enrollmentError);
          // Don't fail the webhook — order is still correctly marked as paid,
          // we can manually reconcile if needed
        }
      }

      // --- STEP 9: Envoyer l'email de confirmation de paiement (fire-and-forget) ---
      // On n'envoie QUE si la transition vient d'avoir lieu (order.status précédent
      // était différent de "completed" — on le sait grâce au step 6 d'idempotence
      // qui aurait déjà renvoyé plus haut si order était déjà completed).
      dispatchPaymentConfirmationEmail(order.id, `${logPrefix}[EMAIL]`);
    }

    console.log(`${logPrefix} SUCCESS`);
    res.json({
      success: true,
      message: 'Webhook traité avec succès'
    });

  } catch (error) {
    console.error(`${logPrefix} UNEXPECTED ERROR`, error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors du traitement du webhook'
    });
  }
});

// GET /api/payments/wave/status/:orderId - Check payment status
//
// Renvoie en plus les infos du cours (slug/titre) pour que la page de retour
// (/paiement/retour/:orderId) puisse afficher un CTA "Accéder à ma formation"
// sans requête additionnelle. Strictement owner-only.
router.get('/wave/status/:orderId', async (req: any, res) => {
  try {
    // Check authentication
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentification requise'
      });
    }

    const { orderId } = req.params;
    const userId = req.user.claims.sub;

    // Get order
    const order = await storage.getOrderById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Commande non trouvée'
      });
    }

    // Verify user owns this order
    if (order.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Accès non autorisé'
      });
    }

    // If order has waveCheckoutId, check with PayDunya
    if (order.waveCheckoutId && order.status === 'pending') {
      const paymentStatus = await checkWavePaymentStatus(order.waveCheckoutId);

      if (paymentStatus.success && paymentStatus.status !== order.status) {
        // Update order status if changed
        await storage.updateOrder(order.id, {
          status: paymentStatus.status,
          waveTransactionId: paymentStatus.transactionId,
          paidAt: paymentStatus.status === 'completed' ? new Date() : undefined,
        });

        // If completed, create enrollment (online courses only)
        if (
          paymentStatus.status === 'completed' &&
          order.orderType === 'online_course' &&
          order.userId &&
          order.courseId
        ) {
          const existingEnrollment = await storage.getEnrollment(order.userId, order.courseId);
          if (!existingEnrollment) {
            await storage.createEnrollment({
              userId: order.userId,
              courseId: order.courseId,
              status: 'active',
              progressPercent: 0,
            });
          }

          // Envoyer l'email de confirmation de paiement (fire-and-forget).
          // Ce chemin est emprunté quand le webhook IPN ne passe pas (ex: dev
          // localhost, réseau marchand qui bloque). Évite le double envoi car
          // on ne déclenche que sur la transition pending → completed.
          dispatchPaymentConfirmationEmail(order.id, '[WAVE-STATUS][EMAIL]');
        }

        // Ré-assigner le statut sur l'objet local pour qu'il soit renvoyé
        // avec les bonnes infos plus bas (évite un double res.json).
        order.status = paymentStatus.status;
        order.waveTransactionId = paymentStatus.transactionId ?? order.waveTransactionId;
      }
    }

    // Récupérer les infos de la formation pour le CTA de la page de retour.
    // On ne révèle que des champs publics (titre, slug).
    let course: { id: string; title: string; slug: string } | null = null;
    if (order.courseId) {
      const c = await storage.getCourseById(order.courseId);
      if (c) course = { id: c.id, title: c.title, slug: c.slug };
    }

    res.json({
      success: true,
      status: order.status,
      transactionId: order.waveTransactionId,
      amount: order.amount,
      currency: order.currency,
      course,
    });

  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la vérification du statut'
    });
  }
});

// ---------------------------------------------------------------------------
// GET /api/payments/my-orders — liste des commandes de l'utilisateur connecté
// ---------------------------------------------------------------------------
//
// Sert à alimenter la section "Mes commandes / reçus" sur la page /mon-compte.
// Renvoie les infos nécessaires pour afficher chaque ligne + un lien de
// téléchargement du reçu (uniquement pour les commandes "completed").
// Strictement propriétaire (on ne renvoie que les orders du user connecté).
router.get('/my-orders', async (req: any, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentification requise' });
    }
    const userId = req.user.claims.sub;

    const orders = await storage.getOrdersByUserId(userId);

    // Enrichir chaque order avec le titre et le slug de la formation (pour affichage).
    const enriched = await Promise.all(
      orders.map(async (o) => {
        let course: { id: string; title: string; slug: string } | null = null;
        if (o.courseId) {
          const c = await storage.getCourseById(o.courseId);
          if (c) course = { id: c.id, title: c.title, slug: c.slug };
        }
        return {
          id: o.id,
          status: o.status,
          amount: o.amount,
          currency: o.currency,
          paymentMethod: o.paymentMethod,
          waveTransactionId: o.waveTransactionId,
          createdAt: o.createdAt,
          paidAt: o.paidAt,
          course,
        };
      }),
    );

    res.json({ success: true, orders: enriched });
  } catch (error) {
    console.error('my-orders error:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la récupération des commandes' });
  }
});

// ---------------------------------------------------------------------------
// GET /api/payments/receipt/:orderId/pdf — télécharger le reçu PDF
// ---------------------------------------------------------------------------
//
// Stream direct du PDF, pas de stockage disque. Strictement owner-only :
// refuse avec 403 si l'utilisateur connecté n'est pas le propriétaire de
// la commande. Refuse aussi si la commande n'est pas "completed" (pas de
// reçu à émettre pour une transaction pending/failed/cancelled).
router.get('/receipt/:orderId/pdf', async (req: any, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentification requise' });
    }
    const requesterId = req.user.claims.sub;
    const { orderId } = req.params;

    const context = await storage.getOrderWithContext(orderId);
    if (!context) {
      return res.status(404).json({ success: false, error: 'Commande introuvable' });
    }

    // Strict : seul le propriétaire peut télécharger son reçu
    if (context.user.id !== requesterId) {
      return res.status(403).json({
        success: false,
        error: 'Accès refusé — vous n\'êtes pas le propriétaire de cette commande',
      });
    }

    if (context.order.status !== 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Aucun reçu disponible pour cette commande (statut : ' + context.order.status + ')',
      });
    }

    if (!context.course) {
      return res.status(400).json({
        success: false,
        error: 'Impossible de générer le reçu : formation introuvable',
      });
    }

    // Headers pour téléchargement PDF
    const receiptFilename = `recu-kemet-${context.order.id.slice(0, 8)}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${receiptFilename}"`);
    res.setHeader('Cache-Control', 'private, max-age=0, no-cache');

    // Le générateur attend le shape { order, user, course }. On construit un
    // User minimal à partir du context (assez pour formatCustomerName).
    generateReceiptPdf(
      {
        order: context.order,
        user: {
          id: context.user.id,
          firstName: context.user.firstName,
          lastName: context.user.lastName,
          email: context.user.email,
          // Champs inutilisés par le générateur mais exigés par le type User :
          username: null,
          password: null,
          profileImageUrl: null,
          role: 'participant',
          createdAt: null,
          updatedAt: null,
          authType: 'local',
          status: 'active',
          isTemporaryPassword: false,
          lastLoginAt: null,
          passwordResetAt: null,
          passwordResetToken: null,
          passwordResetTokenExpiry: null,
        } as any,
        course: {
          id: context.course.id,
          title: context.course.title,
          slug: context.course.slug,
          defaultDuration: context.course.defaultDuration,
          duration: context.course.duration,
        } as any,
      },
      res,
    );
  } catch (error) {
    console.error('Receipt PDF error:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: 'Erreur lors de la génération du reçu' });
    }
  }
});

export default router;
