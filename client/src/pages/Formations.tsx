import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Clock, Users, BookOpen, TrendingUp, Heart, DollarSign } from 'lucide-react';

// Catégories principales par public cible
const mainCategories = [
  { id: 'all', name: 'Toutes les formations', color: 'bg-primary' },
  { id: 'pharmaciens', name: 'Pour les pharmaciens', color: 'bg-chart-2' },
  { id: 'auxiliaires', name: 'Pour les auxiliaires', color: 'bg-chart-1' }
];

// Sous-catégories pour pharmaciens
const pharmacienSubCategories = [
  { id: 'qualite', name: 'Qualité', color: 'bg-chart-2' },
  { id: 'finances', name: 'Finances', color: 'bg-chart-3' },
  { id: 'stock', name: 'Stock', color: 'bg-chart-4' },
  { id: 'potentiel-humain', name: 'Potentiel Humain', color: 'bg-chart-5' }
];

const formations = [
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
    title: 'Mesurer la Performance de son Officine (FDX 50-171)',
    description: 'Utiliser les indicateurs de performance selon la norme FDX 50-171',
    duration: '6h',
    price: '80 000 F',
    format: 'Présentiel',
    icon: TrendingUp,
    objectives: ['Identifier les KPI pertinents', 'Mettre en place un tableau de bord', 'Analyser et améliorer les performances']
  },

  // FINANCES (3 formations)
  {
    id: 6,
    targetAudience: 'pharmaciens',
    category: 'finances',
    title: 'L\'Optimisation Fiscale en Pharmacie',
    description: 'Maîtriser les stratégies d\'optimisation fiscale adaptées aux pharmacies',
    duration: '6h',
    price: '90 000 F',
    format: 'Présentiel',
    icon: DollarSign,
    objectives: ['Comprendre la fiscalité officinale', 'Optimiser les charges fiscales', 'Planifier la fiscalité']
  },
  {
    id: 7,
    targetAudience: 'pharmaciens',
    category: 'finances',
    title: 'La Finance pour le Pharmacien (Cost Killing)',
    description: 'Optimiser la gestion financière et réduire les coûts en officine',
    duration: '8h',
    price: '95 000 F',
    format: 'Présentiel',
    icon: DollarSign,
    objectives: ['Analyser les coûts', 'Identifier les économies possibles', 'Mettre en place un plan d\'action']
  },
  {
    id: 8,
    targetAudience: 'pharmaciens',
    category: 'finances',
    title: 'Le Management Stratégique en Officine',
    description: 'Développer une vision stratégique et piloter la performance de l\'officine',
    duration: '8h',
    price: '100 000 F',
    format: 'Présentiel',
    icon: TrendingUp,
    objectives: ['Élaborer une stratégie', 'Piloter la performance', 'Anticiper les évolutions du marché']
  },

  // STOCK (3 formations)
  {
    id: 9,
    targetAudience: 'pharmaciens',
    category: 'stock',
    title: 'La Gestion des Écarts de Stock',
    description: 'Comprendre les enjeux d\'un stock conforme et maîtriser les bonnes pratiques pour réduire les écarts',
    duration: '4h',
    price: '50 000 F',
    format: 'Présentiel',
    icon: BookOpen,
    objectives: ['Comprendre les enjeux d\'un stock conforme', 'Identifier causes et conséquences des écarts', 'Maîtriser les bonnes pratiques de réduction']
  },
  {
    id: 10,
    targetAudience: 'pharmaciens',
    category: 'stock',
    title: 'La Gestion des Périmés en Officine',
    description: 'Comprendre les causes des péremptions et apprendre les bonnes pratiques de stockage',
    duration: '4h',
    price: '50 000 F',
    format: 'Présentiel',
    icon: Clock,
    objectives: ['Causes et conséquences des périmés', 'Bonnes pratiques de prévention', 'Procédures de stockage optimales']
  },
  {
    id: 11,
    targetAudience: 'pharmaciens',
    category: 'stock',
    title: 'La Gestion des Ruptures en Officine',
    description: 'Anticiper et gérer efficacement les ruptures de stock en pharmacie',
    duration: '4h',
    price: '55 000 F',
    format: 'Présentiel',
    icon: TrendingUp,
    objectives: ['Identifier les causes de rupture', 'Mettre en place des alertes', 'Gérer la relation avec les patients']
  },

  // POTENTIEL HUMAIN (4 formations)
  {
    id: 12,
    targetAudience: 'pharmaciens',
    category: 'potentiel-humain',
    title: 'Développer son Identité Managériale et son Leadership',
    description: 'Renforcer ses compétences de leader et développer son style de management',
    duration: '8h',
    price: '90 000 F',
    format: 'Présentiel',
    icon: Users,
    objectives: ['Définir son style de management', 'Développer son leadership', 'Motiver et fédérer ses équipes']
  },
  {
    id: 13,
    targetAudience: 'pharmaciens',
    category: 'potentiel-humain',
    title: 'La Gestion des Compétences pour le Pharmacien',
    description: 'Optimiser la gestion des compétences et développer les talents de son équipe',
    duration: '6h',
    price: '75 000 F',
    format: 'Présentiel',
    icon: Users,
    objectives: ['Évaluer les compétences', 'Élaborer un plan de développement', 'Accompagner la montée en compétences']
  },
  {
    id: 14,
    targetAudience: 'pharmaciens',
    category: 'potentiel-humain',
    title: 'Réussir son Recrutement en Officine',
    description: 'Maîtriser les techniques de recrutement pour constituer une équipe performante',
    duration: '6h',
    price: '70 000 F',
    format: 'Présentiel',
    icon: Users,
    objectives: ['Définir le profil de poste', 'Mener un entretien efficace', 'Intégrer le nouvel employé']
  },
  {
    id: 15,
    targetAudience: 'pharmaciens',
    category: 'potentiel-humain',
    title: 'Gestion du Changement et du Stress',
    description: 'Accompagner le changement et gérer le stress en milieu professionnel',
    duration: '6h',
    price: '75 000 F',
    format: 'Présentiel',
    icon: Heart,
    objectives: ['Comprendre les mécanismes du changement', 'Gérer la résistance', 'Prévenir et gérer le stress']
  },
  
  // FORMATIONS POUR AUXILIAIRES
  {
    id: 16,
    targetAudience: 'auxiliaires',
    category: 'auxiliaires',
    title: 'Recouvrer Efficacement les Créances',
    description: 'Maîtriser les techniques de recouvrement et améliorer la gestion des impayés',
    duration: '4h',
    price: '50 000 F',
    format: 'Présentiel',
    icon: DollarSign,
    objectives: ['Comprendre les enjeux du recouvrement', 'Maîtriser les techniques de négociation', 'Gérer les situations difficiles']
  },
  {
    id: 17,
    targetAudience: 'auxiliaires',
    category: 'auxiliaires',
    title: 'Maîtriser le Processus Réception et Mise à Disposition des Médicaments',
    description: 'Comprendre les principes de réception et maîtriser les procédures de stockage',
    duration: '4h',
    price: '50 000 F',
    format: 'Présentiel',
    icon: BookOpen,
    objectives: ['Principes de réception des médicaments', 'Vérification des commandes', 'Gestion des retours et situations exceptionnelles']
  },
  {
    id: 18,
    targetAudience: 'auxiliaires',
    category: 'auxiliaires',
    title: 'Initiation aux Bonnes Pratiques Officinales',
    description: 'Découvrir les fondamentaux des bonnes pratiques en pharmacie d\'officine',
    duration: '6h',
    price: '60 000 F',
    format: 'Présentiel',
    icon: Users,
    objectives: ['Comprendre les bonnes pratiques officinales', 'Appliquer les procédures qualité', 'Assurer la conformité réglementaire']
  },
  {
    id: 19,
    targetAudience: 'auxiliaires',
    category: 'auxiliaires',
    title: 'Self Leadership',
    description: 'Développer son leadership personnel et améliorer sa performance individuelle',
    duration: '4h',
    price: '55 000 F',
    format: 'Présentiel',
    icon: Users,
    objectives: ['Développer la confiance en soi', 'Améliorer la communication', 'Gérer son temps et ses priorités']
  },
  {
    id: 20,
    targetAudience: 'auxiliaires',
    category: 'auxiliaires',
    title: 'Gérer Efficacement la Commande en Officine',
    description: 'Maîtriser les techniques de gestion des commandes adaptées aux auxiliaires',
    duration: '4h',
    price: '50 000 F',
    format: 'Présentiel',
    icon: TrendingUp,
    objectives: ['Comprendre le processus de commande', 'Utiliser les outils de gestion', 'Optimiser les approvisionnements']
  },
  {
    id: 21,
    targetAudience: 'auxiliaires',
    category: 'auxiliaires',
    title: 'Optimiser la Relation Client en Officine',
    description: 'Améliorer l\'accueil et le service client pour fidéliser la clientèle',
    duration: '4h',
    price: '50 000 F',
    format: 'Présentiel',
    icon: Heart,
    objectives: ['Maîtriser les techniques d\'accueil', 'Gérer les réclamations', 'Fidéliser la clientèle']
  },
  {
    id: 22,
    targetAudience: 'auxiliaires',
    category: 'auxiliaires',
    title: 'Conseiller l\'Orthopédie en Officine',
    description: 'Identifier les différents types de matériel et conseiller les patients selon leur pathologie',
    duration: '6h',
    price: '50 000 F',
    format: 'Présentiel',
    icon: Heart,
    objectives: ['Identifier les types de matériel orthopédique', 'Conseiller selon la pathologie', 'Assurer un suivi de qualité']
  }
];

