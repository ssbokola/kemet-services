/**
 * Utilitaire one-shot : liste les formations avec leur prix.
 * Sert à identifier rapidement une formation payante (ou à en créer une)
 * pour tester le flow de checkout Wave.
 *
 * Usage : npx tsx scripts/list-courses-prices.ts
 */
import '../server/load-env';
import { db } from '../server/db';
import { courses } from '../shared/schema';
import { desc } from 'drizzle-orm';

async function main() {
  const rows = await db
    .select({
      id: courses.id,
      slug: courses.slug,
      title: courses.title,
      price: courses.price,
      defaultPrice: courses.defaultPrice,
      deliveryMode: courses.deliveryMode,
      isPublished: courses.isPublished,
    })
    .from(courses)
    .orderBy(desc(courses.updatedAt))
    .limit(30);

  console.log(`FORMATIONS (${rows.length}) — price (online) / defaultPrice (onsite) :`);
  console.log('');
  rows.forEach((r) => {
    const effective = r.price ?? r.defaultPrice ?? 0;
    const tag = effective > 0 ? '💰 PAYANTE' : '🆓 GRATUITE';
    const pub = r.isPublished ? 'pub' : 'draft';
    console.log(`  ${tag} | ${effective.toLocaleString('fr-FR')} FCFA | ${pub} | ${r.deliveryMode} | ${r.slug}`);
    console.log(`    → ${r.title.slice(0, 70)}${r.title.length > 70 ? '…' : ''}`);
    console.log(`    → http://localhost:5000/formation/${r.slug}`);
    console.log('');
  });
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
