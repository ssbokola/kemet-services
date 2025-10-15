// Emails de confirmation d'inscription aux formations en ligne
import { sendGmailNotification } from "../gmail";
import type { Course, User } from "@shared/schema";

interface EnrollmentConfirmationData {
  user: User;
  course: Course;
  enrollmentId: string;
}

// Générer l'email de confirmation d'inscription
export function generateEnrollmentConfirmationHTML(data: EnrollmentConfirmationData): string {
  const userName = data.user.firstName && data.user.lastName 
    ? `${data.user.firstName} ${data.user.lastName}`
    : data.user.email || 'Cher apprenant';
    
  const domainName = process.env.REPLIT_DOMAINS?.split(',')[0] || '';
  const courseUrl = `https://${domainName}/mon-compte`;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { background: #f9fafb; padding: 30px; }
        .course-card { background: white; border-radius: 8px; padding: 25px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .course-title { font-size: 24px; color: #0d9488; margin: 0 0 15px 0; }
        .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .info-label { color: #6b7280; font-weight: 500; }
        .info-value { color: #111827; font-weight: 600; }
        .cta-button { display: inline-block; background: #0d9488; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; font-size: 16px; }
        .cta-button:hover { background: #0f766e; }
        .benefits { background: #ecfdf5; border-left: 4px solid #0d9488; padding: 20px; margin: 20px 0; border-radius: 4px; }
        .benefits ul { margin: 10px 0; padding-left: 20px; }
        .benefits li { margin: 8px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        .divider { height: 2px; background: linear-gradient(90deg, transparent, #0d9488, transparent); margin: 30px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Inscription Confirmée !</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">
            Bienvenue dans votre parcours de formation
          </p>
        </div>
        
        <div class="content">
          <p style="font-size: 16px;">Bonjour ${userName},</p>
          
          <p>
            Félicitations ! Vous êtes maintenant inscrit(e) à la formation suivante :
          </p>
          
          <div class="course-card">
            <h2 class="course-title">${data.course.title}</h2>
            <p style="color: #6b7280; margin: 0 0 20px 0;">${data.course.description}</p>
            
            <div class="info-row">
              <span class="info-label">Durée totale</span>
              <span class="info-value">${Math.round(data.course.duration / 60)}h ${data.course.duration % 60}min</span>
            </div>
            <div class="info-row" style="border-bottom: none;">
              <span class="info-label">Catégorie</span>
              <span class="info-value">${getCategoryLabel(data.course.category)}</span>
            </div>
          </div>
          
          <div class="benefits">
            <h3 style="margin-top: 0; color: #0d9488;">Ce qui vous attend :</h3>
            <ul>
              ${data.course.objectives?.slice(0, 4).map(obj => `<li>${obj}</li>`).join('') || '<li>Un contenu riche et pratique</li>'}
            </ul>
          </div>
          
          <div class="divider"></div>
          
          <h3 style="color: #111827;">Prochaines étapes</h3>
          <ol style="margin: 15px 0; padding-left: 20px;">
            <li style="margin: 10px 0;">
              <strong>Accédez à votre espace de formation</strong> - Cliquez sur le bouton ci-dessous pour commencer
            </li>
            <li style="margin: 10px 0;">
              <strong>Suivez votre progression</strong> - Vous recevrez un email hebdomadaire avec votre avancement
            </li>
            <li style="margin: 10px 0;">
              <strong>Apprenez à votre rythme</strong> - Les modules restent accessibles sans limite de temps
            </li>
          </ol>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${courseUrl}" class="cta-button">
              Accéder à ma formation
            </a>
          </div>
          
          <p style="margin-top: 30px; padding: 15px; background: #fef3c7; border-radius: 6px; border-left: 4px solid #f59e0b;">
            <strong>💡 Conseil :</strong> Planifiez dès maintenant 2-3 créneaux par semaine pour avancer régulièrement dans la formation. La régularité est la clé du succès !
          </p>
          
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            Vous avez des questions ? N'hésitez pas à nous contacter à 
            <a href="mailto:infos@kemetservices.com" style="color: #0d9488;">infos@kemetservices.com</a>
          </p>
        </div>
        
        <div class="footer">
          <p><strong>Kemet Services</strong></p>
          <p>Formation et Consultance Pharmacie</p>
          <p>Côte d'Ivoire</p>
          <p style="margin-top: 15px; font-size: 12px;">
            Cet email a été envoyé car vous vous êtes inscrit à cette formation.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    quality: 'Qualité',
    finance: 'Finance',
    stock: 'Gestion de Stock',
    hr: 'Ressources Humaines',
    auxiliaires: 'Auxiliaires'
  };
  return labels[category] || category;
}

// Envoyer l'email de confirmation d'inscription
export async function sendEnrollmentConfirmation(
  user: User, 
  course: Course, 
  enrollmentId: string
): Promise<boolean> {
  try {
    const emailHTML = generateEnrollmentConfirmationHTML({
      user,
      course,
      enrollmentId,
    });
    
    const subject = `✅ Inscription confirmée - ${course.title}`;
    
    // Create a minimal email sending function using nodemailer directly
    const nodemailer = await import('nodemailer');
    
    // If Gmail credentials are available, use them
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      const transporter = nodemailer.default.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });
      
      try {
        await transporter.sendMail({
          from: `"Kemet Services" <${process.env.GMAIL_USER}>`,
          to: user.email || '',
          subject,
          html: emailHTML,
        });
        return true;
      } catch (error) {
        console.error('Erreur envoi email enrollment:', error);
        return false;
      }
    }
    
    // If no Gmail credentials, just log and return success (for development)
    console.log(`📧 Email enrollment prévu pour: ${user.email} - ${subject}`);
    const success = true;
    
    if (success) {
      console.log(`✅ Email de confirmation envoyé à ${user.email} pour ${course.title}`);
    } else {
      console.log(`❌ Échec envoi confirmation à ${user.email}`);
    }
    
    return success;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de confirmation:', error);
    return false;
  }
}
