import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, BookOpen, Award } from 'lucide-react';
import { useLocation } from 'wouter';
import ScrollReveal, { StaggerContainer, StaggerItem } from '@/components/ScrollReveal';

const formations = [
  {
    title: 'Gérer Efficacement la Commande',
    description: 'Maîtriser les techniques de gestion des stocks et optimiser le processus de commande',
    duration: '4h',
    price: '50 000 F',
    target: 'Auxiliaires en pharmacie',
    icon: BookOpen,
    benefits: ['Techniques de gestion des stocks', 'Optimisation des coûts', 'Amélioration satisfaction client']
  },
  {
    title: 'Réduire les Écarts de Stock',
    description: 'Comprendre les enjeux et maîtriser les bonnes pratiques pour réduire les écarts',
    duration: '4h',
    price: '50 000 F',
    target: 'Auxiliaires en pharmacie',
    icon: Clock,
    benefits: ['Identification des causes', 'Mise en place de procédures', 'Contrôle régulier des stocks']
  },
  {
    title: 'Gestion des Risques Opérationnels',
    description: 'Identifier, évaluer et maîtriser les risques dans l\'environnement officinal',
    duration: '4h',
    price: '75 000 F',
    target: 'Pharmaciens & Cadres',
    icon: Users,
    benefits: ['Identification des risques', 'Techniques de gestion', 'Plan d\'action proactif']
  }
];

export default function FocusFormations() {
  const [, setLocation] = useLocation();

  const handleInscription = (formationTitle: string) => {
    window.location.href = '/grille-prediagnostic.html';
  };

  const handleVoirFormations = () => {
    setLocation('/calendrier-2026');
  };

  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-foreground mb-4">
              Formations phares
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
              Des formations ciblées pour résoudre les défis quotidiens de votre officine
            </p>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold" style={{ backgroundColor: '#03341C', color: '#C4A41E' }}>
              <Award className="w-4 h-4" />
              Éligible FDFP — Formation prise en charge
            </span>
          </div>
        </ScrollReveal>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8" staggerDelay={0.12}>
          {formations.map((formation, index) => {
            const IconComponent = formation.icon;
            return (
              <StaggerItem key={index}>
                <Card
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

                      {/* CTA — lien texte */}
                      <button
                        className="w-full text-center text-sm text-primary font-medium hover:underline py-2"
                        onClick={() => handleInscription(formation.title)}
                        data-testid={`link-inscription-${index}`}
                      >
                        En savoir plus →
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        {/* View All — lien texte */}
        <ScrollReveal delay={0.3}>
          <div className="text-center mt-12">
            <button
              onClick={handleVoirFormations}
              className="text-primary hover:underline font-medium"
              data-testid="link-voir-formations"
            >
              Voir toutes nos formations →
            </button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
