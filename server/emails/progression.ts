// Système d'emails hebdomadaires de progression
import { db } from "../db";
import { enrollments, users, courses, lessonProgress, courseLessons, courseModules } from "@shared/schema";
import { eq, and, lt, or, isNull, sql } from "drizzle-orm";
import { sendGmail } from "../gmail";

interface ProgressionData {
  userId: string;
  courseId: string;
  courseName: string;
  userName: string;
  userEmail: string;
  progressPercent: number;
  completedLessons: number;
  totalLessons: number;
  timeSpentMinutes: number;
  enrolledDays: number;
}

// Générer le contenu HTML de l'email de progression
function generateProgressionEmailHTML(data: ProgressionData): string {
  const encouragement = getEncouragementMessage(data.progressPercent);
  const nextSteps = getNextStepsMessage(data.progressPercent);
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; }
        .progress-card { background: white; border-radius: 8px; padding: 20px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .progress-bar { background: #e5e7eb; height: 30px; border-radius: 15px; overflow: hidden; margin: 15px 0; }
        .progress-fill { background: linear-gradient(90deg, #0d9488 0%, #14b8a6 100%); height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; transition: width 0.3s ease; }
        .stats { display: flex; justify-content: space-around; margin: 20px 0; }
        .stat { text-align: center; }
        .stat-value { font-size: 32px; font-weight: bold; color: #0d9488; }
        .stat-label { font-size: 14px; color: #6b7280; margin-top: 5px; }
        .encouragement { background: #ecfdf5; border-left: 4px solid #0d9488; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .cta-button { display: inline-block; background: #0d9488; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
        .cta-button:hover { background: #0f766e; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">📊 Votre Progression Hebdomadaire</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">${data.courseName}</p>
        </div>
        
        <div class="content">
          <p>Bonjour ${data.userName},</p>
          
          <p>Voici un résumé de votre progression dans la formation <strong>${data.courseName}</strong> cette semaine :</p>
          
          <div class="progress-card">
            <h3 style="margin-top: 0; color: #0d9488;">Taux d'Avancement</h3>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${data.progressPercent}%;">
                ${data.progressPercent}%
              </div>
            </div>
          </div>
          
          <div class="stats">
            <div class="stat">
              <div class="stat-value">${data.completedLessons}</div>
              <div class="stat-label">Leçons complétées</div>
            </div>
            <div class="stat">
              <div class="stat-value">${data.totalLessons}</div>
              <div class="stat-label">Total leçons</div>
            </div>
            <div class="stat">
              <div class="stat-value">${Math.round(data.timeSpentMinutes)}</div>
              <div class="stat-label">Minutes étudiées</div>
            </div>
          </div>
          
          <div class="encouragement">
            <strong>💪 ${encouragement}</strong>
            <p style="margin: 10px 0 0 0;">${nextSteps}</p>
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}/mon-compte` : '#'}" class="cta-button">
              Continuer ma formation
            </a>
          </div>
          
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            Vous recevez cet email car vous êtes inscrit à cette formation. Ces emails hebdomadaires vous aident à suivre votre progression et à rester motivé.
          </p>
        </div>
        
        <div class="footer">
          <p><strong>Kemet Services</strong></p>
          <p>Formation et Consultance Pharmacie</p>
          <p>Côte d'Ivoire</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Messages d'encouragement selon la progression
function getEncouragementMessage(progressPercent: number): string {
  if (progressPercent < 20) {
    return "Excellent début ! Chaque leçon vous rapproche de vos objectifs.";
  } else if (progressPercent < 50) {
    return "Vous êtes sur la bonne voie ! Continuez comme ça.";
  } else if (progressPercent < 80) {
    return "Bravo ! Vous avez déjà parcouru plus de la moitié du chemin.";
  } else if (progressPercent < 100) {
    return "Félicitations ! Vous êtes presque au bout, ne lâchez rien !";
  } else {
    return "🎉 Formation terminée ! Bravo pour votre réussite !";
  }
}

// Prochaines étapes selon la progression
function getNextStepsMessage(progressPercent: number): string {
  if (progressPercent < 20) {
    return "Prévoyez 30 minutes cette semaine pour avancer dans les prochaines leçons.";
  } else if (progressPercent < 50) {
    return "Vous pouvez terminer 2-3 leçons supplémentaires cette semaine pour garder votre rythme.";
  } else if (progressPercent < 80) {
    return "Encore quelques modules et vous aurez terminé ! Bloquez 1h dans votre agenda cette semaine.";
  } else if (progressPercent < 100) {
    return "Le dernier sprint ! Terminez les dernières leçons pour obtenir votre certificat.";
  } else {
    return "Consultez notre catalogue pour découvrir d'autres formations qui pourraient vous intéresser.";
  }
}

// Calculer la progression d'un utilisateur dans une formation
async function calculateUserProgress(userId: string, courseId: string): Promise<Omit<ProgressionData, 'courseName' | 'userName' | 'userEmail'>> {
  // Récupérer toutes les leçons du cours
  const modulesWithLessons = await db
    .select({
      lessonId: courseLessons.id,
    })
    .from(courseModules)
    .innerJoin(courseLessons, eq(courseLessons.moduleId, courseModules.id))
    .where(eq(courseModules.courseId, courseId));
  
  const totalLessons = modulesWithLessons.length;
  
  // Récupérer la progression de l'utilisateur
  const userProgress = await db
    .select({
      status: lessonProgress.status,
      timeSpent: lessonProgress.timeSpent,
    })
    .from(lessonProgress)
    .where(eq(lessonProgress.userId, userId));
  
  const completedLessons = userProgress.filter(p => p.status === 'completed').length;
  const totalTimeSpent = userProgress.reduce((sum, p) => sum + (p.timeSpent || 0), 0);
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  
  // Calculer le nombre de jours depuis l'inscription
  const [enrollment] = await db
    .select({ enrolledAt: enrollments.enrolledAt })
    .from(enrollments)
    .where(and(
      eq(enrollments.userId, userId),
      eq(enrollments.courseId, courseId)
    ));
  
  const enrolledDays = enrollment 
    ? Math.floor((Date.now() - enrollment.enrolledAt.getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  
  return {
    userId,
    courseId,
    progressPercent,
    completedLessons,
    totalLessons,
    timeSpentMinutes: Math.round(totalTimeSpent / 60),
    enrolledDays,
  };
}

// Envoyer les emails de progression hebdomadaire
export async function sendWeeklyProgressEmails(): Promise<void> {
  console.log("📧 Début de l'envoi des emails de progression hebdomadaire...");
  
  try {
    // Récupérer toutes les inscriptions actives qui doivent recevoir un email
    // (1 semaine depuis le dernier email OU jamais reçu d'email)
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const activeEnrollments = await db
      .select({
        enrollmentId: enrollments.id,
        userId: enrollments.userId,
        courseId: enrollments.courseId,
        courseName: courses.title,
        userName: sql<string>`COALESCE(${users.firstName} || ' ' || ${users.lastName}, ${users.email})`.as('userName'),
        userEmail: users.email,
        lastEmailSent: enrollments.lastProgressEmailSentAt,
      })
      .from(enrollments)
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .innerJoin(users, eq(enrollments.userId, users.id))
      .where(
        and(
          eq(enrollments.status, 'active'),
          or(
            isNull(enrollments.lastProgressEmailSentAt),
            lt(enrollments.lastProgressEmailSentAt, oneWeekAgo)
          )
        )
      );
    
    console.log(`📊 ${activeEnrollments.length} inscription(s) à traiter`);
    
    let sentCount = 0;
    let errorCount = 0;
    
    for (const enrollment of activeEnrollments) {
      try {
        // Calculer la progression
        const progress = await calculateUserProgress(enrollment.userId, enrollment.courseId);
        
        const progressData: ProgressionData = {
          ...progress,
          courseName: enrollment.courseName,
          userName: enrollment.userName,
          userEmail: enrollment.userEmail || '',
        };
        
        // Ne pas envoyer d'email si aucune progression
        if (progressData.completedLessons === 0 && progressData.enrolledDays < 7) {
          console.log(`⏭️  Pas d'email pour ${enrollment.userName} - trop tôt`);
          continue;
        }
        
        // Générer et envoyer l'email
        const emailHTML = generateProgressionEmailHTML(progressData);
        const subject = `📊 Votre progression - ${progressData.courseName}`;
        
        const success = await sendGmail({
          to: progressData.userEmail,
          subject,
          html: emailHTML,
        });
        
        if (success) {
          // Mettre à jour la date du dernier email envoyé
          await db
            .update(enrollments)
            .set({
              lastProgressEmailSentAt: new Date(),
              progressEmailsCount: sql`${enrollments.progressEmailsCount} + 1`,
            })
            .where(eq(enrollments.id, enrollment.enrollmentId));
          
          sentCount++;
          console.log(`✅ Email envoyé à ${enrollment.userName} (${progressData.progressPercent}% complété)`);
        } else {
          errorCount++;
          console.log(`❌ Échec envoi email à ${enrollment.userName}`);
        }
        
      } catch (error) {
        errorCount++;
        console.error(`❌ Erreur pour ${enrollment.userName}:`, error);
      }
    }
    
    console.log(`\n✨ Envoi terminé: ${sentCount} emails envoyés, ${errorCount} erreurs`);
    
  } catch (error) {
    console.error("❌ Erreur globale lors de l'envoi des emails de progression:", error);
    throw error;
  }
}

// Fonction à appeler via cron job hebdomadaire
export async function weeklyProgressionCron(): Promise<void> {
  console.log("⏰ Tâche cron hebdomadaire démarrée:", new Date().toISOString());
  await sendWeeklyProgressEmails();
  console.log("⏰ Tâche cron hebdomadaire terminée:", new Date().toISOString());
}
