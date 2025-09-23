import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, index, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Table des administrateurs
export const admins = pgTable("admins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(), // Sera hashé côté serveur
  role: text("role").notNull().default('admin'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAdminSchema = createInsertSchema(admins)
  .omit({ id: true, createdAt: true })
  .extend({
    username: z.string().trim().min(3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères'),
    password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
    role: z.enum(['admin', 'manager']).default('admin'),
  });

export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type Admin = typeof admins.$inferSelect;

// Sessions admin pour l'authentification
export const adminSessions = pgTable("admin_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adminId: varchar("admin_id").notNull().references(() => admins.id, { onDelete: 'cascade' }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AdminSession = typeof adminSessions.$inferSelect;

// Session storage table - Required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - Extended for Replit Auth compatibility
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  // Existing fields (legacy)
  username: text("username").unique(),
  password: text("password"),
  // Replit Auth fields (existing column names)
  email: varchar("email").unique(),
  firstName: varchar("firstname"),
  lastName: varchar("lastname"),
  profileImageUrl: varchar("profileimageurl"),
  role: text("role").notNull().default('participant'), // participant, admin
  createdAt: timestamp("createdat").defaultNow(),
  updatedAt: timestamp("updatedat").defaultNow(),
  // Local auth fields (new)
  authType: text("auth_type").notNull().default('replit'), // 'replit', 'local'
  status: text("status").notNull().default('active'), // 'active', 'inactive', 'suspended'
  isTemporaryPassword: boolean("is_temporary_password").default(false),
  lastLoginAt: timestamp("last_login_at"),
  passwordResetAt: timestamp("password_reset_at"),
});

// Schema pour la création d'utilisateurs locaux
export const insertLocalUserSchema = createInsertSchema(users)
  .omit({ id: true, createdAt: true, updatedAt: true, lastLoginAt: true, passwordResetAt: true })
  .extend({
    email: z.string().trim().email('Adresse email invalide'),
    firstName: z.string().trim().min(2, 'Le prénom doit contenir au moins 2 caractères'),
    lastName: z.string().trim().min(2, 'Le nom doit contenir au moins 2 caractères'),
    password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
    authType: z.enum(['replit', 'local']).default('local'),
    status: z.enum(['active', 'inactive', 'suspended']).default('active'),
    role: z.enum(['participant', 'admin']).default('participant'),
    isTemporaryPassword: z.boolean().default(true),
  });

// Schema pour la connexion locale
export const localLoginSchema = z.object({
  email: z.string().trim().email('Adresse email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
});

// Schema pour le changement de mot de passe
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Le mot de passe actuel est requis'),
  newPassword: z.string().min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères'),
  confirmPassword: z.string().min(1, 'La confirmation du mot de passe est requise'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

export type InsertLocalUser = z.infer<typeof insertLocalUserSchema>;
export type LocalLogin = z.infer<typeof localLoginSchema>;
export type ChangePassword = z.infer<typeof changePasswordSchema>;
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Formation course catalog
export const courses = pgTable("courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  category: text("category").notNull(), // 'quality', 'finance', 'stock', 'hr', 'auxiliaires'
  level: text("level").notNull(), // 'debutant', 'intermediaire', 'avance'
  duration: integer("duration").notNull(), // en minutes
  price: integer("price").notNull(), // en centimes
  isPublished: boolean("ispublished").notNull().default(false),
  thumbnail: text("thumbnail"),
  objectives: text("objectives").array(),
  prerequisites: text("prerequisites").array(),
  targetAudience: text("targetaudience").array(),
  createdAt: timestamp("createdat").defaultNow().notNull(),
  updatedAt: timestamp("updatedat").defaultNow().notNull(),
});

export const insertCourseSchema = createInsertSchema(courses)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    title: z.string().trim().min(5, 'Le titre doit contenir au moins 5 caractères'),
    slug: z.string().trim().min(3, 'Le slug doit contenir au moins 3 caractères'),
    description: z.string().trim().min(20, 'La description doit contenir au moins 20 caractères'),
    category: z.enum(['quality', 'finance', 'stock', 'hr', 'auxiliaires']),
    level: z.enum(['debutant', 'intermediaire', 'avance']),
    duration: z.coerce.number().min(15, 'La durée doit être d\'au moins 15 minutes'),
    price: z.coerce.number().min(0, 'Le prix ne peut pas être négatif'),
    objectives: z.string().array().optional(),
    prerequisites: z.string().array().optional(),
    targetAudience: z.string().array().optional(),
  });

export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof courses.$inferSelect;

// Course modules and lessons
export const courseModules = pgTable("course_modules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("courseid").notNull().references(() => courses.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  description: text("description"),
  order: integer("order").notNull(),
  isPublished: boolean("ispublished").notNull().default(false),
  createdAt: timestamp("createdat").defaultNow().notNull(),
});

export const courseLessons = pgTable("course_lessons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  moduleId: varchar("moduleid").notNull().references(() => courseModules.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  content: text("content").notNull(), // Markdown content
  videoUrl: text("videourl"),
  duration: integer("duration"), // en minutes
  order: integer("order").notNull(),
  isPublished: boolean("ispublished").notNull().default(false),
  isFree: boolean("isfree").notNull().default(false), // Lesson accessible sans inscription
  createdAt: timestamp("createdat").defaultNow().notNull(),
});

