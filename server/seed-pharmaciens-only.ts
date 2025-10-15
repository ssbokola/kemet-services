import { db } from './db';
import { courses } from '@shared/schema';

/**
 * Script pour créer uniquement les 10 formations pharmaciens
 */

interface TrainingData {
  code: string;
  title: string;
  category: 'pharmaciens';
  description: string;
  objectives: string[];
  targetAudience: string[];
  prerequisites: string[];
}

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

async function seedPharmaciens() {
  console.log('🌱 Création des 10 formations pharmaciens...\n');

  try {
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
        defaultDuration: 6,
        defaultPrice: 95000, // 95 000 FCFA
        defaultLocation: 'Yopougon CHU, Abidjan',
        isPublished: true,
        objectives: training.objectives,
        prerequisites: training.prerequisites,
        targetAudience: training.targetAudience,
      });

      console.log(`  ✅ ${training.code} - ${training.title}`);
    }

    console.log('\n✨ Succès! 10 formations pharmaciens créées.\n');

  } catch (error) {
    console.error('❌ Erreur:', error);
    throw error;
  }
}

seedPharmaciens()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
