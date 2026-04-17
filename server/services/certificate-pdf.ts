/**
 * Génération du PDF de certificat à la volée.
 *
 * On ne stocke rien sur disque : la DB a toutes les infos (user + course +
 * score + code) et PDFKit reconstruit le certificat en <100 ms. Ça évite
 * toute gestion de volume persistant sur Railway et toute invalidation
 * de cache.
 *
 * Appelé par server/routes/certificates.ts.
 */
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

export interface CertificatePdfData {
  holderName: string;        // "Prénom Nom"
  courseTitle: string;       // Titre de la formation
  finalScore: number;        // Pourcentage 0-100
  completedAt: Date;
  verificationCode: string;  // KMT-YYYY-NNNN
  verificationUrl: string;   // https://kemetservices.com/certificats/KMT-YYYY-NNNN
}

// Palette officielle Kemet — source : client/public/diagnostic-tresorerie.html
// Verts (logo), ors (accents premium), noir/blanc cassé.
//
// Les noms `teal`/`tealDark`/`tealLight` sont conservés comme ALIAS pour
// ne pas casser les references existantes dans ce fichier — ils pointent
// désormais vers les vrais codes Kemet.
const COLORS = {
  // Verts Kemet
  primary: '#076739',        // vert principal (logo)
  primaryDark: '#03341C',    // vert foncé (titres, bordures prestige)
  accent: '#129B58',         // vert accent (vif, pour le score)
  // Alias pour compat avec l'ancien code de ce fichier
  teal: '#076739',
  tealDark: '#03341C',
  tealLight: '#F5F5F0',      // remplacé par blanc cassé Kemet (plus élégant que teal-100)
  // Ors Kemet
  gold: '#C4A41E',           // or principal
  goldLight: '#E1C850',      // or clair (accent premium)
  goldDark: '#967D0F',       // or foncé
  // Neutres
  text: '#0F0F0F',           // noir Kemet
  muted: '#6b7280',          // gris neutre pour texte secondaire
  border: '#d1d5db',         // gris clair pour bordures discrètes
  cream: '#F5F5F0',          // blanc cassé
};

