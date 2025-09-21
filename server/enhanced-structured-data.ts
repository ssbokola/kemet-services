// Données structurées enrichies avec prix, ratings et disponibilité pour SEO avancé

const SITE_URL = process.env.VITE_SITE_URL || 'https://kemetservices.com';

// Schema détaillé pour les formations avec pricing et disponibilité
export const generateDetailedCoursesSchema = () => {
  const today = new Date();
  const nextMonth = new Date(today);
  nextMonth.setMonth(today.getMonth() + 1);
  
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Formations Pharmaceutiques Professionnelles",
    "description": "Formations certifiantes pour pharmaciens et auxiliaires en Côte d'Ivoire",
    "numberOfItems": 3,
    "itemListElement": [
      {
        "@type": "Course",
        "position": 1,
        "name": "Formation Qualité ISO 9001:2015 pour Pharmacies",
        "description": "Certification qualité complète pour pharmacies d'officine selon les normes ISO 9001:2015",
        "provider": {
          "@type": "EducationalOrganization",
          "name": "Kemet Services",
          "url": SITE_URL,
          "logo": `${SITE_URL}/images/logo.png`,
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": 4.9,
            "reviewCount": 15,
            "bestRating": 5
          }
        },
        "courseMode": ["in-person", "blended"],
        "hasCourseInstance": {
          "@type": "CourseInstance",
          "courseMode": "in-person",
          "startDate": nextMonth.toISOString().split('T')[0],
          "duration": "P3D",
          "instructor": {
            "@type": "Person",
            "name": "Expert ISO 9001 Kemet Services",
            "jobTitle": "Consultant Senior ISO"
          },
          "location": {
            "@type": "Place",
            "name": "Centre de Formation Kemet Services",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Abidjan",
              "addressCountry": "CI"
            }
          }
        },
        "offers": {
          "@type": "Offer",
          "price": 300000,
          "priceCurrency": "XOF",
          "priceValidUntil": new Date(today.getTime() + 90*24*60*60*1000).toISOString().split('T')[0],
          "availability": "https://schema.org/InStock",
          "validFrom": today.toISOString().split('T')[0],
          "category": "Formation Professionnelle",
          "eligibleRegion": {
            "@type": "Country",
            "name": "Côte d'Ivoire"
          },
          "additionalProperty": [
            {
              "@type": "PropertyValue",
              "name": "Certificat",
              "value": "Certificat ISO 9001 reconnu"
            },
            {
              "@type": "PropertyValue", 
              "name": "Support",
              "value": "Manuel de formation complet"
            },
            {
              "@type": "PropertyValue",
              "name": "Suivi",
              "value": "Suivi post-formation 3 mois"
            }
          ]
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": 4.9,
          "reviewCount": 15,
          "bestRating": 5,
          "worstRating": 1
        },
        "timeRequired": "PT24H",
        "inLanguage": "fr",
        "learningResourceType": "Course",
        "educationalLevel": "Professional",
        "teaches": [
          "Système de management de la qualité",
          "Audit interne ISO 9001",
          "Documentation qualité pharmacie",
          "Amélioration continue"
        ]
      },
      {
        "@type": "Course",
        "position": 2,
        "name": "Formation Gestion des Stocks Pharmaceutiques",
        "description": "Maîtrise complète de la gestion des stocks : réduction écarts, gestion périmés, optimisation",
        "provider": {
          "@type": "EducationalOrganization",
          "name": "Kemet Services",
          "url": SITE_URL
        },
        "courseMode": ["in-person", "blended"],
        "offers": {
          "@type": "Offer",
          "price": 250000,
          "priceCurrency": "XOF",
          "priceValidUntil": new Date(today.getTime() + 90*24*60*60*1000).toISOString().split('T')[0],
          "availability": "https://schema.org/InStock",
          "validFrom": today.toISOString().split('T')[0]
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": 4.8,
          "reviewCount": 22,
          "bestRating": 5
        }
      },
      {
        "@type": "Course",
        "position": 3,
        "name": "Formation Trésorerie d'Officine",
        "description": "Optimisation financière et maîtrise de la trésorerie pour pharmacies",
        "provider": {
          "@type": "EducationalOrganization",
          "name": "Kemet Services",
          "url": SITE_URL
        },
        "courseMode": ["in-person"],
        "offers": {
          "@type": "Offer",
          "price": 300000,
          "priceCurrency": "XOF",
          "priceValidUntil": new Date(today.getTime() + 90*24*60*60*1000).toISOString().split('T')[0],
          "availability": "https://schema.org/InStock"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": 4.7,
          "reviewCount": 18,
          "bestRating": 5
        }
      }
    ]
  };
};

