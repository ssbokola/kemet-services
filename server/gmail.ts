// Service d'envoi d'email — multi-provider (Resend API > SMTP > Gmail fallback)
//
// Configuration via variables d'environnement, par ordre de priorité :
//
// 1. Resend API (recommandé pour Railway et autres hébergeurs cloud qui bloquent
//    le SMTP sortant — utilise HTTPS donc jamais bloqué)
//    - RESEND_API_KEY     (commence par `re_...`, récupérée sur resend.com)
//    - SMTP_FROM          (adresse "From" — ex: infos@kemetservices.com)
//                          → doit être un domaine vérifié dans Resend
//
// 2. SMTP générique (fonctionne en local et sur les hébergeurs qui autorisent SMTP)
//    - SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASSWORD, SMTP_FROM
//
// 3. Fallback Gmail (rétrocompat)
//    - GMAIL_USER, GMAIL_APP_PASSWORD
//
// Si aucune config n'est complète, les emails sont loggés mais pas envoyés
// (utile en dev local).
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { Resend } from 'resend';

let transporterCache: Transporter | null = null;

/**
 * Renvoie l'adresse "From" à utiliser pour les emails sortants.
 * SMTP_FROM > SMTP_USER > GMAIL_USER > fallback hardcodé.
 */
export function getEmailFromAddress(): string {
  return (
    process.env.SMTP_FROM ||
    process.env.SMTP_USER ||
    process.env.GMAIL_USER ||
    'noreply@kemetservices.com'
  );
}

/**
 * Crée le transporter nodemailer en fonction des variables d'environnement.
 * Priorité SMTP générique, fallback Gmail. Renvoie null si aucune config valide.
 *
 * Le transporter est cached — le même est retourné aux appels suivants.
 */
function createEmailTransporter(): Transporter | null {
  if (transporterCache) return transporterCache;

  // --- 1. SMTP générique (Hostinger, etc.) ---
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
    const port = parseInt(process.env.SMTP_PORT || '465', 10);
    const secure = (process.env.SMTP_SECURE || (port === 465 ? 'true' : 'false')).toLowerCase() === 'true';

    try {
      transporterCache = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });
      console.log(`✅ Transporteur SMTP configuré (${process.env.SMTP_HOST}:${port}, secure=${secure})`);
      return transporterCache;
    } catch (err) {
      console.error('❌ Erreur config SMTP:', err);
      return null;
    }
  }

  // --- 2. Fallback Gmail (rétrocompat) ---
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    try {
      transporterCache = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });
      console.log('✅ Transporteur Gmail configuré (fallback)');
      return transporterCache;
    } catch (err) {
      console.error('❌ Erreur config Gmail:', err);
      return null;
    }
  }

  // --- 3. Aucune config → no-op ---
  console.log('⚠️ Aucune config email (SMTP_* ou GMAIL_*) — les emails ne seront pas envoyés');
  return null;
}

// Alias rétrocompat pour ne pas casser les imports existants
const createGmailTransporter = createEmailTransporter;

/**
 * Exporté pour que les autres fichiers emails puissent utiliser le même
 * transporter sans reconfigurer nodemailer à chaque fois.
 */
export function getEmailTransporter(): Transporter | null {
  if (!transporterCache) {
    transporterCache = createEmailTransporter();
  }
  return transporterCache;
}

// Alias local pour le reste du fichier (variable historique `gmailTransporter`)
let gmailTransporter: Transporter | null = getEmailTransporter();

// ---------------------------------------------------------------------------
// Resend API — client singleton
// ---------------------------------------------------------------------------

let resendClient: Resend | null = null;
function getResendClient(): Resend | null {
  if (resendClient) return resendClient;
  if (!process.env.RESEND_API_KEY) return null;
  resendClient = new Resend(process.env.RESEND_API_KEY);
  return resendClient;
}

/**
 * Options universelles pour l'envoi d'un email.
 * Compatible Resend API ET nodemailer SMTP (attachments au format Resend :
 * { filename, content: Buffer, contentType }).
 */
export interface UniversalEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType?: string;
  }>;
  fromName?: string;
}

/**
 * Envoi universel d'email avec sélection automatique du provider.
 *
 * Ordre de priorité :
 *   1. Resend API (si RESEND_API_KEY définie) — HTTPS, jamais bloqué par l'hébergeur
 *   2. SMTP / Gmail (via nodemailer) — peut être bloqué par Railway
 *   3. No-op (log seulement) si aucune config
 *
 * Retourne true si envoyé, false si erreur.
 */
