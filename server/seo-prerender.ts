import { Request, Response, NextFunction } from 'express';
import { 
  faqSchema, 
  reviewSchema, 
  generateEventsSchema,
  localBusinessSchema,
  generateBreadcrumbSchema 
} from './rich-snippets';
import {
  generateDetailedCoursesSchema,
  generateDetailedConsultingSchema,
  generateEnhancedOrganizationSchema,
  generateWebSiteSchema
} from './enhanced-structured-data';

// Configuration SEO pour chaque route
interface SEOConfig {
  title: string;
  description: string;
  keywords: string;
  ogType: 'website' | 'article';
  ogImage?: string;
  canonical: string;
}

const SITE_URL = process.env.VITE_SITE_URL || 'https://kemetservices.com';
const DEFAULT_IMAGE = `${SITE_URL}/images/hero-formation.jpg`;

// Configuration SEO par route
const routeConfigs: Record<string, SEOConfig> = {
  '/': {
    title: 'Kemet Services - Formation et Consultance Pharmacie Côte d\'Ivoire et Afrique',
    description: 'Formations spécialisées et consultance opérationnelle pour pharmacies d\'officine en Côte d\'Ivoire et Afrique de l\'Ouest. Expertise ISO 9001, gestion des stocks, optimisation de la trésorerie, amélioration de la performance.',
    keywords: 'formation pharmacie Côte d\'Ivoire, consultance pharmacie Afrique, ISO 9001 pharmacie, gestion stocks officine, trésorerie pharmacie',
    ogType: 'website',
    canonical: '/'
  },
  '/formations': {
    title: 'Formations Pharmacie Spécialisées - Qualité, Finance, Stock, RH - Côte d\'Ivoire',
    description: 'Catalogue complet de formations pour pharmaciens : ISO 9001, gestion des stocks, trésorerie, ressources humaines, auxiliaires. Certificats délivrés, formateurs experts.',
    keywords: 'formation pharmacien Côte d\'Ivoire, formation ISO 9001 pharmacie, gestion stocks formation, trésorerie officine formation',
    ogType: 'website',
    canonical: '/formations'
  },
  '/consulting': {
    title: 'Consultance Pharmacie Côte d\'Ivoire - DJANVOUE, CLIENTÈLE, WAYO, TRÉSORERIE, ISO 9001',
    description: 'Services de consultance spécialisés pour pharmacies d\'officine : GPEC et gestion RH, acquisition clientèle, optimisation gestion stocks, trésorerie, risk management, certification ISO 9001.',
    keywords: 'consultant pharmacie Côte d\'Ivoire, GPEC pharmacie, optimisation pharmacie, ISO 9001 consulting, diagnostic pharmacie',
    ogType: 'website',
    canonical: '/consulting'
  },
  '/a-propos': {
    title: 'À Propos - Expert Formation Pharmacie | Fondateur Kemet Services',
    description: 'Découvrez l\'expertise de notre fondateur en formation pharmaceutique et consultance. Vision panafricaine, résultats mesurables, 15+ années d\'expérience.',
    keywords: 'expert formation pharmacie, consultant pharmaceutique Abidjan, expertise ISO 9001 pharmacie',
    ogType: 'website',
    canonical: '/a-propos'
  },
  '/contact': {
    title: 'Contact Kemet Services - Devis Formation & Consultance Pharmacie',
    description: 'Contactez-nous pour un devis personnalisé en formation ou consultance pharmaceutique. Réponse sous 24h, diagnostic gratuit disponible.',
    keywords: 'contact formation pharmacie, devis consultance pharmacie, diagnostic gratuit pharmacie',
    ogType: 'website',
    canonical: '/contact'
  },
  '/diagnostic': {
    title: 'Diagnostic Gratuit Pharmacie - Évaluation Performance & Optimisation',
    description: 'Diagnostic gratuit et confidentiel de votre pharmacie : analyse des processus, identification des axes d\'amélioration, recommandations personnalisées.',
    keywords: 'diagnostic gratuit pharmacie, évaluation pharmacie, audit pharmacie gratuit, diagnostic performance officine',
    ogType: 'website',
    canonical: '/diagnostic'
  },
  '/kemet-echo': {
    title: 'Kemet Echo - Baromètre Client pour Pharmacies | Kemet Services',
    description: 'Kemet Echo : Solution innovante de satisfaction client pour pharmacies et cliniques en Côte d\'Ivoire. CSAT, NPS, enquêtes anonymes, rapports détaillés.',
    keywords: 'satisfaction client pharmacie, baromètre client, NPS pharmacie, CSAT officine, enquête satisfaction',
    ogType: 'website',
    canonical: '/kemet-echo'
  },
  '/galerie': {
    title: 'Galerie Médias | Kemet Services',
    description: 'Galerie photo et médias de Kemet Services. Découvrez nos formations en action, notre identité visuelle et nos moments professionnels en Côte d\'Ivoire.',
    keywords: 'galerie kemet services, photos formations pharmacie, événements pharmacie Abidjan',
    ogType: 'website',
    canonical: '/galerie'
  },
  '/ressources': {
    title: 'Ressources & Articles - Gestion Pharmacie | Kemet Services',
    description: 'Articles, guides et ressources pratiques pour pharmaciens : gestion des stocks, trésorerie, management d\'équipe, qualité officinale.',
    keywords: 'ressources pharmacie, articles gestion officine, guide pharmacien, bonnes pratiques pharmacie',
    ogType: 'website',
    canonical: '/ressources'
  },
  '/bootcamp-stock': {
    title: 'Bootcamp Gestion des Stocks Pharmacie | Kemet Services',
    description: 'Bootcamp intensif de gestion des stocks pour pharmacies d\'officine. Maîtrisez vos approvisionnements, réduisez les périmés et optimisez votre rentabilité.',
    keywords: 'bootcamp stock pharmacie, formation gestion stocks, réduction périmés officine, optimisation approvisionnement',
    ogType: 'website',
    canonical: '/bootcamp-stock'
  },
  '/mentions-legales': {
    title: 'Mentions Légales | Kemet Services',
    description: 'Mentions légales du site kemetservices.com. Éditeur, hébergeur, propriété intellectuelle et conditions d\'utilisation.',
    keywords: 'mentions légales kemet services',
    ogType: 'website',
    canonical: '/mentions-legales'
  },
  '/confidentialite': {
    title: 'Politique de Confidentialité | Kemet Services',
    description: 'Politique de confidentialité et protection des données personnelles de Kemet Services. RGPD, traitement des données, droits des utilisateurs.',
    keywords: 'politique confidentialité kemet services, RGPD, données personnelles',
    ogType: 'website',
    canonical: '/confidentialite'
  },
  '/politique-cookies': {
    title: 'Politique de Cookies | Kemet Services',
    description: 'Politique de cookies du site kemetservices.com. Types de cookies utilisés, gestion des préférences et consentement.',
    keywords: 'cookies kemet services, politique cookies, consentement cookies',
    ogType: 'website',
    canonical: '/politique-cookies'
  },
  '/fdfp': {
    title: 'Formations Pharmacie Éligibles FDFP - Prise en Charge Jusqu\'à 100%',
    description: 'Toutes nos formations pharmacie sont éligibles à la prise en charge FDFP. Kemet Services monte votre dossier. Jusqu\'à 100% financés. 22 formations disponibles.',
    keywords: 'FDFP formation pharmacie, prise en charge FDFP, financement formation Côte d\'Ivoire, FDFP pharmacie, taxe apprentissage formation',
    ogType: 'website',
    canonical: '/fdfp'
  },
  '/faq': {
    title: 'FAQ - Questions Fréquentes | Kemet Services',
    description: 'Réponses à vos questions sur les formations, le consulting, le FDFP, Kemet Echo et nos services pour pharmacies en Côte d\'Ivoire. Tarifs, durée, résultats.',
    keywords: 'FAQ formation pharmacie, questions fréquentes kemet services, FDFP questions, consulting pharmacie questions',
    ogType: 'website',
    canonical: '/faq'
  }
};

