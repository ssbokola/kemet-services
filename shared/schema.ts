import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, index, jsonb, uniqueIndex } from "drizzle-orm/pg-core";
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
  firstName: varchar("firstname"), // Note: column name is "firstname"
  lastName: varchar("lastname"),   // Note: column name is "lastname"
  profileImageUrl: varchar("profileimageurl"),
  role: text("role").notNull().default('participant'), // participant, admin
  createdAt: timestamp("createdat").defaultNow(),
  updatedAt: timestamp("updatedat").defaultNow(),
  // Local auth fields (new columns to be added)
  authType: text("auth_type").notNull().default('replit'), // 'replit', 'local'
  status: text("status").notNull().default('active'), // 'active', 'inactive', 'suspended'
  isTemporaryPassword: boolean("is_temporary_password").default(false),
  lastLoginAt: timestamp("last_login_at"),
  passwordResetAt: timestamp("password_reset_at"),
  // Token de configuration de mot de passe
  passwordResetToken: text("password_reset_token"),
  passwordResetTokenExpiry: timestamp("password_reset_token_expiry"),
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
  categories: text("categories").array().notNull(), // 'quality', 'finance', 'stock', 'hr', 'auxiliaires', 'pharmaciens', 'client'
  
  // Delivery mode configuration
  deliveryMode: text("deliverymode").notNull().default('onsite'), // 'onsite', 'online', 'hybrid'
  isSessionBased: boolean("issessionbased").notNull().default(true), // true = présentiel avec sessions, false = en ligne
  
  // Default values (can be overridden per session)
  defaultDuration: integer("defaultduration").notNull(), // en heures (6h par défaut)
  defaultPrice: integer("defaultprice").notNull(), // en FCFA
  defaultLocation: text("defaultlocation"), // Lieu par défaut (ex: "Yopougon CHU")
  
  // Legacy fields (kept for backwards compatibility with online courses)
  duration: integer("duration"), // en minutes (pour cours en ligne)
  price: integer("price"), // en FCFA (XOF), pour cours en ligne. NB : la colonne s'appelle "price" par historique, mais le montant est bien en FCFA unitaires, pas en centimes.
  
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
    categories: z.array(z.enum(['quality', 'finance', 'stock', 'hr', 'auxiliaires', 'pharmaciens', 'client'])).min(1, 'Au moins une catégorie est requise'),
    deliveryMode: z.enum(['onsite', 'online', 'hybrid']).default('onsite'),
    isSessionBased: z.boolean().default(true),
    defaultDuration: z.coerce.number().min(1, 'La durée doit être d\'au moins 1 heure'),
    defaultPrice: z.coerce.number().min(0, 'Le prix ne peut pas être négatif'),
    defaultLocation: z.string().trim().optional(),
    duration: z.coerce.number().min(15, 'La durée doit être d\'au moins 15 minutes').optional(),
    price: z.coerce.number().min(0, 'Le prix ne peut pas être négatif').optional(),
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

export const insertModuleSchema = createInsertSchema(courseModules)
  .omit({ id: true, createdAt: true })
  .extend({
    title: z.string().trim().min(3, 'Le titre doit contenir au moins 3 caractères'),
    order: z.coerce.number().min(0),
  });

export type InsertModule = z.infer<typeof insertModuleSchema>;
export type Module = typeof courseModules.$inferSelect;

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

export const insertLessonSchema = createInsertSchema(courseLessons)
  .omit({ id: true, createdAt: true })
  .extend({
    title: z.string().trim().min(3, 'Le titre doit contenir au moins 3 caractères'),
    content: z.string().trim().min(10, 'Le contenu doit contenir au moins 10 caractères'),
    order: z.coerce.number().min(0),
    duration: z.coerce.number().min(1).optional().nullable(),
  });

