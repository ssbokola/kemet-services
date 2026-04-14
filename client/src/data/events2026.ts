export type EventType = 'master-class' | 'webinaire' | 'formation-auxiliaires';

export interface KemetEvent {
  id: number;
  slug: string;
  title: string;
  type: EventType;
  date: string;           // ISO date or descriptive
  dateLabel: string;       // Label affiché
  month: string;
  description: string;
  format: string;          // "Présentiel", "Zoom", etc.
  duration: string;
  price: number | null;    // null = gratuit
  isFree: boolean;
  targetAudience: 'pharmaciens' | 'auxiliaires';
  cobranding: string | null;
  objectives: string[];
  topics: string[];
  fdfpEligible: boolean;
  maxParticipants: number | null;
  location: string;
}

export const events2026: KemetEvent[] = [
  // ────────────────────────────────────────────
  // FORMATIONS PHARMACIENS
  // ────────────────────────────────────────────
  {
    id: 1,
    slug: 'pharmacien-stratege-tresorerie-parapharmacie',
    title: 'Pharmacien Stratège : trésorerie & parapharmacie',
    type: 'master-class',
    date: '2026-04-23',
    dateLabel: '23 avril 2026',
    month: 'Avril',
    description: 'Une master class intensive pour repenser votre approche stratégique de la trésorerie et du rayon parapharmacie. Apprenez à piloter vos flux financiers tout en maximisant le potentiel de votre espace parapharmacie comme levier de croissance.',
    format: 'Présentiel',
    duration: 'Demi-journée (3h)',
    price: 75000,
    isFree: false,
    targetAudience: 'pharmaciens',
    cobranding: 'AT Agency',
    objectives: [
      'Analyser sa trésorerie avec les bons indicateurs',
      'Identifier les leviers de rentabilité en parapharmacie',
      'Construire une stratégie de développement durable pour son officine',
      'Maîtriser le cycle cash de la parapharmacie'
    ],
    topics: [
      'Tableau de bord trésorerie simplifié',
      'Analyse du BFR officinal',
      'Sélection et rotation des produits parapharmacie',
      'Stratégie de pricing et merchandising',
      'Plan d\'action personnalisé'
    ],
    fdfpEligible: false,
    maxParticipants: 25,
    location: 'Abidjan, Côte d\'Ivoire'
  },
  {
    id: 2,
    slug: 'pourquoi-80-pharmacies-ignorent-cout-fonctionnement',
    title: 'Pourquoi 80% des pharmacies ignorent leur vrai coût de fonctionnement',
    type: 'webinaire',
    date: '2026-05-18',
    dateLabel: 'Semaine du 18 mai 2026',
    month: 'Mai',
    description: 'Un webinaire gratuit qui révèle les coûts cachés qui grèvent silencieusement la rentabilité de votre officine. Découvrez les méthodes pour calculer votre vrai coût de fonctionnement et les leviers pour l\'optimiser.',
    format: 'Zoom',
    duration: '30–45 min',
    price: null,
    isFree: true,
    targetAudience: 'pharmaciens',
    cobranding: null,
    objectives: [
      'Identifier les coûts cachés de votre officine',
      'Calculer votre coût de fonctionnement réel',
      'Comprendre l\'impact sur votre marge nette',
      'Découvrir 3 actions immédiates pour réduire vos charges'
    ],
    topics: [
      'Les 5 postes de coûts sous-estimés',
      'Méthode de calcul du coût complet',
      'Benchmark sectoriel Côte d\'Ivoire',
      'Plan d\'action immédiat'
    ],
    fdfpEligible: false,
    maxParticipants: null,
    location: 'En ligne (Zoom)'
  },
  {
    id: 3,
    slug: 'piloter-achats-ne-plus-subir-grossistes',
    title: 'Piloter ses achats pour ne plus subir ses grossistes',
    type: 'master-class',
    date: '2026-06-22',
    dateLabel: 'Semaine du 22 juin 2026',
    month: 'Juin',
    description: 'Reprenez le contrôle de votre politique d\'achat. Cette master class vous donne les outils et les stratégies pour négocier efficacement avec vos grossistes et optimiser votre approvisionnement.',
    format: 'Présentiel',
    duration: 'Demi-journée (3h)',
    price: 75000,
    isFree: false,
    targetAudience: 'pharmaciens',
    cobranding: 'Partenaire à confirmer',
    objectives: [
      'Auditer sa politique d\'achat actuelle',
      'Définir ses critères de sélection fournisseurs',
      'Maîtriser les techniques de négociation',
      'Construire un tableau de suivi achats'
    ],
    topics: [
      'Analyse ABC de vos achats',
      'Stratégie multi-grossistes',
      'Techniques de négociation appliquées',
      'Gestion des avoirs et retours',
      'Indicateurs de performance achats'
    ],
    fdfpEligible: false,
    maxParticipants: 25,
    location: 'Abidjan, Côte d\'Ivoire'
  },
  {
    id: 4,
    slug: 'equipe-coute-plus-quelle-rapporte',
    title: 'Votre équipe vous coûte-t-elle plus qu\'elle ne vous rapporte ?',
    type: 'webinaire',
    date: '2026-07-13',
    dateLabel: 'Semaine du 13 juillet 2026',
    month: 'Juillet',
    description: 'Un webinaire percutant pour évaluer objectivement la performance de votre équipe officinale. Découvrez les indicateurs clés et les méthodes pour transformer votre masse salariale en investissement rentable.',
    format: 'Zoom',
    duration: '30–45 min',
    price: null,
    isFree: true,
    targetAudience: 'pharmaciens',
    cobranding: null,
    objectives: [
      'Calculer le ratio productivité/masse salariale',
      'Identifier les dysfonctionnements organisationnels',
      'Comprendre le coût réel d\'un recrutement raté',
      'Découvrir les leviers de motivation non-financiers'
    ],
    topics: [
      'Ratio CA/effectif : où vous situez-vous ?',
      'Les signaux d\'alerte RH',
      'Coût visible vs coût caché d\'un collaborateur',
      'Actions correctives immédiates'
    ],
    fdfpEligible: false,
    maxParticipants: null,
    location: 'En ligne (Zoom)'
  },
  {
    id: 5,
    slug: 'structurer-officine-par-la-qualite',
    title: 'Structurer son officine par la qualité',
    type: 'master-class',
    date: '2026-08-18',
    dateLabel: 'Semaine du 18 août 2026',
    month: 'Août',
    description: 'Mettez en place les fondations d\'une démarche qualité structurante dans votre officine. De l\'organisation des processus à la satisfaction patient, découvrez comment la qualité devient un levier de performance.',
    format: 'Présentiel',
    duration: 'Demi-journée (3h)',
    price: 75000,
    isFree: false,
    targetAudience: 'pharmaciens',
    cobranding: null,
    objectives: [
      'Comprendre les principes de la démarche qualité en officine',
      'Cartographier les processus clés de votre pharmacie',
      'Définir des indicateurs de suivi qualité',
      'Initier un plan d\'amélioration continue'
    ],
    topics: [
      'Les 7 principes de la qualité ISO adaptés à l\'officine',
      'Cartographie des processus officinaux',
      'Rédaction de procédures simples et efficaces',
      'Tableaux de bord qualité',
      'Feuille de route vers la certification'
    ],
    fdfpEligible: false,
    maxParticipants: 25,
    location: 'Abidjan, Côte d\'Ivoire'
  },
  {
    id: 6,
    slug: '3-signaux-avant-crise-tresorerie',
    title: 'Les 3 signaux avant une crise de trésorerie',
    type: 'webinaire',
    date: '2026-09-14',
    dateLabel: 'Semaine du 14 septembre 2026',
    month: 'Septembre',
    description: 'Apprenez à détecter les signaux faibles qui précèdent une crise de trésorerie. Ce webinaire vous donne les clés pour anticiper et agir avant qu\'il ne soit trop tard.',
    format: 'Zoom',
    duration: '30–45 min',
    price: null,
    isFree: true,
    targetAudience: 'pharmaciens',
    cobranding: null,
    objectives: [
      'Reconnaître les 3 signaux d\'alerte précoces',
      'Comprendre la spirale de la crise de trésorerie',
      'Mettre en place un système de veille financière',
      'Connaître les actions d\'urgence à déclencher'
    ],
    topics: [
      'Signal 1 : le BFR qui dérape',
      'Signal 2 : la dépendance fournisseur',
      'Signal 3 : l\'érosion silencieuse de la marge',
      'Kit de survie trésorerie'
    ],
    fdfpEligible: false,
    maxParticipants: null,
    location: 'En ligne (Zoom)'
  },
  {
    id: 7,
    slug: 'maitriser-recouvrement-creances',
    title: 'Maîtriser son recouvrement et ses créances',
    type: 'master-class',
    date: '2026-10-13',
    dateLabel: 'Semaine du 13 octobre 2026',
    month: 'Octobre',
    description: 'Le recouvrement est un enjeu majeur pour la santé financière de votre officine. Cette master class vous donne les outils juridiques, relationnels et organisationnels pour sécuriser vos créances.',
    format: 'Présentiel',
    duration: 'Demi-journée (3h)',
    price: 75000,
    isFree: false,
    targetAudience: 'pharmaciens',
    cobranding: 'Partenaire à confirmer',
    objectives: [
      'Auditer son poste créances clients',
      'Mettre en place une politique de crédit officinale',
      'Maîtriser les étapes du recouvrement amiable',
      'Connaître les recours juridiques disponibles'
    ],
    topics: [
      'État des lieux : vos créances en chiffres',
      'Politique de crédit : qui, combien, comment',
      'Relance structurée en 4 étapes',
      'Outils de suivi et tableaux de bord',
      'Cadre juridique OHADA applicable'
    ],
    fdfpEligible: false,
    maxParticipants: 25,
    location: 'Abidjan, Côte d\'Ivoire'
  },
  {
    id: 8,
    slug: 'pharmacien-2027-ce-qui-change',
    title: 'Pharmacien en 2027 : ce qui change',
    type: 'webinaire',
    date: '2026-11-09',
    dateLabel: 'Semaine du 9 novembre 2026',
    month: 'Novembre',
    description: 'Un tour d\'horizon des évolutions réglementaires, technologiques et commerciales qui impacteront votre exercice en 2027. Anticipez les changements pour transformer les contraintes en opportunités.',
    format: 'Zoom',
    duration: '30–45 min',
    price: null,
    isFree: true,
    targetAudience: 'pharmaciens',
    cobranding: null,
    objectives: [
      'Comprendre les évolutions réglementaires à venir',
      'Identifier les tendances technologiques pour l\'officine',
      'Anticiper les changements dans les habitudes patients',
      'Préparer son plan d\'adaptation 2027'
    ],
    topics: [
      'Nouveautés réglementaires 2027',
      'Digitalisation de l\'officine',
      'Évolution du parcours patient',
      'Opportunités de diversification'
    ],
    fdfpEligible: false,
    maxParticipants: null,
    location: 'En ligne (Zoom)'
  },
  {
    id: 9,
    slug: 'bilan-plan-action-2027',
    title: 'Bilan & Plan d\'action 2027',
    type: 'master-class',
    date: '2026-12-08',
    dateLabel: 'Semaine du 8 décembre 2026',
    month: 'Décembre',
    description: 'Clôturez l\'année en force avec un bilan structuré de votre activité 2026 et un plan d\'action concret pour 2027. Méthodes, outils et accompagnement pour démarrer la nouvelle année avec une feuille de route claire.',
    format: 'Présentiel',
    duration: 'Demi-journée (3h)',
    price: 75000,
    isFree: false,
    targetAudience: 'pharmaciens',
    cobranding: null,
    objectives: [
      'Réaliser un bilan synthétique de l\'année 2026',
      'Identifier les réussites et les axes d\'amélioration',
      'Fixer des objectifs SMART pour 2027',
      'Construire un plan d\'action trimestriel'
    ],
    topics: [
      'Méthodologie du bilan annuel',
      'Analyse des KPIs clés de votre officine',
      'Fixation d\'objectifs et priorisation',
      'Construction du plan d\'action 2027',
      'Calendrier de mise en œuvre'
    ],
    fdfpEligible: false,
    maxParticipants: 25,
    location: 'Abidjan, Côte d\'Ivoire'
  },

  // ────────────────────────────────────────────
  // FORMATIONS AUXILIAIRES – FDFP
  // ────────────────────────────────────────────
  {
    id: 10,
    slug: 'gestion-optimisee-commandes-stock',
    title: 'Gestion optimisée des commandes et du stock',
    type: 'formation-auxiliaires',
    date: '2026-05-30',
    dateLabel: 'Samedi 30 mai 2026',
    month: 'Mai',
    description: 'Formation pratique destinée aux auxiliaires en pharmacie pour maîtriser les fondamentaux de la gestion des commandes et du stock. De la réception à l\'inventaire, apprenez les bonnes pratiques pour éviter ruptures et périmés.',
    format: 'Présentiel',
    duration: '3 heures',
    price: 50000,
    isFree: false,
    targetAudience: 'auxiliaires',
    cobranding: null,
    objectives: [
      'Comprendre le cycle de commande en officine',
      'Maîtriser les techniques de réception et contrôle',
      'Gérer les niveaux de stock (min/max/sécurité)',
      'Réduire les périmés et les ruptures'
    ],
    topics: [
      'Le processus de commande étape par étape',
      'Réception et contrôle qualité/quantité',
      'Gestion des niveaux de stock',
      'Rotation des produits (FEFO)',
      'Inventaire et réconciliation'
    ],
    fdfpEligible: true,
    maxParticipants: 30,
    location: 'Abidjan, Côte d\'Ivoire'
  },
  {
    id: 11,
    slug: 'accueil-relation-patient-comptoir',
    title: 'Accueil & relation patient au comptoir',
    type: 'formation-auxiliaires',
    date: '2026-07-25',
    dateLabel: 'Samedi 25 juillet 2026',
    month: 'Juillet',
    description: 'Développez vos compétences relationnelles au comptoir. Cette formation vous apprend les techniques d\'accueil, d\'écoute active et de conseil pour fidéliser vos patients et améliorer la qualité de service.',
    format: 'Présentiel',
    duration: '3 heures',
    price: 50000,
    isFree: false,
    targetAudience: 'auxiliaires',
    cobranding: null,
    objectives: [
      'Maîtriser les fondamentaux de l\'accueil en officine',
      'Pratiquer l\'écoute active et le questionnement',
      'Gérer les situations difficiles au comptoir',
      'Contribuer à la fidélisation des patients'
    ],
    topics: [
      'Les 5 étapes de l\'accueil professionnel',
      'Techniques d\'écoute active',
      'Communication verbale et non-verbale',
      'Gestion des réclamations et conflits',
      'Mises en situation pratiques'
    ],
    fdfpEligible: true,
    maxParticipants: 30,
    location: 'Abidjan, Côte d\'Ivoire'
  },
  {
    id: 12,
    slug: 'reception-controle-reclamations-fournisseurs',
    title: 'Réception, contrôle et réclamations fournisseurs',
    type: 'formation-auxiliaires',
    date: '2026-10-17',
    dateLabel: 'Samedi 17 octobre 2026',
    month: 'Octobre',
    description: 'Formation opérationnelle sur la gestion des réceptions et des réclamations fournisseurs. Apprenez à sécuriser vos approvisionnements et à faire valoir vos droits face aux grossistes.',
    format: 'Présentiel',
    duration: '3 heures',
    price: 50000,
    isFree: false,
    targetAudience: 'auxiliaires',
    cobranding: null,
    objectives: [
      'Appliquer un protocole de réception rigoureux',
      'Détecter les écarts et non-conformités',
      'Rédiger une réclamation fournisseur efficace',
      'Suivre les avoirs et résolutions'
    ],
    topics: [
      'Checklist de réception en 7 points',
      'Contrôle qualité à la réception',
      'Types de non-conformités courantes',
      'Rédaction et suivi des réclamations',
      'Bonnes pratiques documentaires'
    ],
    fdfpEligible: true,
    maxParticipants: 30,
    location: 'Abidjan, Côte d\'Ivoire'
  },
  {
    id: 13,
    slug: 'bonnes-pratiques-officinales-fondamentaux',
    title: 'Bonnes pratiques officinales (BPO) – les fondamentaux',
    type: 'formation-auxiliaires',
    date: '2026-12-13',
    dateLabel: 'Samedi 13 décembre 2026',
    month: 'Décembre',
    description: 'Découvrez les fondamentaux des Bonnes Pratiques Officinales applicables au contexte ivoirien. Une formation essentielle pour garantir la qualité et la sécurité des actes pharmaceutiques au quotidien.',
    format: 'Présentiel',
    duration: '3 heures',
    price: 50000,
    isFree: false,
    targetAudience: 'auxiliaires',
    cobranding: null,
    objectives: [
      'Comprendre le cadre réglementaire des BPO',
      'Appliquer les règles d\'hygiène et de sécurité',
      'Respecter la chaîne du froid et le stockage',
      'Contribuer à la traçabilité des actes officinaux'
    ],
    topics: [
      'Introduction aux BPO',
      'Hygiène et tenue professionnelle',
      'Conservation et stockage des médicaments',
      'Traçabilité et documentation',
      'Dispensation sécurisée'
    ],
    fdfpEligible: true,
    maxParticipants: 30,
    location: 'Abidjan, Côte d\'Ivoire'
  }
];

// Helpers
export function getEventBySlug(slug: string): KemetEvent | undefined {
  return events2026.find(e => e.slug === slug);
}

export function getEventsByType(type: EventType): KemetEvent[] {
  return events2026.filter(e => e.type === type);
}

export function getEventsByAudience(audience: 'pharmaciens' | 'auxiliaires'): KemetEvent[] {
  return events2026.filter(e => e.targetAudience === audience);
}

export function getUpcomingEvents(): KemetEvent[] {
  const now = new Date();
  return events2026
    .filter(e => new Date(e.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function getTypeLabel(type: EventType): string {
  const labels: Record<EventType, string> = {
    'master-class': 'Master Class',
    'webinaire': 'Webinaire Gratuit',
    'formation-auxiliaires': 'Formation Auxiliaires'
  };
  return labels[type];
}

export function getTypeColor(type: EventType): string {
  const colors: Record<EventType, string> = {
    'master-class': 'bg-primary text-primary-foreground',
    'webinaire': 'bg-gold text-white',
    'formation-auxiliaires': 'bg-emerald-700 text-white'
  };
  return colors[type];
}
