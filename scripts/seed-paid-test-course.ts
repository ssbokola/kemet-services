/**
 * Crée une formation de test PAYANTE (500 FCFA) pour valider le flow
 * de paiement Wave en sandbox PayDunya.
 *
 * Prix volontairement minime pour les tests. Non publiée (draft) pour ne pas
 * apparaître dans le catalogue public.
 *
 * Usage : npx tsx scripts/seed-paid-test-course.ts
 */
import '../server/load-env';
import { db } from '../server/db';
import { courses } from '../shared/schema';
import { eq } from 'drizzle-orm';

const COURSE_SLUG = 'formation-test-paiement-wave';
const COURSE_TITLE = 'Formation test — Paiement Wave (sandbox)';
const TEST_PRICE_FCFA = 500;

async function main() {
  const existing = await db
    .select()
    .from(courses)
    .where(eq(courses.slug, COURSE_SLUG))
    .limit(1);

  if (existing.length > 0) {
    // S'assurer que le prix est bien de 500 FCFA même si la course existe déjà
    const current = existing[0];
    if (current.price !== TEST_PRICE_FCFA || current.defaultPrice !== TEST_PRICE_FCFA) {
      await db
        .update(courses)
        .set({ price: TEST_PRICE_FCFA, defaultPrice: TEST_PRICE_FCFA })
        .where(eq(courses.id, current.id));
      console.log(`✓ Course existait, prix synchronisé à ${TEST_PRICE_FCFA} FCFA : ${current.id}`);
    } else {
      console.log(`✓ Course existe déjà avec le bon prix : ${current.id}`);
    }
    console.log(`  URL : http://localhost:5000/formation/${COURSE_SLUG}`);
    process.exit(0);
  }

  const [created] = await db
    .insert(courses)
    .values({
      slug: COURSE_SLUG,
      title: COURSE_TITLE,
      description:
        'Formation factice utilisée uniquement pour tester le checkout Wave en sandbox PayDunya. Ne pas publier.',
      defaultDuration: 1,
      defaultPrice: TEST_PRICE_FCFA,
      price: TEST_PRICE_FCFA,
      categories: ['test'],
      deliveryMode: 'online',
      isSessionBased: false,
      isPublished: false,
      objectives: ['Tester le flow de paiement Wave end-to-end'],
      targetAudience: ['Équipe Kemet (tests internes)'],
    } as any)
    .returning({ id: courses.id });

  console.log(`✓ Course PAYANTE créée : ${created.id}`);
  console.log(`  Prix : ${TEST_PRICE_FCFA.toLocaleString('fr-FR')} FCFA`);
  console.log(`  URL  : http://localhost:5000/formation/${COURSE_SLUG}`);
  console.log('');
  console.log('Prochaines étapes :');
  console.log('  1. Connecte-toi : test-student@kemet.local / TestStudent2025!');
  console.log('  2. Ouvre l\'URL ci-dessus');
  console.log('  3. Clique sur "Payer 500 FCFA avec Wave"');
  console.log('  4. Saisis un numéro test sandbox PayDunya');
  console.log('  5. Valide → redirection vers PayDunya → retour vers /paiement/retour/:orderId');
  process.exit(0);
}

main().catch((err) => {
  console.error('✗ Erreur:', err);
  process.exit(1);
});
