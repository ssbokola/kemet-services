import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Clock, Users, BookOpen, TrendingUp, Heart, DollarSign } from 'lucide-react';

const categories = [
  { id: 'all', name: 'Toutes', color: 'bg-primary' },
  { id: 'qualite', name: 'Qualité', color: 'bg-chart-2' },
  { id: 'finances', name: 'Finances', color: 'bg-chart-3' },
  { id: 'stock', name: 'Stock', color: 'bg-chart-4' },
  { id: 'rh', name: 'Ressources Humaines', color: 'bg-chart-5' },
  { id: 'auxiliaires', name: 'Auxiliaires', color: 'bg-chart-1' }
];

const formations = [
  // Qualité
  {
    id: 1,
    category: 'qualite',
    title: 'Initiation à la qualité (ISO 9001:2015)',
    description: 'Comprendre et mettre en œuvre les principes de la qualité selon la norme ISO 9001:2015',
    duration: '2 jours',
    price: '150 000 F',
    format: 'Présentiel',
    icon: BookOpen,
    objectives: ['Maîtriser les exigences ISO 9001:2015', 'Développer un système qualité', 'Préparer la certification']
  },
  {
    id: 2,
    category: 'qualite',
    title: 'L\'écoute client en officine',
    description: 'Techniques d\'écoute active et de gestion de la relation client en pharmacie',
    duration: '1 jour',
    price: '75 000 F',
    format: 'Présentiel/Distanciel',
    icon: Heart,
    objectives: ['Améliorer l\'accueil client', 'Gérer les situations difficiles', 'Fidéliser la clientèle']
  },
  {
    id: 3,
    category: 'qualite',
    title: 'Gestion des risques (ISO 31000:2018)',
    description: 'Identifier, évaluer et maîtriser les risques dans l\'environnement officinal',
    duration: '2 jours',
    price: '140 000 F',
    format: 'Présentiel',
    icon: BookOpen,
    objectives: ['Cartographier les risques', 'Mettre en place des mesures préventives', 'Suivre l\'efficacité']
  },
  // Finances
  {
    id: 4,
    category: 'finances',
    title: 'Optimisation fiscale en pharmacie',
    description: 'Stratégies légales d\'optimisation fiscale pour pharmacies d\'officine',
    duration: '1 jour',
    price: '90 000 F',
    format: 'Présentiel',
    icon: DollarSign,
    objectives: ['Comprendre la fiscalité', 'Optimiser les charges', 'Planifier les investissements']
  },
  {
    id: 5,
    category: 'finances',
    title: 'Finance pour le pharmacien',
    description: 'Gestion financière et cost killing pour améliorer la rentabilité',
    duration: '2 jours',
    price: '160 000 F',
    format: 'Présentiel',
    icon: TrendingUp,
    objectives: ['Analyser la performance financière', 'Réduire les coûts', 'Améliorer la marge']
  },
  // Stock
  {
    id: 6,
    category: 'stock',
    title: 'Gestion des écarts de stock',
    description: 'Réduire les écarts à moins de 2 par mois grâce à des méthodes éprouvées',
    duration: '2h',
    price: '50 000 F',
    format: 'Présentiel',
    icon: BookOpen,
    objectives: ['Méthodes FIFO/FEFO', 'Outils de suivi', 'Réduction des pertes']
  },
  {
    id: 7,
    category: 'stock',
    title: 'Gestion des périmés en officine',
    description: 'FEFO optimisé et système d\'alertes pour minimiser les pertes',
    duration: '2h',
    price: '50 000 F',
    format: 'Présentiel',
    icon: Clock,
    objectives: ['Alertes automatiques', 'Rotation optimale', 'Réduction déchets']
  },
  // RH
  {
    id: 8,
    category: 'rh',
    title: 'Identité managériale & leadership',
    description: 'Développer son style de management et ses compétences de leader',
    duration: '2 jours',
    price: '140 000 F',
    format: 'Présentiel',
    icon: Users,
    objectives: ['Définir son style managérial', 'Motiver son équipe', 'Gérer les conflits']
  },
  // Auxiliaires
  {
    id: 9,
    category: 'auxiliaires',
    title: 'Réception & mise à disposition des médicaments',
    description: 'Processus standardisé pour la réception et le stockage des médicaments',
    duration: '1 jour',
    price: '65 000 F',
    format: 'Présentiel',
    icon: BookOpen,
    objectives: ['Contrôle qualité réception', 'Stockage optimal', 'Traçabilité']
  }
];

export default function Formations() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredFormations = selectedCategory === 'all' 
    ? formations 
    : formations.filter(formation => formation.category === selectedCategory);

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
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className={selectedCategory === category.id ? category.color : ''}
                  data-testid={`filter-${category.id}`}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Formations Grid */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredFormations.map((formation) => {
                const IconComponent = formation.icon;
                const categoryInfo = categories.find(cat => cat.id === formation.category);
                
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
                          className={`text-xs ${categoryInfo?.color} text-white`}
                        >
                          {categoryInfo?.name}
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