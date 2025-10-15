import { db } from './db';
import { courses } from '@shared/schema';

/**
 * Script pour créer les 22 formations en présentiel
 * - 12 modules pour auxiliaires (AUX-01 à AUX-12)
 * - 10 modules pour pharmaciens (PHAR-01 à PHAR-10)
 * 
 * Toutes les formations sont en présentiel avec sessions programmées
 */

interface TrainingData {
  code: string;
  title: string;
  category: 'auxiliaires' | 'pharmaciens' | 'quality' | 'finance' | 'stock' | 'hr';
  description: string;
  objectives: string[];
  targetAudience: string[];
  prerequisites: string[];
}

// 12 Modules pour les Auxiliaires (6 heures chacun)
const auxiliairesModules: TrainingData[] = [
  {
    code: 'AUX-01',
    title: 'Accueillir en Officine',
    category: 'auxiliaires',
    description: 'Formation pratique pour maîtriser les techniques d\'accueil et de premier contact avec les clients en officine. Apprenez à créer une expérience client positive dès les premiers instants.',
    objectives: [
      'Maîtriser les techniques d\'accueil professionnel',
      'Créer une première impression positive',
      'Gérer efficacement les premiers contacts clients',
      'Appliquer les bonnes pratiques de communication'
    ],
    targetAudience: ['Auxiliaires de pharmacie', 'Personnel d\'accueil'],
    prerequisites: ['Aucun prérequis']
  },
  {
    code: 'AUX-02',
    title: 'Animer le Comptoir en Officine',
    category: 'auxiliaires',
    description: 'Techniques avancées pour dynamiser les ventes au comptoir, valoriser les produits et optimiser l\'expérience client lors de la délivrance.',
    objectives: [
      'Maîtriser les techniques de vente au comptoir',
      'Valoriser les produits de parapharmacie',
      'Augmenter le panier moyen',
      'Fidéliser la clientèle'
    ],
    targetAudience: ['Auxiliaires de pharmacie', 'Vendeurs en officine'],
    prerequisites: ['Expérience en officine recommandée']
  },
  {
    code: 'AUX-03',
    title: 'Développer son Self Leadership',
    category: 'auxiliaires',
    description: 'Formation au développement personnel et professionnel pour renforcer son autonomie, sa motivation et son efficacité au travail.',
    objectives: [
      'Développer son autonomie professionnelle',
      'Renforcer sa motivation intrinsèque',
      'Gérer son temps et ses priorités',
      'Améliorer sa communication interpersonnelle'
    ],
    targetAudience: ['Auxiliaires de pharmacie', 'Tout personnel d\'officine'],
    prerequisites: ['Aucun prérequis']
  },
  {
    code: 'AUX-04',
    title: 'Gérer Efficacement la Commande en Officine',
    category: 'stock',
    description: 'Maîtrisez le processus de commande pour optimiser les stocks, réduire les ruptures et améliorer la disponibilité des produits.',
    objectives: [
      'Maîtriser le processus de commande',
      'Optimiser les niveaux de stock',
      'Réduire les ruptures de stock',
      'Améliorer la rotation des produits'
    ],
    targetAudience: ['Auxiliaires de pharmacie', 'Gestionnaires de stock'],
    prerequisites: ['Connaissance de base en gestion de stock']
  },
  {
    code: 'AUX-05',
    title: 'Gérer Efficacement les Réclamations Fournisseurs en Officine',
    category: 'quality',
    description: 'Apprenez à traiter professionnellement les réclamations fournisseurs, à documenter les litiges et à obtenir des résolutions satisfaisantes.',
    objectives: [
      'Identifier les types de réclamations',
      'Documenter efficacement les litiges',
      'Communiquer avec les fournisseurs',
      'Obtenir des résolutions rapides'
    ],
    targetAudience: ['Auxiliaires de pharmacie', 'Responsables d\'approvisionnement'],
    prerequisites: ['Expérience en réception de commandes']
  },
  {
    code: 'AUX-06',
    title: 'Gérer les Clients à Crédit en Officine',
    category: 'finance',
    description: 'Techniques de gestion des créances clients, suivi des impayés et recouvrement amiable pour sécuriser la trésorerie de l\'officine.',
    objectives: [
      'Gérer les demandes de crédit',
      'Suivre les comptes clients',
      'Relancer les impayés efficacement',
      'Réduire les créances douteuses'
    ],
    targetAudience: ['Auxiliaires de pharmacie', 'Personnel administratif'],
    prerequisites: ['Notions de base en comptabilité']
  },
  {
    code: 'AUX-07',
    title: 'Améliorer la Qualité de Service à l\'Officine',
    category: 'quality',
    description: 'Formation complète pour élever les standards de qualité de service, mesurer la satisfaction client et mettre en place une démarche d\'amélioration continue.',
    objectives: [
      'Comprendre les attentes clients',
      'Mesurer la qualité de service',
      'Mettre en place des actions correctives',
      'Développer une culture qualité'
    ],
    targetAudience: ['Tout le personnel d\'officine'],
    prerequisites: ['Aucun prérequis']
  },
  {
    code: 'AUX-08',
    title: 'Le Matériel Orthopédique en Officine',
    category: 'auxiliaires',
    description: 'Connaissances approfondies sur le matériel orthopédique : typologie, conseil, adaptation et vente pour mieux servir vos clients.',
    objectives: [
      'Connaître les différents types de matériel orthopédique',
      'Conseiller les clients selon leurs besoins',
      'Assurer la prise de mesures correcte',
      'Gérer le stock de matériel orthopédique'
    ],
    targetAudience: ['Auxiliaires de pharmacie', 'Personnel de vente'],
    prerequisites: ['Connaissances de base en anatomie recommandées']
  },
  {
    code: 'AUX-09',
    title: 'Les Risques Opérationnels en Officine',
    category: 'quality',
    description: 'Identifier, évaluer et gérer les risques opérationnels en officine pour assurer la sécurité des patients et la continuité de l\'activité.',
    objectives: [
      'Identifier les risques opérationnels',
      'Évaluer leur criticité',
      'Mettre en place des mesures préventives',
      'Gérer les incidents et accidents'
    ],
    targetAudience: ['Tout le personnel d\'officine'],
    prerequisites: ['Aucun prérequis']
  },
  {
    code: 'AUX-10',
    title: 'Réceptionner les Médicaments Efficacement',
    category: 'stock',
    description: 'Processus complet de réception des médicaments : contrôles qualité, vérifications réglementaires et traçabilité pour garantir la sécurité.',
    objectives: [
      'Maîtriser le processus de réception',
      'Effectuer les contrôles qualité',
      'Vérifier la conformité réglementaire',
      'Assurer la traçabilité'
    ],
    targetAudience: ['Auxiliaires de pharmacie', 'Personnel de réception'],
    prerequisites: ['Connaissance de base des médicaments']
  },
  {
    code: 'AUX-11',
    title: 'Réduire les Écarts de Stock en Officine',
    category: 'stock',
    description: 'Méthodes pratiques pour identifier les causes d\'écarts de stock, mettre en place des contrôles et réduire significativement les pertes.',
    objectives: [
      'Identifier les causes d\'écarts',
      'Mettre en place des contrôles efficaces',
      'Réduire les pertes et casses',
      'Améliorer la fiabilité des stocks'
    ],
    targetAudience: ['Auxiliaires de pharmacie', 'Gestionnaires de stock'],
    prerequisites: ['Expérience en gestion de stock']
  },
  {
    code: 'AUX-12',
    title: 'Réduire les Périmés en Officine',
    category: 'stock',
    description: 'Stratégies et outils pour minimiser les produits périmés, optimiser la rotation FEFO/FIFO et améliorer la rentabilité de l\'officine.',
    objectives: [
      'Comprendre les causes de péremption',
      'Appliquer la méthode FEFO/FIFO',
      'Mettre en place un système d\'alerte',
      'Réduire les pertes financières'
    ],
    targetAudience: ['Auxiliaires de pharmacie', 'Gestionnaires de stock'],
    prerequisites: ['Connaissance de base en gestion de stock']
  }
];

