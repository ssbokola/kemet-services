import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogType?: 'website' | 'article';
  ogImage?: string;
  keywords?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

const DEFAULT_TITLE = "Kemet Services - Formation et Consultance Pharmacie Côte d'Ivoire et Afrique";
const DEFAULT_DESCRIPTION = "Formations spécialisées et consultance opérationnelle pour pharmacies d'officine en Côte d'Ivoire et Afrique de l'Ouest. Expertise ISO 9001, gestion des stocks, optimisation de la trésorerie, amélioration de la performance. Services pour pharmaciens titulaires et auxiliaires.";
const DEFAULT_KEYWORDS = "formation pharmacie Côte d'Ivoire, consultance pharmacie Afrique, ISO 9001 pharmacie, gestion stocks officine, trésorerie pharmacie, formation pharmacien titulaire, formation auxiliaire pharmacie, consultant pharmaceutique Abidjan, optimisation pharmacie, diagnostic pharmacie gratuit, certification ISO pharmacie, Burkina Faso, Mali, Sénégal, Niger, formation continue pharmacie";
const SITE_URL = import.meta.env.VITE_SITE_URL || "https://kemetservices.com";
const DEFAULT_IMAGE = `${SITE_URL}/images/hero-formation.jpg`;

export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  canonical,
  ogType = 'website',
  ogImage = DEFAULT_IMAGE,
  keywords = DEFAULT_KEYWORDS,
  author = "Équipe Kemet Services",
  publishedTime,
  modifiedTime
}: SEOProps) {
  const fullTitle = title ? `${title} | Kemet Services` : DEFAULT_TITLE;
  const currentUrl = canonical ? `${SITE_URL}${canonical}` : SITE_URL;

  return (
    <Helmet>
      {/* Title */}
      <title>{fullTitle}</title>

      {/* Meta Tags */}
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="fr-FR" />
      <meta name="geo.region" content="CI" />
      <meta name="geo.country" content="Côte d'Ivoire" />
      <meta name="geo.placename" content="Abidjan" />
      <meta name="ICBM" content="5.36, -4.0083" />
      <meta name="DC.coverage" content="Afrique de l'Ouest" />

      {/* Canonical URL */}
      <link rel="canonical" href={currentUrl} />

      {/* Open Graph Tags */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/jpeg" />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:site_name" content="Kemet Services" />
      <meta property="og:locale" content="fr_FR" />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Article specific */}
      {ogType === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {ogType === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {ogType === 'article' && (
        <>
          <meta property="article:author" content={author} />
          <meta property="article:section" content="Pharmacie" />
          <meta property="article:tag" content="formation pharmacie" />
          <meta property="article:tag" content="consultance" />
          <meta property="article:tag" content="Côte d'Ivoire" />
        </>
      )}

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": ["ProfessionalService", "EducationalOrganization"],
          "name": "Kemet Services",
          "description": "Formations spécialisées et consultance opérationnelle pour pharmacies d'officine en Côte d'Ivoire et Afrique de l'Ouest",
          "url": SITE_URL,
          "logo": `${SITE_URL}/images/logo.png`,
          "image": ogImage,
          "sameAs": [
            "https://www.linkedin.com/company/kemet-services",
            "https://wa.me/2250707070707"
          ],
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "CI",
            "addressLocality": "Abidjan",
            "addressRegion": "Côte d'Ivoire",
            "streetAddress": "Abidjan, Côte d'Ivoire"
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer service",
            "availableLanguage": ["French"],
            "telephone": "+225-07-07-07-07-07",
            "email": "contact@kemetservices.com"
          },
          "areaServed": [
            {
              "@type": "Country",
              "name": "Côte d'Ivoire"
            },
            {
              "@type": "Place",
              "name": "Afrique de l'Ouest"
            }
          ],
          "serviceType": "Formation et Consultance Pharmaceutique",
          "knowsAbout": [
            "ISO 9001",
            "Gestion des stocks pharmaceutiques",
            "Trésorerie d'officine",
            "Optimisation des processus",
            "Formation continue pharmaceutique"
          ],
          "makesOffer": [
            {
              "@type": "Service",
              "name": "Formation Qualité ISO 9001",
              "description": "Formation spécialisée pour la certification ISO 9001 des pharmacies d'officine",
              "provider": "Kemet Services",
              "areaServed": "Côte d'Ivoire",
              "audience": {
                "@type": "Audience",
                "audienceType": "Pharmaciens titulaires et auxiliaires"
              }
            },
            {
              "@type": "Service",
              "name": "Formation Gestion des Stocks",
              "description": "Optimisation de la gestion des stocks et réduction des discordances en pharmacie",
              "provider": "Kemet Services",
              "areaServed": "Côte d'Ivoire"
            },
            {
              "@type": "Service",
              "name": "Formation Trésorerie d'Officine",
              "description": "Maîtrise de la trésorerie et optimisation financière des pharmacies",
              "provider": "Kemet Services",
              "areaServed": "Côte d'Ivoire"
            },
            {
              "@type": "Service",
              "name": "Consultance DJANVOUE",
              "description": "Gestion du potentiel humain et optimisation RH en pharmacie",
              "provider": "Kemet Services",
              "areaServed": "Côte d'Ivoire"
            },
            {
              "@type": "Service",
              "name": "Consultance CLIENTÈLE",
              "description": "Stratégies d'acquisition et de fidélisation de clientèle pharmaceutique",
              "provider": "Kemet Services",
              "areaServed": "Côte d'Ivoire"
            },
            {
              "@type": "Service",
              "name": "Diagnostic Gratuit",
              "description": "Audit gratuit des processus et performance des pharmacies d'officine",
              "provider": "Kemet Services",
              "areaServed": "Côte d'Ivoire",
              "priceRange": "Gratuit"
            }
          ],
          "hasCredential": "Expert en formations pharmaceutiques et ISO 9001"
        })}
      </script>
    </Helmet>
  );
}

// Composant spécialisé pour les articles
export function ArticleSEO({
  title,
  description,
  publishedTime,
  modifiedTime,
  canonical,
  keywords
}: Omit<SEOProps, 'ogType'>) {
  return (
    <SEO
      title={title}
      description={description}
      canonical={canonical}
      ogType="article"
      publishedTime={publishedTime}
      modifiedTime={modifiedTime}
      keywords={keywords}
    />
  );
}