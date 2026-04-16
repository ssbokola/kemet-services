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

/**
 * PayDunya IPN webhook payload structure.
 *
 * PayDunya sends the IPN as `application/x-www-form-urlencoded` with ALL fields
 * nested under the `data` key. The integrity hash is `data.hash` (SHA-512 of the
 * MasterKey, hex-encoded).
 *
 * Reference (confirmed from PayDunya official docs, PHP/Python/Node.js examples):
 * - https://developers.paydunya.com/doc/EN/http_json
 * - https://developers.paydunya.com/doc/EN/NodeJS
 */
interface PaydunyaIPNPayload {
  data?: {
    hash?: string;               // SHA-512(MasterKey) in hex
    status?: string;             // 'completed' | 'pending' | 'failed' | 'cancelled'
    response_code?: string;      // '00' = success
    response_text?: string;
    invoice?: {
      token?: string;
      total_amount?: number | string;
      description?: string;
    };
    custom_data?: {
      [key: string]: string;     // orderId is stored here
    } | string;
    transaction?: {
      id?: string;
    };
    receipt_identifier?: string;
    receipt_url?: string;
    customer?: {
      name?: string;
      phone?: string;
      email?: string;
    };
    [key: string]: any;
  };
}

// Legacy alias kept for backward compatibility with existing route code
type WaveWebhookPayload = PaydunyaIPNPayload;

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
    // --- Appel PayDunya : création de l'invoice checkout ---
    //
    // On utilise le "checkout standard" PayDunya, qui renvoie une URL de
    // page de paiement hébergée par PayDunya où le client choisit son moyen
    // de paiement (Wave, Orange Money, carte, etc.).
    //
    // On N'UTILISE PLUS l'API SOFTPAY Wave (wave-ci / wave-senegal) car elle
    // n'est pas accessible en sandbox sans activation manuelle côté compte
    // marchand. Le checkout standard fonctionne immédiatement avec n'importe
    // quel compte PayDunya (test ou live) et supporte Wave nativement.
    //
    // Doc : https://developers.paydunya.com/doc/FR/sanbox
    const checkoutPayload = {
      invoice: {
        total_amount: amount,
        description: description,
      },
      store: {
        name: 'KEMET Services',
        website_url: process.env.APP_BASE_URL || 'https://kemetservices.com',
      },
      // Pré-remplit les champs côté page PayDunya pour éviter au client
      // de ressaisir ses infos. Ce n'est pas exigé par l'API.
      customer: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
      },
      // custom_data est renvoyé tel quel dans l'IPN webhook (on y stocke notre orderId).
      custom_data: { orderId },
      actions: {
        callback_url: `${process.env.APP_BASE_URL}/api/payments/wave/webhook`,
        return_url: returnUrl || `${process.env.APP_BASE_URL}/formations`,
        cancel_url: cancelUrl || `${process.env.APP_BASE_URL}/formations`,
      },
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

    // PayDunya répond typiquement en JSON, mais en cas d'erreur d'URL ou
    // de config, le reverse-proxy Cloudflare peut renvoyer du HTML.
    // On lit d'abord en texte pour loguer et éviter un .json() qui crash.
    const rawBody = await checkoutResponse.text();
    let checkoutData: any;
    try {
      checkoutData = JSON.parse(rawBody);
    } catch {
      console.error('[PAYDUNYA] Non-JSON response from /checkout-invoice/create', {
        status: checkoutResponse.status,
        contentType: checkoutResponse.headers.get('content-type'),
        bodyPreview: rawBody.slice(0, 200),
      });
      return {
        success: false,
        error: `PayDunya a répondu en ${checkoutResponse.status}. Vérifiez vos clés API et le mode (test/live).`,
      };
    }

    if (!checkoutResponse.ok || checkoutData.response_code !== '00') {
      console.error('PayDunya checkout error:', checkoutData);
      return {
        success: false,
        error: checkoutData.response_text || 'Erreur lors de la création du paiement',
      };
    }

    // checkoutData.response_text contient l'URL de la page de paiement
    // (ex : https://paydunya.com/sandbox-checkout/invoice/test_xxx).
    const invoiceToken: string = checkoutData.token;
    const paymentUrl: string = checkoutData.response_text;

    if (!paymentUrl || !invoiceToken) {
      console.error('[PAYDUNYA] Missing paymentUrl or token in response', checkoutData);
      return {
        success: false,
        error: 'Réponse PayDunya incomplète',
      };
    }

    return {
      success: true,
      paymentUrl,
      checkoutId: invoiceToken,
      fees: 0,
      message: checkoutData.description || 'Checkout invoice created',
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
 * Verify PayDunya IPN webhook authenticity.
 *
 * Mechanism (confirmed from PayDunya official documentation — PHP/Python/Node.js examples):
 *   1. PayDunya computes SHA-512(MasterKey) as hex-encoded digest
 *   2. Sends it in the POST body as `data.hash`
 *   3. Request arrives as `application/x-www-form-urlencoded`
 *   4. Server recomputes SHA-512(MasterKey) locally and compares both hashes
 *
 * PHP reference:
 *   if ($_POST['data']['hash'] === hash('sha512', "MASTER_KEY")) { ... }
 *
 * Python reference:
 *   if request.POST['data']['hash'] == hashlib.sha512(b"MASTER_KEY").hexdigest(): ...
 *
 * @param payload - Parsed request body (should contain `data.hash`)
 * @returns true if the hash matches SHA-512(MasterKey), false otherwise
 */
export function verifyWaveWebhook(payload: PaydunyaIPNPayload): boolean {
  const masterKey = process.env.PAYDUNYA_MASTER_KEY || '';

  if (!masterKey) {
    console.error('[IPN-VERIFY] PAYDUNYA_MASTER_KEY not configured — cannot verify');
    return false;
  }

  const receivedHash = payload?.data?.hash;
  if (!receivedHash || typeof receivedHash !== 'string') {
    console.error('[IPN-VERIFY] No hash found at data.hash in payload');
    return false;
  }

  try {
    // Compute expected hash: SHA-512(MasterKey) in hex
    const expectedHash = crypto
      .createHash('sha512')
      .update(masterKey, 'utf8')
      .digest('hex');

    // Timing-safe comparison
    const receivedBuffer = Buffer.from(receivedHash, 'utf8');
    const expectedBuffer = Buffer.from(expectedHash, 'utf8');

    if (receivedBuffer.length !== expectedBuffer.length) {
      console.error('[IPN-VERIFY] Hash length mismatch — likely invalid format');
      return false;
    }

    const isValid = crypto.timingSafeEqual(receivedBuffer, expectedBuffer);
    if (!isValid) {
      console.error('[IPN-VERIFY] Hash mismatch — webhook is NOT from PayDunya');
    }
    return isValid;
  } catch (error) {
    console.error('[IPN-VERIFY] Verification error:', error);
    return false;
  }
}

/**
 * Parse PayDunya IPN webhook payload into a normalized shape.
 *
 * PayDunya structure (urlencoded, keys under `data`):
 *   data[hash]              → SHA-512(MasterKey) (used for auth, not here)
 *   data[status]            → completed | pending | cancelled | failed
 *   data[invoice][token]    → checkout token
 *   data[invoice][total_amount] → amount paid (number or string)
 *   data[custom_data][orderId]  → our internal orderId (or plain string)
 *   data[transaction][id]   → PayDunya transaction reference
 *   data[receipt_identifier] → receipt number
 */
export function processWaveWebhook(payload: PaydunyaIPNPayload): {
  orderId: string;
  status: 'completed' | 'pending' | 'failed' | 'cancelled';
  transactionId: string;
  amount?: number;
  checkoutToken?: string;
} {
  const data = payload?.data ?? {};

  // Normalize status
  const rawStatus = (data.status || '').toLowerCase();
  const status: 'completed' | 'pending' | 'failed' | 'cancelled' =
    rawStatus === 'completed' ? 'completed'
    : rawStatus === 'pending' ? 'pending'
    : rawStatus === 'cancelled' ? 'cancelled'
    : 'failed';

  // Extract orderId from custom_data (can be string or object depending on how we sent it)
  let orderId = '';
  if (typeof data.custom_data === 'string') {
    orderId = data.custom_data;
  } else if (data.custom_data && typeof data.custom_data === 'object') {
    // custom_data may be sent as { orderId: "..." } or flat
    orderId = (data.custom_data.orderId || data.custom_data.order_id || '').toString();
  }

  // Extract amount — may arrive as string from form-urlencoded
  let amount: number | undefined;
  const rawAmount = data.invoice?.total_amount;
  if (rawAmount !== undefined && rawAmount !== null) {
    const parsed = typeof rawAmount === 'string' ? parseFloat(rawAmount) : Number(rawAmount);
    if (Number.isFinite(parsed)) amount = parsed;
  }

  // Extract transaction id (fallback to receipt_identifier if transaction.id missing)
  const transactionId = data.transaction?.id || data.receipt_identifier || '';

  return {
    orderId,
    status,
    transactionId,
    amount,
    checkoutToken: data.invoice?.token,
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
