// Routes pour la gestion des participants - Génération d'identifiants et envoi par email
import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { users, insertLocalUserSchema } from '@shared/schema';
import { requireAdminAuth } from '../auth';
import { emailService } from '../emailService';
import { generateResetToken, hashPassword } from '../passwordUtils';
import { eq, and, or } from 'drizzle-orm';

const router = Router();

// Schema pour la création d'un participant via admin
const createParticipantSchema = z.object({
  email: z.string().trim().email('Adresse email invalide'),
  firstName: z.string().trim().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().trim().min(2, 'Le nom doit contenir au moins 2 caractères'),
  sendEmail: z.boolean().default(true),
});

type CreateParticipant = z.infer<typeof createParticipantSchema>;

// POST /api/admin/participants - Créer un participant et envoyer ses identifiants par email
router.post('/', requireAdminAuth(), async (req, res) => {
  try {
    const participantData = createParticipantSchema.parse(req.body);
    
    // Vérifier que l'email n'existe pas déjà
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, participantData.email))
      .limit(1);

    if (existingUser.length > 0) {
      return res.status(400).json({ 
        error: 'Un utilisateur avec cet email existe déjà',
        field: 'email'
      });
    }

    // Générer un token de configuration sécurisé (pas de mot de passe initial)
    const resetToken = generateResetToken();
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 heures

    // Créer l'utilisateur dans la base de données
    const newUserData = {
      email: participantData.email,
      firstName: participantData.firstName,
      lastName: participantData.lastName,
      password: null, // Pas de mot de passe initial - sera configuré via le lien
      authType: 'local' as const,
      role: 'participant' as const,
      status: 'active' as const,
      isTemporaryPassword: true, // Nécessite configuration
      passwordResetToken: resetToken,
      passwordResetTokenExpiry: tokenExpiry,
    };

    // Insérer l'utilisateur (gérer les colonnes existantes vs nouvelles)
    const insertData: any = {
      username: newUserData.email, // Utiliser l'email comme username
      email: newUserData.email,
      firstName: newUserData.firstName, // Colonne existante
      lastName: newUserData.lastName,   // Colonne existante
      password: newUserData.password,
      role: newUserData.role,
      authType: 'local',
      status: 'active',
      isTemporaryPassword: true,
      passwordResetToken: newUserData.passwordResetToken,
      passwordResetTokenExpiry: newUserData.passwordResetTokenExpiry,
    };

    const [newUser] = await db
      .insert(users)
      .values(insertData)
      .returning();

    // Envoyer l'email avec le lien de configuration si demandé
    if (participantData.sendEmail) {
      const emailSent = await emailService.sendParticipantSetupLink({
        email: participantData.email,
        firstName: participantData.firstName,
        lastName: participantData.lastName,
        resetToken,
      });

      if (!emailSent) {
        console.error('Échec de l\'envoi de l\'email pour:', participantData.email);
        // Ne pas faire échouer la création si l'email échoue
      }
    }

    // Retourner les informations du participant (sans le mot de passe)
    const { password: _, ...userWithoutPassword } = newUser;
    
    res.status(201).json({
      message: 'Participant créé avec succès',
      participant: userWithoutPassword,
      emailSent: participantData.sendEmail,
      setupRequired: true, // Indique qu'une configuration de mot de passe est nécessaire
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Données invalides',
        details: error.errors,
      });
    }

    console.error('Erreur lors de la création du participant:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// GET /api/admin/participants - Lister les participants
router.get('/', requireAdminAuth(), async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string || '';
    
    const offset = (page - 1) * limit;

    // Construire la requête avec filtres
    let whereClause: any = eq(users.role, 'participant');
    
    if (search) {
      whereClause = and(
        eq(users.role, 'participant'),
        or(
          eq(users.email, search),
          eq(users.firstName, search),
          eq(users.lastName, search)
        )
      );
    }

    const [participantsData, countResult] = await Promise.all([
      db
        .select({
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          role: users.role,
          status: users.status,
          authType: users.authType,
          isTemporaryPassword: users.isTemporaryPassword,
          lastLoginAt: users.lastLoginAt,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(whereClause)
        .orderBy(users.createdAt)
        .limit(limit)
        .offset(offset),
      
      db
        .select({ count: users.id })
        .from(users)
        .where(whereClause)
    ]);

    const total = countResult.length;
    const pages = Math.ceil(total / limit);

    res.json({
      participants: participantsData,
      pagination: { page, limit, total, pages }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des participants:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// POST /api/admin/participants/:id/resend-credentials - Renvoyer les identifiants par email
router.post('/:id/resend-credentials', requireAdminAuth(), async (req, res) => {
  try {
    const { id } = req.params;

    // Récupérer l'utilisateur
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.id, id), eq(users.role, 'participant')))
      .limit(1);

    if (!user) {
      return res.status(404).json({ error: 'Participant non trouvé' });
    }

    // Générer un nouveau mot de passe temporaire
    const temporaryPassword = generateTemporaryPassword();
    const hashedPassword = await hashPassword(temporaryPassword);

    // Mettre à jour le mot de passe
    await db
      .update(users)
      .set({ 
        password: hashedPassword,
        isTemporaryPassword: true,
        passwordResetAt: new Date(),
      })
      .where(eq(users.id, id));

    // Envoyer l'email avec les nouveaux identifiants
    const emailSent = await emailService.sendParticipantCredentials({
      email: user.email || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      temporaryPassword,
    });

    if (!emailSent) {
      return res.status(500).json({ error: 'Échec de l\'envoi de l\'email' });
    }

    res.json({
      message: 'Nouveaux identifiants envoyés par email avec succès',
      emailSent: true,
    });

  } catch (error) {
    console.error('Erreur lors du renvoi des identifiants:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// DELETE /api/admin/participants/:id - Supprimer un participant
router.delete('/:id', requireAdminAuth(), async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que l'utilisateur existe et est un participant
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.id, id), eq(users.role, 'participant')))
      .limit(1);

    if (!user) {
      return res.status(404).json({ error: 'Participant non trouvé' });
    }

    // Supprimer l'utilisateur
    await db.delete(users).where(eq(users.id, id));

    res.json({ message: 'Participant supprimé avec succès' });

  } catch (error) {
    console.error('Erreur lors de la suppression du participant:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

export default router;