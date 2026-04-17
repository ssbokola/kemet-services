/**
 * Génère un reçu PDF de démo pour visualiser le design sans passer par
 * la plateforme complète.
 *
 * Usage : npx tsx scripts/preview-receipt-pdf.ts
 * Puis ouvre le fichier généré (chemin affiché à la fin).
 */
import '../server/load-env';
import { createWriteStream, mkdirSync } from 'fs';
import { join } from 'path';
import { generateReceiptPdf } from '../server/services/receipt-pdf';

const mockUser = {
  id: 'preview-user-id',
  email: 'client-exemple@officine-cotedivoire.ci',
  firstName: 'Aminata',
  lastName: 'Koné',
} as any;

const mockCourse = {
  id: 'preview-course-id',
  slug: 'audit-stock-officine',
  title: 'Audit et optimisation du stock d\'officine',
  defaultDuration: 8,
} as any;

const mockOrder = {
  id: '7e3a9f21-b8c4-4d1e-a6f5-92834b7c0de1',
  userId: mockUser.id,
  courseId: mockCourse.id,
  orderType: 'online_course',
  amount: 25000,
  currency: 'XOF',
  status: 'completed',
  paymentMethod: 'wave',
  waveCheckoutId: 'test_ABC123XYZ',
  waveTransactionId: 'WAVE_TXN_789456',
  paidAt: new Date(),
  createdAt: new Date(),
} as any;

try {
  mkdirSync(join(process.cwd(), '.local'), { recursive: true });
} catch {}

const outPath = join(process.cwd(), '.local', 'preview-receipt.pdf');
const stream = createWriteStream(outPath);

stream.on('finish', () => {
  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log(' Preview reçu PDF généré !');
  console.log('═══════════════════════════════════════════════════');
  console.log('');
  console.log(' Ouvre ce fichier :');
  console.log('');
  console.log(`   ${outPath}`);
  console.log('');
});

generateReceiptPdf({ user: mockUser, course: mockCourse, order: mockOrder }, stream);
