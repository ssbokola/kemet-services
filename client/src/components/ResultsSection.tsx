import { Card, CardContent } from '@/components/ui/card';
import { TrendingDown, TrendingUp, Clock } from 'lucide-react';

const kpis = [
  {
    icon: TrendingDown,
    value: '-35%',
    label: 'Réduction des ruptures',
    timeframe: 'en 60 jours',
    description: 'Diminution significative des ruptures de stock grâce à une meilleure gestion des approvisionnements',
    color: 'text-chart-2'
  },
  {
    icon: TrendingUp,
    value: '+1,8 pts',
    label: 'Amélioration de la marge',
    timeframe: 'en 90 jours',
    description: 'Optimisation de la rentabilité par une meilleure gestion des coûts et des prix',
    color: 'text-primary'
  },
  {
    icon: Clock,
    value: '<24h',
    label: 'Délai de traitement',
    timeframe: 'des réclamations',
    description: 'Amélioration de la satisfaction client par une gestion optimisée des réclamations',
    color: 'text-chart-4'
  }
];

const testimonials = [
  {
    name: 'Formation "Gestion de Commande"',
    role: 'Auxiliaires en pharmacie',
    location: 'Abidjan, 16 mars 2024',
    content: 'Formation interactive et pratique avec des cas concrets. Les participants ont apprécié l\'approche participative et les mises en situation réelles.',
    image: '/images/testimonial-1.jpg'
  },
  {
    name: 'Session de Travail de Groupe',
    role: 'Méthodes collaboratives',
    location: 'Formation Kemet Services',
    content: 'Approche pédagogique innovante avec des exercices pratiques permettant aux participants de s\'approprier les concepts enseignés.',
    image: '/images/testimonial-2.jpg'
  },
  {
    name: 'Participants Satisfaits',
    role: 'Groupe de formation',
    location: 'Photo de fin de session',
    content: 'Une formation enrichissante qui a permis à tous les participants d\'acquérir de nouvelles compétences pratiques pour leur travail quotidien.',
    image: '/images/testimonial-3.jpg'
  }
];

export default function ResultsSection() {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-serif text-foreground mb-4">
            Résultats concrets
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Nos clients obtiennent des améliorations mesurables et durables de leurs performances
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {kpis.map((kpi, index) => {
            const IconComponent = kpi.icon;
            return (
              <Card 
                key={index} 
                className="text-center border-0 shadow-lg hover-elevate transition-all duration-300"
                data-testid={`card-kpi-${index}`}
              >
                <CardContent className="p-8">
                  <div className="mb-4 flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
                      <IconComponent className={`w-8 h-8 ${kpi.color}`} />
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className={`text-4xl font-bold ${kpi.color} mb-2`}>
                      {kpi.value}
                    </div>
                    <div className="text-lg font-semibold text-foreground mb-1">
                      {kpi.label}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {kpi.timeframe}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {kpi.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Testimonials */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold font-serif text-foreground text-center mb-12">
            Témoignages clients
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card 
                key={index} 
                className="border-0 shadow-lg hover-elevate transition-all duration-300 overflow-hidden"
                data-testid={`card-testimonial-${index}`}
              >
                <div className="h-48 overflow-hidden">
                  <img 
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <blockquote className="text-muted-foreground leading-relaxed mb-4 italic">
                    "{testimonial.content}"
                  </blockquote>
                  <div>
                    <div className="font-semibold text-foreground">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {testimonial.location}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}