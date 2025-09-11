// Système de notifications pour les inscriptions aux formations
import { appendFileSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';

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

const NOTIFICATIONS_FILE = join(process.cwd(), 'notifications_inscriptions.log');
const CSV_FILE = join(process.cwd(), 'inscriptions.csv');

// Initialiser les fichiers de notification
function initializeNotificationFiles() {
  // Créer le fichier de log s'il n'existe pas
  if (!existsSync(NOTIFICATIONS_FILE)) {
    writeFileSync(NOTIFICATIONS_FILE, '=== NOTIFICATIONS D\'INSCRIPTIONS KEMET SERVICES ===\n\n');
  }
  
  // Créer le fichier CSV s'il n'existe pas
  if (!existsSync(CSV_FILE)) {
    const csvHeader = 'Date,Heure,Formation,Participant,Role,Officine,Email,Telephone,Nb_Participants,Type_Session\n';
    writeFileSync(CSV_FILE, csvHeader);
  }
}

// Formater la notification pour le fichier log
function formatLogNotification(registration: TrainingRegistration): string {
  const date = new Date();
  const dateStr = date.toLocaleDateString('fr-FR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const timeStr = date.toLocaleTimeString('fr-FR');
  
  return `
📧 NOUVELLE INSCRIPTION - ${dateStr} à ${timeStr}
${'='.repeat(60)}

🎓 Formation: ${registration.trainingTitle}
👤 Participant: ${registration.participantName}
🏥 Rôle: ${registration.role}
🏢 Officine: ${registration.officine}
📧 Email: ${registration.email}
📱 Téléphone: ${registration.phone}
👥 Nombre de participants: ${registration.participantsCount}
📊 Type de session: ${registration.sessionType}
📅 Inscrit le: ${registration.createdAt.toLocaleDateString('fr-FR')} à ${registration.createdAt.toLocaleTimeString('fr-FR')}

${'─'.repeat(60)}

`;
}

// Formater pour CSV
function formatCsvLine(registration: TrainingRegistration): string {
  const date = new Date();
  const dateStr = date.toLocaleDateString('fr-FR');
  const timeStr = date.toLocaleTimeString('fr-FR');
  
  // Échapper les guillemets et virgules dans les données CSV
  const escape = (str: string) => `"${str.replace(/"/g, '""')}"`;
  
  return `${escape(dateStr)},${escape(timeStr)},${escape(registration.trainingTitle)},${escape(registration.participantName)},${escape(registration.role)},${escape(registration.officine)},${escape(registration.email)},${escape(registration.phone)},${registration.participantsCount},${escape(registration.sessionType)}\n`;
}

// Fonction principale pour enregistrer une notification
export function logRegistrationNotification(registration: TrainingRegistration): boolean {
  try {
    initializeNotificationFiles();
    
    // Ajouter au fichier de log lisible
    const logEntry = formatLogNotification(registration);
    appendFileSync(NOTIFICATIONS_FILE, logEntry);
    
    // Ajouter au fichier CSV
    const csvLine = formatCsvLine(registration);
    appendFileSync(CSV_FILE, csvLine);
    
    console.log(`✅ Notification d'inscription enregistrée pour ${registration.participantName}`);
    console.log(`📁 Consultez les fichiers: notifications_inscriptions.log et inscriptions.csv`);
    
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de l\'enregistrement de la notification:', error);
    return false;
  }
}

// Fonction pour obtenir le résumé des notifications
export function getNotificationsSummary(): { logFile: string; csvFile: string; exists: boolean } {
  return {
    logFile: NOTIFICATIONS_FILE,
    csvFile: CSV_FILE,
    exists: existsSync(NOTIFICATIONS_FILE) && existsSync(CSV_FILE)
  };
}