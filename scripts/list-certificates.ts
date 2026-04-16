/**
 * Utilitaire one-shot : liste les certificats récents en DB (pour tests).
 * Usage : npx tsx scripts/list-certificates.ts
 */
import '../server/load-env';
import { db } from '../server/db';
import { certificates } from '../shared/schema';
import { desc } from 'drizzle-orm';

async function main() {
  const rows = await db
    .select()
    .from(certificates)
    .orderBy(desc(certificates.issuedAt))
    .limit(10);

  console.log(`CERTIFICATS (${rows.length}) :`);
  rows.forEach((r) => {
    console.log(
      `  ${r.verificationCode} | ${r.finalScore}% | userId=${r.userId} | issued=${r.issuedAt.toISOString()}`,
    );
  });
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