// Fonction pour obtenir la configuration SEO d'une route
function getSEOConfig(path: string): SEOConfig {
  // Normaliser le chemin
  const normalizedPath = path === '/' ? '/' : path.replace(/\/$/, '');
  
  // Chercher une configuration exacte
  if (routeConfigs[normalizedPath]) {
    return routeConfigs[normalizedPath];
  }
  
  // Configuration par défaut
  return routeConfigs['/'];
}

// Fonction pour générer les métadonnées HTML avec Rich Snippets
function generateMetaTags(config: SEOConfig, path: string): string {
  const ogImage = config.ogImage || DEFAULT_IMAGE;
  const fullTitle = config.title;
  const currentUrl = `${SITE_URL}${config.canonical}`;
  
  // Générer les rich snippets selon la page
  let richSnippets = '';
  
  // Breadcrumbs pour toutes les pages
  const breadcrumbSchema = generateBreadcrumbSchema(path);
  richSnippets += `
    <!-- Breadcrumbs Schema -->
    <script type="application/ld+json">
    ${JSON.stringify(breadcrumbSchema)}
    </script>`;
  
  // Schémas spécifiques par page avec données enrichies
  switch (path) {
    case '/':
      // Page d'accueil : FAQ + Enhanced Organization + WebSite + Reviews
      const enhancedOrganizationSchema = generateEnhancedOrganizationSchema();
      const websiteSchema = generateWebSiteSchema();
      richSnippets += `
        <!-- FAQ Schema -->
        <script type="application/ld+json">
        ${JSON.stringify(faqSchema)}
        </script>
        
        <!-- Enhanced Organization Schema -->
        <script type="application/ld+json">
        ${JSON.stringify(enhancedOrganizationSchema)}
        </script>
        
        <!-- WebSite Schema -->
        <script type="application/ld+json">
        ${JSON.stringify(websiteSchema)}
        </script>`;
      break;
      
    case '/formations':
      // Page formations : Detailed Courses + Events + Reviews
      const detailedCoursesSchema = generateDetailedCoursesSchema();
      const eventsSchema = generateEventsSchema();
      richSnippets += `
        <!-- Detailed Courses Schema -->
        <script type="application/ld+json">
        ${JSON.stringify(detailedCoursesSchema)}
        </script>
        
        <!-- Events Schema -->
        <script type="application/ld+json">
        ${JSON.stringify(eventsSchema)}
        </script>
        
        <!-- Reviews Schema -->
        <script type="application/ld+json">
        ${JSON.stringify(reviewSchema)}
        </script>`;
      break;
      
    case '/consulting':
      // Page consulting : Detailed Consulting + Reviews
      const detailedConsultingSchema = generateDetailedConsultingSchema();
      richSnippets += `
        <!-- Detailed Consulting Schema -->
        <script type="application/ld+json">
        ${JSON.stringify(detailedConsultingSchema)}
        </script>
        
        <!-- Reviews Schema -->
        <script type="application/ld+json">
        ${JSON.stringify(reviewSchema)}
        </script>`;
      break;
      
    case '/a-propos':
      // Page à propos : Enhanced Organization + Reviews
      const aboutOrgSchema = generateEnhancedOrganizationSchema();
      richSnippets += `
        <!-- Enhanced Organization Schema -->
        <script type="application/ld+json">
        ${JSON.stringify(aboutOrgSchema)}
        </script>
        
        <!-- Reviews Schema -->
        <script type="application/ld+json">
        ${JSON.stringify(reviewSchema)}
        </script>`;
      break;
      
    case '/contact':
      // Page contact : Enhanced Organization pour infos contact
      const contactOrgSchema = generateEnhancedOrganizationSchema();
      richSnippets += `
        <!-- Contact Organization Schema -->
        <script type="application/ld+json">
        ${JSON.stringify(contactOrgSchema)}
        </script>`;
      break;
      
    case '/diagnostic':
      // Page diagnostic : Service de diagnostic gratuit
      const diagnosticConsultingSchema = generateDetailedConsultingSchema();
      richSnippets += `
        <!-- Diagnostic Service Schema -->
        <script type="application/ld+json">
        ${JSON.stringify(diagnosticConsultingSchema)}
        </script>`;
      break;

    case '/fdfp':
    case '/faq':
      // Pages FDFP et FAQ : FAQ Schema (géré côté client via Helmet)
      richSnippets += `
        <!-- FAQ Schema -->
        <script type="application/ld+json">
        ${JSON.stringify(faqSchema)}
        </script>`;
      break;
  }
  
  return `
    <!-- Title -->
    <title>${fullTitle}</title>
    
    <!-- Meta Tags -->
    <meta name="description" content="${config.description}" />
    <meta name="keywords" content="${config.keywords}" />
    <meta name="author" content="Équipe Kemet Services" />
    <meta name="robots" content="index, follow" />
    <meta name="language" content="fr-FR" />
    <meta name="geo.region" content="CI" />
    <meta name="geo.country" content="Côte d'Ivoire" />
    <meta name="geo.placename" content="Abidjan" />
    <meta name="ICBM" content="5.36, -4.0083" />
    <meta name="DC.coverage" content="Afrique de l'Ouest" />
    
    <!-- Canonical URL -->
    <link rel="canonical" href="${currentUrl}" />
    
    <!-- Open Graph Tags -->
    <meta property="og:type" content="${config.ogType}" />
    <meta property="og:title" content="${fullTitle}" />
    <meta property="og:description" content="${config.description}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:image:alt" content="${fullTitle} - Kemet Services" />
    <meta property="og:url" content="${currentUrl}" />
    <meta property="og:site_name" content="Kemet Services" />
    <meta property="og:locale" content="fr_FR" />
    
    <!-- Twitter Cards -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@KemetServices" />
    <meta name="twitter:title" content="${fullTitle}" />
    <meta name="twitter:description" content="${config.description}" />
    <meta name="twitter:image" content="${ogImage}" />
    <meta name="twitter:image:alt" content="${fullTitle} - Kemet Services" />
    
    <!-- Organization Schema géré par Enhanced Schema selon la page -->
    
    ${richSnippets}
  `;
}

