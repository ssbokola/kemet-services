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
  insertContactRequestSchema,
  courses,
  courseModules,
  courseLessons,
  insertCourseSchema
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
    // Dates pour les périodes
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const last7Days = new Date(today);
    last7Days.setDate(last7Days.getDate() - 7);
    const last30Days = new Date(today);
    last30Days.setDate(last30Days.getDate() - 30);
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      // Totaux généraux
      registrationsCount,
      contactsCount,
      
      // Statistiques par période - Inscriptions
      registrationsToday,
      registrationsYesterday,
      registrationsLast7Days,
      registrationsLast30Days,
      registrationsThisMonth,
      registrationsLastMonth,
      
      // Statistiques par période - Contacts
      contactsToday,
      contactsYesterday,
      contactsLast7Days,
      contactsLast30Days,
      contactsThisMonth,
      contactsLastMonth,
      
      // Répartition par type/statut
      registrationsByRole,
      registrationsBySessionType,
      contactsByType,
      contactsByStatus,
      contactsByPriority,
      
      // Récents
      recentRegistrations,
      recentContacts
    ] = await Promise.all([
      // Totaux généraux
      db.select({ count: count() }).from(trainingRegistrations),
      db.select({ count: count() }).from(contactRequests),
      
      // Inscriptions par période
      db.select({ count: count() }).from(trainingRegistrations).where(sql`${trainingRegistrations.createdAt} >= ${today.toISOString()}`),
      db.select({ count: count() }).from(trainingRegistrations).where(sql`${trainingRegistrations.createdAt} >= ${yesterday.toISOString()} AND ${trainingRegistrations.createdAt} < ${today.toISOString()}`),
      db.select({ count: count() }).from(trainingRegistrations).where(sql`${trainingRegistrations.createdAt} >= ${last7Days.toISOString()}`),
      db.select({ count: count() }).from(trainingRegistrations).where(sql`${trainingRegistrations.createdAt} >= ${last30Days.toISOString()}`),
      db.select({ count: count() }).from(trainingRegistrations).where(sql`${trainingRegistrations.createdAt} >= ${currentMonth.toISOString()}`),
      db.select({ count: count() }).from(trainingRegistrations).where(sql`${trainingRegistrations.createdAt} >= ${lastMonth.toISOString()} AND ${trainingRegistrations.createdAt} < ${currentMonth.toISOString()}`),
      
      // Contacts par période
      db.select({ count: count() }).from(contactRequests).where(sql`${contactRequests.createdAt} >= ${today.toISOString()}`),
      db.select({ count: count() }).from(contactRequests).where(sql`${contactRequests.createdAt} >= ${yesterday.toISOString()} AND ${contactRequests.createdAt} < ${today.toISOString()}`),
      db.select({ count: count() }).from(contactRequests).where(sql`${contactRequests.createdAt} >= ${last7Days.toISOString()}`),
      db.select({ count: count() }).from(contactRequests).where(sql`${contactRequests.createdAt} >= ${last30Days.toISOString()}`),
      db.select({ count: count() }).from(contactRequests).where(sql`${contactRequests.createdAt} >= ${currentMonth.toISOString()}`),
      db.select({ count: count() }).from(contactRequests).where(sql`${contactRequests.createdAt} >= ${lastMonth.toISOString()} AND ${contactRequests.createdAt} < ${currentMonth.toISOString()}`),
      
      // Répartitions
      db.select({ role: trainingRegistrations.role, count: count() }).from(trainingRegistrations).groupBy(trainingRegistrations.role),
      db.select({ sessionType: trainingRegistrations.sessionType, count: count() }).from(trainingRegistrations).groupBy(trainingRegistrations.sessionType),
      db.select({ type: contactRequests.type, count: count() }).from(contactRequests).groupBy(contactRequests.type),
      db.select({ status: contactRequests.status, count: count() }).from(contactRequests).groupBy(contactRequests.status),
      db.select({ priority: contactRequests.priority, count: count() }).from(contactRequests).groupBy(contactRequests.priority),
      
      // Récents
      db.select().from(trainingRegistrations).orderBy(desc(trainingRegistrations.createdAt)).limit(5),
      db.select().from(contactRequests).orderBy(desc(contactRequests.createdAt)).limit(5)
    ]);

    // Calculer les taux de croissance
    const calculateGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    // Calculer le taux de conversion (contacts qui deviennent inscriptions)
    const totalLeads = contactsCount[0].count + registrationsCount[0].count;
    const conversionRate = totalLeads > 0 ? Math.round((registrationsCount[0].count / totalLeads) * 100) : 0;

    res.json({
      // Totaux
      totalRegistrations: registrationsCount[0].count,
      totalContacts: contactsCount[0].count,
      
      // Métriques de performance
      conversionRate,
      totalLeads,
      
      // Période actuelle vs précédente
      registrationsGrowthDaily: calculateGrowth(registrationsToday[0].count, registrationsYesterday[0].count),
      registrationsGrowthMonthly: calculateGrowth(registrationsThisMonth[0].count, registrationsLastMonth[0].count),
      contactsGrowthDaily: calculateGrowth(contactsToday[0].count, contactsYesterday[0].count),
      contactsGrowthMonthly: calculateGrowth(contactsThisMonth[0].count, contactsLastMonth[0].count),
      
      // Statistiques par période
      periods: {
        today: {
          registrations: registrationsToday[0].count,
          contacts: contactsToday[0].count
        },
        yesterday: {
          registrations: registrationsYesterday[0].count,
          contacts: contactsYesterday[0].count
        },
        last7Days: {
          registrations: registrationsLast7Days[0].count,
          contacts: contactsLast7Days[0].count
        },
        last30Days: {
          registrations: registrationsLast30Days[0].count,
          contacts: contactsLast30Days[0].count
        },
        thisMonth: {
          registrations: registrationsThisMonth[0].count,
          contacts: contactsThisMonth[0].count
        },
        lastMonth: {
          registrations: registrationsLastMonth[0].count,
          contacts: contactsLastMonth[0].count
        }
      },
      
      // Répartitions
      breakdown: {
        registrationsByRole: registrationsByRole.map(r => ({ label: r.role, value: r.count })),
        registrationsBySessionType: registrationsBySessionType.map(r => ({ label: r.sessionType, value: r.count })),
        contactsByType: contactsByType.map(c => ({ label: c.type, value: c.count })),
        contactsByStatus: contactsByStatus.map(c => ({ label: c.status, value: c.count })),
        contactsByPriority: contactsByPriority.map(c => ({ label: c.priority, value: c.count }))
      },
      
      // Récents (pour l'affichage détaillé)
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

// ==========================================
// GESTION DES FORMATIONS (COURSES, MODULES, LESSONS)
// ==========================================

// GET /api/admin/courses - Liste des cours pour l'admin
router.get('/courses', requireAdminAuth(), async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string || '';
    const category = req.query.category as string || 'all';
    const published = req.query.published as string || 'all';
    
    const offset = (page - 1) * limit;
    
    // Construire la requête avec filtres
    let whereClause: any = undefined;
    
    // Construire les conditions WHERE
    const conditions = [];
    if (search) {
      conditions.push(sql`${courses.title} ILIKE ${`%${search}%`} OR ${courses.description} ILIKE ${`%${search}%`}`);
    }
    if (category !== 'all') {
      conditions.push(eq(courses.category, category));
    }
    if (published !== 'all') {
      conditions.push(eq(courses.isPublished, published === 'true'));
    }
    
    if (conditions.length > 0) {
      whereClause = conditions.length === 1 
        ? conditions[0]
        : and(...conditions);
    }
    
    // Appliquer les filtres
    const query = whereClause 
      ? db.select().from(courses).where(whereClause)
      : db.select().from(courses);
    
    const countQuery = whereClause
      ? db.select({ count: count() }).from(courses).where(whereClause)
      : db.select({ count: count() }).from(courses);
    
    const [coursesData, totalResult] = await Promise.all([
      query.orderBy(desc(courses.createdAt)).limit(limit).offset(offset),
      countQuery
    ]);
    
    const total = totalResult[0]?.count || 0;
    const pages = Math.ceil(total / limit);
    
    res.json({
      courses: coursesData,
      pagination: { page, limit, total, pages }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des cours:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// POST /api/admin/courses - Créer un nouveau cours
router.post('/courses', requireAdminAuth(), async (req, res) => {
  try {
    const courseData = insertCourseSchema.parse(req.body);
    
    // Vérifier que le slug est unique
    const existingCourse = await db
      .select()
      .from(courses)
      .where(eq(courses.slug, courseData.slug))
      .limit(1);
    
    if (existingCourse.length > 0) {
      return res.status(400).json({ error: 'Ce slug existe déjà' });
    }
    
    const [newCourse] = await db
      .insert(courses)
      .values(courseData)
      .returning();
    
    res.status(201).json(newCourse);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Erreur lors de la création du cours:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// GET /api/admin/courses/:id - Détails d'un cours pour l'admin
router.get('/courses/:id', requireAdminAuth(), async (req, res) => {
  try {
    const { id } = req.params;
    
    const [course] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, id));
    
    if (!course) {
      return res.status(404).json({ error: 'Cours introuvable' });
    }
    
    // Récupérer les modules et leçons associés
    const modules = await db
      .select()
      .from(courseModules)
      .where(eq(courseModules.courseId, id))
      .orderBy(asc(courseModules.order));
    
    const modulesWithLessons = await Promise.all(
      modules.map(async (module) => {
        const lessons = await db
          .select()
          .from(courseLessons)
          .where(eq(courseLessons.moduleId, module.id))
          .orderBy(asc(courseLessons.order));
        
        return { ...module, lessons };
      })
    );
    
    res.json({ 
      ...course, 
      modules: modulesWithLessons 
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du cours:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// PUT /api/admin/courses/:id - Mettre à jour un cours
router.put('/courses/:id', requireAdminAuth(), async (req, res) => {
  try {
    const { id } = req.params;
    const courseData = insertCourseSchema.parse(req.body);
    
    // Vérifier que le cours existe
    const [existingCourse] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, id));
    
    if (!existingCourse) {
      return res.status(404).json({ error: 'Cours introuvable' });
    }
    
    // Vérifier l'unicité du slug (si changé)
    if (courseData.slug !== existingCourse.slug) {
      const courseWithSlug = await db
        .select()
        .from(courses)
        .where(and(eq(courses.slug, courseData.slug), sql`${courses.id} != ${id}`))
        .limit(1);
      
      if (courseWithSlug.length > 0) {
        return res.status(400).json({ error: 'Ce slug existe déjà' });
      }
    }
    
    const [updatedCourse] = await db
      .update(courses)
      .set({ ...courseData, updatedAt: new Date() })
      .where(eq(courses.id, id))
      .returning();
    
    res.json(updatedCourse);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Erreur lors de la mise à jour du cours:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// DELETE /api/admin/courses/:id - Supprimer un cours
router.delete('/courses/:id', requireAdminAuth(), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifier que le cours existe
    const [existingCourse] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, id));
    
    if (!existingCourse) {
      return res.status(404).json({ error: 'Cours introuvable' });
    }
    
    // Supprimer le cours (cascade supprimera modules et leçons)
    await db.delete(courses).where(eq(courses.id, id));
    
    res.json({ message: 'Cours supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du cours:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// ==========================================
// GESTION DES MODULES DE COURS
// ==========================================

// Schéma de validation pour les modules
const moduleSchema = z.object({
  courseId: z.string().min(1, 'ID du cours requis'),
  title: z.string().trim().min(1, 'Titre requis'),
  description: z.string().optional(),
  order: z.coerce.number().min(0, 'L\'ordre doit être positif'),
  isPublished: z.boolean().default(false)
});

// POST /api/admin/modules - Créer un module
router.post('/modules', requireAdminAuth(), async (req, res) => {
  try {
    const moduleData = moduleSchema.parse(req.body);
    
    // Vérifier que le cours existe
    const [course] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, moduleData.courseId));
    
    if (!course) {
      return res.status(404).json({ error: 'Cours introuvable' });
    }
    
    const [newModule] = await db
      .insert(courseModules)
      .values(moduleData)
      .returning();
    
    res.status(201).json(newModule);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Erreur lors de la création du module:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// PUT /api/admin/modules/:id - Mettre à jour un module
router.put('/modules/:id', requireAdminAuth(), async (req, res) => {
  try {
    const { id } = req.params;
    const moduleData = moduleSchema.omit({ courseId: true }).parse(req.body);
    
    const [updatedModule] = await db
      .update(courseModules)
      .set(moduleData)
      .where(eq(courseModules.id, id))
      .returning();
    
    if (!updatedModule) {
      return res.status(404).json({ error: 'Module introuvable' });
    }
    
    res.json(updatedModule);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Erreur lors de la mise à jour du module:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// DELETE /api/admin/modules/:id - Supprimer un module
router.delete('/modules/:id', requireAdminAuth(), async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.delete(courseModules).where(eq(courseModules.id, id));
    
    res.json({ message: 'Module supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du module:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// ==========================================
// GESTION DES LEÇONS
// ==========================================

// Schéma de validation pour les leçons
const lessonSchema = z.object({
  moduleId: z.string().min(1, 'ID du module requis'),
  title: z.string().trim().min(1, 'Titre requis'),
  content: z.string().trim().min(1, 'Contenu requis'),
  videoUrl: z.string().url().optional().or(z.literal('')),
  duration: z.coerce.number().min(0, 'La durée doit être positive').optional(),
  order: z.coerce.number().min(0, 'L\'ordre doit être positif'),
  isPublished: z.boolean().default(false),
  isFree: z.boolean().default(false)
});

// POST /api/admin/lessons - Créer une leçon
router.post('/lessons', requireAdminAuth(), async (req, res) => {
  try {
    const lessonData = lessonSchema.parse(req.body);
    
    // Vérifier que le module existe
    const [module] = await db
      .select()
      .from(courseModules)
      .where(eq(courseModules.id, lessonData.moduleId));
    
    if (!module) {
      return res.status(404).json({ error: 'Module introuvable' });
    }
    
    const [newLesson] = await db
      .insert(courseLessons)
      .values(lessonData)
      .returning();
    
    res.status(201).json(newLesson);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Erreur lors de la création de la leçon:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// PUT /api/admin/lessons/:id - Mettre à jour une leçon
router.put('/lessons/:id', requireAdminAuth(), async (req, res) => {
  try {
    const { id } = req.params;
    const lessonData = lessonSchema.omit({ moduleId: true }).parse(req.body);
    
    const [updatedLesson] = await db
      .update(courseLessons)
      .set(lessonData)
      .where(eq(courseLessons.id, id))
      .returning();
    
    if (!updatedLesson) {
      return res.status(404).json({ error: 'Leçon introuvable' });
    }
    
    res.json(updatedLesson);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Erreur lors de la mise à jour de la leçon:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// DELETE /api/admin/lessons/:id - Supprimer une leçon
router.delete('/lessons/:id', requireAdminAuth(), async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.delete(courseLessons).where(eq(courseLessons.id, id));
    
    res.json({ message: 'Leçon supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la leçon:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

export default router;