// 10 Modules pour les Pharmaciens (6 heures chacun)
const pharmaciensModules: TrainingData[] = [
  {
    code: 'PHAR-01',
    title: 'La Finance pour le Pharmacien',
    category: 'pharmaciens',
    description: 'Formation financière complète pour pharmaciens : lecture des états financiers, analyse de rentabilité et pilotage financier de l\'officine.',
    objectives: [
      'Comprendre les états financiers',
      'Analyser la rentabilité de l\'officine',
      'Maîtriser les indicateurs financiers clés',
      'Prendre des décisions financières éclairées'
    ],
    targetAudience: ['Pharmaciens titulaires', 'Pharmaciens adjoints'],
    prerequisites: ['Notions de base en comptabilité']
  },
  {
    code: 'PHAR-02',
    title: 'La Gestion de Clientèle pour le Pharmacien',
    category: 'pharmaciens',
    description: 'Stratégies de fidélisation, segmentation client et développement de la relation client pour pharmaciens d\'officine.',
    objectives: [
      'Segmenter sa clientèle',
      'Développer des stratégies de fidélisation',
      'Gérer la relation client multicanal',
      'Mesurer la satisfaction client'
    ],
    targetAudience: ['Pharmaciens titulaires', 'Pharmaciens adjoints'],
    prerequisites: ['Expérience en officine']
  },
  {
    code: 'PHAR-03',
    title: 'La Gestion de Stock pour le Pharmacien',
    category: 'pharmaciens',
    description: 'Maîtrise complète de la gestion des stocks pharmaceutiques : méthodes d\'optimisation, valorisation et pilotage des stocks.',
    objectives: [
      'Optimiser les niveaux de stock',
      'Maîtriser les méthodes de valorisation',
      'Réduire les immobilisations',
      'Améliorer la rotation des stocks'
    ],
    targetAudience: ['Pharmaciens titulaires', 'Pharmaciens adjoints'],
    prerequisites: ['Connaissance de base en gestion']
  },
  {
    code: 'PHAR-04',
    title: 'La Gestion des Compétences pour le Pharmacien',
    category: 'pharmaciens',
    description: 'Développement et gestion des compétences de l\'équipe officinale : évaluation, formation et plan de développement.',
    objectives: [
      'Évaluer les compétences de l\'équipe',
      'Élaborer des plans de développement',
      'Gérer les formations',
      'Accompagner la montée en compétences'
    ],
    targetAudience: ['Pharmaciens titulaires', 'Pharmaciens managers'],
    prerequisites: ['Expérience en management']
  },
  {
    code: 'PHAR-05',
    title: 'La Gestion des Risques en Officine ISO 31000 v2018',
    category: 'pharmaciens',
    description: 'Mise en œuvre de la norme ISO 31000:2018 pour identifier, évaluer et gérer les risques en officine de manière structurée.',
    objectives: [
      'Comprendre la norme ISO 31000:2018',
      'Identifier les risques en officine',
      'Évaluer et hiérarchiser les risques',
      'Mettre en place un plan de traitement'
    ],
    targetAudience: ['Pharmaciens titulaires', 'Responsables qualité'],
    prerequisites: ['Connaissance de base en management des risques']
  },
  {
    code: 'PHAR-06',
    title: 'La Qualité en Officine',
    category: 'pharmaciens',
    description: 'Démarche qualité complète pour l\'officine : système documentaire, processus, audits internes et amélioration continue.',
    objectives: [
      'Mettre en place un système qualité',
      'Documenter les processus',
      'Réaliser des audits internes',
      'Conduire l\'amélioration continue'
    ],
    targetAudience: ['Pharmaciens titulaires', 'Responsables qualité'],
    prerequisites: ['Aucun prérequis']
  },
  {
    code: 'PHAR-07',
    title: 'Leadership Managérial',
    category: 'pharmaciens',
    description: 'Développement des compétences de leadership pour mobiliser, motiver et diriger efficacement l\'équipe officinale.',
    objectives: [
      'Développer son leadership',
      'Mobiliser et motiver son équipe',
      'Gérer les situations difficiles',
      'Conduire le changement'
    ],
    targetAudience: ['Pharmaciens titulaires', 'Pharmaciens managers'],
    prerequisites: ['Expérience en management recommandée']
  },
  {
    code: 'PHAR-08',
    title: 'Les Tableaux de Bord en Officine FDX 50-171',
    category: 'pharmaciens',
    description: 'Construction et utilisation de tableaux de bord selon la norme FDX 50-171 pour piloter la performance de l\'officine.',
    objectives: [
      'Comprendre la norme FDX 50-171',
      'Construire des tableaux de bord pertinents',
      'Suivre les indicateurs clés',
      'Piloter la performance'
    ],
    targetAudience: ['Pharmaciens titulaires', 'Responsables de gestion'],
    prerequisites: ['Notions de base en gestion']
  },
  {
    code: 'PHAR-09',
    title: 'Management Opérationnel en Officine',
    category: 'pharmaciens',
    description: 'Techniques de management opérationnel quotidien : organisation du travail, planification et coordination des activités.',
    objectives: [
      'Organiser le travail quotidien',
      'Planifier les activités',
      'Coordonner l\'équipe',
      'Résoudre les problèmes opérationnels'
    ],
    targetAudience: ['Pharmaciens titulaires', 'Pharmaciens adjoints'],
    prerequisites: ['Expérience en officine']
  },
  {
    code: 'PHAR-10',
    title: 'Management Stratégique en Officine',
    category: 'pharmaciens',
    description: 'Vision stratégique et planification à long terme pour développer et pérenniser l\'officine dans un environnement en évolution.',
    objectives: [
      'Élaborer une vision stratégique',
      'Analyser l\'environnement concurrentiel',
      'Définir des objectifs stratégiques',
      'Piloter la transformation'
    ],
    targetAudience: ['Pharmaciens titulaires'],
    prerequisites: ['Expérience significative en officine']
  }
];

