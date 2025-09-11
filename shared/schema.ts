import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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
