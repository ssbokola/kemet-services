/**
 * Wave Mobile Money Payment Integration via PayDunya SOFTPAY
 * 
 * Documentation: https://developers.paydunya.com/doc/FR/softpay
 * 
 * Required Environment Variables:
 * - PAYDUNYA_MASTER_KEY: Your PayDunya Master Key
 * - PAYDUNYA_PRIVATE_KEY: Your PayDunya Private Key  
 * - PAYDUNYA_PUBLIC_KEY: Your PayDunya Public Key
 * - PAYDUNYA_TOKEN: Your PayDunya Token
 * - PAYDUNYA_MODE: 'test' or 'live'
 * - APP_BASE_URL: Your application base URL (for callbacks)
 */

import crypto from 'crypto';

interface WaveCheckoutParams {
  amount: number; // Amount in FCFA (XOF)
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderId: string;
  description: string;
  returnUrl?: string;
  cancelUrl?: string;
}

interface WaveCheckoutResponse {
  success: boolean;
  paymentUrl?: string;
  checkoutId?: string;
  fees?: number;
  error?: string;
  message?: string;
}

interface WaveWebhookPayload {
  status: string; // 'completed', 'pending', 'failed'
  transaction_id: string;
  custom_data?: string; // orderId
  amount?: number;
  fees?: number;
}

/**
 * Create a Wave checkout session via PayDunya SOFTPAY
 */
