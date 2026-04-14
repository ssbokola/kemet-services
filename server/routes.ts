import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "./db";
import { 
  insertTrainingRegistrationSchema, 
  trainingRegistrations,
  insertKemetEchoRequestSchema,
  kemetEchoRequests,
  insertLeadMagnetDownloadSchema,
  leadMagnetDownloads,
  insertContactRequestSchema,
  contactRequests
} from "@shared/schema";
import { z } from "zod";
// import { sendRegistrationNotification } from "./email"; // Unused - file logging active
import { logRegistrationNotification, logKemetEchoNotification } from "./notifications";
import { sendGmailNotification, sendParticipantConfirmation, sendKemetEchoNotification } from "./gmail";
import { sendTelegramNotification, formatRegistrationNotification } from "./telegram";
import adminRoutes from "./routes/admin";
import spfRoutes from "./routes/spf";
import dkimRoutes from "./routes/dkim";
import trainingRoutes from "./routes/training";
import participantRoutes from "./routes/participants";
import formationsRoutes from "./routes/formations";
import modulesRoutes from "./routes/modules";
import lessonsRoutes from "./routes/lessons";
import quizzesRoutes from "./routes/quizzes";
import paymentsRoutes from "./routes/payments";
import onsiteTrainingsRoutes from "./routes/onsite-trainings";
import sessionRegistrationsRoutes from "./routes/session-registrations";
import bootcampRegistrationsRoutes from "./routes/bootcamp-registrations";
import { serveDynamicSitemap, serveDynamicRobots } from "./dynamic-sitemap";
// Authentification Replit Auth - blueprint:javascript_log_in_with_replit
import { setupAuth, isAuthenticated } from "./replitAuth";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware - blueprint:javascript_log_in_with_replit
  await setupAuth(app);
  
  // SEO routes - Dynamic sitemap and robots.txt
  app.get('/sitemap.xml', serveDynamicSitemap);
  app.get('/robots.txt', serveDynamicRobots);
  
  // Auth routes - blueprint:javascript_log_in_with_replit
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const claims = req.user.claims;
      
      // Always construct user data from session claims with correct field names
      const userData = {
        id: claims.sub,
        email: claims.email || null,
        firstName: claims.first_name || null,
        lastName: claims.last_name || null,
        profileImageUrl: claims.profile_image_url || null,
        role: 'participant' as const
      };

      // Upsert user - creates if missing, updates if exists
      const user = await storage.upsertUser(userData);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  
  // Admin routes
  app.use('/api/admin', adminRoutes);
  
  // Participant management routes (admin protected)
  app.use('/api/admin/participants', participantRoutes);
  
  // SPF configuration routes
  app.use('/api/spf', spfRoutes);
  
  // DKIM configuration routes
  app.use('/api/dkim', dkimRoutes);
  
  // Training routes sécurisées - blueprint:javascript_log_in_with_replit
  app.use('/api/training', trainingRoutes);
  
  // Formations (online training) routes
  app.use('/api/formations', formationsRoutes);
  
  // E-learning platform routes
  app.use('/api/modules', modulesRoutes);
  app.use('/api/lessons', lessonsRoutes);
  app.use('/api/quizzes', quizzesRoutes);
  
  // Payment routes (Wave Mobile Money)
  app.use('/api/payments', paymentsRoutes);
  
  // Onsite trainings (public routes for in-person training catalog)
  app.use('/api/onsite-trainings', onsiteTrainingsRoutes);
  
  // Session registrations (public routes for in-person training registration)
  app.use('/api/session-registrations', sessionRegistrationsRoutes);
  
  // Bootcamp registrations (public routes for bootcamp events)
  app.use('/api/bootcamp-registrations', bootcampRegistrationsRoutes);
  
  // Training registration endpoint
  app.post('/api/training-registrations', async (req, res) => {
    try {
      // Validate request body using Zod schema
      const validatedData = insertTrainingRegistrationSchema.parse(req.body);
      
      // Create training registration in database
      const registrationResult = await db.insert(trainingRegistrations).values(validatedData).returning();
      const registration = registrationResult[0];
      
      // Send notifications (asynchronously, don't block response)
      Promise.allSettled([
        // 1. Send admin notification (Gmail first, fallback to file logging)
        (async () => {
          try {
            const gmailSuccess = await sendGmailNotification(registration);
            if (gmailSuccess) {
              console.log('✅ Notification Gmail envoyée avec succès');
            } else {
              console.log('📧 Gmail non configuré - utilisation des fichiers de log');
              const fileSuccess = logRegistrationNotification(registration);
              if (fileSuccess) {
                console.log('✅ Notification enregistrée dans les fichiers de log');
              }
            }
          } catch (error) {
            console.error('❌ Erreur notification Gmail:', error);
            console.log('📁 Utilisation du système de fichiers en secours');
            try {
              logRegistrationNotification(registration);
            } catch (fileError) {
              console.error('❌ Erreur système de fichiers:', fileError);
            }
          }
        })(),

        // 2. Send participant confirmation email (independent execution)
        (async () => {
          console.log(`▶️ Sending participant confirmation to ${registration.email}`);
          try {
            const confirmationSuccess = await sendParticipantConfirmation(registration);
            if (confirmationSuccess) {
              console.log('✅ Email de confirmation participant envoyé avec succès');
            } else {
              console.log('📧 Confirmation participant non envoyée (Gmail non configuré)');
            }
          } catch (error) {
            console.error('❌ Erreur lors de l\'envoi de la confirmation participant:', error);
          }
        })(),

        // 3. Send Telegram notification to admin
        (async () => {
          try {
            const message = formatRegistrationNotification({
              participantName: registration.participantName,
              email: registration.email,
              phone: registration.phone,
              trainingTitle: registration.trainingTitle,
              role: registration.role || undefined,
              officine: registration.officine || undefined
            });
            await sendTelegramNotification(message);
          } catch (error) {
            console.error('❌ Erreur notification Telegram:', error);
          }
        })()
      ]);
      
      // Return success response (no PII logging for privacy)
      console.log('Training registration created successfully');
      
      res.status(201).json({ 
        success: true, 
        id: registration.id,
        message: 'Inscription enregistrée avec succès'
      });
      
    } catch (error) {
      console.error('Training registration error:', error instanceof z.ZodError ? 'Validation failed' : 'Server error');
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Données invalides',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Erreur serveur. Veuillez réessayer plus tard.'
      });
    }
  });

  // Optional: Get training registrations endpoint (for admin purposes)
  app.get('/api/training-registrations', async (req, res) => {
    try {
      const registrations = await db.select().from(trainingRegistrations);
      console.log(`DEBUG: Found ${registrations.length} registrations in database`);
      
      // Return non-PII summary data only
      const summary = registrations.map((reg) => ({
        id: reg.id,
        trainingTitle: reg.trainingTitle,
        participantsCount: reg.participantsCount,
        sessionType: reg.sessionType,
        createdAt: reg.createdAt
      }));
      
      res.json({ success: true, data: summary });
    } catch (error) {
      console.error('Failed to fetch training registrations');
      res.status(500).json({
        success: false,
        error: 'Erreur serveur'
      });
    }
  });

  // Kemet Echo demo request endpoint
  app.post('/api/kemet-echo-requests', async (req, res) => {
    try {
      // Validate request body using Zod schema
      const validatedData = insertKemetEchoRequestSchema.parse(req.body);
      
      // Create Kemet Echo request in database
      const requestResult = await db.insert(kemetEchoRequests).values(validatedData).returning();
      const kemetRequest = requestResult[0];
      
      // Send notification (asynchronously, don't block response)
      Promise.allSettled([
        (async () => {
          try {
            const gmailSuccess = await sendKemetEchoNotification(kemetRequest);
            if (gmailSuccess) {
              console.log('✅ Notification Kemet Echo envoyée avec succès');
            } else {
              console.log('📧 Gmail non configuré - utilisation des fichiers de log');
              const fileSuccess = logKemetEchoNotification(kemetRequest);
              if (fileSuccess) {
                console.log('✅ Notification Kemet Echo enregistrée dans les fichiers de log');
              }
            }
          } catch (error) {
            console.error('❌ Erreur notification Kemet Echo:', error);
            console.log('📁 Utilisation du système de fichiers en secours');
            try {
              logKemetEchoNotification(kemetRequest);
            } catch (fileError) {
              console.error('❌ Erreur système de fichiers:', fileError);
            }
          }
        })()
      ]);
      
      // Return success response
      console.log('Kemet Echo request created successfully');
      
      res.status(201).json({ 
        success: true, 
        id: kemetRequest.id,
        message: 'Demande enregistrée avec succès. Notre équipe vous contactera dans les 24h.'
      });
      
    } catch (error) {
      console.error('Kemet Echo request error:', error instanceof z.ZodError ? 'Validation failed' : 'Server error');
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Données invalides',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Erreur serveur. Veuillez réessayer plus tard.'
      });
    }
  });

  // Lead Magnet download endpoint (PDF Guide)
  app.post('/api/lead-magnet-downloads', async (req, res) => {
    try {
      // Validate request body using Zod schema
      const validatedData = insertLeadMagnetDownloadSchema.parse(req.body);
      
      // Create lead magnet download record in database
      const downloadResult = await db.insert(leadMagnetDownloads).values(validatedData).returning();
      const download = downloadResult[0];
      
      // Log success
      console.log('Lead magnet download recorded successfully');
      
      // Return success response with download URL
      res.status(201).json({ 
        success: true, 
        id: download.id,
        downloadUrl: '/pdf/checklist-gestion-pharmacie.pdf',
        message: 'Merci ! Votre guide est prêt à télécharger.'
      });
      
    } catch (error) {
      console.error('Lead magnet download error:', error instanceof z.ZodError ? 'Validation failed' : 'Server error');
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Données invalides',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Erreur serveur. Veuillez réessayer plus tard.'
      });
    }
  });

  // Contact requests endpoint
  app.post('/api/contacts', async (req, res) => {
    try {
      // Validate request body using Zod schema
      const validatedData = insertContactRequestSchema.parse({
        ...req.body,
        type: req.body.type || 'contact'
      });
      
      // Create contact request record in database
      const contactResult = await db.insert(contactRequests).values(validatedData).returning();
      const contact = contactResult[0];
      
      // Log success
      console.log('Contact request created successfully:', contact.id);
      
      // Return success response
      res.status(201).json({ 
        success: true, 
        id: contact.id,
        message: 'Demande envoyée avec succès. Nous vous recontacterons sous 24h.'
      });
      
    } catch (error) {
      console.error('Contact request error:', error instanceof z.ZodError ? 'Validation failed' : 'Server error');
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Données invalides',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Erreur serveur. Veuillez réessayer plus tard.'
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
