// Configuration DKIM pour Kemet Services
import { createHash, generateKeyPairSync } from 'crypto';
import { promises as dns } from 'dns';

export interface DKIMRecord {
  selector: string;
  domain: string;
  publicKey: string;
  privateKey?: string;
  algorithm: 'rsa-sha256' | 'ed25519';
  keyLength: 1024 | 2048 | 4096;
  canonicalization: 'simple' | 'relaxed';
}

export interface EmailServiceDKIM {
  name: string;
  selector: string;
  description: string;
  isActive: boolean;
  domain: string;
  setupType: 'auto' | 'manual' | 'managed';
  instructions?: string;
}

// Services email avec configuration DKIM
export const emailServicesDKIM: EmailServiceDKIM[] = [
  {
    name: "Google Workspace/Gmail",
    selector: "google",
    description: "DKIM géré automatiquement par Google pour les domaines Google Workspace",
    isActive: true,
    domain: "kemetservices.com",
    setupType: "managed",
    instructions: "Google gère automatiquement DKIM pour les domaines Google Workspace. Configuration via Admin Console si domaine personnalisé."
  },
  {
    name: "SendGrid",
    selector: "s1",
    description: "DKIM SendGrid pour emails transactionnels (nécessite activation)",
    isActive: false,
    domain: "kemetservices.com",
    setupType: "auto",
    instructions: "SendGrid génère automatiquement les clés DKIM. Activer dans les paramètres d'authentification."
  },
  {
    name: "DKIM Personnalisé",
    selector: "kemet2024",
    description: "Configuration DKIM personnalisée pour un contrôle total",
    isActive: false,
    domain: "kemetservices.com",
    setupType: "manual",
    instructions: "Génération manuelle des clés RSA et configuration DNS TXT."
  }
];

// Génération de paires de clés DKIM RSA
export function generateDKIMKeyPair(keyLength: 1024 | 2048 | 4096 = 2048): { publicKey: string; privateKey: string } {
  const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: keyLength,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });

  // Extraire la clé publique pour format DNS (enlever headers PEM)
  const publicKeyDNS = publicKey
    .replace(/-----BEGIN PUBLIC KEY-----/, '')
    .replace(/-----END PUBLIC KEY-----/, '')
    .replace(/\s/g, '');

  return {
    publicKey: publicKeyDNS,
    privateKey
  };
}

// Création d'un enregistrement DKIM complet
export function createDKIMRecord(
  selector: string = 'kemet2024',
  domain: string = 'kemetservices.com',
  keyLength: 1024 | 2048 | 4096 = 2048
): DKIMRecord {
  const { publicKey, privateKey } = generateDKIMKeyPair(keyLength);

  return {
    selector,
    domain,
    publicKey,
    privateKey,
    algorithm: 'rsa-sha256',
    keyLength,
    canonicalization: 'relaxed'
  };
}

// Génération de l'enregistrement DNS TXT DKIM
export function generateDKIMDNSRecord(dkimRecord: DKIMRecord): string {
  return `v=DKIM1; k=rsa; p=${dkimRecord.publicKey}`;
}

// Validation d'un enregistrement DKIM
export function validateDKIMRecord(dkimRecord: string): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Vérifications obligatoires
  if (!dkimRecord.includes('v=DKIM1')) {
    errors.push("L'enregistrement DKIM doit commencer par 'v=DKIM1'");
  }

  if (!dkimRecord.includes('k=rsa')) {
    errors.push("L'algorithme de clé doit être spécifié (k=rsa)");
  }

  if (!dkimRecord.includes('p=')) {
    errors.push("La clé publique doit être présente (p=...)");
  }

  // Vérifications de la clé publique
  const publicKeyMatch = dkimRecord.match(/p=([A-Za-z0-9+/=]+)/);
  if (publicKeyMatch) {
    const publicKey = publicKeyMatch[1];
    
    // Vérifier que ce n'est pas une clé révoquée (vide)
    if (publicKey === '') {
      warnings.push("Clé publique vide - DKIM révoqué pour ce sélecteur");
    }
    
    // Vérifier la longueur (approximative pour RSA)
    if (publicKey.length < 200) {
      warnings.push("Clé publique courte - considérer RSA 2048 bits minimum");
    }
  }

  // Vérifier les paramètres optionnels recommandés
  if (!dkimRecord.includes('s=email') && !dkimRecord.includes('s=*')) {
    warnings.push("Considérer l'ajout du paramètre de service (s=email ou s=*)");
  }

  if (!dkimRecord.includes('t=')) {
    warnings.push("Considérer l'ajout de flags de test (t=y pour test, t=s pour strict)");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// Vérification DKIM réelle via DNS
export async function checkDKIMRecord(
  domain: string, 
  selector: string
): Promise<{ 
  hasRecord: boolean; 
  record?: string; 
  validation?: { isValid: boolean; errors: string[]; warnings: string[] }; 
  error?: string 
}> {
  try {
    const dkimDomain = `${selector}._domainkey.${domain}`;
    
    // Résoudre l'enregistrement TXT DKIM avec timeout
    const txtRecords = await Promise.race([
      dns.resolveTxt(dkimDomain),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('DNS timeout')), 5000)
      )
    ]) as string[][];
    
    if (txtRecords.length > 0) {
      // Concatener les parties de l'enregistrement TXT
      const dkimRecord = txtRecords[0].join('');
      
      // Valider l'enregistrement DKIM
      const validation = validateDKIMRecord(dkimRecord);
      
      return {
        hasRecord: true,
        record: dkimRecord,
        validation
      };
    }
    
    return {
      hasRecord: false
    };
    
  } catch (error) {
    return {
      hasRecord: false,
      error: error instanceof Error ? error.message : 'Erreur DNS inconnue'
    };
  }
}

