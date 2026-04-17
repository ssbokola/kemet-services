// Email de confirmation de paiement — Chantier 4 Lot 2.
//
// Envoyé après qu'un paiement Wave a été validé (statut order = completed).
// Contient :
//   - Récap de la transaction (montant, méthode, référence Wave, date)
//   - Récap de la formation (titre, durée)
//   - CTA "Accéder à ma formation"
//   - Mention du reçu téléchargeable depuis /mon-compte
//
// Déclencheurs :
//   - server/routes/payments.ts → webhook IPN PayDunya (quand status devient completed)
//   - server/routes/payments.ts → polling /wave/status/:orderId (quand passage en completed)
//
// Pattern fire-and-forget : l'envoi est encapsulé dans un try/catch pour ne
// jamais bloquer la réponse HTTP si l'email échoue.

import type { Course, User, Order } from '@shared/schema';

interface PaymentConfirmationData {
  user: User;
  course: Course;
  order: Order;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatFullName(user: User): string {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  return user.firstName || user.lastName || user.email || 'Cher apprenant';
}

function formatAmount(amount: number, currency: string): string {
  return `${amount.toLocaleString('fr-FR')} ${currency}`;
}

function formatFrenchDate(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getAppBaseUrl(): string {
  return (
    process.env.APP_BASE_URL ||
    `https://${process.env.REPLIT_DOMAINS?.split(',')[0] || 'kemetservices.com'}`
  );
}

// ---------------------------------------------------------------------------
// Génération du HTML
// ---------------------------------------------------------------------------

export function generatePaymentConfirmationHTML(data: PaymentConfirmationData): string {
  const userName = formatFullName(data.user);
  const appUrl = getAppBaseUrl();
  const courseUrl = `${appUrl}/mon-compte`;
  const receiptUrl = `${appUrl}/mon-compte`; // La facture PDF sera téléchargeable depuis cette page (tâche 2 du Lot 2)
  const paidAt = data.order.paidAt ? formatFrenchDate(data.order.paidAt) : formatFrenchDate(new Date());
  const amount = formatAmount(Number(data.order.amount), data.order.currency || 'XOF');
  const transactionRef = data.order.waveTransactionId || data.order.id.slice(0, 8).toUpperCase();
  const courseDuration = data.course.duration
    ? `${Math.floor(data.course.duration / 60)}h ${data.course.duration % 60}min`
    : data.course.defaultDuration
    ? `${data.course.defaultDuration} heure${data.course.defaultDuration > 1 ? 's' : ''}`
    : '—';

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Paiement confirmé - Kemet Services</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1f2937; background: #f3f4f6; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .card { background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(135deg, #059669 0%, #0d9488 100%); color: white; padding: 40px 30px; text-align: center; }
    .header-icon { width: 60px; height: 60px; background: rgba(255,255,255,0.2); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 15px; font-size: 32px; }
    .header h1 { margin: 0; font-size: 26px; font-weight: 700; }
    .header p { margin: 8px 0 0 0; opacity: 0.95; font-size: 15px; }
    .content { padding: 30px; }
    .greeting { font-size: 16px; margin-bottom: 20px; }
    .receipt-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .receipt-title { font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #059669; margin: 0 0 15px 0; }
    .receipt-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #d1fae5; font-size: 14px; }
    .receipt-row:last-child { border-bottom: none; }
    .receipt-label { color: #6b7280; }
    .receipt-value { color: #111827; font-weight: 600; text-align: right; }
    .amount-row { padding-top: 12px; margin-top: 8px; border-top: 2px solid #059669 !important; }
    .amount-value { font-size: 20px; font-weight: 700; color: #059669; }
    .course-card { background: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #0d9488; }
    .course-label { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; margin: 0 0 8px 0; }
    .course-title { font-size: 18px; color: #111827; margin: 0 0 10px 0; font-weight: 600; }
    .course-meta { font-size: 14px; color: #6b7280; }
    .cta-wrapper { text-align: center; margin: 30px 0 20px 0; }
    .cta-button { display: inline-block; background: #059669; color: white !important; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; }
    .cta-secondary { display: inline-block; color: #0d9488 !important; padding: 10px 16px; text-decoration: none; font-weight: 500; font-size: 14px; margin-top: 10px; }
    .info-box { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px; font-size: 14px; }
    .footer { text-align: center; padding: 20px 30px 30px 30px; color: #6b7280; font-size: 13px; border-top: 1px solid #e5e7eb; }
    .footer strong { color: #1f2937; }
    .small-note { font-size: 12px; color: #9ca3af; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <div class="header-icon">✅</div>
        <h1>Paiement confirmé</h1>
        <p>Votre inscription a été validée avec succès</p>
      </div>

      <div class="content">
        <p class="greeting">Bonjour ${userName},</p>

        <p>
          Nous avons bien reçu votre paiement. Merci pour votre confiance ! Votre
          accès à la formation est activé dès maintenant.
        </p>

        <!-- Récapitulatif de la transaction -->
        <div class="receipt-box">
          <p class="receipt-title">🧾 Reçu de paiement</p>
          <div class="receipt-row">
            <span class="receipt-label">Commande n°</span>
            <span class="receipt-value">${data.order.id.slice(0, 8).toUpperCase()}</span>
          </div>
          <div class="receipt-row">
            <span class="receipt-label">Date de paiement</span>
            <span class="receipt-value">${paidAt}</span>
          </div>
          <div class="receipt-row">
            <span class="receipt-label">Moyen de paiement</span>
            <span class="receipt-value">Wave (via PayDunya)</span>
          </div>
          <div class="receipt-row">
            <span class="receipt-label">Référence transaction</span>
            <span class="receipt-value" style="font-family: monospace; font-size: 12px;">${transactionRef}</span>
          </div>
          <div class="receipt-row amount-row">
            <span class="receipt-label"><strong>Montant payé</strong></span>
            <span class="receipt-value amount-value">${amount}</span>
          </div>
        </div>

        <!-- Récapitulatif de la formation -->
        <div class="course-card">
          <p class="course-label">📚 Formation</p>
          <h3 class="course-title">${data.course.title}</h3>
          <p class="course-meta">Durée : ${courseDuration}</p>
        </div>

        <!-- CTA principal -->
        <div class="cta-wrapper">
          <a href="${courseUrl}" class="cta-button">
            Accéder à ma formation →
          </a>
          <br>
          <a href="${receiptUrl}" class="cta-secondary">
            Retrouver ma facture dans mon espace
          </a>
        </div>

        <!-- Info utile -->
        <div class="info-box">
          <strong>💡 Astuce :</strong> Votre accès à la formation est illimité. Vous pouvez
          apprendre à votre rythme et revenir aussi souvent que nécessaire.
        </div>

        <p style="margin-top: 25px; color: #6b7280; font-size: 14px;">
          Une question sur votre commande ou votre paiement ?<br>
          Écrivez-nous à <a href="mailto:infos@kemetservices.com" style="color: #0d9488;">infos@kemetservices.com</a>
        </p>
      </div>

      <div class="footer">
        <p><strong>Kemet Services</strong></p>
        <p>Formation et Consultance pour Pharmacies d'Officine</p>
        <p>Abidjan, Côte d'Ivoire</p>
        <p class="small-note">
          Cet email est envoyé automatiquement suite à votre paiement. Conservez-le
          comme preuve de transaction.
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Envoi de l'email via nodemailer + Gmail
// ---------------------------------------------------------------------------

export async function sendPaymentConfirmation(
  user: User,
  course: Course,
  order: Order,
): Promise<boolean> {
  try {
    const emailHTML = generatePaymentConfirmationHTML({ user, course, order });
    const subject = `✅ Paiement confirmé - ${course.title} - Kemet Services`;

    // Graceful skip si Gmail pas configuré (dev local)
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.log(`[PAYMENT-EMAIL] Gmail non configuré — email simulé pour ${user.email}: ${subject}`);
      return true;
    }

    if (!user.email) {
      console.warn('[PAYMENT-EMAIL] User sans email — envoi skippé', { userId: user.id });
      return false;
    }

    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.default.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"Kemet Services" <${process.env.GMAIL_USER}>`,
      to: user.email,
      subject,
      html: emailHTML,
    });

    console.log(`[PAYMENT-EMAIL] Email de confirmation envoyé à ${user.email} pour order ${order.id}`);
    return true;
  } catch (error) {
    console.error('[PAYMENT-EMAIL] Échec envoi email de confirmation de paiement:', error);
    return false;
  }
}