export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type Lesson = typeof courseLessons.$inferSelect;

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
  lastProgressEmailSentAt: timestamp("lastprogressemailsentat"), // Pour tracker les emails hebdomadaires
  progressEmailsCount: integer("progressemailscount").notNull().default(0), // Nombre d'emails envoyés
}, (table) => [
  // Contrainte d'unicité : empêche qu'un utilisateur soit inscrit 2x à la même formation
  // (protection contre les doubles enrollments lors des retries webhook)
  uniqueIndex("enrollments_user_course_unique").on(table.userId, table.courseId),
]);

export const insertEnrollmentSchema = createInsertSchema(enrollments)
  .omit({ id: true, enrolledAt: true });

export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;
export type Enrollment = typeof enrollments.$inferSelect;

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

// Table des demandes de démo Kemet Echo
export const kemetEchoRequests = pgTable("kemet_echo_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  pharmacyName: text("pharmacy_name").notNull(),
  offerType: text("offer_type").notNull(), // 'freemium', 'premium', 'pack'
  message: text("message"),
  dataConsent: boolean("data_consent").notNull().default(false),
  status: text("status").notNull().default('nouveau'), // 'nouveau', 'contacte', 'demo-envoyee', 'converti', 'ferme'
  assignedTo: varchar("assigned_to"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertKemetEchoRequestSchema = createInsertSchema(kemetEchoRequests)
  .omit({ id: true, createdAt: true, updatedAt: true, status: true, assignedTo: true, notes: true })
  .extend({
    name: z.string().trim().min(2, 'Le nom doit contenir au moins 2 caractères'),
    email: z.string().trim().email('Adresse email invalide'),
    phone: z.string().trim().min(8, 'Numéro de téléphone invalide'),
    pharmacyName: z.string().trim().min(2, 'Le nom de la pharmacie doit contenir au moins 2 caractères'),
    offerType: z.enum(['freemium', 'premium', 'pack'], {
      errorMap: () => ({ message: 'Veuillez sélectionner un type d\'offre' })
    }),
    message: z.string().trim().optional(),
    dataConsent: z.boolean().refine(val => val === true, 
      'Vous devez accepter le traitement de vos données personnelles'
    ),
  });

export type InsertKemetEchoRequest = z.infer<typeof insertKemetEchoRequestSchema>;
export type KemetEchoRequest = typeof kemetEchoRequests.$inferSelect;

// Table des téléchargements de guides (Lead Magnets)
export const leadMagnetDownloads = pgTable("lead_magnet_downloads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  pharmacyName: text("pharmacy_name"),
  resourceType: text("resource_type").notNull(), // 'checklist-gestion', 'guide-stocks', etc.
  resourceTitle: text("resource_title").notNull(),
  dataConsent: boolean("data_consent").notNull().default(false),
  marketingConsent: boolean("marketing_consent").notNull().default(false),
  downloadedAt: timestamp("downloaded_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLeadMagnetDownloadSchema = createInsertSchema(leadMagnetDownloads)
  .omit({ id: true, createdAt: true, downloadedAt: true })
  .extend({
    name: z.string().trim().min(2, 'Le nom doit contenir au moins 2 caractères'),
    email: z.string().trim().email('Adresse email invalide'),
    phone: z.string().trim().optional(),
    pharmacyName: z.string().trim().optional(),
    resourceType: z.string().trim().min(1),
    resourceTitle: z.string().trim().min(1),
    dataConsent: z.boolean().refine(val => val === true, 
      'Vous devez accepter le traitement de vos données personnelles pour télécharger cette ressource'
    ),
    marketingConsent: z.boolean().default(false),
  });

export type InsertLeadMagnetDownload = z.infer<typeof insertLeadMagnetDownloadSchema>;
export type LeadMagnetDownload = typeof leadMagnetDownloads.$inferSelect;

// ============================================
// E-LEARNING PLATFORM - EXTENDED SCHEMA
// ============================================

// Quizzes - Can be attached to lessons or courses (final quiz)
export const quizzes = pgTable("quizzes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  lessonId: varchar("lessonid").references(() => courseLessons.id, { onDelete: 'cascade' }),
  courseId: varchar("courseid").references(() => courses.id, { onDelete: 'cascade' }), // For final quiz
  title: text("title").notNull(),
  description: text("description"),
  passingScore: integer("passingscore").notNull().default(70), // Percentage required to pass
  timeLimit: integer("timelimit"), // Time limit in minutes (null = no limit)
  maxAttempts: integer("maxattempts"), // Max attempts allowed (null = unlimited)
  isFinalQuiz: boolean("isfinalquiz").notNull().default(false), // Is this the course final quiz?
  order: integer("order").notNull().default(0),
  isPublished: boolean("ispublished").notNull().default(false),
  createdAt: timestamp("createdat").defaultNow().notNull(),
});

export const insertQuizSchema = createInsertSchema(quizzes)
  .omit({ id: true, createdAt: true })
  .extend({
    title: z.string().trim().min(3, 'Le titre doit contenir au moins 3 caractères'),
    passingScore: z.coerce.number().min(0).max(100),
    timeLimit: z.coerce.number().min(1).optional().nullable(),
    maxAttempts: z.coerce.number().min(1).optional().nullable(),
  });

export type InsertQuiz = z.infer<typeof insertQuizSchema>;
export type Quiz = typeof quizzes.$inferSelect;

// Quiz Questions
export const quizQuestions = pgTable("quiz_questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  quizId: varchar("quizid").notNull().references(() => quizzes.id, { onDelete: 'cascade' }),
  questionText: text("questiontext").notNull(),
  questionType: text("questiontype").notNull().default('multiple_choice'), // 'multiple_choice', 'true_false', 'short_answer'
  options: text("options").array(), // JSON array of options for multiple choice
  correctAnswer: text("correctanswer").notNull(), // Index for multiple choice, 'true'/'false', or text answer
  explanation: text("explanation"), // Optional explanation shown after answer
  points: integer("points").notNull().default(1),
  order: integer("order").notNull(),
  createdAt: timestamp("createdat").defaultNow().notNull(),
});

export const insertQuizQuestionSchema = createInsertSchema(quizQuestions)
  .omit({ id: true, createdAt: true })
  .extend({
    questionText: z.string().trim().min(5, 'La question doit contenir au moins 5 caractères'),
    questionType: z.enum(['multiple_choice', 'true_false', 'short_answer']),
    points: z.coerce.number().min(1),
    order: z.coerce.number().min(0),
  });

export type InsertQuizQuestion = z.infer<typeof insertQuizQuestionSchema>;
export type QuizQuestion = typeof quizQuestions.$inferSelect;

// Quiz Results/Attempts
export const quizResults = pgTable("quiz_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("userid").notNull().references(() => users.id, { onDelete: 'cascade' }),
  quizId: varchar("quizid").notNull().references(() => quizzes.id, { onDelete: 'cascade' }),
  score: integer("score").notNull(), // Percentage score
  totalPoints: integer("totalpoints").notNull(),
  earnedPoints: integer("earnedpoints").notNull(),
  answers: jsonb("answers").notNull(), // JSON object with question_id: user_answer pairs
  passed: boolean("passed").notNull(),
  attemptNumber: integer("attemptnumber").notNull().default(1),
  timeSpent: integer("timespent"), // Time spent in seconds
  startedAt: timestamp("startedat").notNull(),
  completedAt: timestamp("completedat").notNull(),
});

export const insertQuizResultSchema = createInsertSchema(quizResults)
  .omit({ id: true });

export type InsertQuizResult = z.infer<typeof insertQuizResultSchema>;
export type QuizResult = typeof quizResults.$inferSelect;

// Course Resources (downloadable files, PDFs, checklists)
export const courseResources = pgTable("course_resources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("courseid").notNull().references(() => courses.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(), // 'pdf', 'checklist', 'template', 'link', 'other'
  url: text("url").notNull(), // URL to the resource
  fileSize: integer("filesize"), // File size in bytes
  order: integer("order").notNull().default(0),
  isPublished: boolean("ispublished").notNull().default(false),
  createdAt: timestamp("createdat").defaultNow().notNull(),
});

