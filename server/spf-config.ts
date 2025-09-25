// Configuration SPF pour Kemet Services
export interface SPFRecord {
  version: string;
  mechanisms: string[];
  qualifier: string;
}

export interface EmailProvider {
  name: string;
  spfMechanism: string;
  description: string;
  isActive: boolean;
}

// Fournisseurs d'email configurés pour Kemet Services
export const emailProviders: EmailProvider[] = [
  {
    name: "Google Workspace/Gmail",
    spfMechanism: "include:_spf.google.com",
    description: "Utilisé pour l'envoi d'emails via Gmail SMTP (infos@kemetservices.com)",
    isActive: true
  },
  {
    name: "SendGrid",
    spfMechanism: "include:sendgrid.net",
    description: "Service d'email transactionnel (configuré mais clé API manquante)",
    isActive: false
  }
];

// Configuration SPF recommandée pour kemetservices.com
export function generateSPFRecord(): SPFRecord {
  const activeMechanisms = emailProviders
    .filter(provider => provider.isActive)
    .map(provider => provider.spfMechanism);

  return {
    version: "v=spf1",
    mechanisms: activeMechanisms,
    qualifier: "~all" // Soft fail - marque comme spam mais délivre
  };
}

// Génère la chaîne SPF complète pour DNS
export function getSPFRecordString(): string {
  const spfRecord = generateSPFRecord();
  return `${spfRecord.version} ${spfRecord.mechanisms.join(' ')} ${spfRecord.qualifier}`;
}

// Configurations SPF recommandées selon les cas d'usage
export const spfConfigurations = {
  // Configuration actuelle recommandée (Gmail seulement)
  current: "v=spf1 include:_spf.google.com ~all",
  
  // Avec SendGrid activé
  withSendGrid: "v=spf1 include:_spf.google.com include:sendgrid.net ~all",
  
  // Configuration stricte (hard fail)
  strict: "v=spf1 include:_spf.google.com -all",
  
  // Avec IP spécifique si nécessaire
  withIP: "v=spf1 include:_spf.google.com ip4:192.168.1.1 ~all"
};

// Validation SPF complète avec parsing précis des mécanismes
export function validateSPFRecord(spfRecord: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Vérifications de base
  if (!spfRecord.startsWith('v=spf1')) {
    errors.push("L'enregistrement SPF doit commencer par 'v=spf1'");
  }
  
  if (!spfRecord.includes('all')) {
    errors.push("L'enregistrement SPF doit se terminer par un qualificateur 'all'");
  }
  
  // Parser et compter TOUS les mécanismes DNS avec variantes (correction critique)
  const dnsLookupMechanisms: string[] = [];
  
  // include: mécanismes - toujours 1 lookup DNS
  const includes = spfRecord.match(/include:[^\s]+/g) || [];
  dnsLookupMechanisms.push(...includes);
  
  // a mécanismes - variants: a, a:domain, a/mask, a:domain/mask 
  const aMechanisms = spfRecord.match(/\b[~\-\+\?]?a(?::[^\s\/]+)?(?:\/\d+)?\b/g) || [];
  dnsLookupMechanisms.push(...aMechanisms);
  
  // mx mécanismes - variants: mx, mx:domain, mx/mask, mx:domain/mask
  const mxMechanisms = spfRecord.match(/\b[~\-\+\?]?mx(?::[^\s\/]+)?(?:\/\d+)?\b/g) || [];
  dnsLookupMechanisms.push(...mxMechanisms);
  
  // ptr mécanismes - variants: ptr, ptr:domain (obsolète mais compté)
  const ptrMechanisms = spfRecord.match(/\b[~\-\+\?]?ptr(?::[^\s]+)?\b/g) || [];
  dnsLookupMechanisms.push(...ptrMechanisms);
  
  // exists mécanismes - toujours avec domaine: exists:domain
  const existsMechanisms = spfRecord.match(/\b[~\-\+\?]?exists:[^\s]+/g) || [];
  dnsLookupMechanisms.push(...existsMechanisms);
  
  // redirect= modifier (terminal) - 1 lookup DNS pour le nouveau domaine
  const redirects = spfRecord.match(/redirect=[^\s]+/g) || [];
  dnsLookupMechanisms.push(...redirects);
  
  const totalDnsLookups = dnsLookupMechanisms.length;
  if (totalDnsLookups > 10) {
    errors.push(`Trop de lookups DNS (${totalDnsLookups}/10 max) - mécanismes: ${dnsLookupMechanisms.join(', ')}`);
  }
  
  // Vérifier les qualificateurs dangereux
  if (spfRecord.includes('+all')) {
    errors.push("Qualificateur '+all' dangereux - autorise tous les serveurs. Utiliser '~all' ou '-all'");
  }
  
  // Détecter duplications potentielles
  const uniqueMechanisms = new Set(dnsLookupMechanisms);
  if (uniqueMechanisms.size !== dnsLookupMechanisms.length) {
    errors.push("Mécanismes DNS dupliqués détectés - optimisation possible");
  }
  
  // Longueur maximale RFC
  if (spfRecord.length > 255) {
    errors.push(`Enregistrement trop long (${spfRecord.length}/255 caractères max)`);
  }
  
  // Ordre des mécanismes - 'all' doit être en dernier
  const allPosition = spfRecord.lastIndexOf('all');
  const afterAll = spfRecord.substring(allPosition + 3).trim();
  if (afterAll && !afterAll.startsWith('//')) { // Sauf commentaires
    errors.push("Le qualificateur 'all' doit être le dernier mécanisme");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Domaines utilisés par Kemet Services
export const domainConfig = {
  primaryDomain: "kemetservices.com",
  emailAddresses: [
    "contact@kemetservices.com",
    "noreply@kemetservices.com", 
    "infos@kemetservices.com" // Admin Gmail
  ],
  dnsTTL: 3600 // 1 heure
};

// Instructions DNS pour l'implémentation
export const dnsInstructions = {
  recordType: "TXT",
  hostname: "@", // ou domaine racine
  value: getSPFRecordString(),
  ttl: domainConfig.dnsTTL,
  note: "Remplacer tout enregistrement SPF existant. Un seul enregistrement SPF par domaine."
};