async function seedOnsiteTrainings() {
  console.log('🌱 Création des formations en présentiel...\n');

  try {
    // Créer les formations pour auxiliaires
    console.log('📚 Création des 12 modules pour auxiliaires...');
    for (const training of auxiliairesModules) {
      const slug = `${training.code.toLowerCase()}-${training.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')}`;

      await db.insert(courses).values({
        title: `${training.code} - ${training.title}`,
        slug,
        description: training.description,
        category: training.category,
        deliveryMode: 'onsite',
        isSessionBased: true,
        defaultDuration: 6, // 6 heures
        defaultPrice: 75000, // 75 000 FCFA par défaut
        defaultLocation: 'Yopougon CHU, Abidjan',
        isPublished: true,
        objectives: training.objectives,
        prerequisites: training.prerequisites,
        targetAudience: training.targetAudience,
      });

      console.log(`  ✅ ${training.code} - ${training.title}`);
    }

    // Créer les formations pour pharmaciens
    console.log('\n📚 Création des 10 modules pour pharmaciens...');
    for (const training of pharmaciensModules) {
      const slug = `${training.code.toLowerCase()}-${training.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')}`;

      await db.insert(courses).values({
        title: `${training.code} - ${training.title}`,
        slug,
        description: training.description,
        category: training.category,
        deliveryMode: 'onsite',
        isSessionBased: true,
        defaultDuration: 6, // 6 heures
        defaultPrice: 95000, // 95 000 FCFA par défaut (pharmaciens)
        defaultLocation: 'Yopougon CHU, Abidjan',
        isPublished: true,
        objectives: training.objectives,
        prerequisites: training.prerequisites,
        targetAudience: training.targetAudience,
      });

      console.log(`  ✅ ${training.code} - ${training.title}`);
    }

    console.log('\n✨ Succès! 22 formations en présentiel créées avec succès.');
    console.log('   - 12 modules pour auxiliaires');
    console.log('   - 10 modules pour pharmaciens\n');

  } catch (error) {
    console.error('❌ Erreur lors de la création des formations:', error);
    throw error;
  }
}

// Exécuter le script si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  seedOnsiteTrainings()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { seedOnsiteTrainings };