export const insertCourseResourceSchema = createInsertSchema(courseResources)
  .omit({ id: true, createdAt: true })
  .extend({
    title: z.string().trim().min(3, 'Le titre doit contenir au moins 3 caractères'),
    type: z.enum(['pdf', 'checklist', 'template', 'link', 'other']),
    url: z.string().url('URL invalide'),
  });

export type InsertCourseResource = z.infer<typeof insertCourseResourceSchema>;
export type CourseResource = typeof courseResources.$inferSelect;

// Training Sessions (for onsite/in-person training)
export const trainingSessions = pgTable("training_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("courseid").notNull().references(() => courses.id, { onDelete: 'cascade' }),
  sessionCode: text("sessioncode").notNull().unique(), // ex: "AUX-01-2025-01"
  title: text("title").notNull(), // Peut être différent du titre du cours
  description: text("description"),
  
  // Scheduling
  startDate: timestamp("startdate").notNull(),
  endDate: timestamp("enddate").notNull(),
  registrationDeadline: timestamp("registrationdeadline").notNull(),
  
  // Location
  venue: text("venue").notNull(), // ex: "Salle de formation Kemet Services"
  address: text("address").notNull(), // ex: "Yopougon CHU, Abidjan"
  city: text("city").notNull().default('Abidjan'),
  
  // Capacity
  maxCapacity: integer("maxcapacity").notNull(),
  currentRegistrations: integer("currentregistrations").notNull().default(0),
  
  // Pricing
  pricePerPerson: integer("priceperperson").notNull(), // Prix en FCFA
  
  // Status
  status: text("status").notNull().default('draft'), // 'draft', 'published', 'open', 'full', 'cancelled', 'completed'
  
  // Optional metadata
  isOnlineLink: text("isonlinelink"), // URL Zoom/Meet si hybride
  waveProductId: text("waveproductid"), // ID produit Wave si configuré
  metadata: jsonb("metadata"), // Données additionnelles
  
  createdAt: timestamp("createdat").defaultNow().notNull(),
  updatedAt: timestamp("updatedat").defaultNow().notNull(),
});

