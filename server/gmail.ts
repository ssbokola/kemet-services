// Service d'envoi d'email — supporte n'importe quel SMTP (Hostinger, Gmail, etc.)
//
// Configuration via variables d'environnement, par ordre de priorité :
//
// 1. SMTP générique (recommandé — fonctionne avec Hostinger, OVH, SendGrid, etc.)
//    - SMTP_HOST          (ex: smtp.hostinger.com)
//    - SMTP_PORT          (465 pour SSL, 587 pour STARTTLS)
//    - SMTP_SECURE        ("true" si port 465, sinon "false")
//    - SMTP_USER          (l'adresse email utilisée pour l'auth — ex: infos@kemetservices.com)
//    - SMTP_PASSWORD      (le mot de passe SMTP)
//    - SMTP_FROM          (optionnel — l'adresse affichée dans le From, par défaut SMTP_USER)
//
// 2. Fallback Gmail (rétrocompat — pour ceux qui utilisent encore Gmail)
//    - GMAIL_USER
//    - GMAIL_APP_PASSWORD
//
// Si aucune des 2 configs n'est complète, les emails sont loggés mais pas envoyés
// (utile en dev local).
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

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
  if (!gmailTransporter) {
    gmailTransporter = createGmailTransporter();
  }

  if (!gmailTransporter) {
    console.log('📧 Gmail non configuré - notification non envoyée');
    return false;
  }

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

  const mailOptions = {
    from: {
      name: 'Kemet Services',
      address: getEmailFromAddress()
    },
    to: adminEmail,
    subject: subject,
    text: textContent,
    html: htmlContent,
    priority: 'high' as 'high',
    replyTo: registration.email // Permet de répondre directement au participant
  };

  try {
    const result = await gmailTransporter.sendMail(mailOptions);
    console.log(`✅ Email Gmail envoyé avec succès à ${adminEmail}`);
    console.log(`📧 Message envoyé avec succès`);
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi Gmail:', error);
    return false;
  }
}

// Fonction pour envoyer un email de confirmation au participant
export async function sendParticipantConfirmation(
  registration: TrainingRegistration
): Promise<boolean> {
  
  // Créer le transporteur si pas encore fait
  if (!gmailTransporter) {
    gmailTransporter = createGmailTransporter();
  }

  if (!gmailTransporter) {
    console.log('📧 Gmail non configuré - confirmation participant non envoyée');
    return false;
  }

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

  const mailOptions = {
    from: `"Kemet Services" <${getEmailFromAddress()}>`,
    to: registration.email,
    subject: subject,
    text: textContent,
    html: htmlContent,
    replyTo: getEmailFromAddress() // Email de réponse
  };

    console.log(`▶️ Envoi de l'email de confirmation à ${registration.email}`);
    await gmailTransporter.sendMail(mailOptions);
    console.log(`✅ Email de confirmation envoyé avec succès à ${registration.email}`);
    return true;
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
  if (!gmailTransporter) {
    gmailTransporter = createGmailTransporter();
  }

  if (!gmailTransporter) {
    console.log('📧 Gmail non configuré - notification non envoyée');
    return false;
  }

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
    await gmailTransporter.sendMail({
      from: `"Kemet Echo Notifications" <${getEmailFromAddress()}>`,
      to: adminEmail,
      subject,
      text: textContent,
      html: htmlContent,
      replyTo: request.email
    });
    
    return true;
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
  // Créer le transporteur si pas encore fait
  if (!gmailTransporter) {
    gmailTransporter = createGmailTransporter();
  }

  if (!gmailTransporter) {
    console.log('📧 Gmail non configuré - email non envoyé');
    return false;
  }

  const mailOptions = {
    from: {
      name: 'Kemet Services',
      address: getEmailFromAddress()
    },
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text || options.html.replace(/<[^>]*>/g, ''), // Fallback text version
    replyTo: options.replyTo || getEmailFromAddress()
  };

  try {
    await gmailTransporter.sendMail(mailOptions);
    console.log(`✅ Email envoyé avec succès à ${options.to}`);
    return true;
  } catch (error) {
    console.error(`❌ Erreur lors de l'envoi de l'email à ${options.to}:`, error);
    return false;
  }
}