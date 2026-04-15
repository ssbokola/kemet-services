import { Router } from 'express';
import { storage } from '../storage';
import { createWaveCheckout, verifyWaveWebhook, processWaveWebhook, checkWavePaymentStatus } from '../payments/wave';
import { z } from 'zod';

const router = Router();

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
    const checkoutSchema = z.object({
      courseId: z.string().min(1),
      returnUrl: z.string().optional(),
      cancelUrl: z.string().optional(),
    });

    const { courseId, returnUrl, cancelUrl } = checkoutSchema.parse(req.body);
    
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

    // Create Wave checkout (use default phone based on country if user doesn't have one)
    const defaultPhone = process.env.WAVE_COUNTRY === 'CI' ? '+2250000000000' : '+2210000000000';
    const waveResult = await createWaveCheckout({
      amount: coursePrice,
      customerName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Utilisateur',
      customerEmail: user.email || `user-${userId}@kemetservices.com`,
      customerPhone: defaultPhone,
      orderId: order.id,
      description: `Formation: ${course.title}`,
      returnUrl: returnUrl || `${process.env.APP_BASE_URL}/mon-compte`,
      cancelUrl: cancelUrl || `${process.env.APP_BASE_URL}/formation/${course.slug}`,
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
        }

        return res.json({
          success: true,
          status: paymentStatus.status,
          transactionId: paymentStatus.transactionId,
        });
      }
    }

    // Return current order status
    res.json({
      success: true,
      status: order.status,
      transactionId: order.waveTransactionId,
    });

  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de la vérification du statut' 
    });
  }
});

export default router;
