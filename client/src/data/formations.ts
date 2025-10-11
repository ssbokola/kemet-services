// Données de démonstration pour les formations en ligne
export const demoFormations = [
  {
    id: "formation-1",
    title: "Gestion Optimale des Stocks en Pharmacie",
    slug: "gestion-stocks-pharmacie",
    description: "Maîtrisez les techniques modernes de gestion de stock pour réduire les pertes et optimiser vos approvisionnements. Formation complète avec cas pratiques et outils concrets.",
    category: "stock",
    level: "intermediaire",
    duration: 360, // 6 heures
    price: 45000, // 45 000 FCFA
    isPublished: true,
    thumbnail: "/api/placeholder/400/250",
    objectives: [
      "Réduire les ruptures de stock de 50%",
      "Diminuer les périmés de 30%",
      "Optimiser le flux de trésorerie",
      "Maîtriser les indicateurs clés (rotation, couverture)"
    ],
    prerequisites: [
      "Expérience en pharmacie recommandée",
      "Notions de base en gestion"
    ],
    targetAudience: [
      "Pharmaciens titulaires",
      "Pharmaciens adjoints",
      "Responsables d'approvisionnement"
    ],
    modules: [
      {
        id: "m1",
        title: "Les Fondamentaux de la Gestion de Stock",
        description: "Comprendre les principes de base",
        lessons: [
          { id: "l1-1", title: "Introduction à la gestion de stock", duration: 30, isFree: true },
          { id: "l1-2", title: "Les indicateurs de performance", duration: 45 },
          { id: "l1-3", title: "Méthodes de valorisation", duration: 45 }
        ]
      },
      {
        id: "m2",
        title: "Optimisation et Prévisions",
        description: "Techniques avancées de prévision",
        lessons: [
          { id: "l2-1", title: "Analyse ABC", duration: 60 },
          { id: "l2-2", title: "Calcul des stocks de sécurité", duration: 60 },
          { id: "l2-3", title: "Outils de prévision", duration: 60 }
        ]
      },
      {
        id: "m3",
        title: "Cas Pratiques",
        description: "Mise en application",
        lessons: [
          { id: "l3-1", title: "Étude de cas: Officine urbaine", duration: 60 },
          { id: "l3-2", title: "Exercices pratiques", duration: 60 }
        ]
      }
    ]
  },
  {
    id: "formation-2",
    title: "Excellence du Service Client en Pharmacie",
    slug: "service-client-pharmacie",
    description: "Développez vos compétences relationnelles et transformez chaque interaction en opportunité de fidélisation. Formation pratique avec jeux de rôle.",
    category: "quality",
    level: "debutant",
    duration: 240, // 4 heures
    price: 35000,
    isPublished: true,
    thumbnail: "/api/placeholder/400/250",
    objectives: [
      "Améliorer la satisfaction client de 40%",
      "Gérer les situations difficiles avec assurance",
      "Développer la fidélisation",
      "Optimiser le conseil pharmaceutique"
    ],
    prerequisites: [
      "Aucun prérequis"
    ],
    targetAudience: [
      "Pharmaciens",
      "Auxiliaires en pharmacie",
      "Personnel d'accueil"
    ],
    modules: [
      {
        id: "m1",
        title: "Les Fondamentaux de l'Accueil",
        description: "Maîtriser les bases",
        lessons: [
          { id: "l1-1", title: "Première impression et sourire", duration: 30, isFree: true },
          { id: "l1-2", title: "Écoute active", duration: 45 },
          { id: "l1-3", title: "Communication non-verbale", duration: 45 }
        ]
      },
      {
        id: "m2",
        title: "Gestion des Situations Difficiles",
        description: "Techniques de gestion de conflits",
        lessons: [
          { id: "l2-1", title: "Identifier les clients difficiles", duration: 30 },
          { id: "l2-2", title: "Techniques de désescalade", duration: 60 },
          { id: "l2-3", title: "Jeux de rôle", duration: 30 }
        ]
      }
    ]
  },
  {
    id: "formation-3",
    title: "Finance et Rentabilité pour Pharmaciens",
    slug: "finance-rentabilite-pharmacie",
    description: "Comprenez les chiffres de votre officine et prenez des décisions éclairées pour améliorer votre rentabilité. Formation avec tableaux de bord Excel.",
    category: "finance",
    level: "intermediaire",
    duration: 480, // 8 heures
    price: 55000,
    isPublished: true,
    thumbnail: "/api/placeholder/400/250",
    objectives: [
      "Lire et analyser un compte de résultat",
      "Calculer sa marge brute et nette",
      "Identifier les leviers de rentabilité",
      "Construire ses tableaux de bord"
    ],
    prerequisites: [
      "Gestion d'une officine",
      "Bases en comptabilité recommandées"
    ],
    targetAudience: [
      "Pharmaciens titulaires",
      "Futurs acquéreurs d'officine",
      "Responsables financiers"
    ],
    modules: [
      {
        id: "m1",
        title: "Comptabilité Pharmaceutique",
        description: "Les bases comptables",
        lessons: [
          { id: "l1-1", title: "Le compte de résultat", duration: 60, isFree: true },
          { id: "l1-2", title: "Le bilan simplifié", duration: 60 },
          { id: "l1-3", title: "Les ratios clés", duration: 60 }
        ]
      },
      {
        id: "m2",
        title: "Analyse de Rentabilité",
        description: "Comprendre et améliorer sa marge",
        lessons: [
          { id: "l2-1", title: "Calcul de la marge brute", duration: 60 },
          { id: "l2-2", title: "Analyse par catégorie", duration: 60 },
          { id: "l2-3", title: "Point mort et seuil de rentabilité", duration: 60 }
        ]
      },
      {
        id: "m3",
        title: "Tableaux de Bord",
        description: "Outils de pilotage",
        lessons: [
          { id: "l3-1", title: "Construction d'un tableau de bord", duration: 60 },
          { id: "l3-2", title: "Indicateurs de performance", duration: 60 },
          { id: "l3-3", title: "Cas pratique Excel", duration: 60 }
        ]
      }
    ]
  },
  {
    id: "formation-4",
    title: "Management d'Équipe en Pharmacie",
    slug: "management-equipe-pharmacie",
    description: "Devenez un leader inspirant et constituez une équipe performante et motivée. Formation interactive avec mises en situation.",
    category: "hr",
    level: "avance",
    duration: 420, // 7 heures
    price: 50000,
    isPublished: true,
    thumbnail: "/api/placeholder/400/250",
    objectives: [
      "Recruter les bons profils",
      "Motiver et fédérer son équipe",
      "Gérer les conflits efficacement",
      "Développer les compétences individuelles"
    ],
    prerequisites: [
      "Expérience en management souhaitée",
      "Équipe à gérer (2 personnes minimum)"
    ],
    targetAudience: [
      "Pharmaciens titulaires",
      "Pharmaciens adjoints avec responsabilités",
      "Futurs managers"
    ],
    modules: [
      {
        id: "m1",
        title: "Les Fondamentaux du Leadership",
        description: "Devenir un bon leader",
        lessons: [
          { id: "l1-1", title: "Styles de management", duration: 60, isFree: true },
          { id: "l1-2", title: "Communication managériale", duration: 60 },
          { id: "l1-3", title: "Définir une vision", duration: 60 }
        ]
      },
      {
        id: "m2",
        title: "Recrutement et Intégration",
        description: "Construire son équipe",
        lessons: [
          { id: "l2-1", title: "Définir le profil de poste", duration: 45 },
          { id: "l2-2", title: "Techniques d'entretien", duration: 60 },
          { id: "l2-3", title: "Onboarding réussi", duration: 45 }
        ]
      },
      {
        id: "m3",
        title: "Motivation et Performance",
        description: "Faire grandir son équipe",
        lessons: [
          { id: "l3-1", title: "Leviers de motivation", duration: 45 },
          { id: "l3-2", title: "Entretiens individuels", duration: 45 },
          { id: "l3-3", title: "Gestion des conflits", duration: 60 }
        ]
      }
    ]
  },
  {
    id: "formation-5",
    title: "Dispensation et Conseil Pharmaceutique Avancé",
    slug: "conseil-pharmaceutique-avance",
    description: "Perfectionnez votre pratique du conseil pharmaceutique avec des cas cliniques complexes et des protocoles de dispensation structurés.",
    category: "auxiliaires",
    level: "avance",
    duration: 300, // 5 heures
    price: 40000,
    isPublished: true,
    thumbnail: "/api/placeholder/400/250",
    objectives: [
      "Maîtriser les interactions médicamenteuses",
      "Structurer son conseil pharmaceutique",
      "Détecter les signaux d'alerte",
      "Orienter efficacement vers le médecin"
    ],
    prerequisites: [
      "Diplôme de pharmacien requis",
      "Expérience en officine de 1 an minimum"
    ],
    targetAudience: [
      "Pharmaciens en exercice",
      "Pharmaciens préparateurs"
    ],
    modules: [
      {
        id: "m1",
        title: "Protocoles de Dispensation",
        description: "Méthode structurée",
        lessons: [
          { id: "l1-1", title: "La méthode WWHAM", duration: 45, isFree: true },
          { id: "l1-2", title: "Questions ciblées", duration: 45 },
          { id: "l1-3", title: "Check-list de sécurité", duration: 30 }
        ]
      },
      {
        id: "m2",
        title: "Interactions et Contre-indications",
        description: "Sécurité du patient",
        lessons: [
          { id: "l2-1", title: "Interactions majeures", duration: 60 },
          { id: "l2-2", title: "Populations à risque", duration: 60 }
        ]
      },
      {
        id: "m3",
        title: "Cas Cliniques Complexes",
        description: "Mise en pratique",
        lessons: [
          { id: "l3-1", title: "10 cas pratiques commentés", duration: 60 }
        ]
      }
    ]
  }
];

export const categoryLabels: Record<string, string> = {
  quality: "Qualité",
  finance: "Finance",
  stock: "Stock",
  hr: "Ressources Humaines",
  auxiliaires: "Auxiliaires"
};

export const levelLabels: Record<string, string> = {
  debutant: "Débutant",
  intermediaire: "Intermédiaire",
  avance: "Avancé"
};
