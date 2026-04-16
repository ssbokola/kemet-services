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

export interface CertificatePdfData {
  holderName: string;        // "Prénom Nom"
  courseTitle: string;       // Titre de la formation
  finalScore: number;        // Pourcentage 0-100
  completedAt: Date;
  verificationCode: string;  // KMT-YYYY-NNNN
  verificationUrl: string;   // https://kemetservices.com/certificats/KMT-YYYY-NNNN
}

// Couleurs du branding Kemet (teal/emerald)
const COLORS = {
  teal: '#0d9488',
  tealDark: '#0f766e',
  tealLight: '#ccfbf1',
  gold: '#b45309',
  text: '#111827',
  muted: '#6b7280',
  border: '#d1d5db',
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
export function generateCertificatePdf(
  data: CertificatePdfData,
  stream: NodeJS.WritableStream,
): void {
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

  // --- Bordure décorative (double cadre teal) ---
  doc
    .lineWidth(3)
    .strokeColor(COLORS.teal)
    .rect(20, 20, pageWidth - 40, pageHeight - 40)
    .stroke();
  doc
    .lineWidth(1)
    .strokeColor(COLORS.tealDark)
    .rect(30, 30, pageWidth - 60, pageHeight - 60)
    .stroke();

  // --- Bandeau haut : nom de l'organisme ---
  doc
    .fillColor(COLORS.teal)
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

  // --- Titre principal ---
  doc
    .fillColor(COLORS.tealDark)
    .font('Helvetica-Bold')
    .fontSize(38)
    .text('CERTIFICAT DE RÉUSSITE', 0, 115, {
      align: 'center',
      width: pageWidth,
      characterSpacing: 2,
    });

  // Petite ligne décorative sous le titre
  const lineY = 170;
  doc
    .lineWidth(1.5)
    .strokeColor(COLORS.gold)
    .moveTo(pageWidth / 2 - 60, lineY)
    .lineTo(pageWidth / 2 + 60, lineY)
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

  // --- Nom de l'apprenant (bien mis en valeur) ---
  doc
    .fillColor(COLORS.tealDark)
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

  // Code de vérification à droite
  const rightBoxX = pageWidth - 300;
  doc
    .fillColor(COLORS.tealLight)
    .roundedRect(rightBoxX, footerY - 15, 210, 60, 6)
    .fill();
  doc
    .fillColor(COLORS.muted)
    .font('Helvetica')
    .fontSize(8)
    .text('Code de vérification', rightBoxX, footerY - 8, {
      width: 210,
      align: 'center',
    });
  doc
    .fillColor(COLORS.tealDark)
    .font('Courier-Bold')
    .fontSize(15)
    .text(data.verificationCode, rightBoxX, footerY + 5, {
      width: 210,
      align: 'center',
    });
  doc
    .fillColor(COLORS.muted)
    .font('Helvetica')
    .fontSize(7)
    .text('Vérifier sur kemetservices.com/certificats/', rightBoxX, footerY + 28, {
      width: 210,
      align: 'center',
    });

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
