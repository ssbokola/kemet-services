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
      amount: course.price,
      currency: 'XOF',
      status: 'pending',
      paymentMethod: 'wave',
    });

    // Create Wave checkout (use default phone based on country if user doesn't have one)
    const defaultPhone = process.env.WAVE_COUNTRY === 'CI' ? '+2250000000000' : '+2210000000000';
    const waveResult = await createWaveCheckout({
      amount: course.price,
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

// POST /api/payments/wave/webhook - Handle Wave payment notifications
router.post('/wave/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-paydunya-signature'] as string;
    const paydunyaToken = req.headers['paydunya-token'] as string;
    
    // Verify webhook authenticity
    const isValid = verifyWaveWebhook(req.body, signature, paydunyaToken);
    
    if (!isValid) {
      console.error('Invalid webhook signature or token');
      return res.status(401).json({ 
        success: false, 
        error: 'Webhook non autorisé' 
      });
    }

    // Process webhook payload
    const webhookData = processWaveWebhook(req.body);
    
    if (!webhookData.orderId) {
      console.error('No orderId in webhook payload');
      return res.status(400).json({ 
        success: false, 
        error: 'OrderId manquant' 
      });
    }

    // Get order
    const order = await storage.getOrderById(webhookData.orderId);
    if (!order) {
      console.error('Order not found:', webhookData.orderId);
      return res.status(404).json({ 
        success: false, 
        error: 'Commande non trouvée' 
      });
    }

    // Update order status
    await storage.updateOrder(order.id, {
      status: webhookData.status,
      waveTransactionId: webhookData.transactionId,
      paidAt: webhookData.status === 'completed' ? new Date() : undefined,
    });

    // If payment completed, create enrollment
    if (webhookData.status === 'completed') {
      try {
        // Check if enrollment already exists (idempotency)
        const existingEnrollment = await storage.getEnrollment(order.userId, order.courseId);
        
        if (!existingEnrollment) {
          await storage.createEnrollment({
            userId: order.userId,
            courseId: order.courseId,
            status: 'active',
            progressPercent: 0,
          });
          
          console.log(`Enrollment created for user ${order.userId} in course ${order.courseId}`);
        } else {
          console.log(`Enrollment already exists for user ${order.userId} in course ${order.courseId}`);
        }
      } catch (enrollmentError) {
        console.error('Error creating enrollment:', enrollmentError);
        // Don't fail the webhook - order is still marked as paid
      }
    }

    res.json({ 
      success: true, 
      message: 'Webhook traité avec succès' 
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
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

        // If completed, create enrollment
        if (paymentStatus.status === 'completed') {
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