// Middleware de pré-rendu SEO
export function seoPrerender(req: Request, res: Response, next: NextFunction) {
  const userAgent = req.get('User-Agent') || '';
  const path = req.path;
  const method = req.method;
  
  // Ne traiter que les requêtes GET HTML
  if (method !== 'GET') {
    return next();
  }
  
  // Exclure les routes API et assets
  if (path.startsWith('/api/') || path.startsWith('/src/') || 
      path.includes('.js') || path.includes('.css') || path.includes('.png') || 
      path.includes('.jpg') || path.includes('.ico') || path.includes('.svg')) {
    return next();
  }
  
  // Détecter les crawlers connus qui ont besoin des métadonnées
  const knownCrawlers = [
    'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider', 
    'yandexbot', 'facebookexternalhit', 'twitterbot', 'linkedinbot', 
    'whatsappexternalhit', 'telegrambot', 'applebot', 'discordbot'
  ];
  
  const isCrawler = knownCrawlers.some(crawler => 
    userAgent.toLowerCase().includes(crawler)
  );
  
  if (!isCrawler) {
    return next();
  }
  
  // Obtenir la configuration SEO pour cette route
  const seoConfig = getSEOConfig(path);
  
  // Générer le HTML avec métadonnées pré-rendues
  const prerenderedHtml = `<!DOCTYPE html>
<html lang="fr-FR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    ${generateMetaTags(seoConfig, path)}
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@400;500;600;700;800&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=Instrument+Serif:ital,wght@0,400;1,400&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <noscript>
      <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">
        <h1>${seoConfig.title}</h1>
        <p>${seoConfig.description}</p>
        <p><strong>JavaScript est requis pour utiliser ce site.</strong></p>
      </div>
    </noscript>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;
  
  res.set('Content-Type', 'text/html');
  res.send(prerenderedHtml);
}

export default seoPrerender;