export default function Formations() {
  const [selectedMainCategory, setSelectedMainCategory] = useState('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState('all');

  // Filtrage par catégorie principale
  const getFilteredFormations = () => {
    let filtered = formations;
    
    // Filtrer par public cible
    if (selectedMainCategory === 'pharmaciens') {
      filtered = formations.filter(formation => formation.targetAudience === 'pharmaciens');
    } else if (selectedMainCategory === 'auxiliaires') {
      filtered = formations.filter(formation => formation.targetAudience === 'auxiliaires');
    }
    
    // Filtrer par sous-catégorie (seulement si pharmaciens est sélectionné)
    if (selectedMainCategory === 'pharmaciens' && selectedSubCategory !== 'all') {
      filtered = filtered.filter(formation => formation.category === selectedSubCategory);
    }
    
    return filtered;
  };

  const filteredFormations = getFilteredFormations();

  // Réinitialiser la sous-catégorie quand on change de catégorie principale
  const handleMainCategoryChange = (categoryId: string) => {
    setSelectedMainCategory(categoryId);
    setSelectedSubCategory('all');
  };

  const handleInscription = (formationTitle: string) => {
    console.log(`Inscription formation: ${formationTitle}`);
    // In a real app, this would open enrollment form
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-8">
        {/* Hero Section */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold font-serif text-foreground mb-6">
              Catalogue de formations
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Formations spécialisées pour pharmaciens et personnel d'officine en Côte d'Ivoire
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className="py-8 bg-background border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Catégories principales */}
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Choisir votre public cible</h3>
              <div className="flex flex-wrap gap-3 justify-center">
                {mainCategories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedMainCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleMainCategoryChange(category.id)}
                    className={selectedMainCategory === category.id ? category.color : ''}
                    data-testid={`filter-main-${category.id}`}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Sous-catégories pour pharmaciens */}
            {selectedMainCategory === 'pharmaciens' && (
              <div className="text-center">
                <h4 className="text-md font-medium text-muted-foreground mb-3">Spécialités</h4>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button
                    variant={selectedSubCategory === 'all' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSubCategory('all')}
                    className={selectedSubCategory === 'all' ? 'bg-primary' : ''}
                    data-testid="filter-sub-all"
                  >
                    Toutes les spécialités
                  </Button>
                  {pharmacienSubCategories.map((subCategory) => (
                    <Button
                      key={subCategory.id}
                      variant={selectedSubCategory === subCategory.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedSubCategory(subCategory.id)}
                      className={selectedSubCategory === subCategory.id ? subCategory.color : ''}
                      data-testid={`filter-sub-${subCategory.id}`}
                    >
                      {subCategory.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Formations Grid */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Résultats */}
            <div className="text-center mb-8">
              <p className="text-muted-foreground">
                <span className="font-semibold text-foreground">{filteredFormations.length}</span> formation{filteredFormations.length > 1 ? 's' : ''} disponible{filteredFormations.length > 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredFormations.map((formation) => {
                const IconComponent = formation.icon;
                
                // Déterminer l'info de catégorie pour le badge
                const getCategoryInfo = () => {
                  if (formation.targetAudience === 'auxiliaires') {
                    return { name: 'Auxiliaires', color: 'bg-chart-1' };
                  } else {
                    // Pour les pharmaciens, utiliser la sous-catégorie
                    const subCat = pharmacienSubCategories.find(cat => cat.id === formation.category);
                    return subCat || { name: 'Pharmaciens', color: 'bg-chart-2' };
                  }
                };
                
                const categoryInfo = getCategoryInfo();
                
                return (
                  <Card 
                    key={formation.id} 
                    className="hover-elevate transition-all duration-300 border-0 shadow-lg h-full"
                    data-testid={`card-formation-${formation.id}`}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <IconComponent className="w-6 h-6 text-primary" />
                        </div>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${categoryInfo.color} text-white`}
                        >
                          {categoryInfo.name}
                        </Badge>
                      </div>
                      <h3 className="text-xl font-semibold font-serif text-foreground mb-2">
                        {formation.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {formation.description}
                      </p>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        {/* Objectives */}
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-foreground">Objectifs :</h4>
                          {formation.objectives.map((objective, idx) => (
                            <div key={idx} className="flex items-center text-sm text-muted-foreground">
                              <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3"></div>
                              {objective}
                            </div>
                          ))}
                        </div>

                        {/* Details */}
                        <div className="flex items-center justify-between py-4 border-t border-border">
                          <div className="space-y-1">
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Clock className="w-4 h-4 mr-2" />
                              {formation.duration}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formation.format}
                            </div>
                          </div>
                          <div className="text-lg font-semibold text-primary">
                            {formation.price}
                          </div>
                        </div>

                        {/* CTA */}
                        <Button 
                          className="w-full"
                          onClick={() => handleInscription(formation.title)}
                          data-testid={`button-inscription-${formation.id}`}
                        >
                          S'inscrire
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}