export async function sendEmailUniversal(options: UniversalEmailOptions): Promise<boolean> {
  const fromAddress = getEmailFromAddress();
  const fromName = options.fromName || 'Kemet Services';
  const fromFormatted = `"${fromName}" <${fromAddress}>`;

  // --- 1. Resend API (priorité) ---
  const resend = getResendClient();
  if (resend) {
    try {
      const resendAttachments = options.attachments?.map((a) => ({
        filename: a.filename,
        content: a.content,
      }));
      const { error } = await resend.emails.send({
        from: fromFormatted,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo: options.replyTo,
        attachments: resendAttachments,
      });
      if (error) {
        console.error('[EMAIL][Resend] Erreur API:', error);
        return false;
      }
      console.log(`[EMAIL][Resend] Envoyé à ${options.to}: ${options.subject}`);
      return true;
    } catch (err) {
      console.error('[EMAIL][Resend] Exception:', err);
      return false;
    }
  }

  // --- 2. SMTP / Gmail (fallback) ---
  const transporter = getEmailTransporter();
  if (transporter) {
    try {
      await transporter.sendMail({
        from: fromFormatted,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo: options.replyTo,
        attachments: options.attachments,
      });
      console.log(`[EMAIL][SMTP] Envoyé à ${options.to}: ${options.subject}`);
      return true;
    } catch (err) {
      console.error('[EMAIL][SMTP] Erreur envoi:', err);
      return false;
    }
  }

  // --- 3. No-op ---
  console.warn(`[EMAIL] Aucune config provider — email non envoyé: ${options.subject} → ${options.to}`);
  return false;
}

interface TrainingRegistration {
  id: string;
  trainingTitle: string;
  participantName: string;
  role: string;
  officine: string;
  email: string;
  phone: string;
  participantsCount: number;
  sessionType: string;
  createdAt: Date;
}

