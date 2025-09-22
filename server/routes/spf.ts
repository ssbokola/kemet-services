// Routes API pour la gestion SPF
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { requireAdminAuth } from '../auth';
import { 
  generateSPFRecord, 
  getSPFRecordString, 
  validateSPFRecord, 
  emailProviders, 
  spfConfigurations,
  domainConfig,
  dnsInstructions
} from '../spf-config';

const router = Router();

// Schémas de validation
const validateSPFSchema = z.object({
  spfRecord: z.string().min(1, "L'enregistrement SPF ne peut pas être vide")
});

const generateSPFSchema = z.object({
  activeProviders: z.array(z.string()).optional(),
  qualifier: z.enum(['~all', '-all', '+all', '?all']).optional()
});

// GET /api/spf/config - Récupère la configuration SPF actuelle (protégé)
router.get('/config', requireAdminAuth(), (req: Request, res: Response) => {
  try {
    const currentSPF = getSPFRecordString();
    
    res.json({
      success: true,
      data: {
        currentSPF,
        emailProviders,
        domainConfig,
        dnsInstructions,
        presetConfigurations: spfConfigurations
      }
    });
  } catch (error) {
    console.error('Erreur récupération config SPF:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération de la configuration SPF'
    });
  }
});

// POST /api/spf/validate - Valide un enregistrement SPF (protégé)
router.post('/validate', requireAdminAuth(), (req: Request, res: Response) => {
  try {
    const { spfRecord } = validateSPFSchema.parse(req.body);
    
    const validation = validateSPFRecord(spfRecord);
    
    // Analyses supplémentaires
    const analysis = analyzeSPFRecord(spfRecord);
    
    res.json({
      success: true,
      data: {
        ...validation,
        analysis
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
    
    console.error('Erreur validation SPF:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la validation SPF'
    });
  }
});

// POST /api/spf/generate - Génère un enregistrement SPF personnalisé (protégé)
router.post('/generate', requireAdminAuth(), (req: Request, res: Response) => {
  try {
    const { activeProviders = [], qualifier = '~all' } = generateSPFSchema.parse(req.body);
    
    // Filtrer les fournisseurs actifs
    const selectedProviders = emailProviders.filter(provider => 
      activeProviders.length === 0 ? provider.isActive : activeProviders.includes(provider.name)
    );
    
    const mechanisms = selectedProviders.map(provider => provider.spfMechanism);
    const spfRecord = `v=spf1 ${mechanisms.join(' ')} ${qualifier}`;
    
    const validation = validateSPFRecord(spfRecord);
    
    res.json({
      success: true,
      data: {
        spfRecord,
        selectedProviders,
        validation,
        dnsInstructions: {
          ...dnsInstructions,
          value: spfRecord
        }
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
    
    console.error('Erreur génération SPF:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la génération SPF'
    });
  }
});

// GET /api/spf/check/:domain - Vérifie l'enregistrement SPF d'un domaine
router.get('/check/:domain', async (req: Request, res: Response) => {
  try {
    const { domain } = req.params;
    
    // Validation basique du domaine
    if (!domain || !isValidDomain(domain)) {
      return res.status(400).json({
        success: false,
        error: 'Domaine invalide'
      });
    }
    
    // Note: En production, vous pourriez utiliser une bibliothèque DNS comme 'dns2' ou 'node:dns'
    // Pour cette démo, on simule la vérification
    const mockSPFCheck = await simulateSPFCheck(domain);
    
    res.json({
      success: true,
      data: mockSPFCheck
    });
  } catch (error) {
    console.error('Erreur vérification SPF:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la vérification SPF'
    });
  }
});

// GET /api/spf/recommendations - Récupère les recommandations SPF (protégé)
router.get('/recommendations', requireAdminAuth(), (req: Request, res: Response) => {
  try {
    const recommendations = generateSPFRecommendations();
    
    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    console.error('Erreur recommandations SPF:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la génération des recommandations'
    });
  }
});

// Fonction d'analyse approfondie d'un enregistrement SPF
function analyzeSPFRecord(spfRecord: string) {
  const analysis = {
    mechanisms: [] as string[],
    qualifiers: [] as string[],
    includes: [] as string[],
    ipRanges: [] as string[],
    dnsLookups: 0,
    recordLength: spfRecord.length,
    recommendations: [] as string[]
  };
  
  // Extraire les mécanismes
  const mechanismMatches = spfRecord.match(/\b(include|a|mx|ip4|ip6|exists|ptr):[^\s]+/g) || [];
  analysis.mechanisms = mechanismMatches;
  
  // Compter TOUS les mécanismes DNS (correction critique - utilise même logique que validateSPFRecord)
  const dnsLookupMechanisms = [
    ...( spfRecord.match(/include:[^\s]+/g) || []),
    ...( spfRecord.match(/\b[~\-\+\?]?a(?::[^\s\/]+)?(?:\/\d+)?\b/g) || []),
    ...( spfRecord.match(/\b[~\-\+\?]?mx(?::[^\s\/]+)?(?:\/\d+)?\b/g) || []),
    ...( spfRecord.match(/\b[~\-\+\?]?ptr(?::[^\s]+)?\b/g) || []),
    ...( spfRecord.match(/\b[~\-\+\?]?exists:[^\s]+/g) || []),
    ...( spfRecord.match(/redirect=[^\s]+/g) || [])
  ];
  
  const includes = spfRecord.match(/include:[^\s]+/g) || [];
  analysis.includes = includes;
  analysis.dnsLookups = dnsLookupMechanisms.length;
  
  // Extraire les plages IP
  const ipMatches = spfRecord.match(/ip[46]:[^\s]+/g) || [];
  analysis.ipRanges = ipMatches;
  
  // Qualificateurs
  const qualifierMatch = spfRecord.match(/([~\-\+\?])all/);
  if (qualifierMatch) {
    analysis.qualifiers.push(qualifierMatch[0]);
  }
  
  // Générer des recommandations
  if (analysis.dnsLookups > 8) {
    analysis.recommendations.push("Réduire le nombre d'inclusions pour éviter la limite DNS (10 max)");
  }
  
  if (analysis.recordLength > 200) {
    analysis.recommendations.push("Enregistrement long - considérer l'optimisation pour éviter la limite de 255 caractères");
  }
  
  if (!spfRecord.includes('all')) {
    analysis.recommendations.push("Ajouter un qualificateur 'all' pour définir le comportement par défaut");
  }
  
  if (spfRecord.includes('+all')) {
    analysis.recommendations.push("Éviter '+all' qui autorise tous les serveurs - utiliser '~all' ou '-all'");
  }
  
  return analysis;
}

// Vérification SPF réelle via DNS TXT lookups (correction critique)
import { promises as dns } from 'dns';

async function checkSPFRecord(domain: string) {
  try {
    // Résoudre les enregistrements TXT pour le domaine avec timeout
    const txtRecords = await Promise.race([
      dns.resolveTxt(domain),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('DNS timeout')), 5000)
      )
    ]) as string[][];
    
    // Trouver tous les enregistrements SPF (commence par "v=spf1")
    const spfRecords: string[] = [];
    
    for (const record of txtRecords) {
      // Les enregistrements TXT peuvent être des tableaux de chaînes
      const recordString = Array.isArray(record) ? record.join('') : record;
      
      if (recordString.startsWith('v=spf1')) {
        spfRecords.push(recordString);
      }
    }
    
    if (spfRecords.length > 0) {
      // Valider le premier enregistrement SPF trouvé
      const validation = validateSPFRecord(spfRecords[0]);
      
      return {
        domain,
        hasSpfRecord: true,
        spfRecords,
        status: 'found',
        message: `${spfRecords.length} enregistrement(s) SPF trouvé(s)`,
        validation,
        lastChecked: new Date().toISOString(),
        ...(spfRecords.length > 1 && {
          warnings: ['Plusieurs enregistrements SPF détectés - seul le premier est validé par les serveurs email']
        })
      };
    }
    
    return {
      domain,
      hasSpfRecord: false,
      spfRecords: [],
      status: 'missing',
      message: 'Aucun enregistrement SPF trouvé pour ce domaine',
      recommendations: [
        'Ajouter un enregistrement SPF pour améliorer la délivrabilité',
        'Utiliser la configuration SPF recommandée dans cet outil'
      ],
      lastChecked: new Date().toISOString()
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur DNS inconnue';
    
    return {
      domain,
      hasSpfRecord: false,
      spfRecords: [],
      status: 'error',
      message: `Erreur lors de la vérification DNS: ${errorMessage}`,
      error: errorMessage,
      lastChecked: new Date().toISOString()
    };
  }
}