function formatFrenchDate(date: Date): string {
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Écrit le PDF du certificat dans le stream fourni.
 *
 * Format A4 paysage (842 × 595 pt). Le stream est pipé par le caller
 * (typiquement `res` de la route Express) et fermé automatiquement par
 * PDFKit lors du `.end()`.
 */
export async function generateCertificatePdf(
  data: CertificatePdfData,
  stream: NodeJS.WritableStream,
): Promise<void> {
  // Générer le QR code en amont (PNG buffer). Si ça échoue, on continue sans
  // QR — le certificat reste valide, juste sans le visuel de vérification.
  let qrBuffer: Buffer | null = null;
  try {
    qrBuffer = await QRCode.toBuffer(data.verificationUrl, {
      type: 'png',
      margin: 1,
      width: 180, // haute résolution pour un rendu net à l'impression
      errorCorrectionLevel: 'M',
      color: { dark: '#03341C', light: '#FFFFFF' }, // vert foncé Kemet sur blanc
    });
  } catch (qrErr) {
    console.warn('[CERTIFICATE-PDF] QR generation failed, rendering without QR:', qrErr);
  }

  const doc = new PDFDocument({
    size: 'A4',
    layout: 'landscape',
    margins: { top: 40, bottom: 40, left: 40, right: 40 },
    info: {
      Title: `Certificat Kemet Services — ${data.verificationCode}`,
      Author: 'Kemet Services',
      Subject: `Certificat de réussite : ${data.courseTitle}`,
      Keywords: `certificat, formation, kemet, ${data.verificationCode}`,
      CreationDate: data.completedAt,
    },
  });

  doc.pipe(stream);

  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;

  // --- Bordure décorative (cadre vert + filet doré intérieur) ---
  doc
    .lineWidth(3)
    .strokeColor(COLORS.primaryDark)
    .rect(20, 20, pageWidth - 40, pageHeight - 40)
    .stroke();
  doc
    .lineWidth(1)
    .strokeColor(COLORS.gold)
    .rect(30, 30, pageWidth - 60, pageHeight - 60)
    .stroke();

  // --- Bandeau haut : nom de l'organisme (vert principal Kemet) ---
  doc
    .fillColor(COLORS.primary)
    .font('Helvetica-Bold')
    .fontSize(14)
    .text('KEMET SERVICES', 0, 55, { align: 'center', width: pageWidth });
  doc
    .fillColor(COLORS.muted)
    .font('Helvetica')
    .fontSize(10)
    .text('Formation & Consultance Pharmaceutique — Côte d\'Ivoire', 0, 73, {
      align: 'center',
      width: pageWidth,
    });

  // --- Titre principal (vert foncé Kemet) ---
  doc
    .fillColor(COLORS.primaryDark)
    .font('Helvetica-Bold')
    .fontSize(38)
    .text('CERTIFICAT DE RÉUSSITE', 0, 115, {
      align: 'center',
      width: pageWidth,
      characterSpacing: 2,
    });

  // Double filet décoratif sous le titre (or principal + or clair)
  const lineY = 170;
  doc
    .lineWidth(2)
    .strokeColor(COLORS.gold)
    .moveTo(pageWidth / 2 - 70, lineY)
    .lineTo(pageWidth / 2 + 70, lineY)
    .stroke();
  doc
    .lineWidth(0.8)
    .strokeColor(COLORS.goldLight)
    .moveTo(pageWidth / 2 - 50, lineY + 4)
    .lineTo(pageWidth / 2 + 50, lineY + 4)
    .stroke();

  // --- Préambule ---
  doc
    .fillColor(COLORS.text)
    .font('Helvetica')
    .fontSize(14)
    .text('Ce certificat est décerné à', 0, 195, {
      align: 'center',
      width: pageWidth,
    });

  // --- Nom de l'apprenant (vert foncé Kemet, en valeur) ---
  doc
    .fillColor(COLORS.primaryDark)
    .font('Times-BoldItalic')
    .fontSize(36)
    .text(data.holderName, 0, 225, {
      align: 'center',
      width: pageWidth,
    });

  // --- Phrase de reconnaissance + titre de la formation ---
  doc
    .fillColor(COLORS.text)
    .font('Helvetica')
    .fontSize(13)
    .text('pour avoir suivi et réussi avec succès la formation', 0, 285, {
      align: 'center',
      width: pageWidth,
    });

  doc
    .fillColor(COLORS.text)
    .font('Helvetica-Bold')
    .fontSize(18)
    .text(`« ${data.courseTitle} »`, 60, 310, {
      align: 'center',
      width: pageWidth - 120,
    });

  // --- Score + date ---
  const scoreY = 360;
  doc
    .fillColor(COLORS.muted)
    .font('Helvetica')
    .fontSize(11)
    .text('Score obtenu au quiz de certification', 0, scoreY, {
      align: 'center',
      width: pageWidth,
    });
  doc
    .fillColor(COLORS.gold)
    .font('Helvetica-Bold')
    .fontSize(22)
    .text(`${data.finalScore} %`, 0, scoreY + 15, {
      align: 'center',
      width: pageWidth,
    });

  doc
    .fillColor(COLORS.muted)
    .font('Helvetica')
    .fontSize(11)
    .text(`Délivré le ${formatFrenchDate(data.completedAt)}`, 0, scoreY + 48, {
      align: 'center',
      width: pageWidth,
    });

  // --- Signature (gauche) + Code de vérification (droite) ---
  const footerY = pageHeight - 125;

  // Signature à gauche
  doc
    .strokeColor(COLORS.border)
    .lineWidth(0.8)
    .moveTo(90, footerY)
    .lineTo(280, footerY)
    .stroke();
  doc
    .fillColor(COLORS.text)
    .font('Helvetica-Bold')
    .fontSize(11)
    .text('Dr. SONHON Bokola Tinni', 90, footerY + 6, { width: 190, align: 'center' });
  doc
    .fillColor(COLORS.muted)
    .font('Helvetica')
    .fontSize(9)
    .text('Fondateur & Directeur général', 90, footerY + 21, {
      width: 190,
      align: 'center',
    });

  // Bloc "Code de vérification + QR" à droite.
  // Layout : QR carré (70×70) collé contre un encart texte (210×60).
  const qrSize = 70;
  const verifBoxW = 210;
  const verifBoxH = 70;
  const verifBoxX = pageWidth - 300;
  const verifBoxY = footerY - 20;
  const qrX = verifBoxX - qrSize - 8; // à gauche du bloc, avec un petit gap
  const qrY = verifBoxY;

  // Fond de l'encart texte : blanc cassé Kemet avec bordure dorée fine
  doc
    .fillColor(COLORS.cream)
    .roundedRect(verifBoxX, verifBoxY, verifBoxW, verifBoxH, 6)
    .fill();
  doc
    .lineWidth(0.8)
    .strokeColor(COLORS.gold)
    .roundedRect(verifBoxX, verifBoxY, verifBoxW, verifBoxH, 6)
    .stroke();

  // QR code (si disponible)
  if (qrBuffer) {
    // Petit cadre blanc autour du QR pour améliorer le contraste
    doc
      .fillColor('#FFFFFF')
      .roundedRect(qrX, qrY, qrSize, qrSize, 4)
      .fill();
    doc
      .lineWidth(0.5)
      .strokeColor(COLORS.border)
      .roundedRect(qrX, qrY, qrSize, qrSize, 4)
      .stroke();
    doc.image(qrBuffer, qrX + 4, qrY + 4, { width: qrSize - 8, height: qrSize - 8 });
  }

  // Texte de l'encart
  doc
    .fillColor(COLORS.muted)
    .font('Helvetica')
    .fontSize(8)
    .text('Code de vérification', verifBoxX, verifBoxY + 8, {
      width: verifBoxW,
      align: 'center',
    });
  doc
    .fillColor(COLORS.tealDark)
    .font('Courier-Bold')
    .fontSize(15)
    .text(data.verificationCode, verifBoxX, verifBoxY + 23, {
      width: verifBoxW,
      align: 'center',
    });
  doc
    .fillColor(COLORS.muted)
    .font('Helvetica')
    .fontSize(7)
    .text(
      qrBuffer ? 'Scanner le QR ou vérifier sur kemetservices.com/certificats/' : 'Vérifier sur kemetservices.com/certificats/',
      verifBoxX,
      verifBoxY + 48,
      { width: verifBoxW, align: 'center' },
    );

  // --- Mention légale bas de page ---
  doc
    .fillColor(COLORS.muted)
    .font('Helvetica')
    .fontSize(8)
    .text(
      `Certificat authentifiable sur ${data.verificationUrl}`,
      0,
      pageHeight - 50,
      { align: 'center', width: pageWidth },
    );

  doc.end();
}
