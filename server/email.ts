// Email service using SendGrid - from blueprint:javascript_sendgrid integration
import { MailService } from '@sendgrid/mail';

// Initialize mail service
const mailService = new MailService();

if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.error('SENDGRID_API_KEY environment variable not set - email not sent');
    return false;
  }

  try {
    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    console.log(`Email sent successfully to ${params.to}`);
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
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

export async function sendRegistrationNotification(
  registration: TrainingRegistration,
  adminEmail: string = 'admin@kemetservices.com'
): Promise<boolean> {
  const subject = `🎓 Nouvelle inscription - ${registration.trainingTitle}`;
  
  const textContent = `
Nouvelle inscription reçue sur Kemet Services

Formation: ${registration.trainingTitle}
Participant: ${registration.participantName}
Rôle: ${registration.role}
Officine: ${registration.officine}
Email: ${registration.email}
Téléphone: ${registration.phone}
Nombre de participants: ${registration.participantsCount}
Type de session: ${registration.sessionType}
Date d'inscription: ${registration.createdAt.toLocaleDateString('fr-FR')}

Connectez-vous à votre espace d'administration pour voir tous les détails.
`;

  const htmlContent = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #0f766e;">🎓 Nouvelle inscription - Formation</h2>
  
  <div style="background-color: #f0fdfa; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="color: #0f766e; margin-top: 0;">${registration.trainingTitle}</h3>
    
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px 0; font-weight: bold;">Participant:</td>
        <td style="padding: 8px 0;">${registration.participantName}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-weight: bold;">Rôle:</td>
        <td style="padding: 8px 0;">${registration.role}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-weight: bold;">Officine:</td>
        <td style="padding: 8px 0;">${registration.officine}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-weight: bold;">Email:</td>
        <td style="padding: 8px 0;"><a href="mailto:${registration.email}">${registration.email}</a></td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-weight: bold;">Téléphone:</td>
        <td style="padding: 8px 0;"><a href="tel:${registration.phone}">${registration.phone}</a></td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-weight: bold;">Participants:</td>
        <td style="padding: 8px 0;">${registration.participantsCount} personne(s)</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-weight: bold;">Type:</td>
        <td style="padding: 8px 0;">
          <span style="background-color: ${registration.sessionType === 'inter-entreprise' ? '#dbeafe' : '#fef3c7'}; 
                       color: ${registration.sessionType === 'inter-entreprise' ? '#1e40af' : '#92400e'}; 
                       padding: 4px 8px; border-radius: 4px; font-size: 12px;">
            ${registration.sessionType === 'inter-entreprise' ? 'Inter-entreprise' : 'Intra-entreprise'}
          </span>
        </td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-weight: bold;">Date:</td>
        <td style="padding: 8px 0;">${registration.createdAt.toLocaleDateString('fr-FR', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</td>
      </tr>
    </table>
  </div>
  
  <p style="color: #6b7280;">
    Connectez-vous à votre <strong>espace d'administration</strong> pour consulter tous les détails et gérer les inscriptions.
  </p>
  
  <div style="margin-top: 30px; padding: 15px; background-color: #f9fafb; border-radius: 6px; font-size: 12px; color: #6b7280;">
    <p style="margin: 0;">
      📧 Email envoyé automatiquement par Kemet Services<br>
      🔒 Vos données sont protégées selon la réglementation RGPD
    </p>
  </div>
</div>
`;

  return await sendEmail({
    to: adminEmail,
    from: 'noreply@kemetservices.com',
    subject,
    text: textContent,
    html: htmlContent
  });
}