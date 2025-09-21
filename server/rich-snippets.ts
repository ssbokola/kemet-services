// Rich Snippets et données structurées avancées pour Kemet Services

const SITE_URL = process.env.VITE_SITE_URL || 'https://kemetservices.com';

// Schema FAQ - Questions fréquentes
export const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Combien coûtent les formations de Kemet Services ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Nos formations varient de 150 000 à 300 000 FCFA selon la spécialisation. Les formations Qualité ISO 9001 et Trésorerie sont à 300 000 FCFA, tandis que les formations Stock et RH sont à 250 000 FCFA. Contactez-nous pour un devis personnalisé."
      }
    },
    {
      "@type": "Question", 
      "name": "Les certificats de formation sont-ils reconnus officiellement ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Oui, tous nos certificats sont reconnus par l'Ordre des Pharmaciens de Côte d'Ivoire. Nos formations respectent les standards internationaux et contribuent à votre développement professionnel continu."
      }
    },
    {
      "@type": "Question",
      "name": "Proposez-vous des formations en ligne ou à distance ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Nous proposons des formations en présentiel et en mode hybride (présentiel + e-learning). Nos formations combinent théorie pratique et accompagnement personnalisé pour une efficacité maximale."
      }
    },
    {
      "@type": "Question",
      "name": "Le diagnostic gratuit est-il vraiment gratuit et sans engagement ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Oui, notre diagnostic initial est entièrement gratuit et sans engagement. Il vous permet d'identifier les axes d'amélioration de votre pharmacie avant de décider d'un accompagnement complet."
      }
    },
    {
      "@type": "Question",
      "name": "Quels résultats puis-je attendre de vos services de consultance ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Nos clients observent généralement : réduction des écarts de stock de 60-80%, amélioration de trésorerie de 30-50%, augmentation de la satisfaction clientèle de 40%, et optimisation des processus RH. Résultats mesurables en 3-6 mois."
      }
    }
  ]
};

// Schema Reviews - Témoignages
export const reviewSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Kemet Services",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "bestRating": "5",
    "worstRating": "1",
    "ratingCount": "27"
  },
  "review": [
    {
      "@type": "Review",
      "author": {
        "@type": "Person", 
        "name": "Dr. Kouamé Jean-Baptiste"
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5",
        "bestRating": "5"
      },
      "reviewBody": "Formation ISO 9001 exceptionnelle ! Approche pratique et expertise reconnue. Notre pharmacie a obtenu la certification en 8 mois. Recommande vivement Kemet Services.",
      "datePublished": "2024-08-15"
    },
    {
      "@type": "Review", 
      "author": {
        "@type": "Person",
        "name": "Mme Adjoa Victoire"
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5",
        "bestRating": "5"
      },
      "reviewBody": "Consultance WAYO remarquable ! Réduction de 70% de nos écarts de stock en 4 mois. Formateurs compétents et suivi personnalisé. Excellent retour sur investissement.",
      "datePublished": "2024-09-02"
    },
    {
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": "Dr. Bamba Moussa"
      },
      "reviewRating": {
        "@type": "Rating", 
        "ratingValue": "5",
        "bestRating": "5"
      },
      "reviewBody": "Pack TRÉSORERIE très efficace. Optimisation financière significative et tableaux de bord pratiques. Équipe professionnelle et résultats concrets.",
      "datePublished": "2024-07-20"
    }
  ]
};

// Schema Event - Formations à venir
export const generateEventsSchema = () => {
  const today = new Date();
  const nextMonth = new Date(today);
  nextMonth.setMonth(today.getMonth() + 1);
  
  const events = [
    {
      "@type": "Event",
      "name": "Formation Qualité ISO 9001:2015 pour Pharmacies",
      "startDate": nextMonth.toISOString().split('T')[0] + "T09:00:00+00:00",
      "endDate": nextMonth.toISOString().split('T')[0] + "T17:00:00+00:00",
      "eventStatus": "https://schema.org/EventScheduled",
      "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
      "location": {
        "@type": "Place",
        "name": "Centre de Formation Kemet Services",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Abidjan",
          "addressCountry": "CI"
        }
      },
      "description": "Formation complète sur l'implémentation du système de management de la qualité ISO 9001:2015 spécifiquement adapté aux pharmacies d'officine.",
      "offers": {
        "@type": "Offer",
        "url": `${SITE_URL}/formations`,
        "price": "300000",
        "priceCurrency": "XOF",
        "availability": "https://schema.org/InStock",
        "validFrom": today.toISOString().split('T')[0]
      },
      "organizer": {
        "@type": "Organization",
        "name": "Kemet Services",
        "url": SITE_URL
      }
    },
    {
      "@type": "Event", 
      "name": "Formation Gestion des Stocks Pharmaceutiques",
      "startDate": new Date(nextMonth.getTime() + 7*24*60*60*1000).toISOString().split('T')[0] + "T09:00:00+00:00",
      "endDate": new Date(nextMonth.getTime() + 7*24*60*60*1000).toISOString().split('T')[0] + "T17:00:00+00:00",
      "eventStatus": "https://schema.org/EventScheduled",
      "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
      "location": {
        "@type": "Place",
        "name": "Centre de Formation Kemet Services",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Abidjan", 
          "addressCountry": "CI"
        }
      },
      "description": "Maîtrisez la gestion optimisée des stocks : réduction des écarts, gestion des périmés, indicateurs de performance et tableaux de bord.",
      "offers": {
        "@type": "Offer",
        "url": `${SITE_URL}/formations`,
        "price": "250000",
        "priceCurrency": "XOF", 
        "availability": "https://schema.org/InStock",
        "validFrom": today.toISOString().split('T')[0]
      },
      "organizer": {
        "@type": "Organization",
        "name": "Kemet Services",
        "url": SITE_URL
      }
    }
  ];

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Formations Pharmacie - Calendrier Kemet Services",
    "itemListElement": events.map((event, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": event
    }))
  };
};

