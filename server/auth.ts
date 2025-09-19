import crypto from 'crypto';
import { eq, and, gt, lt } from 'drizzle-orm';
import { db } from './db';
import { admins, adminSessions, type Admin } from '@shared/schema';

// Utilitaires de hash de mots de passe avec sécurité renforcée
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(32).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 310000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, hashedPassword: string): boolean {
  const [salt, hash] = hashedPassword.split(':');
  const verifyHash = crypto.pbkdf2Sync(password, salt, 310000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(verifyHash, 'hex'));
}

// Génération de tokens sécurisés
export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Créer une session admin
export async function createAdminSession(adminId: string): Promise<string> {
  const token = generateSecureToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 heures

  await db.insert(adminSessions).values({
    adminId,
    token,
    expiresAt,
  });

  return token;
}

// Vérifier une session admin
export async function verifyAdminSession(token: string): Promise<Admin | null> {
  const sessions = await db
    .select({
      admin: admins,
      session: adminSessions,
    })
    .from(adminSessions)
    .innerJoin(admins, eq(adminSessions.adminId, admins.id))
    .where(
      and(
        eq(adminSessions.token, token),
        gt(adminSessions.expiresAt, new Date())
      )
    )
    .limit(1);

  return sessions.length > 0 ? sessions[0].admin : null;
}

// Supprimer une session admin (logout)
export async function deleteAdminSession(token: string): Promise<void> {
  await db.delete(adminSessions).where(eq(adminSessions.token, token));
}

// Supprimer les sessions expirées
export async function cleanupExpiredSessions(): Promise<void> {
  await db.delete(adminSessions).where(lt(adminSessions.expiresAt, new Date()));
}

// Authentifier un admin
export async function authenticateAdmin(username: string, password: string): Promise<Admin | null> {
  const adminResults = await db
    .select()
    .from(admins)
    .where(eq(admins.username, username))
    .limit(1);

  if (adminResults.length === 0) {
    return null;
  }

  const admin = adminResults[0];
  const isValid = verifyPassword(password, admin.password);

  return isValid ? admin : null;
}

// Créer le premier admin (pour l'initialisation)
export async function createFirstAdmin(username: string, password: string): Promise<Admin> {
  const hashedPassword = hashPassword(password);
  
  const result = await db.insert(admins).values({
    username,
    password: hashedPassword,
    role: 'admin',
  }).returning();

  return result[0];
}

// Middleware pour vérifier l'authentification admin
export function requireAdminAuth() {
  return async (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: 'Token d\'authentification requis' });
    }

    const admin = await verifyAdminSession(token);
    if (!admin) {
      return res.status(401).json({ error: 'Session invalide ou expirée' });
    }

    req.admin = admin;
    next();
  };
}