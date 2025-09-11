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
  adminEmail = 'ssbokola@gmail.com'
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