// Schema détaillé pour les services de consulting
export const generateDetailedConsultingSchema = () => {
  const today = new Date();
  
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Services de Consultance Pharmaceutique",
    "description": "Solutions de consulting spécialisées pour optimisation des pharmacies d'officine",
    "numberOfItems": 3,
    "itemListElement": [
      {
        "@type": "Service",
        "position": 1,
        "name": "DJANVOUE - Gestion RH et GPEC",
        "description": "Optimisation ressources humaines : état des lieux, objectifs SMART, évaluation compétences/motivation",
        "provider": {
          "@type": "Organization",
          "name": "Kemet Services",
          "url": SITE_URL,
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": 4.8,
            "reviewCount": 12,
            "bestRating": 5
          }
        },
        "serviceType": "Consultance RH",
        "areaServed": {
          "@type": "Country",
          "name": "Côte d'Ivoire"
        },
        "offers": {
          "@type": "Offer",
          "priceSpecification": {
            "@type": "PriceSpecification",
            "priceCurrency": "XOF",
            "minPrice": 500000,
            "maxPrice": 1500000,
            "description": "Devis personnalisé selon les besoins spécifiques",
            "eligibleQuantity": {
              "@type": "QuantitativeValue",
              "minValue": 1,
              "unitText": "mission"
            }
          },
          "availability": "https://schema.org/InStock",
          "validFrom": today.toISOString().split('T')[0],
          "additionalProperty": [
            {
              "@type": "PropertyValue",
              "name": "Diagnostic",
              "value": "Diagnostic RH complet"
            },
            {
              "@type": "PropertyValue",
              "name": "Plan d'action",
              "value": "Plan d'action GPEC"
            },
            {
              "@type": "PropertyValue",
              "name": "Suivi",
              "value": "Suivi 6 mois inclus"
            }
          ]
        },
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "Pack DJANVOUE",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Audit RH initial"
              },
              "description": "État des lieux complet des ressources humaines"
            }
          ]
        }
      },
      {
        "@type": "Service",
        "position": 2,
        "name": "CLIENTÈLE - Acquisition & Fidélisation",
        "description": "Développement clientèle : stratégie commerciale, base clients, suivi satisfaction",
        "provider": {
          "@type": "Organization",
          "name": "Kemet Services",
          "url": SITE_URL
        },
        "offers": {
          "@type": "Offer",
          "priceSpecification": {
            "@type": "PriceSpecification",
            "priceCurrency": "XOF",
            "minPrice": 400000,
            "maxPrice": 1200000
          },
          "availability": "https://schema.org/InStock"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": 4.9,
          "reviewCount": 8
        }
      },
      {
        "@type": "Service",
        "position": 3,
        "name": "Diagnostic Gratuit",
        "description": "Évaluation complète et gratuite de votre pharmacie avec recommandations personnalisées",
        "provider": {
          "@type": "Organization",
          "name": "Kemet Services",
          "url": SITE_URL
        },
        "offers": {
          "@type": "Offer",
          "price": 0,
          "priceCurrency": "XOF",
          "availability": "https://schema.org/InStock",
          "validFrom": today.toISOString().split('T')[0],
          "priceValidUntil": new Date(today.getTime() + 365*24*60*60*1000).toISOString().split('T')[0]
        },
        "isAccessibleForFree": true
      }
    ]
  };
};