export async function sendGmailNotification(
  registration: TrainingRegistration,
  adminEmail = 'infos@kemetservices.com'
): Promise<boolean> {
  
  // Créer le transporteur si pas encore fait
  // Pas de guard sur gmailTransporter — sendEmailUniversal gère la sélection
  // du provider (Resend > SMTP > Gmail). Il retournera false si aucun ne marche.

  const subject = `🎓 Nouvelle inscription - ${registration.trainingTitle}`;
  
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0f766e, #14b8a6); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; }
        .info-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        .info-table td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
        .info-table td:first-child { font-weight: bold; color: #475569; }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
        .badge.inter { background: #dbeafe; color: #1e40af; }
        .badge.intra { background: #fef3c7; color: #92400e; }
        .footer { margin-top: 20px; padding: 15px; background: #f1f5f9; border-radius: 6px; font-size: 12px; color: #64748b; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0; font-size: 24px;">🎓 Nouvelle inscription reçue</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Kemet Services - Formation professionnelle</p>
        </div>
        
        <div class="content">
            <h2 style="color: #0f766e; margin-top: 0;">${registration.trainingTitle}</h2>
            
            <table class="info-table">
                <tr>
                    <td>👤 Participant</td>
                    <td><strong>${registration.participantName}</strong></td>
                </tr>
                <tr>
                    <td>🏥 Rôle</td>
                    <td>${registration.role.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</td>
                </tr>
                <tr>
                    <td>🏢 Officine</td>
                    <td>${registration.officine}</td>
                </tr>
                <tr>
                    <td>📧 Email</td>
                    <td><a href="mailto:${registration.email}" style="color: #0f766e;">${registration.email}</a></td>
                </tr>
                <tr>
                    <td>📱 Téléphone</td>
                    <td><a href="tel:${registration.phone}" style="color: #0f766e;">${registration.phone}</a></td>
                </tr>
                <tr>
                    <td>👥 Participants</td>
                    <td><strong>${registration.participantsCount}</strong> personne(s)</td>
                </tr>
                <tr>
                    <td>📊 Type de session</td>
                    <td>
                        <span class="badge ${registration.sessionType === 'inter-entreprise' ? 'inter' : 'intra'}">
                            ${registration.sessionType === 'inter-entreprise' ? 'Inter-entreprise' : 'Intra-entreprise'}
                        </span>
                    </td>
                </tr>
                <tr>
                    <td>📅 Date d'inscription</td>
                    <td>${registration.createdAt.toLocaleDateString('fr-FR', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}</td>
                </tr>
            </table>
            
            <p style="margin-top: 20px; color: #475569;">
                <strong>Prochaines étapes :</strong><br>
                • Consultez votre tableau de bord sur <a href="https://kemetservices.com/inscriptions" style="color: #0f766e;">kemetservices.com/inscriptions</a><br>
                • Contactez le participant pour finaliser l'inscription<br>
                • Planifiez la session de formation
            </p>
        </div>
        
        <div class="footer">
            <p style="margin: 0;">
                📧 Email envoyé automatiquement par Kemet Services<br>
                🔒 Informations confidentielles - Ne pas transférer<br>
                📱 Répondez directement à cet email ou contactez le participant
            </p>
        </div>
    </div>
</body>
</html>
`;

  const textContent = `
🎓 NOUVELLE INSCRIPTION KEMET SERVICES

Formation: ${registration.trainingTitle}
Participant: ${registration.participantName}
Rôle: ${registration.role}
Officine: ${registration.officine}
Email: ${registration.email}
Téléphone: ${registration.phone}
Nombre de participants: ${registration.participantsCount}
Type de session: ${registration.sessionType}
Date: ${registration.createdAt.toLocaleDateString('fr-FR')}

Consultez votre tableau de bord: https://kemetservices.com/inscriptions
`;

  // Envoi universel (Resend API > SMTP > Gmail)
  return await sendEmailUniversal({
    to: adminEmail,
    subject,
    html: htmlContent,
    text: textContent,
    replyTo: registration.email,
  });
}

// Fonction pour envoyer un email de confirmation au participant
export async function sendParticipantConfirmation(
  registration: TrainingRegistration
): Promise<boolean> {
  
  // Pas de guard sur gmailTransporter — sendEmailUniversal gère Resend > SMTP > Gmail

  try {
    console.log(`▶️ Construction de l'email de confirmation pour ${registration.email}`);
    
    const subject = `✅ Confirmation d'inscription - ${registration.trainingTitle}`;
    
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0f766e, #14b8a6); color: white; padding: 25px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { background: #f8fafc; padding: 25px; border-radius: 0 0 8px 8px; }
        .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #14b8a6; }
        .info-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        .info-table td { padding: 12px; border-bottom: 1px solid #e2e8f0; }
        .info-table td:first-child { font-weight: bold; color: #475569; width: 40%; }
        .badge { display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: bold; }
        .badge.success { background: #dcfce7; color: #166534; }
        .cta-button { background: #0f766e; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; margin: 15px 0; font-weight: bold; }
        .footer { margin-top: 25px; padding: 20px; background: #f1f5f9; border-radius: 6px; text-align: center; }
        .contact-info { background: #e0f2fe; padding: 15px; border-radius: 6px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0; font-size: 28px;">✅ Inscription confirmée !</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">Merci de votre confiance</p>
        </div>
        
        <div class="content">
            <p style="font-size: 18px; color: #0f766e; margin-top: 0;">
                Bonjour <strong>${registration.participantName}</strong>,
            </p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
                Nous avons bien reçu votre inscription à la formation <strong>"${registration.trainingTitle}"</strong>. 
                Votre demande est actuellement en cours de traitement.
            </p>

            <div class="info-box">
                <h3 style="color: #0f766e; margin-top: 0;">📋 Récapitulatif de votre inscription</h3>
                
                <table class="info-table">
                    <tr>
                        <td>🎓 Formation</td>
                        <td><strong>${registration.trainingTitle}</strong></td>
                    </tr>
                    <tr>
                        <td>👤 Participant</td>
                        <td>${registration.participantName}</td>
                    </tr>
                    <tr>
                        <td>🏥 Rôle</td>
                        <td>${registration.role.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</td>
                    </tr>
                    <tr>
                        <td>🏢 Officine</td>
                        <td>${registration.officine}</td>
                    </tr>
                    <tr>
                        <td>👥 Nombre de participants</td>
                        <td><strong>${registration.participantsCount}</strong> personne(s)</td>
                    </tr>
                    <tr>
                        <td>📊 Type de session</td>
                        <td>
                            <span class="badge success">
                                ${registration.sessionType === 'inter-entreprise' ? 'Inter-entreprise' : 'Intra-entreprise'}
                            </span>
                        </td>
                    </tr>
                    <tr>
                        <td>📅 Date d'inscription</td>
                        <td>${registration.createdAt.toLocaleDateString('fr-FR', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric'
                        })}</td>
                    </tr>
                </table>
            </div>

            <div class="contact-info">
                <h3 style="color: #0f766e; margin-top: 0;">📞 Prochaines étapes</h3>
                <p style="margin-bottom: 15px;">
                    <strong>Notre équipe va vous contacter sous 24h</strong> pour :
                </p>
                <ul style="margin: 0; padding-left: 20px;">
                    <li>Confirmer les détails de la formation</li>
                    <li>Planifier les dates de session</li>
                    <li>Finaliser les modalités pratiques</li>
                    <li>Répondre à vos questions</li>
                </ul>
            </div>

            <div style="text-align: center; margin: 25px 0;">
                <a href="https://kemetservices.com" class="cta-button">Découvrir nos autres formations</a>
            </div>

            <div class="contact-info">
                <h3 style="color: #0f766e; margin-top: 0;">📧 Besoin d'aide ?</h3>
                <p style="margin: 0;">
                    <strong>Email :</strong> <a href="mailto:infos@kemetservices.com" style="color: #0f766e;">infos@kemetservices.com</a><br>
                    <strong>Téléphone :</strong> <a href="tel:${registration.phone}" style="color: #0f766e;">Nous vous rappelons</a><br>
                    <strong>Site web :</strong> <a href="https://kemetservices.com" style="color: #0f766e;">kemetservices.com</a>
                </p>
            </div>
        </div>
        
        <div class="footer">
            <p style="margin: 0; font-size: 14px; color: #64748b;">
                <strong>Kemet Services</strong> - Formation et Conseil Pharmaceutique<br>
                Optimisation des performances pharmaceutiques en Côte d'Ivoire<br>
                📧 Cet email a été envoyé automatiquement suite à votre inscription
            </p>
        </div>
    </div>
</body>
</html>
`;

  const textContent = `
✅ CONFIRMATION D'INSCRIPTION - KEMET SERVICES

Bonjour ${registration.participantName},

Nous avons bien reçu votre inscription à la formation "${registration.trainingTitle}".

RÉCAPITULATIF:
- Formation: ${registration.trainingTitle}
- Participant: ${registration.participantName}
- Rôle: ${registration.role}
- Officine: ${registration.officine}
- Participants: ${registration.participantsCount} personne(s)
- Type: ${registration.sessionType === 'inter-entreprise' ? 'Inter-entreprise' : 'Intra-entreprise'}
- Date d'inscription: ${registration.createdAt.toLocaleDateString('fr-FR')}

PROCHAINES ÉTAPES:
Notre équipe va vous contacter sous 24h pour confirmer les détails et planifier votre formation.

CONTACT:
Email: infos@kemetservices.com
Site web: https://kemetservices.com

Merci de votre confiance !

Kemet Services
Formation et Conseil Pharmaceutique
`;

    console.log(`▶️ Envoi de l'email de confirmation à ${registration.email}`);
    return await sendEmailUniversal({
      to: registration.email,
      subject,
      html: htmlContent,
      text: textContent,
    });
  } catch (error) {
    console.error('❌ Erreur lors de la construction/envoi de la confirmation participant:', error);
    return false;
  }
}

// Interface pour les demandes Kemet Echo
interface KemetEchoRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  pharmacyName: string;
  offerType: string;
  message?: string | null;
  createdAt: Date;
}

// Utility function to escape HTML to prevent injection
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

export async function sendKemetEchoNotification(
  request: KemetEchoRequest,
  adminEmail = 'infos@kemetservices.com'
): Promise<boolean> {
  
  // Créer le transporteur si pas encore fait
  // Pas de guard sur gmailTransporter — sendEmailUniversal gère la sélection
  // du provider (Resend > SMTP > Gmail). Il retournera false si aucun ne marche.

  const offerLabels: Record<string, string> = {
    'freemium': 'Freemium (Essai gratuit 30 jours)',
    'premium': 'Premium (Abonnement payant)',
    'pack': 'Pack clé en main (Tablette + Formation)'
  };

  const subject = `Nouvelle demande Kemet Echo - ${escapeHtml(request.pharmacyName)}`;
  
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0f766e, #14b8a6); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; }
        .info-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        .info-table td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
        .info-table td:first-child { font-weight: bold; color: #475569; width: 35%; }
        .badge { display: inline-block; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: bold; }
        .badge.freemium { background: #dbeafe; color: #1e40af; }
        .badge.premium { background: #fef3c7; color: #92400e; }
        .badge.pack { background: #d1fae5; color: #065f46; }
        .message-box { background: white; padding: 15px; border-left: 4px solid #14b8a6; border-radius: 6px; margin: 15px 0; }
        .footer { margin-top: 20px; padding: 15px; background: #f1f5f9; border-radius: 6px; font-size: 12px; color: #64748b; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0; font-size: 24px;">Nouvelle demande Kemet Echo</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Solution de satisfaction client pour pharmacies</p>
        </div>
        
        <div class="content">
            <h2 style="color: #0f766e; margin-top: 0;">${escapeHtml(request.pharmacyName)}</h2>
            
            <table class="info-table">
                <tr>
                    <td>Contact</td>
                    <td><strong>${escapeHtml(request.name)}</strong></td>
                </tr>
                <tr>
                    <td>Pharmacie/Clinique</td>
                    <td>${escapeHtml(request.pharmacyName)}</td>
                </tr>
                <tr>
                    <td>Email</td>
                    <td><a href="mailto:${escapeHtml(request.email)}" style="color: #0f766e;">${escapeHtml(request.email)}</a></td>
                </tr>
                <tr>
                    <td>Telephone</td>
                    <td><a href="tel:${escapeHtml(request.phone)}" style="color: #0f766e;">${escapeHtml(request.phone)}</a></td>
                </tr>
                <tr>
                    <td>Offre souhaitee</td>
                    <td>
                        <span class="badge ${request.offerType}">
                            ${offerLabels[request.offerType] || request.offerType}
                        </span>
                    </td>
                </tr>
                <tr>
                    <td>Date demande</td>
                    <td>${new Date(request.createdAt).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</td>
                </tr>
            </table>
            
            ${request.message ? `
            <div class="message-box">
                <strong style="color: #0f766e; display: block; margin-bottom: 8px;">Message du client :</strong>
                <p style="margin: 0; white-space: pre-wrap;">${escapeHtml(request.message)}</p>
            </div>
            ` : ''}
            
            <div style="background: #e0f2fe; padding: 15px; border-radius: 6px; margin-top: 20px;">
                <strong style="color: #0c4a6e;">Actions recommandees :</strong>
                <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #0c4a6e;">
                    <li>Contacter le client dans les 24h</li>
                    <li>Planifier une démonstration en ligne ou sur site</li>
                    <li>Préparer le pack de bienvenue adapté à l'offre</li>
                    ${request.offerType === 'pack' ? '<li>Prévoir la livraison et formation tablette</li>' : ''}
                </ul>
            </div>
        </div>
        
        <div class="footer">
            <strong style="color: #475569;">Kemet Echo - Baromètre Client</strong><br>
            Système de gestion de satisfaction client pour pharmacies<br>
            <a href="mailto:${adminEmail}" style="color: #0f766e;">${adminEmail}</a>
        </div>
    </div>
</body>
</html>
  `;

  const textContent = `
NOUVELLE DEMANDE KEMET ECHO

Contact: ${request.name}
Pharmacie/Clinique: ${request.pharmacyName}
Email: ${request.email}
Telephone: ${request.phone}
Offre: ${offerLabels[request.offerType]}
Date: ${new Date(request.createdAt).toLocaleString('fr-FR')}

${request.message ? `Message:\n${request.message}\n` : ''}

Actions recommandees:
- Contacter le client dans les 24h
- Planifier une démonstration
- Préparer le pack de bienvenue

---
Kemet Echo - Baromètre Client
${adminEmail}
  `;

  try {
    return await sendEmailUniversal({
      to: adminEmail,
      subject,
      html: htmlContent,
      text: textContent,
      replyTo: request.email,
      fromName: 'Kemet Echo Notifications',
    });
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de notification Kemet Echo:', error);
    return false;
  }
}

// Fonction pour tester la configuration Gmail
export async function testGmailConnection(): Promise<boolean> {
  if (!gmailTransporter) {
    gmailTransporter = createGmailTransporter();
  }

  if (!gmailTransporter) {
    return false;
  }

  try {
    await gmailTransporter.verify();
    console.log('✅ Connexion Gmail vérifiée avec succès');
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion Gmail:', error);
    return false;
  }
}

// Fonction générique pour envoyer un email via Gmail
interface SendGmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export async function sendGmail(options: SendGmailOptions): Promise<boolean> {
  // Délègue à sendEmailUniversal qui choisit le provider (Resend > SMTP > Gmail).
  return await sendEmailUniversal({
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
    replyTo: options.replyTo,
  });
}

// Fonction _legacy conservée pour éviter de casser d'anciens imports si présents
async function _legacySendGmailDeadCode(): Promise<boolean> {
  try {
    return false;
  } catch (error) {
    return false;
  }
}