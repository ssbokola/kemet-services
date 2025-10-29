import express from 'express';
import { db } from '../db';
import { bootcampRegistrations, orders, insertBootcampRegistrationSchema } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { createWaveCheckout } from '../payments/wave';

const router = express.Router();

/**
 * POST /api/bootcamp-registrations
 * Create a new bootcamp registration and initiate Wave payment
 */
router.post('/', async (req, res) => {
  try {
    // Validate request body using Zod schema
    const validatedData = insertBootcampRegistrationSchema.parse(req.body);
    
    const {
      bootcampName,
      fullName,
      email,
      phone,
      organization,
      pricingTier,
      numberOfParticipants,
      totalAmount
    } = validatedData;

    // Server-side price calculation (never trust client)
    const participants = numberOfParticipants || 1;
    let calculatedAmount: number;
    
    switch (pricingTier) {
      case 'classic':
        calculatedAmount = 200000;
        break;
      case 'smart_pay':
        calculatedAmount = 160000;
        break;
      case 'team_pack':
        if (participants < 2) {
          return res.status(400).json({ 
            message: 'Team Pack nécessite au moins 2 participants' 
          });
        }
        calculatedAmount = 170000 * participants;
        break;
      case 'max_boost':
        if (participants < 2) {
          return res.status(400).json({ 
            message: 'Max Boost nécessite au moins 2 participants' 
          });
        }
        calculatedAmount = 136000 * participants;
        break;
      default:
        return res.status(400).json({ 
          message: 'Formule tarifaire invalide' 
        });
    }
    
    // Use server-calculated amount instead of client-provided
    const finalAmount = calculatedAmount;

    // Create order first
    const orderId = `BOOTCAMP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const [order] = await db.insert(orders).values({
      userId: null, // Anonymous registration
      orderType: 'bootcamp',
      referenceId: orderId,
      amount: finalAmount, // Use server-calculated amount
      currency: 'XOF',
      status: 'pending',
      paymentMethod: 'wave',
      metadata: { bootcampName, pricingTier, numberOfParticipants: participants }
    }).returning();

    // Create registration
    const [registration] = await db.insert(bootcampRegistrations).values({
      bootcampName,
      fullName,
      email,
      phone,
      organization,
      pricingTier,
      numberOfParticipants: participants,
      totalAmount: finalAmount, // Use server-calculated amount
      orderId: order.id,
      paymentStatus: 'pending'
    }).returning();

    // Initiate Wave checkout
    try {
      const waveResponse = await createWaveCheckout({
        amount: finalAmount, // Use server-calculated amount
        customerName: fullName,
        customerEmail: email,
        customerPhone: phone,
        orderId: orderId,
        description: `Inscription Bootcamp Stock+ - ${pricingTier.toUpperCase()}`,
        returnUrl: `${process.env.APP_BASE_URL || 'http://localhost:5000'}/bootcamp-stock?payment=success`,
        cancelUrl: `${process.env.APP_BASE_URL || 'http://localhost:5000'}/bootcamp-stock?payment=cancelled`
      });

      if (waveResponse.success && waveResponse.paymentUrl) {
        // Update order with Wave details
        await db.update(orders)
          .set({ 
            waveCheckoutId: waveResponse.checkoutId,
            wavePaymentUrl: waveResponse.paymentUrl 
          })
          .where(eq(orders.id, order.id));

        return res.json({
          success: true,
          registrationId: registration.id,
          orderId: order.id,
          paymentUrl: waveResponse.paymentUrl
        });
      } else {
        // Wave checkout failed, clean up
        await db.delete(bootcampRegistrations).where(eq(bootcampRegistrations.id, registration.id));
        await db.delete(orders).where(eq(orders.id, order.id));

        return res.status(500).json({
          message: waveResponse.error || 'Erreur lors de l\'initialisation du paiement'
        });
      }
    } catch (waveError: any) {
      console.error('Wave checkout error:', waveError);
      
      // Clean up on error
      await db.delete(bootcampRegistrations).where(eq(bootcampRegistrations.id, registration.id));
      await db.delete(orders).where(eq(orders.id, order.id));

      // Graceful error handling if Wave is not configured
      if (waveError.message?.includes('PAYDUNYA')) {
        return res.json({
          success: true,
          registrationId: registration.id,
          orderId: order.id,
          message: 'Inscription enregistrée (paiement Wave non configuré en développement)'
        });
      }

      return res.status(500).json({
        message: 'Erreur lors de l\'initialisation du paiement'
      });
    }
  } catch (error: any) {
    console.error('Bootcamp registration error:', error);
    return res.status(500).json({
      message: error.message || 'Erreur lors de l\'inscription au bootcamp'
    });
  }
});

export default router;
