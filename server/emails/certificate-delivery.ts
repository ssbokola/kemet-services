/**
 * Email de délivrance de certificat — Lot 3.
 *
 * Envoyé automatiquement quand un participant réussit le quiz de
 * certification (≥ 70 %). L'appel est déclenché depuis
 * server/routes/final-quiz.ts après la création du certificat en DB.
 *
 * Important : fire-and-forget. Si l'envoi échoue (Gmail désactivé en dev,
 * quota, adresse invalide, etc.), on log et on continue — le participant
 * a déjà vu son certificat à l'écran, le mail est un bonus.
 */
import { sendGmail } from '../gmail';

export interface CertificateDeliveryParams {
  to: string;
  firstName: string | null;
  courseTitle: string;
  finalScore: number;
  verificationCode: string;
  baseUrl: string; // ex: https://kemetservices.com
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (c) => map[c]);
}

function buildHtml(params: CertificateDeliveryParams): string {
  const safeName = escapeHtml((params.firstName || '').trim());
  const greeting = safeName ? `Félicitations ${safeName} !` : 'Félicitations !';
  const safeCourse = escapeHtml(params.courseTitle);
  const safeCode = escapeHtml(params.verificationCode);
  const verifyUrl = `${params.baseUrl}/certificats/${params.verificationCode}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Votre certificat Kemet Services</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f3f4f6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .header h1 { margin: 0; font-size: 28px; }
    .header p { margin: 10px 0 0 0; opacity: 0.95; font-size: 15px; }
    .content { background: #ffffff; padding: 35px 30px; }
    .cert-card { background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border: 2px solid #f59e0b; border-radius: 10px; padding: 24px; text-align: center; margin: 24px 0; }
    .cert-card h2 { margin: 0 0 8px 0; color: #92400e; font-size: 20px; }
    .cert-card .course { font-size: 16px; color: #78350f; font-weight: 600; margin: 12px 0; }
    .cert-card .score { font-size: 32px; color: #b45309; font-weight: 700; margin: 10px 0 0 0; }
    .cert-card .score-label { font-size: 12px; color: #92400e; text-transform: uppercase; letter-spacing: 1px; }
    .code-box { background: #f0fdfa; border: 1px solid #ccfbf1; border-radius: 6px; padding: 12px; text-align: center; margin: 20px 0; font-family: 'Courier New', monospace; }
    .code-box strong { color: #0f766e; font-size: 18px; letter-spacing: 2px; }
    .code-box .label { display: block; font-size: 11px; color: #6b7280; margin-bottom: 4px; font-family: 'Segoe UI', sans-serif; letter-spacing: 0; text-transform: uppercase; }
    .cta-button { display: inline-block; background: #0d9488; color: #ffffff !important; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; font-size: 16px; }
    .cta-button:hover { background: #0f766e; }
    .info-box { margin-top: 20px; padding: 15px 18px; background: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 6px; font-size: 14px; color: #1e3a8a; }
    .footer { background: #f9fafb; text-align: center; padding: 25px 20px; color: #6b7280; font-size: 13px; border-radius: 0 0 10px 10px; }
    .footer strong { color: #111827; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎓 ${greeting}</h1>
      <p>Vous avez obtenu votre certificat de formation</p>
    </div>

    <div class="content">
      <p style="font-size: 16px; margin-top: 0;">
        Bravo pour avoir réussi le quiz de certification de votre formation
        <strong>« ${safeCourse} »</strong>. Votre certificat officiel est désormais
        disponible.
      </p>

      <div class="cert-card">
        <h2>✨ Certificat de réussite</h2>
        <div class="course">${safeCourse}</div>
        <div class="score-label">Score obtenu</div>
        <div class="score">${params.finalScore} %</div>
      </div>

      <div class="code-box">
        <span class="label">Code de vérification</span>
        <strong>${safeCode}</strong>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${verifyUrl}" class="cta-button">Voir mon certificat</a>
      </div>

      <p style="font-size: 14px; color: #6b7280; margin-bottom: 8px;">
        Le bouton ne fonctionne pas ? Copiez-collez ce lien dans votre navigateur :
      </p>
      <p style="word-break: break-all; color: #0d9488; font-size: 13px; background: #f0fdfa; padding: 10px; border-radius: 6px; border: 1px solid #ccfbf1;">
        ${verifyUrl}
      </p>

      <div class="info-box">
        <strong>🔍 Certificat vérifiable publiquement</strong><br>
        Toute personne (employeur, régulateur, ordre professionnel…) peut
        authentifier votre certificat en saisissant le code
        <strong>${safeCode}</strong> sur ${params.baseUrl}/certificats/.
        Une fois connecté·e à votre espace, vous pouvez aussi télécharger
        la version PDF officielle depuis la page de votre formation.
      </div>

      <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
        Une question ? Écrivez-nous à
        <a href="mailto:infos@kemetservices.com" style="color: #0d9488;">infos@kemetservices.com</a>.
      </p>
    </div>

    <div class="footer">
      <p style="margin: 0 0 5px 0;"><strong>Kemet Services</strong></p>
      <p style="margin: 0;">Formation et Consultance Pharmaceutique</p>
      <p style="margin: 0;">Côte d'Ivoire</p>
      <p style="margin-top: 12px; font-size: 11px;">
        Email automatique — merci de ne pas répondre directement à ce message.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

function buildText(params: CertificateDeliveryParams): string {
  const greeting = (params.firstName || '').trim()
    ? `Félicitations ${params.firstName!.trim()} !`
    : 'Félicitations !';
  const verifyUrl = `${params.baseUrl}/certificats/${params.verificationCode}`;

  return `
${greeting}

Vous avez réussi le quiz de certification de la formation :
« ${params.courseTitle} »

Score obtenu : ${params.finalScore} %
Code de vérification : ${params.verificationCode}

Voir votre certificat en ligne :
${verifyUrl}

Ce code permet à tout tiers (employeur, régulateur…) de vérifier
l'authenticité de votre certificat.

Une fois connecté·e à votre espace Kemet Services, vous pouvez
également télécharger la version PDF officielle.

Une question ? infos@kemetservices.com

—
Kemet Services
Formation et Consultance Pharmaceutique
Côte d'Ivoire
  `.trim();
}

/**
 * Envoie l'email de certificat. Fire-and-forget : renvoie true/false mais
 * ne throw jamais. Le caller est le submit handler du quiz final, qui ne
 * doit pas bloquer sur l'email.
 */
export async function sendCertificateEmail(
  params: CertificateDeliveryParams,
): Promise<boolean> {
  if (!params.to) {
    console.warn('[CERT-EMAIL] No recipient — skipping.');
    return false;
  }
  return sendGmail({
    to: params.to,
    subject: `🎓 Votre certificat Kemet Services — ${params.courseTitle}`,
    html: buildHtml(params),
    text: buildText(params),
  });
}
