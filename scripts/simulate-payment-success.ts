/**
 * Simulation d'un paiement Wave RÉUSSI — pour tester le flow "succès"
 * sans passer par le vrai checkout PayDunya sandbox (qui demande un compte
 * PayDunya client pour le mot de passe).
 *
 * Ce script :
 *   1. Trouve la dernière commande en statut "pending" pour test-student
 *   2. La marque en "completed"
 *   3. Crée l'enrollment correspondant (si pas déjà créé)
 *   4. Affiche l'URL de retour à ouvrir dans le navigateur
 *
 * Usage : npx tsx scripts/simulate-payment-success.ts
 */
import '../server/load-env';
import { db } from '../server/db';
import { orders, enrollments, users } from '../shared/schema';
import { and, desc, eq } from 'drizzle-orm';

const TEST_EMAIL = 'test-student@kemet.local';

async function main() {
  // 1. Retrouver le user test
  const [user] = await db.select().from(users).where(eq(users.email, TEST_EMAIL)).limit(1);
  if (!user) {
    console.error(`✗ User ${TEST_EMAIL} introuvable. Lance scripts/seed-lot3-test-data.ts d'abord.`);
    process.exit(1);
  }

  // 2. Retrouver la dernière order pending
  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.userId, user.id), eq(orders.status, 'pending')))
    .orderBy(desc(orders.createdAt))
    .limit(1);

  if (!order) {
    console.error('✗ Aucune commande "pending" pour ce user.');
    console.error('  → Va d\'abord sur /formation/formation-test-paiement-wave');
    console.error('  → Clique "Payer 500 FCFA avec Wave", saisis un tel, clique Payer maintenant');
    console.error('  → Sur PayDunya, ne clique PAS Annuler (laisse ouvert ou ferme l\'onglet)');
    console.error('  → Puis relance ce script');
    process.exit(1);
  }

  console.log(`✓ Commande trouvée : ${order.id} (montant: ${order.amount} ${order.currency})`);

  // 3. Passer l'order en completed
  await db
    .update(orders)
    .set({
      status: 'completed',
      waveTransactionId: `SIMUL_${Date.now()}`,
      paidAt: new Date(),
    })
    .where(eq(orders.id, order.id));
  console.log(`✓ Order passée en "completed"`);

  // 4. Créer l'enrollment si absent
  if (order.courseId) {
    const [existing] = await db
      .select()
      .from(enrollments)
      .where(and(eq(enrollments.userId, user.id), eq(enrollments.courseId, order.courseId)))
      .limit(1);

    if (!existing) {
      await db.insert(enrollments).values({
        userId: user.id,
        courseId: order.courseId,
        status: 'active',
        progressPercent: 0,
      } as any);
      console.log(`✓ Enrollment créé`);
    } else {
      console.log(`✓ Enrollment existait déjà`);
    }
  }

  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log(' Paiement simulé avec succès !');
  console.log('═══════════════════════════════════════════════════');
  console.log('');
  console.log(' Ouvre cette URL dans ton navigateur (tu dois être');
  console.log(' connecté comme test-student) :');
  console.log('');
  console.log(`   http://localhost:5000/paiement/retour/${order.id}`);
  console.log('');
  console.log(' Tu dois voir la page verte "Paiement confirmé".');
  console.log('');
  process.exit(0);
}

main().catch((err) => {
  console.error('✗ Erreur:', err);
  process.exit(1);
});