export const insertTrainingSessionSchema = createInsertSchema(trainingSessions)
  .omit({ id: true, createdAt: true, updatedAt: true, currentRegistrations: true })
  .extend({
    sessionCode: z.string().trim().min(3, 'Le code de session doit contenir au moins 3 caractères'),
    title: z.string().trim().min(5, 'Le titre doit contenir au moins 5 caractères'),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    registrationDeadline: z.coerce.date(),
    venue: z.string().trim().min(3, 'Le lieu doit contenir au moins 3 caractères'),
    address: z.string().trim().min(5, 'L\'adresse doit contenir au moins 5 caractères'),
    maxCapacity: z.coerce.number().min(1, 'La capacité doit être d\'au moins 1 personne'),
    pricePerPerson: z.coerce.number().min(0, 'Le prix ne peut pas être négatif'),
    status: z.enum(['draft', 'published', 'open', 'full', 'cancelled', 'completed']).default('draft'),
  });

export type InsertTrainingSession = z.infer<typeof insertTrainingSessionSchema>;
export type TrainingSession = typeof trainingSessions.$inferSelect;

// Session Registrations (for onsite training)
export const sessionRegistrations = pgTable("session_registrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("sessionid").notNull().references(() => trainingSessions.id, { onDelete: 'cascade' }),
  userId: varchar("userid").references(() => users.id, { onDelete: 'set null' }), // Optional - peut être null pour participants externes
  
  // Participant info (always stored, even if userId exists)
  participantName: text("participantname").notNull(),
  participantEmail: text("participantemail").notNull(),
  participantPhone: text("participantphone").notNull(),
  participantRole: text("participantrole").notNull(), // 'pharmacien-titulaire', 'auxiliaire', etc.
  organization: text("organization").notNull(), // Nom de l'officine/organisation
  
  // Payment tracking
  orderId: varchar("orderid").references(() => orders.id, { onDelete: 'set null' }),
  paymentStatus: text("paymentstatus").notNull().default('pending'), // 'pending', 'completed', 'failed', 'refunded'
  amountPaid: integer("amountpaid").notNull(),
  
  // Attendance tracking
  attended: boolean("attended").default(false),
  attendanceMarkedAt: timestamp("attendancemarkedat"),
  
  // Cancellation
  isCancelled: boolean("iscancelled").notNull().default(false),
  cancellationReason: text("cancellationreason"),
  cancelledAt: timestamp("cancelledat"),
  
  // Notes
  notes: text("notes"),
  
  createdAt: timestamp("createdat").defaultNow().notNull(),
  updatedAt: timestamp("updatedat").defaultNow().notNull(),
});