// Fonction wrapper pour compatibilité (transition)
async function simulateSPFCheck(domain: string) {
  return await checkSPFRecord(domain);
}

// Validation basique de domaine
function isValidDomain(domain: string): boolean {
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.([a-zA-Z]{2,}|xn--[a-zA-Z0-9]+)$/;
  return domainRegex.test(domain) && domain.length <= 253;
}

// Génération de recommandations SPF contextuelles
function generateSPFRecommendations() {
  return {
    currentStatus: {
      domain: domainConfig.primaryDomain,
      emailServices: emailProviders.filter(p => p.isActive).map(p => p.name),
      recommendedSPF: getSPFRecordString()
    },
    bestPractices: [
      {
        title: "Utiliser des qualificateurs appropriés",
        description: "~all pour soft fail (marqué comme spam), -all pour hard fail (rejeté)",
        priority: "high"
      },
      {
        title: "Limiter les lookups DNS",
        description: "Maximum 10 inclusions pour éviter les erreurs de résolution",
        priority: "medium"
      },
      {
        title: "Tester régulièrement",
        description: "Vérifier la configuration SPF après chaque changement de service email",
        priority: "medium"
      },
      {
        title: "Implémenter DKIM et DMARC",
        description: "Compléter SPF avec DKIM et DMARC pour une protection complète",
        priority: "high"
      }
    ],
    nextSteps: [
      {
        step: 1,
        title: "Configurer l'enregistrement SPF",
        description: "Ajouter l'enregistrement TXT SPF dans votre DNS",
        estimated: "15 minutes"
      },
      {
        step: 2,
        title: "Attendre la propagation",
        description: "Laisser le temps à la propagation DNS (24-48h max)",
        estimated: "24-48 heures"
      },
      {
        step: 3,
        title: "Tester la configuration",
        description: "Utiliser des outils en ligne pour vérifier l'enregistrement SPF",
        estimated: "5 minutes"
      },
      {
        step: 4,
        title: "Configurer DKIM",
        description: "Ajouter la signature DKIM pour vos services email",
        estimated: "30 minutes"
      }
    ]
  };
}

export default router;