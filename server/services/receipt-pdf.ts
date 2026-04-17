/**
 * Générateur de reçu de paiement PDF — Chantier 4 Lot 2.
 *
 * Format A4 portrait, branding Kemet Services.
 * Contient :
 *   - En-tête avec nom et coordonnées Kemet
 *   - Numéro de reçu, date de paiement
 *   - Bloc "Client" (nom, email)
 *   - Tableau d'items (formation + prix)
 *   - Total TTC
 *   - Référence transaction Wave
 *   - Tampon "PAYÉ"
 *   - Mentions légales en bas de page
 *
 * Usage :
 *   generateReceiptPdf({ order, user, course }, stream);
 *
 * Le PDF est streamé directement vers le response Express : pas de stockage disque.
 *
 * NB : ce document est un "reçu de paiement" (preuve de transaction), PAS une
 * facture fiscale stricte avec NCC/RCCM/TVA. Une vraie facture fiscale sera
 * ajoutée plus tard quand les infos légales Kemet auront été validées avec
 * un comptable.
 */
import PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';
import type { Writable } from 'stream';
import type { Course, User, Order } from '@shared/schema';

// ---------------------------------------------------------------------------
// Palette & constantes visuelles — Charte Kemet officielle
// (source : client/public/diagnostic-tresorerie.html ligne 26)
// ---------------------------------------------------------------------------

const COLORS = {
  // Verts Kemet
  primary: '#076739',        // vert Kemet principal (logo)
  primaryDark: '#03341C',    // vert Kemet foncé (bandeau prestige)
  accent: '#129B58',         // vert accent (vif, pour le tampon PAYÉ)
  // Ors Kemet
  gold: '#C4A41E',           // or principal
  goldLight: '#E1C850',      // or clair (accents premium)
  goldDark: '#967D0F',       // or foncé
  // Neutres Kemet
  black: '#0F0F0F',          // noir Kemet
  charcoal: '#232323',       // charbon
  cream: '#F5F5F0',          // blanc cassé (fond doux)
  white: '#FFFFFF',
  // Dérivés utilitaires
  text: '#0F0F0F',           // noir Kemet pour tout texte principal
  muted: '#6b7280',          // gris neutre pour labels secondaires
  border: '#d1d5db',         // gris clair pour bordures discrètes
  rowAlt: '#F5F5F0',         // blanc cassé Kemet pour les lignes alternées
};