export const insertSessionRegistrationSchema = createInsertSchema(sessionRegistrations)
  .omit({ id: true, createdAt: true, updatedAt: true, attended: true, attendanceMarkedAt: true, isCancelled: true, cancelledAt: true })
  .extend({
    participantName: z.string().trim().min(2, 'Le nom doit contenir au moins 2 caractères'),
    participantEmail: z.string().trim().email('Adresse email invalide'),
    participantPhone: z.string().trim().min(8, 'Numéro de téléphone invalide'),
    participantRole: z.string().trim().min(2, 'Le rôle est requis'),
    organization: z.string().trim().min(2, 'L\'organisation est requise'),
    amountPaid: z.coerce.number().min(0, 'Le montant ne peut pas être négatif'),
  });

export type InsertSessionRegistration = z.infer<typeof insertSessionRegistrationSchema>;
export type SessionRegistration = typeof sessionRegistrations.$inferSelect;

// Orders/Payments (Wave Mobile Money) - Extended for both online courses and onsite sessions
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("userid").references(() => users.id, { onDelete: 'cascade' }),
  
  // Order type and reference
  orderType: text("ordertype").notNull(), // 'online_course', 'onsite_session'
  courseId: varchar("courseid").references(() => courses.id, { onDelete: 'set null' }), // For online courses (nullable)
  sessionId: varchar("sessionid").references(() => trainingSessions.id, { onDelete: 'set null' }), // For onsite sessions (nullable)
  referenceId: text("referenceid").notNull(), // Stores either courseId or sessionId for quick lookup
  
  amount: integer("amount").notNull(), // Amount in FCFA
  currency: text("currency").notNull().default('XOF'), // FCFA
  status: text("status").notNull().default('pending'), // 'pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'
  paymentMethod: text("paymentmethod").notNull().default('wave'), // 'wave'
  waveTransactionId: text("wavetransactionid"), // Wave transaction reference
  waveCheckoutId: text("wavecheckoutid"), // Wave checkout session ID
  wavePaymentUrl: text("wavepaymenturl"), // Wave payment URL for redirect
  failureReason: text("failurereason"), // Reason for failure
  notes: text("notes"), // Additional notes
  metadata: jsonb("metadata"), // Additional metadata
  paidAt: timestamp("paidat"),
  createdAt: timestamp("createdat").defaultNow().notNull(),
  updatedAt: timestamp("updatedat").defaultNow().notNull(),
});

export const insertOrderSchema = createInsertSchema(orders)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    orderType: z.enum(['online_course', 'onsite_session', 'bootcamp']),
    referenceId: z.string().trim().min(1, 'L\'ID de référence est requis'),
    amount: z.coerce.number().min(1, 'Le montant doit être supérieur à 0'),
    currency: z.string().default('XOF'),
    paymentMethod: z.enum(['wave']).default('wave'),
  });

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

