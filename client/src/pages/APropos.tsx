import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Target, 
  Heart, 
  Shield, 
  MapPin,
  Award,
  Users,
  TrendingUp,
  CheckCircle,
  Lightbulb,
  Zap,
  GraduationCap,
  Briefcase,
  BarChart3
} from 'lucide-react';
import Header from '@/components/Header';
import { KemetClientTimeline } from '@/components/ui/timeline';
import founderImage from '@assets/1757573169268_1757594043126.jpg';

const valeurs = [
  {
    name: 'Long terme',
    description: 'Nous construisons des partenariats durables basés sur la confiance mutuelle et la croissance continue.',
    icon: Target,
    color: 'bg-blue-500'
  },
  {
    name: 'Focus client',
    description: 'Votre succès est notre priorité. Chaque solution est pensée pour maximiser votre performance.',
    icon: Heart,
    color: 'bg-green-500'
  },
  {
    name: 'Discrétion',
    description: 'Confidentialité absolue de vos données et respect total de votre environnement professionnel.',
    icon: Shield,
    color: 'bg-purple-500'
  },
  {
    name: 'Proximité',
    description: 'Un accompagnement de terrain, au plus près de vos réalités quotidiennes en Afrique.',
    icon: MapPin,
    color: 'bg-orange-500'
  }
];

const atouts = [
  {
    name: 'Spécificité',
    description: 'Expertise 100% dédiée au secteur pharmaceutique africain',
    icon: Award
  },
  {
    name: 'Adaptabilité',
    description: 'Solutions personnalisées selon la taille et les besoins de votre officine',
    icon: Lightbulb
  },
  {
    name: 'Dynamisme',
    description: 'Équipe réactive avec des méthodes modernes et efficaces',
    icon: Zap
  }
];

// Le processus d'accompagnement est maintenant géré par le composant KemetClientTimeline

export default function APropos() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-primary/10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Qui sommes-nous ?
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              <strong className="text-primary">"Le cabinet d'un pharmacien, pour les pharmaciens(ennes)"</strong>
            </p>
            <p className="text-lg text-muted-foreground">
              Kemet Services est un cabinet de conseil spécialisé dans l'accompagnement 
              des pharmacies en Afrique, créé par des professionnels du secteur pour des professionnels.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Objectifs */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">Notre Mission</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Transformer les pharmacies africaines en centres d'excellence, alliant performance économique, 
                qualité de service et satisfaction des équipes. Nous accompagnons chaque pharmacien dans 
                l'optimisation de son officine avec des solutions concrètes et mesurables.
              </p>
              
              <h3 className="text-xl font-semibold text-foreground mb-4">Nos Objectifs</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Améliorer la rentabilité de votre pharmacie</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Optimiser vos processus opérationnels</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Renforcer la satisfaction de vos patients</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Développer les compétences de vos équipes</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Users className="w-12 h-12 text-primary mx-auto mb-3" />
                  <h4 className="font-semibold text-foreground mb-2">Premium</h4>
                  <p className="text-sm text-muted-foreground">Accompagnements personnalisés</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Award className="w-12 h-12 text-primary mx-auto mb-3" />
                  <h4 className="font-semibold text-foreground mb-2">10+</h4>
                  <p className="text-sm text-muted-foreground">Années d'expérience</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <TrendingUp className="w-12 h-12 text-primary mx-auto mb-3" />
                  <h4 className="font-semibold text-foreground mb-2">95%</h4>
                  <p className="text-sm text-muted-foreground">Taux de satisfaction</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <MapPin className="w-12 h-12 text-primary mx-auto mb-3" />
                  <h4 className="font-semibold text-foreground mb-2">100%</h4>
                  <p className="text-sm text-muted-foreground">Afrique</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Valeurs */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Nos Valeurs</h2>
            <p className="text-lg text-muted-foreground">
              Les principes qui guident notre action au quotidien
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {valeurs.map((valeur, index) => {
              const IconComponent = valeur.icon;
              return (
                <Card key={index} className="text-center hover-elevate" data-testid={`card-valeur-${index}`}>
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg ${valeur.color} text-white flex items-center justify-center mx-auto mb-3`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-lg">{valeur.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {valeur.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Atouts */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Nos Atouts</h2>
            <p className="text-lg text-muted-foreground">
              Ce qui fait la différence Kemet Services
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {atouts.map((atout, index) => {
              const IconComponent = atout.icon;
              return (
                <Card key={index} className="text-center" data-testid={`card-atout-${index}`}>
                  <CardHeader>
                    <IconComponent className="w-12 h-12 text-primary mx-auto mb-3" />
                    <CardTitle className="text-xl">{atout.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {atout.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Processus d'accompagnement */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Notre Processus d'Accompagnement</h2>
            <p className="text-lg text-muted-foreground">
              Une méthodologie éprouvée en 4 étapes pour des résultats garantis
            </p>
          </div>
          
          <KemetClientTimeline className="max-w-6xl mx-auto" />
        </div>
      </section>

      {/* Fondateur */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Notre Fondateur</h2>
            <p className="text-lg text-muted-foreground">
              Une expertise pharmaceutique et managériale unique en Afrique
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <img 
                src={founderImage} 
                alt="Bokola Tinni Sonhon, Fondateur de Kemet Services"
                className="w-64 h-64 rounded-lg object-cover mx-auto lg:mx-0 mb-6 shadow-lg"
                data-testid="img-founder"
              />
              <h3 className="text-2xl font-bold text-foreground mb-2">Dr. Bokola Tinni Sonhon</h3>
              <p className="text-lg text-primary font-medium mb-4">Pharmacien d'Officine • Fondateur</p>
              <p className="text-muted-foreground">
                "Mon expérience terrain combinée à ma formation en management me permet d'accompagner 
                concrètement les pharmaciens africains vers l'excellence opérationnelle."
              </p>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Briefcase className="w-6 h-6 text-primary" />
                    Expérience Terrain
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Gérant de Pharmacie depuis 2021</p>
                      <p className="text-sm text-muted-foreground">Pharmacie Saint Clément, Yopougon</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">8 ans de management d'équipe</p>
                      <p className="text-sm text-muted-foreground">Direction d'équipes de 20+ personnes</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Gestion de crise et transformation</p>
                      <p className="text-sm text-muted-foreground">Conduite du changement organisationnel</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <GraduationCap className="w-6 h-6 text-primary" />
                    Formation d'Excellence
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Doctorat en Pharmacie</p>
                      <p className="text-sm text-muted-foreground">Université Mohammed V (2012)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">MBA + Master Qualité</p>
                      <p className="text-sm text-muted-foreground">CERAP & Institut Africain de la Qualité Totale (2019)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Certifications Leadership</p>
                      <p className="text-sm text-muted-foreground">Leadership Managérial & Self Leadership (2020)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <BarChart3 className="w-6 h-6 text-primary" />
                    Expertise Spécialisée
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Diagnostic organisationnel et tableaux de bord</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Management par la Qualité en pharmacie</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Gestion Prévisionnelle des Emplois et Carrières</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Prêt à transformer votre pharmacie ?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Rejoignez les pharmaciens qui nous font confiance pour optimiser leur officine. 
            Commencez par un diagnostic gratuit de votre situation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" data-testid="button-cta-diagnostic">
              Diagnostic gratuit
            </Button>
            <Button variant="outline" size="lg" data-testid="button-cta-contact">
              Nous contacter
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}