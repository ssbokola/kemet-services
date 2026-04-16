/**
 * Setup complet pour tester Lot 3 (certificats) sans passer par le flow quiz.
 *
 * Crée / réutilise :
 *   1. Une formation de test
 *   2. Un participant de test + enrollment actif
 *   3. Un certificat avec code KMT-2026-TEST (réservé pour les tests)
 *
 * Usage : npx tsx scripts/seed-lot3-test-data.ts
 *
 * Après l'exécution, tu peux tester :
 *   - Page publique (pas d'auth) : http://localhost:5000/certificats/KMT-2026-TEST
 *     → (mais notre regex exige KMT-YYYY-NNNN avec 4 chiffres. On génère donc
 *        un code conforme ci-dessous.)
 *   - API verify : http://localhost:5000/api/certificates/verify/<code>
 *   - Download PDF (après login test-student) :
 *     http://localhost:5000/api/certificates/<code>/download
 */
import '../server/load-env';
import { db } from '../server/db';
import { users, courses, enrollments, certificates } from '../shared/schema';
import { hashPassword } from '../server/auth';
import { eq, and } from 'drizzle-orm';

const TEST_EMAIL = 'test-student@kemet.local';
const TEST_PASSWORD = 'TestStudent2025!';

const COURSE_SLUG = 'formation-test-lot3-certificats';
const COURSE_TITLE = 'Formation test — Certification & audit de stock';
// Code de vérification déterministe pour les tests (0001 correspond au format).
const TEST_VERIFICATION_CODE = 'KMT-2026-0001';

async function main() {
  // ----- 1. Utilisateur test -----
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, TEST_EMAIL))
    .limit(1);

  let userId: string;
  if (existingUser.length > 0) {
    userId = existingUser[0].id;
    console.log(`✓ User existe : ${userId}`);
  } else {
    const [created] = await db
      .insert(users)
      .values({
        email: TEST_EMAIL,
        firstName: 'Test',
        lastName: 'Student',
        password: hashPassword(TEST_PASSWORD),
        authType: 'local',
        status: 'active',
        role: 'participant',
        isTemporaryPassword: false,
      })
      .returning({ id: users.id });
    userId = created.id;
    console.log(`✓ User créé : ${userId}`);
  }

  // ----- 2. Formation test -----
  const existingCourse = await db
    .select()
    .from(courses)
    .where(eq(courses.slug, COURSE_SLUG))
    .limit(1);

  let courseId: string;
  if (existingCourse.length > 0) {
    courseId = existingCourse[0].id;
    console.log(`✓ Course existe : ${courseId}`);
  } else {
    const [created] = await db
      .insert(courses)
      .values({
        slug: COURSE_SLUG,
        title: COURSE_TITLE,
        description:
          'Formation de test pour valider le Lot 3 (PDF certificats + vérification publique).',
        defaultDuration: 5,
        defaultPrice: 0,
        categories: ['test'],
        deliveryMode: 'online',
        isSessionBased: false,
        published: false, // non publique pour ne pas polluer le catalogue
        objectives: ['Tester la génération PDF', 'Tester la page de vérif'],
        targetAudience: ['Pharmaciens', 'Assistants'],
      } as any)
      .returning({ id: courses.id });
    courseId = created.id;
    console.log(`✓ Course créée : ${courseId}`);
  }

  // ----- 3. Enrollment -----
  const existingEnroll = await db
    .select()
    .from(enrollments)
    .where(and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId)))
    .limit(1);

  if (existingEnroll.length === 0) {
    await db.insert(enrollments).values({
      userId,
      courseId,
      status: 'active',
      progressPercent: 100,
      completedAt: new Date(),
      progressEmailsCount: 0,
    } as any);
    console.log('✓ Enrollment créé');
  } else {
    console.log('✓ Enrollment existe déjà');
  }

  // ----- 4. Certificat test -----
  const existingCert = await db
    .select()
    .from(certificates)
    .where(eq(certificates.verificationCode, TEST_VERIFICATION_CODE))
    .limit(1);

  if (existingCert.length === 0) {
    await db.insert(certificates).values({
      userId,
      courseId,
      certificateNumber: TEST_VERIFICATION_CODE,
      finalScore: 90,
      completedAt: new Date(),
      verificationCode: TEST_VERIFICATION_CODE,
      pdfUrl: null,
    });
    console.log(`✓ Certificat créé : ${TEST_VERIFICATION_CODE}`);
  } else {
    console.log(`✓ Certificat existe déjà : ${TEST_VERIFICATION_CODE}`);
  }

  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log(' URLs de test Lot 3');
  console.log('═══════════════════════════════════════════════════');
  console.log(`  Page publique (pas d'auth) :`);
  console.log(`    http://localhost:5000/certificats/${TEST_VERIFICATION_CODE}`);
  console.log('');
  console.log(`  Formulaire de saisie (pas d'auth) :`);
  console.log(`    http://localhost:5000/certificats`);
  console.log('');
  console.log(`  API verify (JSON) :`);
  console.log(`    http://localhost:5000/api/certificates/verify/${TEST_VERIFICATION_CODE}`);
  console.log('');
  console.log(`  PDF (nécessite login ${TEST_EMAIL}) :`);
  console.log(`    http://localhost:5000/api/certificates/${TEST_VERIFICATION_CODE}/download`);
  console.log('');
  console.log(` Login participant :`);
  console.log(`    ${TEST_EMAIL} / ${TEST_PASSWORD}`);
  console.log('═══════════════════════════════════════════════════');
  process.exit(0);
}

main().catch((err) => {
  console.error('✗ Erreur:', err);
  process.exit(1);
});
