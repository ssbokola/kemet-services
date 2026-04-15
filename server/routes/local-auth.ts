/**
 * Local Auth Routes (email/password) — complements Replit OAuth.
 *
 * Endpoints:
 *   POST /api/auth/register          → create local account + auto-login
 *   POST /api/auth/login             → email/password login
 *   POST /api/auth/forgot-password   → request reset email
 *   POST /api/auth/reset-password    → consume reset token + set new password
 *
 * Session shape for local users (mirrors Replit shape so downstream code
 * can read `req.user.claims.sub` uniformly):
 *   {
 *     authType: 'local',
 *     claims: { sub, email, first_name, last_name }
 *   }
 */
import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { hashPassword, verifyPassword, generateSecureToken } from '../auth';
import { sendPasswordResetEmail } from '../emails/password-reset';
import { localLoginSchema } from '@shared/schema';

const router = Router();

// ---------- Validation schemas (local to this file) ----------
const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email('Adresse email invalide'),
  firstName: z.string().trim().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().trim().min(2, 'Le nom doit contenir au moins 2 caractères'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
});

const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email('Adresse email invalide'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(10, 'Jeton invalide'),
  newPassword: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
});

// ---------- Helper: establish session for local user ----------
function loginUser(req: any, user: { id: string; email: string | null; firstName: string | null; lastName: string | null }): Promise<void> {
  return new Promise((resolve, reject) => {
    const sessionUser = {
      authType: 'local',
      claims: {
        sub: user.id,
        email: user.email,
        first_name: user.firstName,
        last_name: user.lastName,
      },
    };
    req.login(sessionUser, (err: any) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

// ---------- POST /api/auth/register ----------
router.post('/register', async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);

    const hashedPassword = hashPassword(data.password);

    let newUser;
    try {
      newUser = await storage.createLocalUser({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        password: hashedPassword,
        authType: 'local',
        status: 'active',
        role: 'participant',
        isTemporaryPassword: false,
      } as any);
    } catch (err: any) {
      if (err?.message === 'EMAIL_ALREADY_REGISTERED') {
        return res.status(409).json({
          success: false,
          error: 'Un compte existe déjà avec cette adresse email',
        });
      }
      throw err;
    }

    // Auto-login after registration
    await loginUser(req, newUser);
    await storage.updateUserLastLogin(newUser.id);

    console.log(`[AUTH] Local account created: ${newUser.id} (${newUser.email})`);

    res.status(201).json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
      },
      message: 'Compte créé avec succès',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Données invalides',
        details: error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
    }
    console.error('[AUTH] Register error:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la création du compte' });
  }
});

// ---------- POST /api/auth/login ----------
router.post('/login', async (req, res) => {
  try {
    const data = localLoginSchema.parse(req.body);
    const normalizedEmail = data.email.toLowerCase().trim();

    const user = await storage.getUserByEmail(normalizedEmail);

    // Same generic error for non-existent user + wrong password (prevents user enumeration)
    const GENERIC_ERROR = 'Email ou mot de passe incorrect';

    if (!user || !user.password) {
      return res.status(401).json({ success: false, error: GENERIC_ERROR });
    }

    // Prevent Replit-OAuth-only users from logging in with password
    if (user.authType === 'replit') {
      return res.status(401).json({
        success: false,
        error: 'Ce compte utilise la connexion Replit. Veuillez vous connecter via "Se connecter avec Replit".',
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        error: 'Ce compte est désactivé. Contactez le support.',
      });
    }

    const isValid = verifyPassword(data.password, user.password);
    if (!isValid) {
      return res.status(401).json({ success: false, error: GENERIC_ERROR });
    }

    await loginUser(req, user);
    await storage.updateUserLastLogin(user.id);

    console.log(`[AUTH] Local login: ${user.id} (${user.email})`);

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Données invalides',
        details: error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
    }
    console.error('[AUTH] Login error:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la connexion' });
  }
});

// ---------- POST /api/auth/forgot-password ----------
router.post('/forgot-password', async (req, res) => {
  try {
    const data = forgotPasswordSchema.parse(req.body);

    // ALWAYS respond 200 to prevent email enumeration
    const genericResponse = {
      success: true,
      message: 'Si un compte existe avec cette adresse, un email de réinitialisation a été envoyé.',
    };

    const user = await storage.getUserByEmail(data.email);

    // Silently skip if user doesn't exist OR is a Replit user (can't reset OAuth passwords)
    if (!user || user.authType !== 'local') {
      return res.json(genericResponse);
    }

    const token = generateSecureToken();
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await storage.setPasswordResetToken(user.id, token, expiry);

    // Send email (don't await — fire and forget, but log errors)
    const appBaseUrl = process.env.APP_BASE_URL || 'https://kemetservices.com';
    const resetUrl = `${appBaseUrl}/reinitialiser-mot-de-passe?token=${token}`;

    sendPasswordResetEmail({
      to: user.email!,
      firstName: user.firstName || '',
      resetUrl,
    }).catch((err) => {
      console.error(`[AUTH] Failed to send reset email to ${user.email}:`, err);
    });

    console.log(`[AUTH] Password reset token issued for user ${user.id}`);

    res.json(genericResponse);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Adresse email invalide',
      });
    }
    console.error('[AUTH] Forgot password error:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// ---------- POST /api/auth/reset-password ----------
router.post('/reset-password', async (req, res) => {
  try {
    const data = resetPasswordSchema.parse(req.body);

    const user = await storage.getUserByPasswordResetToken(data.token);

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Lien invalide ou expiré. Veuillez recommencer la procédure de réinitialisation.',
      });
    }

    const hashedPassword = hashPassword(data.newPassword);
    await storage.updateUserPassword(user.id, hashedPassword);
    await storage.clearPasswordResetToken(user.id);

    // Auto-login after password reset
    await loginUser(req, user);
    await storage.updateUserLastLogin(user.id);

    console.log(`[AUTH] Password reset completed for user ${user.id}`);

    res.json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Données invalides',
        details: error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
    }
    console.error('[AUTH] Reset password error:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la réinitialisation' });
  }
});

export default router;
