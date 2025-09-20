import { Router } from 'express';
import { z } from 'zod';
import { eq, count, desc, asc, sql, and } from 'drizzle-orm';
import { db } from '../db';
import { 
  authenticateAdmin, 
  createAdminSession, 
  deleteAdminSession,
  requireAdminAuth,
  createFirstAdmin
} from '../auth';
import { 
  admins, 
  trainingRegistrations, 
  contactRequests,
  insertContactRequestSchema 
} from '@shared/schema';

const router = Router();

// Schéma de validation pour le login
const loginSchema = z.object({
  username: z.string().trim().min(1, 'Nom d\'utilisateur requis'),
  password: z.string().min(1, 'Mot de passe requis'),
});

// Login admin
router.post('/login', async (req, res) => {
  try {
    const { username, password } = loginSchema.parse(req.body);
    
    const admin = await authenticateAdmin(username, password);
    if (!admin) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    const token = await createAdminSession(admin.id);
    
    res.json({
      message: 'Connexion réussie',
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        role: admin.role,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Logout admin
router.post('/logout', requireAdminAuth(), async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    
    if (token) {
      await deleteAdminSession(token);
    }
    
    res.json({ message: 'Déconnexion réussie' });
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Vérifier si un admin existe (pour l'initialisation)
router.get('/check-setup', async (req, res) => {
  try {
    const adminCount = await db.select({ count: count() }).from(admins);
    const hasAdmin = adminCount[0].count > 0;
    
    res.json({ hasAdmin });
  } catch (error) {
    console.error('Erreur lors de la vérification:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Créer le premier admin (setup initial)
router.post('/setup', async (req, res) => {
  try {
    const { username, password } = loginSchema.parse(req.body);
    
    // Vérifier qu'aucun admin n'existe déjà
    const adminCount = await db.select({ count: count() }).from(admins);
    if (adminCount[0].count > 0) {
      return res.status(400).json({ error: 'Un administrateur existe déjà' });
    }
    
    const admin = await createFirstAdmin(username, password);
    const token = await createAdminSession(admin.id);
    
    res.json({
      message: 'Administrateur créé avec succès',
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        role: admin.role,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Erreur lors de la création de l\'admin:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Dashboard - Statistiques générales
router.get('/dashboard/stats', requireAdminAuth(), async (req, res) => {
  try {
    const [
      registrationsCount,
      contactsCount,
      recentRegistrations,
      recentContacts
    ] = await Promise.all([
      db.select({ count: count() }).from(trainingRegistrations),
      db.select({ count: count() }).from(contactRequests),
      db.select().from(trainingRegistrations).orderBy(desc(trainingRegistrations.createdAt)).limit(5),
      db.select().from(contactRequests).orderBy(desc(contactRequests.createdAt)).limit(5)
    ]);

    res.json({
      totalRegistrations: registrationsCount[0].count,
      totalContacts: contactsCount[0].count,
      recentRegistrations,
      recentContacts
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des stats:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Gestion des inscriptions
router.get('/registrations', requireAdminAuth(), async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search as string;
    const role = req.query.role as string;
    const sessionType = req.query.sessionType as string;
    
    // Construire la requête avec filtres
    const registrations = await db
      .select()
      .from(trainingRegistrations)
      .where(
        and(
          search ? 
            sql`(
              lower(${trainingRegistrations.participantName}) LIKE lower(${`%${search}%`}) OR 
              lower(${trainingRegistrations.email}) LIKE lower(${`%${search}%`}) OR 
              lower(${trainingRegistrations.officine}) LIKE lower(${`%${search}%`})
            )` : undefined,
          role && role !== 'all' ? eq(trainingRegistrations.role, role) : undefined,
          sessionType && sessionType !== 'all' ? eq(trainingRegistrations.sessionType, sessionType) : undefined
        )
      )
      .orderBy(desc(trainingRegistrations.createdAt))
      .limit(limit)
      .offset(offset);
    
    const totalCount = await db
      .select({ count: count() })
      .from(trainingRegistrations)
      .where(
        and(
          search ? 
            sql`(
              lower(${trainingRegistrations.participantName}) LIKE lower(${`%${search}%`}) OR 
              lower(${trainingRegistrations.email}) LIKE lower(${`%${search}%`}) OR 
              lower(${trainingRegistrations.officine}) LIKE lower(${`%${search}%`})
            )` : undefined,
          role && role !== 'all' ? eq(trainingRegistrations.role, role) : undefined,
          sessionType && sessionType !== 'all' ? eq(trainingRegistrations.sessionType, sessionType) : undefined
        )
      );
    
    res.json({
      registrations,
      pagination: {
        page,
        limit,
        total: totalCount[0].count,
        pages: Math.ceil(totalCount[0].count / limit)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des inscriptions:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Gestion des demandes de contact
router.get('/contacts', requireAdminAuth(), async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search as string;
    const type = req.query.type as string;
    const status = req.query.status as string;
    const priority = req.query.priority as string;
    
    // Construire les filtres
    const contacts = await db
      .select()
      .from(contactRequests)
      .where(
        and(
          search ? 
            sql`(
              lower(${contactRequests.name}) LIKE lower(${`%${search}%`}) OR 
              lower(${contactRequests.email}) LIKE lower(${`%${search}%`}) OR 
              lower(${contactRequests.company}) LIKE lower(${`%${search}%`}) OR
              lower(${contactRequests.subject}) LIKE lower(${`%${search}%`})
            )` : undefined,
          type && type !== 'all' ? eq(contactRequests.type, type) : undefined,
          status && status !== 'all' ? eq(contactRequests.status, status) : undefined,
          priority && priority !== 'all' ? eq(contactRequests.priority, priority) : undefined
        )
      )
      .orderBy(desc(contactRequests.createdAt))
      .limit(limit)
      .offset(offset);
    
    // Compter le total avec les mêmes filtres
    const totalCount = await db
      .select({ count: count() })
      .from(contactRequests)
      .where(
        and(
          search ? 
            sql`(
              lower(${contactRequests.name}) LIKE lower(${`%${search}%`}) OR 
              lower(${contactRequests.email}) LIKE lower(${`%${search}%`}) OR 
              lower(${contactRequests.company}) LIKE lower(${`%${search}%`}) OR
              lower(${contactRequests.subject}) LIKE lower(${`%${search}%`})
            )` : undefined,
          type && type !== 'all' ? eq(contactRequests.type, type) : undefined,
          status && status !== 'all' ? eq(contactRequests.status, status) : undefined,
          priority && priority !== 'all' ? eq(contactRequests.priority, priority) : undefined
        )
      );
    
    res.json({
      contacts,
      pagination: {
        page,
        limit,
        total: totalCount[0].count,
        pages: Math.ceil(totalCount[0].count / limit)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des contacts:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Export CSV des contacts
router.get('/contacts/export', requireAdminAuth(), async (req, res) => {
  try {
    const search = req.query.search as string;
    const type = req.query.type as string;
    const status = req.query.status as string;
    const priority = req.query.priority as string;
    
    // Récupérer tous les contacts avec les filtres appliqués (sans pagination)
    const contacts = await db
      .select()
      .from(contactRequests)
      .where(
        and(
          search ? 
            sql`(
              lower(${contactRequests.name}) LIKE lower(${`%${search}%`}) OR 
              lower(${contactRequests.email}) LIKE lower(${`%${search}%`}) OR 
              lower(${contactRequests.company}) LIKE lower(${`%${search}%`}) OR
              lower(${contactRequests.subject}) LIKE lower(${`%${search}%`})
            )` : undefined,
          type && type !== 'all' ? eq(contactRequests.type, type) : undefined,
          status && status !== 'all' ? eq(contactRequests.status, status) : undefined,
          priority && priority !== 'all' ? eq(contactRequests.priority, priority) : undefined
        )
      )
      .orderBy(desc(contactRequests.createdAt));
    
    // Générer le CSV
    const csvHeader = [
      'ID', 'Type', 'Nom', 'Email', 'Téléphone', 'Entreprise', 'Sujet', 'Message',
      'Service consulting', 'Statut', 'Priorité', 'Date création', 'Date modification'
    ].join(',');
    
    const csvRows = contacts.map(contact => [
      contact.id,
      contact.type,
      `"${contact.name}"`,
      contact.email,
      contact.phone || '',
      `"${contact.company || ''}"`,
      `"${contact.subject || ''}"`,
      `"${contact.message.replace(/"/g, '""')}"`,
      `"${contact.consultingService || ''}"`,
      contact.status,
      contact.priority,
      contact.createdAt.toISOString(),
      contact.updatedAt.toISOString()
    ].join(','));
    
    const csv = [csvHeader, ...csvRows].join('\n');
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="contacts-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send('\uFEFF' + csv); // BOM pour Excel
  } catch (error) {
    console.error('Erreur lors de l\'export CSV:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Mettre à jour le statut d'une demande de contact
router.patch('/contacts/:id/status', requireAdminAuth(), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    const validStatuses = ['nouveau', 'en-cours', 'traite', 'ferme'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }
    
    await db
      .update(contactRequests)
      .set({ 
        status, 
        notes: notes || null,
        updatedAt: new Date() 
      })
      .where(eq(contactRequests.id, id));
    
    res.json({ message: 'Statut mis à jour' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

export default router;