// Schema Organisation enrichi avec données financières et opérationnelles
export const generateEnhancedOrganizationSchema = () => {
  const today = new Date();
  
  return {
    "@context": "https://schema.org",
    "@type": ["ProfessionalService", "EducationalOrganization"],
    "@id": `${SITE_URL}#organization`,
    "name": "Kemet Services",
    "alternateName": "Kemet Services CI",
    "description": "Premier centre de formation et consulting pharmaceutique en Côte d'Ivoire et Afrique de l'Ouest",
    "foundingDate": "2018",
    "url": SITE_URL,
    "logo": {
      "@type": "ImageObject",
      "url": `${SITE_URL}/images/logo.png`,
      "width": 300,
      "height": 150
    },
    "image": [
      `${SITE_URL}/images/hero-formation.jpg`,
      `${SITE_URL}/images/consulting.jpg`,
      `${SITE_URL}/images/logo.png`
    ],
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Abidjan",
      "addressLocality": "Abidjan",
      "addressRegion": "Côte d'Ivoire",
      "addressCountry": "CI",
      "postalCode": "00225"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 5.3599517,
      "longitude": -4.0082563,
      "elevation": "50m"
    },
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": "+225-75-90-68-744",
        "contactType": "customer service",
        "availableLanguage": ["French"],
        "areaServed": "CI"
      },
      {
        "@type": "ContactPoint",
        "email": "contact@kemetservices.com",
        "contactType": "customer service",
        "availableLanguage": ["French"]
      }
    ],
    "sameAs": [
      "https://www.linkedin.com/company/kemet-services",
      "https://wa.me/225759068744"
    ],
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "08:00",
        "closes": "18:00"
      }
    ],
    "areaServed": [
      {
        "@type": "Country",
        "name": "Côte d'Ivoire",
        "alternateName": "Ivory Coast"
      },
      {
        "@type": "Country",
        "name": "Burkina Faso"
      },
      {
        "@type": "Country",
        "name": "Mali"
      }
    ],
    "serviceType": [
      "Formation Professionnelle Pharmaceutique",
      "Consultance Opérationnelle",
      "Certification ISO 9001",
      "Audit Pharmacie"
    ],
    "priceRange": "150000-300000 XOF",
    "paymentAccepted": ["Cash", "Credit Card", "Bank Transfer", "Mobile Money"],
    "currenciesAccepted": "XOF",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": 4.8,
      "reviewCount": 47,
      "bestRating": 5,
      "worstRating": 1
    },
    "numberOfEmployees": {
      "@type": "QuantitativeValue",
      "minValue": 8,
      "maxValue": 12,
      "unitText": "employees"
    },
    "knowsAbout": [
      "ISO 9001:2015",
      "Gestion stocks pharmaceutiques",
      "Trésorerie d'officine",
      "GPEC pharmacie",
      "Optimisation processus",
      "Formation continue pharmaceutique",
      "Certification qualité",
      "Consulting pharmaceutique",
      "Système qualité pharmacie",
      "Audit interne",
      "Amélioration continue"
    ],
    "award": [
      "Expert certifié ISO 9001",
      "Consultant agréé pharmacies CI",
      "Centre de formation accrédité"
    ],
    "slogan": "Excellence en Formation et Consulting Pharmaceutique",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Catalogue Services Kemet",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Formation ISO 9001"
          },
          "price": 300000,
          "priceCurrency": "XOF"
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service", 
            "name": "Formation Gestion Stocks"
          },
          "price": 250000,
          "priceCurrency": "XOF"
        }
      ]
    },
    "makesOffer": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Diagnostic Gratuit Pharmacie"
        },
        "price": 0,
        "priceCurrency": "XOF",
        "availability": "https://schema.org/InStock"
      }
    ]
  };
};

// Schema WebSite enrichi pour navigation
export const generateWebSiteSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Kemet Services",
    "alternateName": "Formation Pharmacie Côte d'Ivoire",
    "url": SITE_URL,
    "description": "Premier centre de formation et consulting pharmaceutique en Côte d'Ivoire",
    "inLanguage": "fr-FR",
    "author": {
      "@type": "Organization", 
      "name": "Kemet Services"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Kemet Services",
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE_URL}/images/logo.png`
      }
    },
    "potentialAction": [
      {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${SITE_URL}/search?q={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      }
    ],
    "mainEntity": {
      "@type": "Organization",
      "name": "Kemet Services",
      "url": SITE_URL
    }
  };
};

