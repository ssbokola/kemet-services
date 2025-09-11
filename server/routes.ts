import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTrainingRegistrationSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Training registration endpoint
  app.post('/api/training-registrations', async (req, res) => {
    try {
      // Validate request body using Zod schema
      const validatedData = insertTrainingRegistrationSchema.parse(req.body);
      
      // Create training registration in storage
      const registration = await storage.createTrainingRegistration(validatedData);
      
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
      const summary = registrations.map(reg => ({
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