// Bootcamp Registrations (for special events like Bootcamp Stock+)
export const bootcampRegistrations = pgTable("bootcamp_registrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Bootcamp identifier
  bootcampName: text("bootcampname").notNull(), // 'bootcamp-stock-nov-2025'
  
  // Participant info
  fullName: text("fullname").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  organization: text("organization").notNull(), // Nom de l'officine
  
  // Pricing tier selected
  pricingTier: text("pricingtier").notNull(), // 'classic', 'smart_pay', 'team_pack', 'max_boost'
  numberOfParticipants: integer("numberofparticipants").notNull().default(1), // For team_pack and max_boost
  sessionsCount: integer("sessionscount").notNull().default(4), // Number of sessions (1-4) - only for Classic tier
  totalAmount: integer("totalamount").notNull(), // Prix total en FCFA
  
  // Payment tracking
  orderId: varchar("orderid").references(() => orders.id, { onDelete: 'set null' }),
  paymentStatus: text("paymentstatus").notNull().default('pending'), // 'pending', 'completed', 'failed', 'refunded'
  
  // Attendance tracking per session
  attendedSession1: boolean("attendedsession1").default(false), // AUX-04 - 22 nov
  attendedSession2: boolean("attendedsession2").default(false), // AUX-10 - 29 nov
  attendedSession3: boolean("attendedsession3").default(false), // AUX-05 - 06 dec
  attendedSession4: boolean("attendedsession4").default(false), // AUX-11 & AUX-12 - 13 dec
  
  // Cancellation
  isCancelled: boolean("iscancelled").notNull().default(false),
  cancellationReason: text("cancellationreason"),
  cancelledAt: timestamp("cancelledat"),
  
  // Notes
  notes: text("notes"),
  
  createdAt: timestamp("createdat").defaultNow().notNull(),
  updatedAt: timestamp("updatedat").defaultNow().notNull(),
});

export const insertBootcampRegistrationSchema = createInsertSchema(bootcampRegistrations)
  .omit({ 
    id: true, 
    createdAt: true, 
    updatedAt: true, 
    attendedSession1: true, 
    attendedSession2: true, 
    attendedSession3: true, 
    attendedSession4: true, 
    isCancelled: true, 
    cancelledAt: true,
    orderId: true, // Server-assigned
    paymentStatus: true, // Server-assigned
    notes: true, // Optional, not in form
    cancellationReason: true // Not in registration form
  })
  .extend({
    bootcampName: z.string().trim().min(3, 'Le nom du bootcamp est requis'),
    fullName: z.string().trim().min(2, 'Le nom doit contenir au moins 2 caractères'),
    email: z.string().trim().email('Adresse email invalide'),
    phone: z.string().trim().min(8, 'Numéro de téléphone invalide'),
    organization: z.string().trim().min(2, 'L\'organisation est requise'),
    pricingTier: z.enum(['classic', 'smart_pay', 'team_pack', 'max_boost']),
    numberOfParticipants: z.coerce.number().min(1, 'Au moins 1 participant requis').max(10, 'Maximum 10 participants'),
    sessionsCount: z.coerce.number().min(1, 'Au moins 1 session requise').max(4, 'Maximum 4 sessions'),
    totalAmount: z.coerce.number().min(0, 'Le montant ne peut pas être négatif'),
  });

export type InsertBootcampRegistration = z.infer<typeof insertBootcampRegistrationSchema>;
export type BootcampRegistration = typeof bootcampRegistrations.$inferSelect;

// Certificates/Attestations
export const certificates = pgTable("certificates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("userid").notNull().references(() => users.id, { onDelete: 'cascade' }),
  courseId: varchar("courseid").notNull().references(() => courses.id, { onDelete: 'cascade' }),
  certificateNumber: text("certificatenumber").notNull().unique(), // Unique certificate number
  finalScore: integer("finalscore").notNull(), // Final quiz score percentage
  completedAt: timestamp("completedat").notNull(),
  pdfUrl: text("pdfurl"), // URL to generated PDF
  verificationCode: text("verificationcode").notNull().unique(), // QR code verification
  issuedAt: timestamp("issuedat").defaultNow().notNull(),
});

export const insertCertificateSchema = createInsertSchema(certificates)
  .omit({ id: true, issuedAt: true });

export type InsertCertificate = z.infer<typeof insertCertificateSchema>;
export type Certificate = typeof certificates.$inferSelect;

