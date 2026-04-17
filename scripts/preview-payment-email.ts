/**
 * Génère un fichier HTML local représentant l'email de confirmation de paiement.
 * Permet de prévisualiser le design dans le navigateur sans rien envoyer.
 *
 * Usage : npx tsx scripts/preview-payment-email.ts
 * Puis ouvre le fichier généré (chemin affiché à la fin).
 */
import '../server/load-env';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { generatePaymentConfirmationHTML } from '../server/emails/payment-confirmation';

// Données fictives pour la preview
const mockUser = {
  id: 'preview-user-id',
  email: 'client-exemple@officine-cotedivoire.ci',
  firstName: 'Aminata',
  lastName: 'Koné',
  username: null,
  password: null,
  profileImageUrl: null,
  role: 'participant',
  createdAt: new Date(),
  updatedAt: new Date(),
  authType: 'local',
  status: 'active',
  isTemporaryPassword: false,
  lastLoginAt: null,
  passwordResetAt: null,
  passwordResetToken: null,
  passwordResetTokenExpiry: null,
} as any;

const mockCourse = {
  id: 'preview-course-id',
  slug: 'audit-stock-officine',
  title: 'Audit et optimisation du stock d\'officine',
  description: 'Formation pratique sur la gestion avancée des stocks pharmaceutiques.',
  categories: ['stock'],
  deliveryMode: 'online',
  isSessionBased: false,
  defaultDuration: 8,
  defaultPrice: 25000,
  duration: null,
  price: 25000,
  isPublished: true,
  thumbnail: null,
  objectives: ['Réduire les ruptures', 'Optimiser la trésorerie'],
  prerequisites: null,
  targetAudience: ['Pharmaciens'],
  createdAt: new Date(),
  updatedAt: new Date(),
  defaultLocation: null,
} as any;

const mockOrder = {
  id: '7e3a9f21-b8c4-4d1e-a6f5-92834b7c0de1',
  userId: mockUser.id,
  courseId: mockCourse.id,
  orderType: 'online_course',
  referenceId: mockCourse.id,
  amount: 25000,
  currency: 'XOF',
  status: 'completed',
  paymentMethod: 'wave',
  waveCheckoutId: 'test_ABC123XYZ',
  waveTransactionId: 'WAVE_TXN_789456',
  paidAt: new Date(),
  failureReason: null,
  createdAt: new Date(),
  updatedAt: new Date(),
} as any;

const html = generatePaymentConfirmationHTML({
  user: mockUser,
  course: mockCourse,
  order: mockOrder,
});

const outPath = join(process.cwd(), '.local', 'preview-payment-email.html');
// Assure que le dossier existe
try {
  require('fs').mkdirSync(join(process.cwd(), '.local'), { recursive: true });
} catch {}
writeFileSync(outPath, html, 'utf8');

console.log('');
console.log('═══════════════════════════════════════════════════');
console.log(' Preview email généré !');
console.log('═══════════════════════════════════════════════════');
console.log('');
console.log(' Ouvre ce fichier dans ton navigateur :');
console.log('');
console.log(`   ${outPath}`);
console.log('');
console.log(' Ou en URL file:// :');
console.log(`   file:///${outPath.replace(/\\/g, '/')}`);
console.log('');
