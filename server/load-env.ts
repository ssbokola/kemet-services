/**
 * Chargement des variables d'environnement depuis .env (dev local).
 *
 * Doit être importé AVANT tout autre module qui lit `process.env.*` au
 * chargement (typiquement server/db.ts qui lit DATABASE_URL).
 *
 * `override: true` est volontaire :
 *   - En prod (Railway) : pas de fichier .env → dotenv ne fait rien,
 *     les env vars de la plateforme restent en place (safe).
 *   - En dev : permet d'écraser d'éventuelles vars héritées du shell parent
 *     (ex: ANTHROPIC_API_KEY="" injectée par certains hôtes d'agent).
 */
import dotenv from 'dotenv';

dotenv.config({ override: true });
