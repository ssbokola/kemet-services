/**
 * Génère un certificat PDF de démo pour visualiser le rendu (avec QR code).
 * Usage : npx tsx scripts/preview-certificate-pdf.ts
 */
import '../server/load-env';
import { createWriteStream, mkdirSync } from 'fs';
import { join } from 'path';
import { generateCertificatePdf } from '../server/services/certificate-pdf';

try {
  mkdirSync(join(process.cwd(), '.local'), { recursive: true });
} catch {}

const outPath = join(process.cwd(), '.local', 'preview-certificate.pdf');
const stream = createWriteStream(outPath);

stream.on('finish', () => {
  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log(' Preview certificat PDF généré !');
  console.log('═══════════════════════════════════════════════════');
  console.log('');
  console.log(`   ${outPath}`);
  console.log('');
});

(async () => {
  await generateCertificatePdf(
    {
      holderName: 'Aminata Koné',
      courseTitle: 'Audit et optimisation du stock d\'officine',
      finalScore: 92,
      completedAt: new Date(),
      verificationCode: 'KMT-2026-0042',
      verificationUrl: 'https://kemetservices.com/certificats/KMT-2026-0042',
    },
    stream,
  );
})();
