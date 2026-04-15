/**
 * Password Reset Email Template
 *
 * Sent when a user requests a password reset via POST /api/auth/forgot-password.
 * Token is valid for 1 hour (enforced server-side in the reset-password route).
 *
 * Style matches the existing Kemet teal-gradient branding used in
 * server/gmail.ts and server/emails/enrollment.ts.
 */
import { sendGmail } from '../gmail';

interface PasswordResetEmailParams {
  to: string;
  firstName: string;
  resetUrl: string;
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

function buildHtml(firstName: string, resetUrl: string): string {
  const safeName = escapeHtml(firstName || '').trim();
  const greeting = safeName ? `Bonjour ${safeName},` : 'Bonjour,';
  const safeUrl = escapeHtml(resetUrl);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Réinitialisation de votre mot de passe</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f3f4f6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .header h1 { margin: 0; font-size: 26px; }
    .header p { margin: 10px 0 0 0; opacity: 0.9; font-size: 15px; }
    .content { background: #ffffff; padding: 35px 30px; }
    .cta-button { display: inline-block; background: #0d9488; color: #ffffff !important; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; font-size: 16px; }
    .cta-button:hover { background: #0f766e; }
    .link-fallback { word-break: break-all; color: #0d9488; font-size: 13px; background: #f0fdfa; padding: 12px; border-radius: 6px; border: 1px solid #ccfbf1; }
    .warning-box { margin-top: 25px; padding: 15px 18px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 6px; font-size: 14px; color: #78350f; }
    .security-box { margin-top: 20px; padding: 15px 18px; background: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 6px; font-size: 14px; color: #1e3a8a; }
    .footer { background: #f9fafb; text-align: center; padding: 25px 20px; color: #6b7280; font-size: 13px; border-radius: 0 0 10px 10px; }
    .footer strong { color: #111827; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 Réinitialisation du mot de passe</h1>
      <p>Kemet Services - Formation Pharmaceutique</p>
    </div>

    <div class="content">
      <p style="font-size: 16px; margin-top: 0;">${greeting}</p>

      <p>
        Nous avons reçu une demande de réinitialisation du mot de passe associé à votre
        compte Kemet Services. Cliquez sur le bouton ci-dessous pour choisir un nouveau
        mot de passe :
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${safeUrl}" class="cta-button">Réinitialiser mon mot de passe</a>
      </div>

      <p style="font-size: 14px; color: #6b7280; margin-bottom: 8px;">
        Le bouton ne fonctionne pas ? Copiez-collez ce lien dans votre navigateur :
      </p>
      <p class="link-fallback">${safeUrl}</p>

      <div class="warning-box">
        <strong>⏱ Ce lien expire dans 1 heure.</strong><br>
        Passé ce délai, vous devrez recommencer la procédure de réinitialisation depuis
        la page de connexion.
      </div>

      <div class="security-box">
        <strong>🛡 Vous n'êtes pas à l'origine de cette demande ?</strong><br>
        Ignorez simplement cet email — votre mot de passe actuel reste valable et aucune
        modification ne sera effectuée. Si vous recevez ce type d'email de manière
        inattendue et récurrente, contactez-nous à
        <a href="mailto:infos@kemetservices.com" style="color: #1e3a8a;">infos@kemetservices.com</a>.
      </div>

      <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
        Une question ? Notre équipe est disponible à
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

function buildText(firstName: string, resetUrl: string): string {
  const greeting = firstName?.trim() ? `Bonjour ${firstName.trim()},` : 'Bonjour,';
  return `
${greeting}

Nous avons reçu une demande de réinitialisation du mot de passe associé à votre
compte Kemet Services.

Pour choisir un nouveau mot de passe, ouvrez le lien suivant dans votre navigateur :

${resetUrl}

⏱  Ce lien expire dans 1 heure.

🛡  Vous n'êtes pas à l'origine de cette demande ?
Ignorez cet email — votre mot de passe actuel reste valable.

Une question ? Contactez-nous à infos@kemetservices.com.

—
Kemet Services
Formation et Consultance Pharmaceutique
Côte d'Ivoire
  `.trim();
}

/**
 * Send the password-reset email.
 * Returns true on success, false on failure (e.g. Gmail not configured).
 * Failures are logged by the underlying sendGmail() call.
 */
export async function sendPasswordResetEmail(
  params: PasswordResetEmailParams
): Promise<boolean> {
  const { to, firstName, resetUrl } = params;

  if (!to) {
    console.error('[PASSWORD-RESET] Cannot send email: no recipient address');
    return false;
  }

  return sendGmail({
    to,
    subject: '🔐 Réinitialisation de votre mot de passe - Kemet Services',
    html: buildHtml(firstName, resetUrl),
    text: buildText(firstName, resetUrl),
  });
}
