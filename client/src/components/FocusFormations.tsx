import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, BookOpen } from 'lucide-react';

const formations = [
  {
    title: 'Gestion des écarts de stock',
    description: 'Réduire les écarts à moins de 2 par mois grâce à des méthodes éprouvées',
    duration: '2h',
    price: '50 000 F',
    target: 'Pharmaciens & Assistants',
    icon: BookOpen,
    benefits: ['Méthodes FIFO/FEFO', 'Outils de suivi', 'Réduction des pertes']
  },
  {
    title: 'Gestion des péremptions',
    description: 'FEFO optimisé et système d\'alertes pour minimiser les pertes',
    duration: '2h',
    price: '50 000 F',
    target: 'Équipe officine',
    icon: Clock,
    benefits: ['Alertes automatiques', 'Rotation optimale', 'Réduction déchets']
  },
  {
    title: 'Commande & réception',
    description: 'Processus zéro erreur pour la gestion des approvisionnements',
    duration: '2h',
    price: '50 000 F',
    target: 'Personnel réception',
    icon: Users,
    benefits: ['Processus standardisé', 'Contrôle qualité', 'Zéro erreur']
  }
];

export default function FocusFormations() {
  const handleInscription = (formationTitle: string) => {
    console.log(`Inscription formation: ${formationTitle}`);
    // In a real app, this would open enrollment form
  };

  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-serif text-foreground mb-4">
            Formations phares
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Des formations ciblées pour résoudre les défis quotidiens de votre officine
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {formations.map((formation, index) => {
            const IconComponent = formation.icon;
            return (
              <Card 
                key={index} 
                className="hover-elevate transition-all duration-300 border-0 shadow-lg h-full"
                data-testid={`card-formation-${index}`}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-primary" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {formation.target}
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
                    {/* Benefits */}
                    <div className="space-y-2">
                      {formation.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-center text-sm text-muted-foreground">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3"></div>
                          {benefit}
                        </div>
                      ))}
                    </div>

                    {/* Duration and Price */}
                    <div className="flex items-center justify-between py-4 border-t border-border">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 mr-2" />
                        {formation.duration}
                      </div>
                      <div className="text-lg font-semibold text-primary">
                        {formation.price}
                      </div>
                    </div>

                    {/* CTA */}
                    <Button 
                      className="w-full"
                      onClick={() => handleInscription(formation.title)}
                      data-testid={`button-inscription-${index}`}
                    >
                      S'inscrire
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* View All CTA */}
        <div className="text-center mt-12">
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => console.log('Voir toutes formations triggered')}
            className="text-primary border-primary"
            data-testid="button-voir-formations"
          >
            Voir toutes nos formations
          </Button>
        </div>
      </div>
    </section>
  );
}