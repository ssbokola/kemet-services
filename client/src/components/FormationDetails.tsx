import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  Users, 
  Calendar, 
  MapPin, 
  Award,
  BookOpen,
  Target,
  Clock
} from 'lucide-react';
import { useLocation } from 'wouter';

const learningObjectives = [
  'Maîtriser les techniques de gestion optimisée des stocks pharmaceutiques',
  'Réduire significativement les écarts de stock et produits périmés',
  'Améliorer la trésorerie et la rentabilité de votre officine',
  'Mettre en place un système qualité ISO 9001:2015',
  'Développer les compétences de votre équipe',
  'Gérer efficacement les ressources humaines',
  'Optimiser l\'acquisition et la fidélisation client',
  'Appliquer les bonnes pratiques officinales'
];

const targetAudience = [
  {
    icon: Award,
    title: 'Pharmaciens titulaires',
    description: 'Propriétaires d\'officines souhaitant optimiser leurs performances opérationnelles et financières'
  },
  {
    icon: Users,
    title: 'Pharmaciens adjoints',
    description: 'Responsables opérationnels cherchant à développer leurs compétences managériales'
  },
  {
    icon: BookOpen,
    title: 'Auxiliaires en pharmacie',
    description: 'Personnel d\'officine désirant monter en compétences sur la gestion quotidienne'
  },
  {
    icon: Target,
    title: 'Gérants d\'officine',
    description: 'Managers opérationnels visant l\'excellence dans la gestion de leur pharmacie'
  }
];

const modalites = [
  {
    icon: MapPin,
    title: 'Format présentiel',
    description: 'Sessions en salle à Abidjan avec exercices pratiques et études de cas réels d\'officines ivoiriennes'
  },
  {
    icon: Calendar,
    title: 'Durée flexible',
    description: 'Formations de 4h à 8h selon les modules. Sessions inter-entreprise ou intra-entreprise sur mesure'
  },
  {
    icon: Clock,
    title: 'Horaires adaptés',
    description: 'Planning ajustable selon vos contraintes d\'exploitation. Sessions en semaine ou weekend disponibles'
  },
  {
    icon: Award,
    title: 'Certification',
    description: 'Attestation de formation délivrée. Accompagnement jusqu\'à la certification ISO 9001 si souhaité'
  }
];

const pricingInfo = [
  {
    label: 'Formations courtes',
    price: '50 000 - 75 000 F',
    duration: '4-8h',
    description: 'Modules thématiques ciblés'
  },
  {
    label: 'Packs consulting',
    price: 'Sur devis',
    duration: '2-6 mois',
    description: 'Accompagnement personnalisé'
  }
];

export default function FormationDetails() {
  const [, setLocation] = useLocation();

  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Ce que vous apprendrez */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-foreground mb-4">
              Ce que vous apprendrez
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Compétences pratiques et résultats concrets pour votre officine
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
            {learningObjectives.map((objective, index) => (
              <div 
                key={index} 
                className="flex items-start gap-3 p-4 rounded-lg hover-elevate bg-muted/30"
                data-testid={`learning-objective-${index}`}
              >
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-foreground leading-relaxed">{objective}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pour qui */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-foreground mb-4">
              Pour qui ?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Nos formations s'adressent à tous les professionnels de l'officine
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {targetAudience.map((audience, index) => {
              const IconComponent = audience.icon;
              return (
                <Card 
                  key={index} 
                  className="text-center hover-elevate transition-all"
                  data-testid={`target-audience-${index}`}
                >
                  <CardContent className="p-6">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2 text-lg">
                      {audience.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {audience.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Format des formations */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-foreground mb-4">
              Format des formations
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Programme structuré en modules pratiques avec supports pédagogiques
            </p>
          </div>

          {/* Structure explicite du format */}
          <div className="max-w-4xl mx-auto mb-12">
            <Card data-testid="card-format-structure">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-primary" />
                  Structure type d'une formation
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-primary font-semibold">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Diagnostic initial (30 min)</h4>
                      <p className="text-sm text-muted-foreground">Évaluation des besoins spécifiques de votre équipe</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-primary font-semibold">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Modules théoriques (40% du temps)</h4>
                      <p className="text-sm text-muted-foreground">Présentation des concepts clés avec exemples concrets du secteur pharmaceutique ivoirien</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-primary font-semibold">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Exercices pratiques (50% du temps)</h4>
                      <p className="text-sm text-muted-foreground">Études de cas réels, mises en situation, ateliers en groupe</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-primary font-semibold">4</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Plan d'action personnalisé (10% du temps)</h4>
                      <p className="text-sm text-muted-foreground">Feuille de route pour appliquer immédiatement dans votre officine</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-primary/5 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" />
                    Supports fournis
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Manuel de formation complet (PDF)</li>
                    <li>• Fiches pratiques et outils téléchargeables</li>
                    <li>• Tableaux de bord Excel personnalisables</li>
                    <li>• Attestation de formation certifiée</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Modalités */}
          <h3 className="text-2xl font-bold font-serif text-center text-foreground mb-8">
            Modalités pratiques
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {modalites.map((modalite, index) => {
              const IconComponent = modalite.icon;
              return (
                <Card 
                  key={index} 
                  className="hover-elevate transition-all"
                  data-testid={`modalite-${index}`}
                >
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <IconComponent className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">
                      {modalite.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {modalite.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Tarifs */}
          <div className="bg-muted/30 rounded-2xl p-8">
            <h3 className="text-2xl font-bold font-serif text-center text-foreground mb-8">
              Tarifs
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {pricingInfo.map((pricing, index) => (
                <Card 
                  key={index} 
                  className="text-center"
                  data-testid={`pricing-${index}`}
                >
                  <CardContent className="p-6">
                    <div className="text-lg font-semibold text-primary mb-2">
                      {pricing.label}
                    </div>
                    <div className="text-3xl font-bold text-foreground mb-1">
                      {pricing.price}
                    </div>
                    <div className="text-sm text-muted-foreground mb-3">
                      {pricing.duration}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {pricing.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button 
            size="lg" 
            onClick={() => setLocation('/formations')}
            className="text-lg px-8 py-6"
            data-testid="button-voir-catalogue"
          >
            Voir le catalogue complet
          </Button>
        </div>
      </div>
    </section>
  );
}
