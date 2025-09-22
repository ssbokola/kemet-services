// Routes API pour la gestion DKIM
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { requireAdminAuth } from '../auth';
import { 
  emailServicesDKIM, 
  createDKIMRecord, 
  generateDKIMDNSRecord,
  validateDKIMRecord,
  checkDKIMRecord,
  getDKIMDNSInstructions,
  dkimDomainConfig,
  dkimConfigurations,
  generateDKIMRecommendations,
  generateDKIMKeyPair
} from '../dkim-config';

const router = Router();

// Schémas de validation
const validateDKIMSchema = z.object({
  dkimRecord: z.string().min(1, "L'enregistrement DKIM ne peut pas être vide")
});

const generateDKIMSchema = z.object({
  selector: z.string().min(1, "Le sélecteur est requis").regex(/^[a-zA-Z0-9_-]+$/, "Sélecteur invalide"),
  domain: z.string().min(1, "Le domaine est requis"),
  keyLength: z.number().int().refine(val => [1024, 2048, 4096].includes(val), "Longueur de clé invalide").optional().default(2048)
});

const checkDKIMSchema = z.object({
  domain: z.string().min(1, "Le domaine est requis"),
  selector: z.string().min(1, "Le sélecteur est requis")
});

const keypairDKIMSchema = z.object({
  selector: z.string().min(1, "Le sélecteur est requis").regex(/^[a-zA-Z0-9_-]+$/, "Sélecteur invalide"),
  domain: z.string().min(1, "Le domaine est requis").regex(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Domaine invalide"),
  keyLength: z.number().int().refine(val => [1024, 2048, 4096].includes(val), "Longueur de clé invalide").optional().default(2048)
});

// GET /api/dkim/config - Récupère la configuration DKIM actuelle (protégé)
router.get('/config', requireAdminAuth(), (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: {
        emailServices: emailServicesDKIM,
        domainConfig: dkimDomainConfig,
        presetConfigurations: dkimConfigurations,
        dnsInstructions: getDKIMDNSInstructions()
      }
    });
  } catch (error) {
    console.error('Erreur récupération config DKIM:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération de la configuration DKIM'
    });
  }
});

// POST /api/dkim/validate - Valide un enregistrement DKIM (protégé)
router.post('/validate', requireAdminAuth(), (req: Request, res: Response) => {
  try {
    const { dkimRecord } = validateDKIMSchema.parse(req.body);
    
    const validation = validateDKIMRecord(dkimRecord);
    
    res.json({
      success: true,
      data: validation
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Données invalides',
        details: error.errors
      });
    }
    
    console.error('Erreur validation DKIM:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la validation DKIM'
    });
  }
});

// POST /api/dkim/generate - Génère une nouvelle paire de clés DKIM (protégé)
router.post('/generate', requireAdminAuth(), (req: Request, res: Response) => {
  try {
    const { selector, domain, keyLength } = generateDKIMSchema.parse(req.body);
    
    // Générer une nouvelle paire de clés DKIM
    const dkimRecord = createDKIMRecord(selector, domain, keyLength as 1024 | 2048 | 4096);
    const dnsRecord = generateDKIMDNSRecord(dkimRecord);
    const dnsInstructions = getDKIMDNSInstructions(selector, domain, dkimRecord);
    
    // Validation du record généré
    const validation = validateDKIMRecord(dnsRecord);
    
    res.json({
      success: true,
      data: {
        dkimRecord: {
          selector,
          domain,
          publicKey: dkimRecord.publicKey,
          algorithm: dkimRecord.algorithm,
          keyLength,
          // Ne pas exposer la clé privée dans la réponse pour la sécurité
          hasPrivateKey: !!dkimRecord.privateKey
        },
        dnsRecord,
        dnsInstructions,
        validation
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Données invalides',
        details: error.errors
      });
    }
    
    console.error('Erreur génération DKIM:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la génération DKIM'
    });
  }
});

// POST /api/dkim/check - Vérifie l'enregistrement DKIM d'un domaine/sélecteur (protégé)
router.post('/check', requireAdminAuth(), async (req: Request, res: Response) => {
  try {
    const { domain, selector } = checkDKIMSchema.parse(req.body);
    
    const result = await checkDKIMRecord(domain, selector);
    
    res.json({
      success: true,
      data: {
        domain,
        selector,
        ...result,
        lastChecked: new Date().toISOString()
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Données invalides',
        details: error.errors
      });
    }
    
    console.error('Erreur vérification DKIM:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la vérification DKIM'
    });
  }
});