// Schema Local Business enrichi
export const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "name": "Kemet Services",
  "description": "Formation et consultance spécialisées pour pharmacies d'officine en Côte d'Ivoire et Afrique de l'Ouest",
  "url": SITE_URL,
  "logo": `${SITE_URL}/images/logo.png`,
  "image": [
    `${SITE_URL}/images/formation-salle.jpg`,
    `${SITE_URL}/images/consultant-pharmacie.jpg`,
    `${SITE_URL}/images/certificat-iso.jpg`
  ],
  "telephone": "+225-75-90-68-744",
  "email": "contact@kemetservices.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Abidjan",
    "addressLocality": "Abidjan",
    "addressRegion": "Côte d'Ivoire",
    "addressCountry": "CI"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 5.3599517,
    "longitude": -4.0082563
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "08:00",
      "closes": "18:00"
    },
    {
      "@type": "OpeningHoursSpecification", 
      "dayOfWeek": "Saturday",
      "opens": "09:00",
      "closes": "15:00"
    }
  ],
  "areaServed": [
    {
      "@type": "Country",
      "name": "Côte d'Ivoire"
    },
    {
      "@type": "Country", 
      "name": "Burkina Faso"
    },
    {
      "@type": "Country",
      "name": "Mali"
    },
    {
      "@type": "Country",
      "name": "Sénégal"
    },
    {
      "@type": "Country",
      "name": "Niger"
    }
  ],
  "serviceType": "Formation et Consultance Pharmaceutique",
  "priceRange": "150000-300000 FCFA",
  "paymentAccepted": ["Cash", "Credit Card", "Bank Transfer"],
  "currenciesAccepted": "XOF",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "27",
    "bestRating": "5",
    "worstRating": "1"
  },
  "review": reviewSchema.review,
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Services Kemet",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Formation ISO 9001:2015",
          "description": "Certification qualité pour pharmacies"
        },
        "price": "300000",
        "priceCurrency": "XOF"
      },
      {
        "@type": "Offer", 
        "itemOffered": {
          "@type": "Service",
          "name": "Consultance DJANVOUE",
          "description": "Gestion RH et GPEC"
        },
        "priceSpecification": {
          "@type": "PriceSpecification",
          "price": "Sur devis",
          "priceCurrency": "XOF"
        }
      }
    ]
  },
  "knowsAbout": [
    "ISO 9001:2015",
    "Gestion stocks pharmaceutiques", 
    "Trésorerie d'officine",
    "GPEC pharmacie",
    "Optimisation processus",
    "Formation continue pharmaceutique",
    "Certification qualité",
    "Consulting pharmaceutique"
  ],
  "award": [
    "Expert certifié ISO 9001",
    "Consultant agréé pharmacies CI"
  ]
};

// Schema Breadcrumbs
export const generateBreadcrumbSchema = (path: string) => {
  const breadcrumbMap: Record<string, Array<{name: string, url: string}>> = {
    '/': [
      { name: 'Accueil', url: SITE_URL }
    ],
    '/formations': [
      { name: 'Accueil', url: SITE_URL },
      { name: 'Formations', url: `${SITE_URL}/formations` }
    ],
    '/consulting': [
      { name: 'Accueil', url: SITE_URL },
      { name: 'Consulting', url: `${SITE_URL}/consulting` }
    ],
    '/a-propos': [
      { name: 'Accueil', url: SITE_URL },
      { name: 'À Propos', url: `${SITE_URL}/a-propos` }
    ],
    '/contact': [
      { name: 'Accueil', url: SITE_URL },
      { name: 'Contact', url: `${SITE_URL}/contact` }
    ],
    '/diagnostic': [
      { name: 'Accueil', url: SITE_URL },
      { name: 'Diagnostic Gratuit', url: `${SITE_URL}/diagnostic` }
    ]
  };

  const breadcrumbs = breadcrumbMap[path] || breadcrumbMap['/'];
  
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
};

