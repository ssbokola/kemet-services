import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SearchCheck, Target, Settings, BarChart3 } from 'lucide-react';
import consultingImage from '@assets/generated_images/Professional_pharmacist_working_83678ee2.png';

const steps = [
  {
    icon: SearchCheck,
    title: 'Audit 360°',
    description: 'Diagnostic complet de votre officine : stocks, processus, équipe, performance',
    duration: '2-3 jours'
  },
  {
    icon: Target,
    title: 'Plan d\'action 90 jours',
    description: 'Feuille de route personnalisée avec objectifs SMART et indicateurs de performance',
    duration: '1 semaine'
  },
  {
    icon: Settings,
    title: 'Mise en place',
    description: 'Accompagnement terrain pour l\'implémentation des solutions recommandées',
    duration: '30 jours'
  },
  {
    icon: BarChart3,
    title: 'Suivi & optimisation',
    description: 'Monitoring des résultats et ajustements pour pérenniser les améliorations',
    duration: '60 jours'
  }
];

export default function ConsultingSection() {
  const handleConsultingContact = () => {
    console.log('Consulting contact triggered');
    // In a real app, this would open contact form or WhatsApp
  };

  return (
    <section className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div>
            <div className="mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-serif text-foreground mb-4">
                Consulting & Accompagnement
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Une approche méthodique pour transformer durablement votre officine et optimiser ses performances opérationnelles.
              </p>
            </div>

            <div className="space-y-6">
              {steps.map((step, index) => {
                const IconComponent = step.icon;
                return (
                  <div 
                    key={index}
                    className="flex items-start space-x-4"
                    data-testid={`step-consulting-${index}`}
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-foreground">
                          {step.title}
                        </h3>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                          {step.duration}
                        </span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8">
              <Button 
                size="lg"
                onClick={handleConsultingContact}
                data-testid="button-consulting-contact"
              >
                Demander un accompagnement
              </Button>
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <Card className="overflow-hidden border-0 shadow-xl">
              <img 
                src={consultingImage} 
                alt="Pharmacien professionnel Abidjan" 
                className="w-full h-96 object-cover"
                data-testid="img-consulting"
              />
              <CardContent className="p-6">
                <div className="text-center">
                  <h4 className="text-lg font-semibold text-foreground mb-2">
                    Expertise de terrain
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    Plus de 10 ans d'expérience dans l'optimisation des pharmacies d'officine en Côte d'Ivoire
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}