// Configuration du domaine Kemet Services
export const dkimDomainConfig = {
  primaryDomain: "kemetservices.com",
  selectors: {
    default: "kemet2024",
    google: "google",
    sendgrid: "s1",
    custom: "kemet2024"
  },
  recommendedKeyLength: 2048 as const,
  dnsTTL: 3600 // 1 heure
};

// Instructions DNS pour DKIM
export function getDKIMDNSInstructions(
  selector: string = 'kemet2024',
  domain: string = 'kemetservices.com',
  dkimRecord?: DKIMRecord
): {
  recordType: string;
  hostname: string;
  value: string;
  ttl: number;
  note: string;
} {
  const record = dkimRecord || createDKIMRecord(selector, domain);
  
  return {
    recordType: "TXT",
    hostname: `${selector}._domainkey`,
    value: generateDKIMDNSRecord(record),
    ttl: dkimDomainConfig.dnsTTL,
    note: `Enregistrement DKIM pour le sélecteur '${selector}'. Peut coexister avec d'autres sélecteurs DKIM.`
  };
}

// Configurations DKIM prédéfinies
export const dkimConfigurations = {
  // Configuration Google Workspace (géré par Google)
  googleWorkspace: {
    selector: "google",
    description: "DKIM géré automatiquement par Google",
    instructions: "Activé automatiquement pour les domaines Google Workspace. Aucune configuration DNS manuelle requise.",
    isAutoManaged: true
  },
  
  // Configuration SendGrid (géré par SendGrid)
  sendgrid: {
    selector: "s1",
    description: "DKIM géré par SendGrid",
    instructions: "Activer l'authentification DKIM dans les paramètres SendGrid. SendGrid fournira les enregistrements DNS.",
    isAutoManaged: true
  },
  
  // Configuration personnalisée
  custom: {
    selector: "kemet2024",
    description: "DKIM personnalisé avec clés générées localement",
    instructions: "Génération de clés RSA 2048 bits et configuration DNS manuelle. Contrôle total sur la configuration.",
    isAutoManaged: false
  }
};

// Génération de recommandations DKIM
export function generateDKIMRecommendations() {
  return {
    currentStatus: {
      domain: dkimDomainConfig.primaryDomain,
      activeServices: emailServicesDKIM.filter(s => s.isActive).map(s => s.name),
      recommendedSelectors: dkimDomainConfig.selectors
    },
    
    bestPractices: [
      {
        title: "Utiliser des clés RSA 2048 bits minimum",
        description: "Les clés 1024 bits sont dépréciées pour des raisons de sécurité",
        priority: "high" as const
      },
      {
        title: "Implémenter plusieurs sélecteurs",
        description: "Permet la rotation des clés et l'utilisation de services multiples",
        priority: "medium" as const
      },
      {
        title: "Rotation régulière des clés",
        description: "Changer les clés DKIM tous les 6-12 mois pour la sécurité",
        priority: "medium" as const
      },
      {
        title: "Surveillance des enregistrements DNS",
        description: "Vérifier régulièrement que les enregistrements DKIM sont présents et valides",
        priority: "high" as const
      },
      {
        title: "Configuration DMARC complémentaire",
        description: "DKIM fonctionne mieux avec DMARC pour une protection complète",
        priority: "high" as const
      }
    ],
    
    nextSteps: [
      {
        step: 1,
        title: "Analyser la configuration actuelle",
        description: "Vérifier les enregistrements DKIM existants",
        estimated: "10 minutes"
      },
      {
        step: 2,
        title: "Configurer les services email",
        description: "Activer DKIM sur Google Workspace et/ou SendGrid",
        estimated: "20 minutes"
      },
      {
        step: 3,
        title: "Ajouter les enregistrements DNS",
        description: "Publier les clés publiques DKIM dans le DNS",
        estimated: "15 minutes"
      },
      {
        step: 4,
        title: "Tester la configuration",
        description: "Vérifier que les signatures DKIM sont correctes",
        estimated: "10 minutes"
      },
      {
        step: 5,
        title: "Monitorer la délivrabilité",
        description: "Suivre l'impact sur la réputation email",
        estimated: "Continu"
      }
    ]
  };
}