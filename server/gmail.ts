// Service d'envoi d'email via Gmail SMTP
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

// Configuration Gmail SMTP
const gmailConfig = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.GMAIL_USER, // votre adresse Gmail
    pass: process.env.GMAIL_APP_PASSWORD // mot de passe d'application Gmail
  }
};

// Créer le transporteur Gmail
let gmailTransporter: Transporter | null = null;

function createGmailTransporter() {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.log('⚠️ GMAIL_USER ou GMAIL_APP_PASSWORD non configuré - utilisation du système de fichiers');
    return null;
  }

  try {
    gmailTransporter = nodemailer.createTransport(gmailConfig);
    console.log('✅ Transporteur Gmail configuré');
    return gmailTransporter;
  } catch (error) {
    console.error('❌ Erreur lors de la configuration Gmail:', error);
    return null;
  }
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
      address: process.env.GMAIL_USER || 'noreply@kemetservices.com'
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
    from: `"Kemet Services" <${process.env.GMAIL_USER}>`,
    to: registration.email,
    subject: subject,
    text: textContent,
    html: htmlContent,
    replyTo: process.env.GMAIL_USER // Email de réponse
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