export async function createWaveCheckout(params: WaveCheckoutParams): Promise<WaveCheckoutResponse> {
  const {
    amount,
    customerName,
    customerEmail,
    customerPhone,
    orderId,
    description,
    returnUrl,
    cancelUrl
  } = params;

  // PayDunya configuration
  const PAYDUNYA_API_BASE = process.env.PAYDUNYA_MODE === 'live' 
    ? 'https://app.paydunya.com/api/v1' 
    : 'https://app.paydunya.com/sandbox-api/v1';

  try {
    // Step 1: Create PayDunya checkout
    const checkoutPayload = {
      invoice: {
        total_amount: amount,
        description: description,
      },
      store: {
        name: 'KEMET Services',
        website_url: process.env.APP_BASE_URL || 'https://kemetservices.com',
      },
      custom_data: orderId,
      actions: {
        callback_url: `${process.env.APP_BASE_URL}/api/payments/wave/webhook`,
        return_url: returnUrl || `${process.env.APP_BASE_URL}/formations`,
        cancel_url: cancelUrl || `${process.env.APP_BASE_URL}/formations`,
      }
    };

    const checkoutResponse = await fetch(`${PAYDUNYA_API_BASE}/checkout-invoice/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'PAYDUNYA-MASTER-KEY': process.env.PAYDUNYA_MASTER_KEY || '',
        'PAYDUNYA-PRIVATE-KEY': process.env.PAYDUNYA_PRIVATE_KEY || '',
        'PAYDUNYA-TOKEN': process.env.PAYDUNYA_TOKEN || '',
      },
      body: JSON.stringify(checkoutPayload),
    });

    const checkoutData = await checkoutResponse.json();

    if (!checkoutResponse.ok || checkoutData.response_code !== '00') {
      console.error('PayDunya checkout error:', checkoutData);
      return {
        success: false,
        error: checkoutData.response_text || 'Erreur lors de la création du paiement',
      };
    }

    const invoiceToken = checkoutData.token;

    // Step 2: Create Wave SOFTPAY payment - different payload for each country
    const isCI = process.env.WAVE_COUNTRY === 'CI';
    
    const wavePayload = isCI 
      ? {
          // Côte d'Ivoire payload
          wave_ci_fullName: customerName,
          wave_ci_email: customerEmail,
          wave_ci_phone: customerPhone.replace(/\+225|225/, ''), // Remove country code for CI
          wave_ci_payment_token: invoiceToken,
        }
      : {
          // Senegal payload
          wave_senegal_fullName: customerName,
          wave_senegal_email: customerEmail,
          wave_senegal_phone: customerPhone.replace(/\+221|221/, ''), // Remove country code for Senegal
          wave_senegal_payment_token: invoiceToken,
        };

    const waveEndpoint = isCI
      ? `${PAYDUNYA_API_BASE}/softpay/wave-ci`
      : `${PAYDUNYA_API_BASE}/softpay/wave-senegal`;

    const waveResponse = await fetch(waveEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'PAYDUNYA-MASTER-KEY': process.env.PAYDUNYA_MASTER_KEY || '',
        'PAYDUNYA-PRIVATE-KEY': process.env.PAYDUNYA_PRIVATE_KEY || '',
        'PAYDUNYA-TOKEN': process.env.PAYDUNYA_TOKEN || '',
      },
      body: JSON.stringify(wavePayload),
    });

    const waveData = await waveResponse.json();

    if (!waveData.success) {
      console.error('Wave SOFTPAY error:', waveData);
      return {
        success: false,
        error: waveData.message || 'Erreur lors de la création du paiement Wave',
      };
    }

    return {
      success: true,
      paymentUrl: waveData.url,
      checkoutId: invoiceToken,
      fees: waveData.fees || 0,
      message: waveData.message,
    };

  } catch (error) {
    console.error('Wave checkout error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}

/**
 * Verify Wave webhook authenticity
 * 
 * IMPORTANT: This implementation requires either:
 * 1. Valid HMAC-SHA256 signature (preferred for production)
 * 2. Valid PayDunya token in request headers (fallback)
 * 
 * Consult PayDunya's official documentation to confirm their exact webhook signature mechanism:
 * - Algorithm (SHA256, SHA512, etc.)
 * - Header name (X-PayDunya-Signature, etc.)
 * - Payload format (raw body, stringified JSON, etc.)
 * 
 * For production, always verify the signature mechanism with PayDunya support.
 */
export function verifyWaveWebhook(
  payload: any, 
  signature?: string, 
  paydunyaToken?: string
): boolean {
  // Try signature verification first (most secure)
  if (signature) {
    const secret = process.env.PAYDUNYA_WEBHOOK_SECRET || process.env.PAYDUNYA_PRIVATE_KEY || '';
    
    if (!secret) {
      console.error('No webhook secret configured - cannot verify signature');
      return false;
    }

    try {
      const hash = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(payload))
        .digest('hex');
      
      const isValid = hash === signature;
      if (!isValid) {
        console.error('Invalid webhook signature');
      }
      return isValid;
    } catch (error) {
      console.error('Webhook signature verification error:', error);
      return false;
    }
  }

  // Fallback: Verify PayDunya token (less secure but better than nothing)
  if (paydunyaToken) {
    const expectedToken = process.env.PAYDUNYA_TOKEN || '';
    if (!expectedToken) {
      console.error('No PayDunya token configured - cannot verify webhook');
      return false;
    }
    
    const isValid = paydunyaToken === expectedToken;
    if (!isValid) {
      console.error('Invalid PayDunya token in webhook request');
    } else {
      console.warn('Webhook verified using token fallback - signature verification recommended for production');
    }
    return isValid;
  }

  // Reject if neither signature nor token provided
  console.error('Webhook rejected: no signature or PayDunya token provided');
  return false;
}

/**
 * Process Wave webhook payload
 */
export function processWaveWebhook(payload: WaveWebhookPayload): {
  orderId: string;
  status: 'completed' | 'pending' | 'failed';
  transactionId: string;
  amount?: number;
  fees?: number;
} {
  const status = payload.status === 'completed' ? 'completed' 
    : payload.status === 'pending' ? 'pending' 
    : 'failed';

  return {
    orderId: payload.custom_data || '',
    status,
    transactionId: payload.transaction_id,
    amount: payload.amount,
    fees: payload.fees,
  };
}

/**
 * Check payment status via PayDunya
 */
export async function checkWavePaymentStatus(checkoutId: string): Promise<{
  success: boolean;
  status: 'completed' | 'pending' | 'failed' | 'cancelled';
  transactionId?: string;
  error?: string;
}> {
  const PAYDUNYA_API_BASE = process.env.PAYDUNYA_MODE === 'live' 
    ? 'https://app.paydunya.com/api/v1' 
    : 'https://app.paydunya.com/sandbox-api/v1';

  try {
    const response = await fetch(`${PAYDUNYA_API_BASE}/checkout-invoice/confirm/${checkoutId}`, {
      method: 'GET',
      headers: {
        'PAYDUNYA-MASTER-KEY': process.env.PAYDUNYA_MASTER_KEY || '',
        'PAYDUNYA-PRIVATE-KEY': process.env.PAYDUNYA_PRIVATE_KEY || '',
        'PAYDUNYA-TOKEN': process.env.PAYDUNYA_TOKEN || '',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        status: 'failed',
        error: data.response_text || 'Erreur lors de la vérification du paiement',
      };
    }

    const status = data.status === 'completed' ? 'completed'
      : data.status === 'pending' ? 'pending'
      : data.status === 'cancelled' ? 'cancelled'
      : 'failed';

    return {
      success: true,
      status,
      transactionId: data.transaction_id,
    };

  } catch (error) {
    console.error('Wave payment status check error:', error);
    return {
      success: false,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}