// GET /api/dkim/recommendations - Récupère les recommandations DKIM (protégé)
router.get('/recommendations', requireAdminAuth(), (req: Request, res: Response) => {
  try {
    const recommendations = generateDKIMRecommendations();
    
    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    console.error('Erreur recommandations DKIM:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la génération des recommandations'
    });
  }
});

// POST /api/dkim/keypair - Génère une nouvelle paire de clés RSA avec téléchargement sécurisé (protégé)
router.post('/keypair', requireAdminAuth(), (req: Request, res: Response) => {
  try {
    // Validation Zod stricte
    const { keyLength, selector, domain } = keypairDKIMSchema.parse(req.body);
    
    // Headers de sécurité critiques pour empêcher la mise en cache
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    
    const { publicKey, privateKey } = generateDKIMKeyPair(keyLength);
    
    // Génération instructions DNS automatiques
    const publicKeyForDNS = publicKey.replace(/\n/g, '').replace(/-----BEGIN PUBLIC KEY-----/g, '').replace(/-----END PUBLIC KEY-----/g, '');
    const dnsRecord = `v=DKIM1; k=rsa; p=${publicKeyForDNS}`;
    
    // Log audit (sans la clé privée)
    console.log(`[AUDIT] Génération clés DKIM - Domaine: ${domain}, Sélecteur: ${selector}, Longueur: ${keyLength}bits, Admin: ${req.user?.username || 'inconnu'}`);
    
    res.json({
      success: true,
      data: {
        keyLength,
        selector,
        domain,
        publicKey,
        privateKey, // Livraison one-time, l'admin doit sauvegarder immédiatement
        dnsRecord,
        dnsInstructions: {
          name: `${selector}._domainkey.${domain}`,
          type: 'TXT',
          value: dnsRecord
        },
        generated: new Date().toISOString(),
        warning: "⚠️ CRITIQUE: Sauvegardez immédiatement la clé privée dans un endroit sécurisé. Elle ne sera plus accessible après cette page.",
        securityNote: "Cette clé privée ne sera jamais stockée sur le serveur. Vous devez la conserver en sécurité pour signer vos emails."
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Données invalides',
        details: error.errors
      });
    }
    
    console.error('Erreur génération paire de clés DKIM:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la génération de la paire de clés'
    });
  }
});

// Fonction utilitaire pour analyser un enregistrement DKIM
function analyzeDKIMRecord(dkimRecord: string) {
  const analysis = {
    version: '',
    algorithm: '',
    publicKey: '',
    services: [] as string[],
    flags: [] as string[],
    keyLength: 0,
    parameters: {} as Record<string, string>,
    recommendations: [] as string[]
  };
  
  // Parser les paramètres DKIM
  const params = dkimRecord.split(';').map(p => p.trim());
  
  for (const param of params) {
    const [key, value] = param.split('=').map(p => p.trim());
    if (key && value) {
      analysis.parameters[key] = value;
      
      switch (key) {
        case 'v':
          analysis.version = value;
          break;
        case 'k':
          analysis.algorithm = value;
          break;
        case 'p':
          analysis.publicKey = value;
          // Estimation approximative de la longueur de clé
          if (value.length > 350) analysis.keyLength = 2048;
          else if (value.length > 180) analysis.keyLength = 1024;
          break;
        case 's':
          analysis.services = value.split(':');
          break;
        case 't':
          analysis.flags = value.split(':');
          break;
      }
    }
  }
  
  // Générer des recommandations
  if (analysis.keyLength <= 1024) {
    analysis.recommendations.push("Considérer l'utilisation d'une clé RSA 2048 bits pour une meilleure sécurité");
  }
  
  if (!analysis.services.length || analysis.services.includes('*')) {
    analysis.recommendations.push("Considérer la restriction des services (s=email) pour limiter l'usage");
  }
  
  if (analysis.flags.includes('y')) {
    analysis.recommendations.push("Mode test activé (t=y) - retirer pour la production");
  }
  
  if (!analysis.flags.includes('s')) {
    analysis.recommendations.push("Considérer le mode strict (t=s) pour renforcer la sécurité");
  }
  
  return analysis;
}

export default router;