// User enrollment and access management
export const enrollments = pgTable("enrollments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("userid").notNull().references(() => users.id, { onDelete: 'cascade' }),
  courseId: varchar("courseid").notNull().references(() => courses.id, { onDelete: 'cascade' }),
  status: text("status").notNull().default('active'), // 'active', 'suspended', 'completed', 'expired'
  enrolledAt: timestamp("enrolledat").defaultNow().notNull(),
  expiresAt: timestamp("expiresat"), // null = permanent access
  completedAt: timestamp("completedat"),
  progressPercent: integer("progresspercent").notNull().default(0),
});

// User lesson progress tracking
export const lessonProgress = pgTable("lesson_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("userid").notNull().references(() => users.id, { onDelete: 'cascade' }),
  lessonId: varchar("lessonid").notNull().references(() => courseLessons.id, { onDelete: 'cascade' }),
  status: text("status").notNull().default('not_started'), // 'not_started', 'in_progress', 'completed'
  timeSpent: integer("timespent").notNull().default(0), // en secondes
  completedAt: timestamp("completedat"),
  lastAccessedAt: timestamp("lastaccessedat").defaultNow().notNull(),
});

// Table des inscriptions aux formations
export const trainingRegistrations = pgTable("training_registrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  trainingId: text("training_id").notNull(),
  trainingTitle: text("training_title").notNull(),
  participantName: text("participant_name").notNull(),
  role: text("role").notNull(), // 'pharmacien-titulaire', 'pharmacien-adjoint', 'auxiliaire', 'etudiant', 'autre'
  officine: text("officine").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  experienceLevel: text("experience_level").notNull(), // 'debutant', 'intermediaire', 'avance'
  companySize: text("company_size").notNull(), // '1-5', '6-10', '11-20', '20+'
  participantsCount: integer("participants_count").notNull().default(1),
  sessionType: text("session_type").notNull(), // 'inter-entreprise', 'intra-entreprise', 'en-ligne'
  preferredDate: text("preferred_date"), // ISO date string, optionnel
  message: text("message"), // optionnel
  dataConsent: boolean("data_consent").notNull().default(false),
  marketingConsent: boolean("marketing_consent").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTrainingRegistrationSchema = createInsertSchema(trainingRegistrations)
  .omit({ id: true, createdAt: true })
  .extend({
    role: z.enum(['pharmacien-titulaire', 'pharmacien-adjoint', 'auxiliaire', 'etudiant', 'autre']),
    experienceLevel: z.enum(['debutant', 'intermediaire', 'avance']),
    companySize: z.enum(['1-5', '6-10', '11-20', '20+']),
    sessionType: z.enum(['inter-entreprise', 'intra-entreprise', 'en-ligne']),
    participantsCount: z.coerce.number().min(1).max(50),
    email: z.string().trim().email('Adresse email invalide'),
    phone: z.string().trim().min(8, 'Numéro de téléphone invalide'),
    participantName: z.string().trim().min(2, 'Le nom doit contenir au moins 2 caractères'),
    officine: z.string().trim().min(2, 'Le nom de l\'officine doit contenir au moins 2 caractères'),
    trainingId: z.string().trim().min(1, 'L\'ID de formation est requis'),
    trainingTitle: z.string().trim().min(1, 'Le titre de la formation est requis'),
    dataConsent: z.boolean().refine(val => val === true, 'Vous devez accepter le traitement de vos données personnelles'),
    preferredDate: z.string().optional(),
    message: z.string().optional(),
  });

export type InsertTrainingRegistration = z.infer<typeof insertTrainingRegistrationSchema>;
export type TrainingRegistration = typeof trainingRegistrations.$inferSelect;

// Table des demandes de contact et consulting
export const contactRequests = pgTable("contact_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // 'contact', 'consulting', 'diagnostic'
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  company: text("company"),
  subject: text("subject"),
  message: text("message").notNull(),
  consultingService: text("consulting_service"), // Pour les demandes de consulting
  status: text("status").notNull().default('nouveau'), // 'nouveau', 'en-cours', 'traite', 'ferme'
  priority: text("priority").notNull().default('normale'), // 'basse', 'normale', 'haute', 'urgente'
  assignedTo: varchar("assigned_to"), // ID de l'admin assigné
  notes: text("notes"), // Notes internes
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertContactRequestSchema = createInsertSchema(contactRequests)
  .omit({ id: true, createdAt: true, updatedAt: true, status: true, priority: true, assignedTo: true, notes: true })
  .extend({
    type: z.enum(['contact', 'consulting', 'diagnostic']),
    name: z.string().trim().min(2, 'Le nom doit contenir au moins 2 caractères'),
    email: z.string().trim().email('Adresse email invalide'),
    phone: z.string().trim().optional(),
    company: z.string().trim().optional(),
    subject: z.string().trim().optional(),
    message: z.string().trim().min(10, 'Le message doit contenir au moins 10 caractères'),
    consultingService: z.string().optional(),
  });

export type InsertContactRequest = z.infer<typeof insertContactRequestSchema>;
export type ContactRequest = typeof contactRequests.$inferSelect;
