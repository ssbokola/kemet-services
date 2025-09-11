import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTrainingRegistrationSchema } from "@shared/schema";
import { z } from "zod";
// import { sendRegistrationNotification } from "./email"; // Unused - file logging active
import { logRegistrationNotification } from "./notifications";
import { sendGmailNotification, sendParticipantConfirmation } from "./gmail";

export async function registerRoutes(app: Express): Promise<Server> {
  // Training registration endpoint
  app.post('/api/training-registrations', async (req, res) => {
    try {
      // Validate request body using Zod schema
      const validatedData = insertTrainingRegistrationSchema.parse(req.body);
      
      // Create training registration in storage
      const registration = await storage.createTrainingRegistration(validatedData);
      
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
      const registrations = await storage.getTrainingRegistrations();
      console.log(`DEBUG: Found ${registrations.length} registrations in storage`);
      
      // Return non-PII summary data only
      const summary = registrations.map((reg: any) => ({
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

  const httpServer = createServer(app);

  return httpServer;
}