const PAGE_MARGIN = 50;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ReceiptPdfData {
  order: Order;
  user: User;
  course: Course;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatFrenchDate(d: Date | string | null): string {
  if (!d) return '—';
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function formatAmount(amount: number | string, currency: string = 'XOF'): string {
  const n = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `${n.toLocaleString('fr-FR')} ${currency}`;
}

function formatCustomerName(user: User): string {
  if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
  return user.firstName || user.lastName || user.email || 'Client';
}

function truncate(str: string, maxLen: number): string {
  if (!str) return '';
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 1).trimEnd() + '…';
}

function buildReceiptNumber(orderId: string, paidAt: Date | string | null): string {
  // Format : RCP-YYYY-XXXX (8 premiers caractères de l'UUID)
  const year = paidAt ? new Date(paidAt).getFullYear() : new Date().getFullYear();
  const short = orderId.slice(0, 8).toUpperCase();
  return `RCP-${year}-${short}`;
}

// ---------------------------------------------------------------------------
// Générateur principal
// ---------------------------------------------------------------------------

export function generateReceiptPdf(data: ReceiptPdfData, stream: Writable): void {
  const { order, user, course } = data;

  // NB sur la bottom margin : elle doit être petite (20) pour éviter que
  // PDFKit crée automatiquement des pages supplémentaires quand le footer
  // s'approche du bas. Avec bottom=20, on peut écrire jusqu'à pageHeight-20.
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: PAGE_MARGIN, bottom: 20, left: PAGE_MARGIN, right: PAGE_MARGIN },
    info: {
      Title: `Reçu de paiement - ${course.title}`,
      Author: 'Kemet Services',
      Subject: `Paiement de la formation ${course.title}`,
      Creator: 'Kemet Services Platform',
    },
  });

  doc.pipe(stream);

  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const contentWidth = pageWidth - PAGE_MARGIN * 2;

  // Option globale : désactiver le lineBreak automatique sur les .text()
  // pour que PDFKit n'ajoute jamais de page par lui-même.
  // On passera `{ lineBreak: false }` sur les textes critiques.

  // --- EN-TÊTE (hauteur réduite : 65px) ---
  doc.rect(0, 0, pageWidth, 65).fill(COLORS.primaryDark);
  doc.rect(0, 65, pageWidth, 2.5).fill(COLORS.gold);

  doc
    .fillColor(COLORS.white)
    .font('Helvetica-Bold')
    .fontSize(20)
    .text('Kemet Services', PAGE_MARGIN, 18, { width: contentWidth});

  doc
    .font('Helvetica')
    .fontSize(9)
    .fillColor(COLORS.cream)
    .text('Cabinet de formation et conseil — Pharmacies d\'officine', PAGE_MARGIN, 44, {
      width: contentWidth,
      lineBreak: false,
    });

  doc
    .font('Helvetica-Bold')
    .fontSize(14)
    .fillColor(COLORS.goldLight)
    .text('REÇU DE PAIEMENT', pageWidth - PAGE_MARGIN - 220, 26, {
      width: 220,
      align: 'right',
      lineBreak: false,
    });

  // --- ÉMETTEUR (gauche) + INFORMATIONS (droite) ---
  let yLeft = 85;
  const yStart = 85;

  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .fillColor(COLORS.gold)
    .text('ÉMETTEUR', PAGE_MARGIN, yLeft, { lineBreak: false });
  yLeft += 13;

  const leftLines = [
    ['Helvetica-Bold', 'Kemet Services'],
    ['Helvetica', 'Abidjan — Yopougon CHU, Côte d\'Ivoire'],
    ['Helvetica', 'infos@kemetservices.com'],
    ['Helvetica', 'kemetservices.com'],
  ];
  for (const [font, line] of leftLines) {
    doc.font(font).fontSize(9).fillColor(COLORS.text).text(line, PAGE_MARGIN, yLeft, { lineBreak: false });
    yLeft += 12;
  }

  // Infos droite
  const metaX = pageWidth - PAGE_MARGIN - 230;
  let metaY = yStart;
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .fillColor(COLORS.gold)
    .text('INFORMATIONS', metaX, metaY, { width: 230});
  metaY += 13;

  const metaRows: Array<[string, string]> = [
    ['N° de reçu', buildReceiptNumber(order.id, order.paidAt)],
    ['Date d\'émission', formatFrenchDate(order.paidAt || order.createdAt)],
    ['Référence commande', order.id.slice(0, 8).toUpperCase()],
  ];
  for (const [label, value] of metaRows) {
    doc.font('Helvetica').fontSize(8).fillColor(COLORS.muted).text(label, metaX, metaY, { width: 100});
    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .fillColor(COLORS.text)
      .text(value, metaX + 100, metaY, { width: 130, align: 'right'});
    metaY += 12;
  }

  // --- CLIENT ---
  let y = Math.max(yLeft, metaY) + 15;
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .fillColor(COLORS.gold)
    .text('CLIENT', PAGE_MARGIN, y, { lineBreak: false });
  y += 13;
  doc
    .font('Helvetica-Bold')
    .fontSize(11)
    .fillColor(COLORS.text)
    .text(formatCustomerName(user), PAGE_MARGIN, y, { lineBreak: false });
  y += 13;
  if (user.email) {
    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor(COLORS.muted)
      .text(user.email, PAGE_MARGIN, y, { lineBreak: false });
    y += 12;
  }

  // --- TABLEAU DES ITEMS ---
  y += 12;
  const colDescX = PAGE_MARGIN;
  const colAmountX = pageWidth - PAGE_MARGIN - 130;

  // En-tête tableau
  doc.rect(PAGE_MARGIN, y, contentWidth, 22).fill(COLORS.primaryDark);
  doc.rect(PAGE_MARGIN, y + 22, contentWidth, 1.2).fill(COLORS.gold);
  doc
    .fillColor(COLORS.white)
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('DESCRIPTION', colDescX + 10, y + 7, { lineBreak: false })
    .text('MONTANT', colAmountX, y + 7, { width: 130, align: 'right'});
  y += 22;

  // Ligne formation (plus compacte : 48px)
  doc.rect(PAGE_MARGIN, y, contentWidth, 48).fill(COLORS.rowAlt).stroke(COLORS.border);

  doc
    .fillColor(COLORS.text)
    .font('Helvetica-Bold')
    .fontSize(10)
    .text('Formation professionnelle', colDescX + 10, y + 8, { width: contentWidth - 160});

  doc
    .font('Helvetica')
    .fontSize(9)
    .fillColor(COLORS.muted)
    .text(truncate(course.title, 75), colDescX + 10, y + 22, { width: contentWidth - 160 });

  doc
    .font('Helvetica')
    .fontSize(8)
    .fillColor(COLORS.muted)
    .text('Formation en ligne — accès illimité', colDescX + 10, y + 35, { lineBreak: false });

  doc
    .font('Helvetica-Bold')
    .fontSize(11)
    .fillColor(COLORS.text)
    .text(
      formatAmount(Number(order.amount), order.currency || 'XOF'),
      colAmountX,
      y + 18,
      { width: 120, align: 'right'},
    );

  y += 48;

  // --- TOTAL (bloc premium compact) ---
  y += 12;
  const totalBoxY = y;
  const totalBoxX = pageWidth - PAGE_MARGIN - 260;
  const totalBoxW = 260;
  const totalBoxH = 44;

  doc.rect(totalBoxX, totalBoxY, totalBoxW, totalBoxH).fill(COLORS.cream);
  doc.lineWidth(1.5).strokeColor(COLORS.gold).rect(totalBoxX, totalBoxY, totalBoxW, totalBoxH).stroke();
  doc.rect(totalBoxX, totalBoxY + totalBoxH, totalBoxW, 2).fill(COLORS.primaryDark);

  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .fillColor(COLORS.primaryDark)
    .text('MONTANT TOTAL PAYÉ', totalBoxX + 15, totalBoxY + 7, { width: totalBoxW - 30});

  doc
    .font('Helvetica-Bold')
    .fontSize(18)
    .fillColor(COLORS.primaryDark)
    .text(
      formatAmount(Number(order.amount), order.currency || 'XOF'),
      totalBoxX + 15,
      totalBoxY + 20,
      { width: totalBoxW - 30},
    );

  // --- TAMPON "PAYÉ" — placé à gauche au niveau du total ---
  if (order.status === 'completed') {
    doc.save();
    doc.rotate(-10, { origin: [PAGE_MARGIN + 55, totalBoxY + 22] });
    doc
      .strokeColor(COLORS.accent)
      .lineWidth(2.5)
      .rect(PAGE_MARGIN, totalBoxY, 110, 40)
      .stroke();
    doc
      .font('Helvetica-Bold')
      .fontSize(20)
      .fillColor(COLORS.accent)
      .text('PAYÉ', PAGE_MARGIN, totalBoxY + 10, { width: 110, align: 'center'});
    doc.restore();
  }

  // --- DÉTAILS DE LA TRANSACTION ---
  y = totalBoxY + totalBoxH + 20;
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .fillColor(COLORS.gold)
    .text('DÉTAILS DE LA TRANSACTION', PAGE_MARGIN, y, { lineBreak: false });
  y += 13;

  const txRows: Array<[string, string]> = [
    ['Moyen de paiement', 'Wave (mobile money) via PayDunya'],
    ['Date du paiement', formatFrenchDate(order.paidAt || order.createdAt)],
    ['Référence transaction', order.waveTransactionId || '—'],
    ['Statut', order.status === 'completed' ? 'Payé' : order.status],
  ];

  for (const [label, value] of txRows) {
    doc.font('Helvetica').fontSize(8).fillColor(COLORS.muted).text(label, PAGE_MARGIN, y, { width: 160});
    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor(COLORS.text)
      .text(value, PAGE_MARGIN + 160, y, { width: contentWidth - 160});
    y += 13;
  }

  // --- PIED DE PAGE (position fixe près du bas mais toujours sur la même page) ---
  const footerY = pageHeight - 70;

  doc
    .strokeColor(COLORS.gold)
    .lineWidth(0.8)
    .moveTo(PAGE_MARGIN, footerY)
    .lineTo(pageWidth - PAGE_MARGIN, footerY)
    .stroke();

  doc
    .font('Helvetica')
    .fontSize(7.5)
    .fillColor(COLORS.muted)
    .text(
      'Document émis automatiquement par la plateforme Kemet Services.',
      PAGE_MARGIN,
      footerY + 8,
      { width: contentWidth, align: 'center' },
    );

  doc
    .font('Helvetica-Bold')
    .fontSize(8.5)
    .fillColor(COLORS.primaryDark)
    .text('Kemet Services', PAGE_MARGIN, footerY + 24, {
      width: contentWidth,
      align: 'center',
      lineBreak: false,
    });

  doc
    .font('Helvetica')
    .fontSize(7.5)
    .fillColor(COLORS.muted)
    .text(
      'Abidjan, Côte d\'Ivoire — infos@kemetservices.com — kemetservices.com',
      PAGE_MARGIN,
      footerY + 36,
      { width: contentWidth, align: 'center'},
    );

  doc.end();
}

/**
 * Variante qui génère le PDF en mémoire et retourne un Buffer.
 * Utile pour joindre le reçu en pièce jointe d'email (nodemailer attachment).
 *
 * Préférer `generateReceiptPdf(..., stream)` quand on a déjà un stream
 * destination (ex : response HTTP) — c'est plus efficient en mémoire.
 */
export function renderReceiptPdfToBuffer(data: ReceiptPdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const pass = new PassThrough();

    pass.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    pass.on('end', () => resolve(Buffer.concat(chunks)));
    pass.on('error', reject);

    try {
      generateReceiptPdf(data, pass);
    } catch (err) {
      reject(err);
    }
  });
}
