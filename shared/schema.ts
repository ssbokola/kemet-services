import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
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

// Table des utilisateurs (conservée pour compatibilité)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

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
