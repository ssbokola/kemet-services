import { Card, CardContent } from '@/components/ui/card';
import { Award, MapPin, TrendingUp, Leaf } from 'lucide-react';

const pillars = [
  {
    icon: Award,
    title: 'Expertise',
    description: 'Formations certifiées ISO et respect des bonnes pratiques officinales',
    color: 'text-primary'
  },
  {
    icon: MapPin,
    title: 'Proximité',
    description: 'Ancrage local en Côte d\'Ivoire avec une connaissance du terrain',
    color: 'text-chart-2'
  },
  {
    icon: TrendingUp,
    title: 'Impact',
    description: 'Résultats mesurables et amélioration concrète de la performance',
    color: 'text-chart-3'
  },
  {
    icon: Leaf,
    title: 'Durabilité',
    description: 'Solutions pérennes et accompagnement dans la transformation',
    color: 'text-chart-4'
  }
];

export default function WhyKemet() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-serif text-foreground mb-4">
            Pourquoi choisir Kemet Services ?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Quatre piliers fondamentaux pour transformer et optimiser votre pharmacie d'officine
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pillars.map((pillar, index) => {
            const IconComponent = pillar.icon;
            return (
              <Card 
                key={index} 
                className="hover-elevate transition-all duration-300 border-0 shadow-lg"
                data-testid={`card-pillar-${pillar.title.toLowerCase()}`}
              >
                <CardContent className="p-8 text-center">
                  <div className="mb-6 flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <IconComponent className={`w-8 h-8 ${pillar.color}`} />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold font-serif text-foreground mb-4">
                    {pillar.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {pillar.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}