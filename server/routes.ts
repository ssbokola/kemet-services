import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTrainingRegistrationSchema } from "@shared/schema";
import { z } from "zod";
import { sendRegistrationNotification } from "./email";
import { logRegistrationNotification } from "./notifications";

export async function registerRoutes(app: Express): Promise<Server> {
  // Training registration endpoint
  app.post('/api/training-registrations', async (req, res) => {
    try {
      // Validate request body using Zod schema
      const validatedData = insertTrainingRegistrationSchema.parse(req.body);
      
      // Create training registration in storage
      const registration = await storage.createTrainingRegistration(validatedData);
      
      // Send notification (asynchronously, don't block response)
      // Use file logging since no email service is configured
      console.log('Attempting to log registration notification...');
      try {
        const notificationSuccess = logRegistrationNotification(registration);
        if (notificationSuccess) {
          console.log('✅ Notification enregistrée dans les fichiers de log');
        } else {
          console.log('❌ Échec de l\'enregistrement de la notification');
        }
      } catch (error) {
        console.error('❌ Erreur lors de l\'enregistrement de la notification:', error);
      }
      
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
