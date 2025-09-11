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
  // Stock - Formations phares basées sur les fiches commerciales
  {
    id: 1,
    category: 'stock',
    title: 'Réduire les Écarts de Stock',
    description: 'Comprendre les enjeux d\'un stock conforme et maîtriser les bonnes pratiques pour réduire les écarts',
    duration: '4h',
    price: '50 000 F',
    format: 'Présentiel',
    icon: BookOpen,
    objectives: ['Comprendre les enjeux d\'un stock conforme', 'Identifier causes et conséquences des écarts', 'Maîtriser les bonnes pratiques de réduction']
  },
  {
    id: 2,
    category: 'stock',
    title: 'Réduire les Périmés en Pharmacie',
    description: 'Comprendre les causes des péremptions et apprendre les bonnes pratiques de stockage',
    duration: '4h',
    price: '50 000 F',
    format: 'Présentiel',
    icon: Clock,
    objectives: ['Causes et conséquences des périmés', 'Bonnes pratiques de prévention', 'Procédures de stockage optimales']
  },
  {
    id: 3,
    category: 'stock',
    title: 'Gérer Efficacement la Commande',
    description: 'Maîtriser les techniques de gestion des stocks et optimiser le processus de commande',
    duration: '4h',
    price: '50 000 F',
    format: 'Présentiel',
    icon: TrendingUp,
    objectives: ['Comprendre les enjeux de gestion des commandes', 'Maîtriser les techniques de gestion', 'Optimiser pour réduire coûts et améliorer satisfaction']
  },
  // Auxiliaires
  {
    id: 4,
    category: 'auxiliaires',
    title: 'Réceptionner Efficacement les Médicaments',
    description: 'Comprendre les principes de réception et maîtriser les procédures de stockage',
    duration: '4h',
    price: '50 000 F',
    format: 'Présentiel',
    icon: BookOpen,
    objectives: ['Principes de réception des médicaments', 'Vérification des commandes', 'Gestion des retours et situations exceptionnelles']
  },
  {
    id: 5,
    category: 'auxiliaires',
    title: 'Conseiller le Matériel Orthopédique',
    description: 'Identifier les différents types de matériel et conseiller les patients selon leur pathologie',
    duration: '6h',
    price: '50 000 F',
    format: 'Présentiel',
    icon: Heart,
    objectives: ['Identifier les types de matériel orthopédique', 'Conseiller selon la pathologie', 'Assurer un suivi de qualité']
  },
  // Qualité
  {
    id: 6,
    category: 'qualite',
    title: 'Gérer les Risques Opérationnels',
    description: 'Comprendre, identifier et maîtriser les risques opérationnels en pharmacie',
    duration: '4h',
    price: '75 000 F',
    format: 'Présentiel',
    icon: Users,
    objectives: ['Comprendre les types de risques opérationnels', 'Identifier et évaluer les risques', 'Mettre en place un plan d\'action de gestion']
  },
  // Finances
  {
    id: 7,
    category: 'finances',
    title: 'Gestion Efficace de la Trésorerie',
    description: 'Optimiser la gestion de trésorerie et améliorer la performance financière de l\'officine',
    duration: '6h',
    price: '90 000 F',
    format: 'Présentiel',
    icon: DollarSign,
    objectives: ['Maîtriser les flux de trésorerie', 'Optimiser les encaissements', 'Gérer les investissements et financements']
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