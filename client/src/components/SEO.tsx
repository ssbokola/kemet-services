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

const DEFAULT_TITLE = "Kemet Services - Formation et Consultance Pharmacie Côte d'Ivoire";
const DEFAULT_DESCRIPTION = "Formations ciblées et consultance opérationnelle pour pharmacies d'officine en Côte d'Ivoire. Expertise ISO, gestion des stocks, optimisation de la trésorerie et performance.";
const DEFAULT_KEYWORDS = "formation pharmacie, consultance pharmacie, Côte d'Ivoire, ISO 9001, gestion stocks, trésorerie officine, performance pharmacie";
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
          "@type": "ProfessionalService",
          "name": "Kemet Services",
          "description": "Formations ciblées et consultance opérationnelle pour pharmacies d'officine en Côte d'Ivoire",
          "url": SITE_URL,
          "logo": `${SITE_URL}/images/logo.png`,
          "image": ogImage,
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "CI",
            "addressLocality": "Abidjan",
            "addressRegion": "Côte d'Ivoire"
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer service",
            "availableLanguage": ["French"]
          },
          "areaServed": {
            "@type": "Country",
            "name": "Côte d'Ivoire"
          },
          "makesOffer": [
            {
              "@type": "Service",
              "name": "Formation professionnelle pharmaceutique",
              "description": "Formations ISO 9001, gestion des stocks, trésorerie pour pharmaciens et auxiliaires"
            },
            {
              "@type": "Service",
              "name": "Consultance pharmaceutique",
              "description": "Audit et optimisation des processus d'officine en Côte d'Ivoire"
            },
            {
              "@type": "Service", 
              "name": "Certification ISO",
              "description": "Accompagnement à la certification ISO 9001 pour pharmacies"
            }
          ]
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