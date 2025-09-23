// Service d'envoi d'email via Gmail SMTP
import nodemailer from 'nodemailer';

interface EmailParams {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

interface ParticipantCredentials {
  email: string;
  firstName: string;
  lastName: string;
  temporaryPassword: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      throw new Error("Variables d'environnement GMAIL_USER et GMAIL_APP_PASSWORD requises");
    }

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }

  async sendEmail(params: EmailParams): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: `"Kemet Services" <${process.env.GMAIL_USER}>`,
        to: params.to,
        subject: params.subject,
        text: params.text,
        html: params.html,
      });
      return true;
    } catch (error) {
      console.error('Erreur envoi email:', error);
      return false;
    }
  }

  async sendParticipantCredentials(credentials: ParticipantCredentials): Promise<boolean> {
    const { email, firstName, lastName, temporaryPassword } = credentials;
    
    const subject = 'Vos identifiants d\'accès à la plateforme Kemet Services';
    
    const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vos identifiants d'accès</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #0d9488; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background-color: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
        .credentials { background-color: white; padding: 20px; border-radius: 8px; border-left: 4px solid #0d9488; margin: 20px 0; }
        .button { background-color: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
        .footer { text-align: center; color: #64748b; font-size: 14px; margin-top: 30px; }
        .warning { background-color: #fef3c7; border: 1px solid #d97706; padding: 15px; border-radius: 6px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0;">Bienvenue sur Kemet Services</h1>
            <p style="margin: 10px 0 0 0;">Plateforme de formation pharmaceutique professionnelle</p>
        </div>
        
        <div class="content">
            <h2>Bonjour ${firstName} ${lastName},</h2>
            
            <p>Votre compte participant a été créé avec succès sur la plateforme de formation Kemet Services. Voici vos identifiants de connexion :</p>
            
            <div class="credentials">
                <h3 style="color: #0d9488; margin-top: 0;">Vos identifiants de connexion</h3>
                <p><strong>Email :</strong> ${email}</p>
                <p><strong>Mot de passe temporaire :</strong> <code style="background-color: #f1f5f9; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${temporaryPassword}</code></p>
            </div>
            
            <div class="warning">
                <strong>⚠️ Important :</strong> Pour votre sécurité, nous vous recommandons fortement de changer ce mot de passe temporaire lors de votre première connexion.
            </div>
            
            <p>Vous pouvez maintenant accéder à votre espace participant et découvrir nos formations spécialisées :</p>
            
            <ul>
                <li>📊 <strong>Formations Qualité</strong> - Amélioration continue et certification</li>
                <li>💰 <strong>Formations Finance</strong> - Gestion financière et rentabilité</li>
                <li>📦 <strong>Formations Stock</strong> - Optimisation des inventaires</li>
                <li>👥 <strong>Formations RH</strong> - Management et développement des équipes</li>
                <li>🔧 <strong>Formations Auxiliaires</strong> - Support technique et maintenance</li>
            </ul>
            
            <div style="text-align: center;">
                <a href="http://localhost:5000/login" class="button">Se connecter à la plateforme</a>
            </div>
            
            <p>Si vous rencontrez des difficultés ou avez des questions, n'hésitez pas à nous contacter.</p>
            
            <p>Cordialement,<br>
            <strong>L'équipe Kemet Services</strong><br>
            Experts en formation pharmaceutique</p>
        </div>
        
        <div class="footer">
            <p>© 2024 Kemet Services - Formation et conseil pharmaceutique en Côte d'Ivoire</p>
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre directement.</p>
        </div>
    </div>
</body>
</html>`;

    const textContent = `
Bonjour ${firstName} ${lastName},

Votre compte participant a été créé avec succès sur la plateforme de formation Kemet Services.

Vos identifiants de connexion :
- Email : ${email}
- Mot de passe temporaire : ${temporaryPassword}

IMPORTANT : Pour votre sécurité, changez ce mot de passe temporaire lors de votre première connexion.

Accédez à votre espace participant : http://localhost:5000/login

Nos formations disponibles :
- Formations Qualité - Amélioration continue et certification
- Formations Finance - Gestion financière et rentabilité  
- Formations Stock - Optimisation des inventaires
- Formations RH - Management et développement des équipes
- Formations Auxiliaires - Support technique et maintenance

Pour toute question, contactez-nous.

Cordialement,
L'équipe Kemet Services
Experts en formation pharmaceutique

© 2024 Kemet Services - Formation et conseil pharmaceutique en Côte d'Ivoire
`;

    return await this.sendEmail({
      to: email,
      subject,
      text: textContent,
      html: htmlContent,
    });
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Erreur de connexion email:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();