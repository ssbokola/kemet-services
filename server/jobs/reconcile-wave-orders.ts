/**
 * Réconciliation auto Wave — Chantier 4 Lot 3.
 *
 * Un cron interne qui tourne toutes les 15 minutes. Il cherche les commandes
 * `pending` qui ont plus de 10 minutes et appelle l'API PayDunya pour vérifier
 * leur statut réel. Sert de filet de sécurité quand le webhook IPN n'arrive
 * pas (downtime Railway, timeout réseau côté PayDunya, etc.).
 *
 * Mécanisme :
 *   1. Lister les orders status=pending ET waveCheckoutId non null ET
 *      createdAt < now - 10min
 *   2. Pour chaque order :
 *      - Appeler checkWavePaymentStatus(waveCheckoutId)
 *      - Si completed → update order + create enrollment + envoyer l'email
 *      - Si failed/cancelled → update order
 *      - Sinon (toujours pending) → laisser pour le prochain passage
 *   3. Stop automatique après 50 orders par run pour éviter de bloquer le
 *      Node loop si beaucoup de pending accumulés
 *
 * Pas besoin de node-cron : setInterval Node built-in suffit pour un job
 * périodique simple. Le job est démarré dans server/index.ts au boot.
 *
 * Sécurité : idempotent — les updates sont basées sur le statut renvoyé par
 * PayDunya qui est la source de vérité. Double-envoi d'email évité via la
 * garde `status === completed && oldStatus === pending`.
 */

import { db } from '../db';
import { orders, enrollments } from '@shared/schema';
import { and, eq, lt, isNotNull } from 'drizzle-orm';
import { checkWavePaymentStatus } from '../payments/wave';
import { sendPaymentConfirmation } from '../emails/payment-confirmation';
import { storage } from '../storage';

// --- Config ---
const RECONCILE_INTERVAL_MS = 15 * 60 * 1000;   // 15 minutes
const MIN_PENDING_AGE_MS = 10 * 60 * 1000;      // skip les orders trop récentes (le webhook doit avoir sa chance)
const MAX_ORDERS_PER_RUN = 50;                  // garde-fou CPU

let intervalHandle: NodeJS.Timeout | null = null;

/**
 * Lance un cycle de réconciliation. Exporté séparément pour permettre un
 * appel manuel (ex : bouton admin "forcer réconciliation" plus tard).
 */
export async function runReconciliation(): Promise<{
  scanned: number;
  completed: number;
  failed: number;
  cancelled: number;
  errors: number;
}> {
  const logPrefix = '[RECONCILE]';
  const cutoff = new Date(Date.now() - MIN_PENDING_AGE_MS);

  const stats = { scanned: 0, completed: 0, failed: 0, cancelled: 0, errors: 0 };

  try {
    const pendingOrders = await db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.status, 'pending'),
          isNotNull(orders.waveCheckoutId),
          lt(orders.createdAt, cutoff),
        ),
      )
      .limit(MAX_ORDERS_PER_RUN);

    if (pendingOrders.length === 0) {
      return stats;
    }

    console.log(`${logPrefix} Scanning ${pendingOrders.length} pending orders older than ${MIN_PENDING_AGE_MS / 60000}min`);

    for (const order of pendingOrders) {
      stats.scanned++;

      if (!order.waveCheckoutId) continue; // filet de sécurité, déjà filtré par la query

      try {
        const paydunyaStatus = await checkWavePaymentStatus(order.waveCheckoutId);

        if (!paydunyaStatus.success) {
          console.warn(`${logPrefix} Status check failed for order ${order.id}:`, paydunyaStatus.error);
          stats.errors++;
          continue;
        }

        // Toujours pending ? On laisse pour le prochain run
        if (paydunyaStatus.status === 'pending') {
          continue;
        }

        // Transition détectée → update
        await storage.updateOrder(order.id, {
          status: paydunyaStatus.status,
          waveTransactionId: paydunyaStatus.transactionId,
          paidAt: paydunyaStatus.status === 'completed' ? new Date() : undefined,
        });

        if (paydunyaStatus.status === 'completed') {
          stats.completed++;

          // Créer l'enrollment si online_course et pas déjà créé
          if (order.orderType === 'online_course' && order.userId && order.courseId) {
            try {
              const existing = await storage.getEnrollment(order.userId, order.courseId);
              if (!existing) {
                await storage.createEnrollment({
                  userId: order.userId,
                  courseId: order.courseId,
                  status: 'active',
                  progressPercent: 0,
                });
              }
            } catch (e: any) {
              if (e?.code !== '23505') {
                console.error(`${logPrefix} Enrollment creation failed for order ${order.id}:`, e);
              }
            }
          }

          // Envoyer l'email de confirmation (fire-and-forget). On récupère
          // l'order rafraîchie pour avoir paidAt + waveTransactionId corrects.
          (async () => {
            try {
              const freshOrder = await storage.getOrderById(order.id);
              const user = order.userId ? await storage.getUserById(order.userId) : null;
              const course = order.courseId ? await storage.getCourseById(order.courseId) : null;
              if (freshOrder && user && course) {
                await sendPaymentConfirmation(user, course, freshOrder);
                console.log(`${logPrefix} Email envoyé pour order ${order.id} (via cron)`);
              }
            } catch (e) {
              console.error(`${logPrefix} Email send failed for order ${order.id}:`, e);
            }
          })();

          console.log(`${logPrefix} Order ${order.id} → completed (transaction ${paydunyaStatus.transactionId})`);
        } else if (paydunyaStatus.status === 'failed') {
          stats.failed++;
          console.log(`${logPrefix} Order ${order.id} → failed`);
        } else if (paydunyaStatus.status === 'cancelled') {
          stats.cancelled++;
          console.log(`${logPrefix} Order ${order.id} → cancelled`);
        }
      } catch (error) {
        stats.errors++;
        console.error(`${logPrefix} Unexpected error on order ${order.id}:`, error);
      }
    }

    console.log(`${logPrefix} Run done`, stats);
    return stats;
  } catch (error) {
    console.error(`${logPrefix} Top-level error:`, error);
    stats.errors++;
    return stats;
  }
}

/**
 * Démarre le job de réconciliation périodique. Idempotent : appels multiples
 * ignorés. À appeler une seule fois au boot depuis server/index.ts.
 */
export function startWaveReconciliationJob(): void {
  if (intervalHandle) {
    console.warn('[RECONCILE] Job already running, ignoring duplicate start');
    return;
  }

  // Premier run différé de 2min après le boot pour ne pas charger le démarrage
  const initialDelay = 2 * 60 * 1000;

  setTimeout(() => {
    runReconciliation().catch((e) => console.error('[RECONCILE] Initial run failed:', e));
    intervalHandle = setInterval(() => {
      runReconciliation().catch((e) => console.error('[RECONCILE] Periodic run failed:', e));
    }, RECONCILE_INTERVAL_MS);
  }, initialDelay);

  console.log(`[RECONCILE] Job armé — 1er passage dans ${initialDelay / 1000}s, puis toutes les ${RECONCILE_INTERVAL_MS / 60000}min`);
}

/**
 * Stoppe le job (utilisé par les tests / hot reload dev si besoin).
 */
export function stopWaveReconciliationJob(): void {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
    console.log('[RECONCILE] Job stopped');
  }
}
