/**
 * One-shot script : crée un participant de test + l'inscrit à la formation test.
 *
 * Usage : npx tsx scripts/seed-test-participant.ts
 *
 * Identifiants créés :
 *   email     : test-student@kemet.local
 *   password  : TestStudent2025!
 *   course id : 899ea6bd-1cd3-4739-8c6a-341af5c61eb4
 */
import '../server/load-env';
import { db } from '../server/db';
import { users, enrollments } from '../shared/schema';
import { hashPassword } from '../server/auth';
import { eq, and } from 'drizzle-orm';

const TEST_EMAIL = 'test-student@kemet.local';
const TEST_PASSWORD = 'TestStudent2025!';
const TEST_FIRST = 'Test';
const TEST_LAST = 'Student';
const COURSE_ID = '899ea6bd-1cd3-4739-8c6a-341af5c61eb4';

async function main() {
  // 1. Crée (ou réutilise) le user
  const existing = await db.select().from(users).where(eq(users.email, TEST_EMAIL)).limit(1);
  let userId: string;
  if (existing.length > 0) {
    userId = existing[0].id;
    console.log(`✓ User existe déjà : ${userId}`);
  } else {
    const [created] = await db.insert(users).values({
      email: TEST_EMAIL,
      firstName: TEST_FIRST,
      lastName: TEST_LAST,
      password: hashPassword(TEST_PASSWORD),
      authType: 'local',
      status: 'active',
      role: 'participant',
      isTemporaryPassword: false,
    }).returning({ id: users.id });
    userId = created.id;
    console.log(`✓ User créé : ${userId}`);
  }

  // 2. Crée (ou réutilise) l'enrollment
  const existingEnrollment = await db.select().from(enrollments)
    .where(and(eq(enrollments.userId, userId), eq(enrollments.courseId, COURSE_ID)))
    .limit(1);
  if (existingEnrollment.length > 0) {
    console.log(`✓ Enrollment existe déjà : ${existingEnrollment[0].id} (status=${existingEnrollment[0].status})`);
    // Si suspended/expired, on le remet actif
    if (existingEnrollment[0].status !== 'active') {
      await db.update(enrollments)
        .set({ status: 'active' })
        .where(eq(enrollments.id, existingEnrollment[0].id));
      console.log(`  → status remis à 'active'`);
    }
  } else {
    const [created] = await db.insert(enrollments).values({
      userId,
      courseId: COURSE_ID,
      status: 'active',
      progressPercent: 0,
      progressEmailsCount: 0,
    }).returning({ id: enrollments.id });
    console.log(`✓ Enrollment créé : ${created.id}`);
  }

  console.log('');
  console.log('═══════════════════════════════════════════════');
  console.log(' Identifiants participant de test');
  console.log('═══════════════════════════════════════════════');
  console.log(`  URL       : http://localhost:5000/login`);
  console.log(`  Email     : ${TEST_EMAIL}`);
  console.log(`  Password  : ${TEST_PASSWORD}`);
  console.log(`  Formation : Formation test - Gestion de stock en officine`);
  console.log('═══════════════════════════════════════════════');
  process.exit(0);
}

main().catch((err) => {
  console.error('✗ Erreur:', err);
  process.exit(1);
});