// ----------------------------------------------------------------------
// Final quiz (quiz de certification) — generated by Claude from a PDF
// of the course material. One pool of 30 questions per course; each
// student attempt draws 10 randomly-selected questions with shuffled
// A/B/C/D options. Pass threshold: 8/10.
// ----------------------------------------------------------------------

/** Shape of a single AI-generated question stored in JSONB (both in the pool and in attempts). */
export type FinalQuizQuestion = {
  question: string;
  options: string[]; // ["A) ...", "B) ...", "C) ...", "D) ..."]
  answer: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
};

/** Shape of a single answer snapshot stored in attempt JSONB. */
export type FinalQuizAnswerSnapshot = {
  questionIndex: number; // 0-9 within the 10 drawn
  userAnswer: 'A' | 'B' | 'C' | 'D' | null;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  isCorrect: boolean;
};

// One pool of 30 AI-generated questions per course.
export const finalQuizzes = pgTable("final_quizzes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("courseid").notNull().references(() => courses.id, { onDelete: 'cascade' }),
  // Full pool of questions (default target: 30). Stored as FinalQuizQuestion[].
  questions: jsonb("questions").notNull().$type<FinalQuizQuestion[]>(),
  questionsCount: integer("questionscount").notNull(), // denormalized for fast display
  sourcePdfName: text("sourcepdfname"), // original PDF filename for traceability
  sourcePdfSizeBytes: integer("sourcepdfsizebytes"),
  aiModel: text("aimodel").notNull().default('claude-sonnet-4-20250514'),
  generatedAt: timestamp("generatedat").defaultNow().notNull(),
  updatedAt: timestamp("updatedat").defaultNow().notNull(),
}, (table) => [
  // One pool per course (regeneration overwrites)
  uniqueIndex("final_quizzes_course_unique").on(table.courseId),
]);

export type FinalQuiz = typeof finalQuizzes.$inferSelect;
export type InsertFinalQuiz = typeof finalQuizzes.$inferInsert;

// Each attempt by a user. Pass = score >= PASS_THRESHOLD (8).
// Cooldown of 1 hour between the *start* of consecutive attempts is enforced
// in the route handler (not as a DB constraint, for flexibility).
export const finalQuizAttempts = pgTable("final_quiz_attempts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("userid").notNull().references(() => users.id, { onDelete: 'cascade' }),
  courseId: varchar("courseid").notNull().references(() => courses.id, { onDelete: 'cascade' }),
  finalQuizId: varchar("finalquizid").notNull().references(() => finalQuizzes.id, { onDelete: 'cascade' }),
  // The 10 questions actually shown (already shuffled + options shuffled).
  questionsSnapshot: jsonb("questionssnapshot").notNull().$type<FinalQuizQuestion[]>(),
  // Answers from user + correction (populated at submit time).
  answersSnapshot: jsonb("answerssnapshot").$type<FinalQuizAnswerSnapshot[]>(),
  score: integer("score"), // 0-10, null while in progress
  total: integer("total").notNull().default(10),
  passed: boolean("passed"), // null while in progress
  startedAt: timestamp("startedat").defaultNow().notNull(),
  submittedAt: timestamp("submittedat"),
}, (table) => [
  index("final_quiz_attempts_user_course_idx").on(table.userId, table.courseId),
]);

export type FinalQuizAttempt = typeof finalQuizAttempts.$inferSelect;
export type InsertFinalQuizAttempt = typeof finalQuizAttempts.$inferInsert;

/** Pass threshold: 8 correct answers out of 10 (80%). */
export const FINAL_QUIZ_PASS_THRESHOLD = 8;
/** Number of questions drawn per attempt from the pool. */
export const FINAL_QUIZ_QUESTIONS_PER_ATTEMPT = 10;
/** Target number of questions in the pool generated by the AI. */
export const FINAL_QUIZ_POOL_SIZE = 30;
/** Cooldown between attempts (ms). 1 hour. */
export const FINAL_QUIZ_COOLDOWN_MS = 60 * 60 * 1000;
