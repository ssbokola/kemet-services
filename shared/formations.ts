import { LucideIcon, Users, BookOpen, TrendingUp, Heart, DollarSign, Package, BarChart3, Shield, Clock } from 'lucide-react';

export interface Formation {
  id: number;
  targetAudience: 'pharmaciens' | 'auxiliaires';
  category: string;
  title: string;
  description: string;
  duration: string;
  price: string;
  format: string;
  icon: LucideIcon;
  objectives: string[];
}

// Catégories principales par public cible
export const mainCategories = [
  { id: 'all', name: 'Toutes les formations', color: 'bg-primary' },
  { id: 'pharmaciens', name: 'Pour les pharmaciens', color: 'bg-chart-2' },
  { id: 'auxiliaires', name: 'Pour les auxiliaires', color: 'bg-chart-1' }
];

// Sous-catégories pour pharmaciens
export const pharmacienSubCategories = [
  { id: 'qualite', name: 'Qualité', color: 'bg-chart-2' },
  { id: 'finances', name: 'Finances', color: 'bg-chart-3' },
  { id: 'stock', name: 'Stock', color: 'bg-chart-4' },
  { id: 'potentiel-humain', name: 'Potentiel Humain', color: 'bg-chart-5' }
];

export const formations: Formation[] = [
  // FORMATIONS POUR PHARMACIENS
  
  // QUALITÉ (5 formations)
  {
    id: 1,
    targetAudience: 'pharmaciens',
    category: 'qualite',
    title: 'Initiation à la Qualité (Norme ISO 9001-V2015)',
    description: 'Découvrir les fondamentaux de la norme ISO 9001 version 2015 appliquée à la pharmacie',
    duration: '6h',
    price: '75 000 F',
    format: 'Présentiel',
    icon: Users,
    objectives: ['Comprendre les exigences ISO 9001-2015', 'Mettre en place un système qualité', 'Préparer la certification']
  },
  {
    id: 2,
    targetAudience: 'pharmaciens',
    category: 'qualite',
    title: 'La Gestion des Risques pour le Pharmacien (ISO 31000 V2018)',
    description: 'Maîtriser la gestion des risques selon la norme ISO 31000 version 2018',
    duration: '6h',
    price: '80 000 F',
    format: 'Présentiel',
    icon: Users,
    objectives: ['Identifier et évaluer les risques', 'Mettre en place un plan de gestion', 'Suivre et améliorer le processus']
  },
  {
    id: 3,
    targetAudience: 'pharmaciens',
    category: 'qualite',
    title: 'Les Bonnes Pratiques Officinales',
    description: 'Maîtriser les bonnes pratiques officinales pour une pharmacie conforme',
    duration: '8h',
    price: '90 000 F',
    format: 'Présentiel',
    icon: BookOpen,
    objectives: ['Appliquer les BPO', 'Assurer la conformité réglementaire', 'Améliorer la qualité de service']
  },
  {
    id: 4,
    targetAudience: 'pharmaciens',
    category: 'qualite',
    title: 'Le Management par Objectif',
    description: 'Développer un management efficace basé sur la définition et l\'atteinte d\'objectifs',
    duration: '6h',
    price: '85 000 F',
    format: 'Présentiel',
    icon: TrendingUp,
    objectives: ['Définir des objectifs SMART', 'Mettre en place un suivi', 'Motiver les équipes']
  },
  {
    id: 5,
    targetAudience: 'pharmaciens',
    category: 'qualite',
    title: 'Les Bonnes Pratiques de Pharmacovigilance',
    description: 'Maîtriser la pharmacovigilance et le signalement des effets indésirables',
    duration: '4h',
    price: '65 000 F',
    format: 'Présentiel',
    icon: Heart,
    objectives: ['Comprendre la pharmacovigilance', 'Savoir signaler les effets indésirables', 'Assurer la sécurité patients']
  },

  // FINANCES (4 formations)
  {
    id: 6,
    targetAudience: 'pharmaciens',
    category: 'finances',
    title: 'La Gestion Financière de l\'Officine',
    description: 'Maîtriser la gestion financière et budgétaire de votre pharmacie',
    duration: '8h',
    price: '95 000 F',
    format: 'Présentiel',
    icon: DollarSign,
    objectives: ['Analyser la rentabilité', 'Optimiser la trésorerie', 'Planifier les investissements']
  },
  {
    id: 7,
    targetAudience: 'pharmaciens',
    category: 'finances',
    title: 'L\'Analyse des Ratios Financiers',
    description: 'Utiliser les ratios financiers pour piloter votre officine',
    duration: '6h',
    price: '80 000 F',
    format: 'Présentiel',
    icon: BarChart3,
    objectives: ['Calculer les ratios clés', 'Interpréter les résultats', 'Prendre des décisions éclairées']
  },
  {
    id: 8,
    targetAudience: 'pharmaciens',
    category: 'finances',
    title: 'La Négociation avec les Fournisseurs',
    description: 'Améliorer vos conditions d\'achat par la négociation',
    duration: '4h',
    price: '70 000 F',
    format: 'Présentiel',
    icon: Users,
    objectives: ['Préparer la négociation', 'Techniques de négociation', 'Fidéliser les partenaires']
  },
  {
    id: 9,
    targetAudience: 'pharmaciens',
    category: 'finances',
    title: 'Le Contrôle de Gestion en Officine',
    description: 'Mettre en place un contrôle de gestion efficace',
    duration: '6h',
    price: '85 000 F',
    format: 'Présentiel',
    icon: BarChart3,
    objectives: ['Définir les indicateurs', 'Analyser les écarts', 'Corriger les dérives']
  },

  // STOCK (4 formations)
  {
    id: 10,
    targetAudience: 'pharmaciens',
    category: 'stock',
    title: 'La Gestion des Périmés en Officine',
    description: 'Réduire drastiquement vos périmés par une gestion optimisée',
    duration: '6h',
    price: '80 000 F',
    format: 'Présentiel',
    icon: Package,
    objectives: ['Organiser le rangement FEFO', 'Mettre en place des alertes', 'Réduire les pertes']
  },
  {
    id: 11,
    targetAudience: 'pharmaciens',
    category: 'stock',
    title: 'L\'Optimisation des Commandes',
    description: 'Optimiser vos commandes pour réduire les ruptures et le sur-stock',
    duration: '8h',
    price: '90 000 F',
    format: 'Présentiel',
    icon: Package,
    objectives: ['Calculer les stocks de sécurité', 'Planifier les commandes', 'Utiliser les outils digitaux']
  },
  {
    id: 12,
    targetAudience: 'pharmaciens',
    category: 'stock',
    title: 'L\'Inventaire Tournant et Annuel',
    description: 'Maîtriser les techniques d\'inventaire pour une gestion précise',
    duration: '4h',
    price: '65 000 F',
    format: 'Présentiel',
    icon: BarChart3,
    objectives: ['Organiser l\'inventaire', 'Analyser les écarts', 'Corriger les erreurs']
  },
  {
    id: 13,
    targetAudience: 'pharmaciens',
    category: 'stock',
    title: 'La Gestion des Stupéfiants et Assimilés',
    description: 'Respecter la réglementation sur les stupéfiants et psychotropes',
    duration: '4h',
    price: '70 000 F',
    format: 'Présentiel',
    icon: Shield,
    objectives: ['Connaître la réglementation', 'Gérer les stocks sécurisés', 'Tenir les registres']
  },

  // POTENTIEL HUMAIN (4 formations)
  {
    id: 14,
    targetAudience: 'pharmaciens',
    category: 'potentiel-humain',
    title: 'Le Leadership et Management d\'Équipe',
    description: 'Développer vos compétences de leader pour motiver votre équipe',
    duration: '8h',
    price: '95 000 F',
    format: 'Présentiel',
    icon: Users,
    objectives: ['Développer son leadership', 'Motiver les équipes', 'Gérer les conflits']
  },
  {
    id: 15,
    targetAudience: 'pharmaciens',
    category: 'potentiel-humain',
    title: 'La Communication Efficace en Officine',
    description: 'Améliorer la communication interne et externe de votre pharmacie',
    duration: '6h',
    price: '80 000 F',
    format: 'Présentiel',
    icon: Users,
    objectives: ['Techniques de communication', 'Gestion des conflits', 'Communication client']
  },
  {
    id: 16,
    targetAudience: 'pharmaciens',
    category: 'potentiel-humain',
    title: 'L\'Évaluation et Formation du Personnel',
    description: 'Mettre en place un système d\'évaluation et de formation continue',
    duration: '6h',
    price: '85 000 F',
    format: 'Présentiel',
    icon: BookOpen,
    objectives: ['Évaluer les performances', 'Planifier les formations', 'Développer les compétences']
  },
  {
    id: 17,
    targetAudience: 'pharmaciens',
    category: 'potentiel-humain',
    title: 'La Gestion du Stress et du Bien-être au Travail',
    description: 'Créer un environnement de travail sain et productif',
    duration: '4h',
    price: '70 000 F',
    format: 'Présentiel',
    icon: Heart,
    objectives: ['Identifier les sources de stress', 'Techniques de gestion', 'Améliorer le bien-être']
  },

  // FORMATIONS POUR AUXILIAIRES (7 formations)
  {
    id: 18,
    targetAudience: 'auxiliaires',
    category: 'service-client',
    title: 'L\'Accueil et Service Client d\'Excellence',
    description: 'Développer un accueil professionnel et chaleureux pour fidéliser la clientèle',
    duration: '6h',
    price: '60 000 F',
    format: 'Présentiel',
    icon: Heart,
    objectives: ['Techniques d\'accueil', 'Gérer les réclamations', 'Fidéliser les clients']
  },
  {
    id: 19,
    targetAudience: 'auxiliaires',
    category: 'vente-conseil',
    title: 'Les Techniques de Vente et de Conseil',
    description: 'Maîtriser les techniques de vente éthique et de conseil pharmaceutique',
    duration: '8h',
    price: '70 000 F',
    format: 'Présentiel',
    icon: TrendingUp,
    objectives: ['Identifier les besoins', 'Argumenter les conseils', 'Conclure la vente']
  },
  {
    id: 20,
    targetAudience: 'auxiliaires',
    category: 'gestion-produits',
    title: 'La Connaissance des Produits Pharmaceutiques',
    description: 'Approfondir vos connaissances sur les médicaments et parapharmacie',
    duration: '6h',
    price: '65 000 F',
    format: 'Présentiel',
    icon: BookOpen,
    objectives: ['Classifications thérapeutiques', 'Indications et contre-indications', 'Conseils associés']
  },
  {
    id: 21,
    targetAudience: 'auxiliaires',
    category: 'gestion-administrative',
    title: 'La Gestion de Commande et Facturation',
    description: 'Maîtriser les processus administratifs de l\'officine',
    duration: '4h',
    price: '55 000 F',
    format: 'Présentiel',
    icon: BarChart3,
    objectives: ['Gérer les commandes', 'Facturation et encaissements', 'Suivi des stocks']
  },
  {
    id: 22,
    targetAudience: 'auxiliaires',
    category: 'hygiene-securite',
    title: 'L\'Hygiène et Sécurité en Officine',
    description: 'Respecter les règles d\'hygiène et de sécurité dans l\'officine',
    duration: '4h',
    price: '50 000 F',
    format: 'Présentiel',
    icon: Shield,
    objectives: ['Règles d\'hygiène', 'Prévention des risques', 'Gestion des urgences']
  },
  {
    id: 23,
    targetAudience: 'auxiliaires',
    category: 'communication',
    title: 'La Communication Professionnelle',
    description: 'Développer une communication professionnelle efficace',
    duration: '6h',
    price: '60 000 F',
    format: 'Présentiel',
    icon: Users,
    objectives: ['Communication verbale et non-verbale', 'Écoute active', 'Gestion des émotions']
  },
  {
    id: 24,
    targetAudience: 'auxiliaires',
    category: 'gestion-situations',
    title: 'La Gestion des Situations Difficiles',
    description: 'Gérer efficacement les situations délicates et les clients difficiles',
    duration: '4h',
    price: '55 000 F',
    format: 'Présentiel',
    icon: Clock,
    objectives: ['Désamorcer les tensions', 'Techniques de médiation', 'Rester professionnel']
  }
];

// Fonctions utilitaires
export const getFormationById = (id: number): Formation | undefined => {
  return formations.find(formation => formation.id === id);
};

export const getFormationsByCategory = (category: string): Formation[] => {
  if (category === 'all') return formations;
  if (category === 'pharmaciens') return formations.filter(f => f.targetAudience === 'pharmaciens');
  if (category === 'auxiliaires') return formations.filter(f => f.targetAudience === 'auxiliaires');
  return formations.filter(formation => formation.category === category);
};

export const getFormationsByTargetAudience = (targetAudience: 'pharmaciens' | 'auxiliaires'): Formation[] => {
  return formations.filter(formation => formation.targetAudience === targetAudience);
};