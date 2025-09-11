import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Users,
  Quote,
  MapPin,
  Calendar
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import Header from '@/components/Header';

// Données pour les graphiques
const stockData = [
  { month: 'Jan', before: 15, after: 8 },
  { month: 'Fév', before: 18, after: 6 },
  { month: 'Mar', before: 22, after: 4 },
  { month: 'Avr', before: 20, after: 5 },
  { month: 'Mai', before: 16, after: 3 },
  { month: 'Jun', before: 14, after: 3 }
];

const rupturesData = [
  { month: 'Jan', ruptures: 25 },
  { month: 'Fév', ruptures: 18 },
  { month: 'Mar', ruptures: 12 },
  { month: 'Avr', ruptures: 8 },
  { month: 'Mai', ruptures: 6 },
  { month: 'Jun', ruptures: 4 }
];

const margeData = [
  { month: 'Jan', marge: 18.2 },
  { month: 'Fév', marge: 18.8 },
  { month: 'Mar', marge: 19.4 },
  { month: 'Avr', marge: 19.8 },
  { month: 'Mai', marge: 20.1 },
  { month: 'Jun', marge: 20.3 }
];

// KPI Cards
const kpiData = [
  {
    title: 'Ruptures de stock',
    value: '-35%',
    subtitle: 'en 60 jours',
    icon: TrendingDown,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  {
    title: 'Délai réclamations',
    value: '<24h',
    subtitle: 'temps de traitement',
    icon: Clock,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    title: 'Marge brute',
    value: '+1,8 pts',
    subtitle: 'amélioration',
    icon: TrendingUp,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50'
  },
  {
    title: 'Satisfaction équipe',
    value: '94%',
    subtitle: 'taux de satisfaction',
    icon: Users,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  }
];

// Études de cas
const caseStudies = [
  {
    id: 'pharmacie-cocody',
    title: 'Pharmacie du Plateau - Cocody',
    location: 'Cocody, Abidjan',
    context: 'Pharmacie familiale avec 8 employés faisant face à des écarts de stock récurrents et une baisse de rentabilité.',
    problem: 'Écarts de stock de 15-20% mensuels, périmés représentant 8% du CA, et turnover élevé du personnel.',
    actions: [
      'Audit complet des processus de gestion des stocks',
      'Formation FEFO de l\'équipe sur 3 jours',
      'Mise en place d\'un système de traçabilité',
      'Optimisation des commandes avec seuils automatiques'
    ],
    results: {
      before: { ecarts: '18%', perimes: '8%', marge: '17.2%' },
      after: { ecarts: '3%', perimes: '2%', marge: '20.1%' }
    },
    testimonial: {
      text: "Kemet Services a révolutionné notre gestion. En 4 mois, nos écarts sont passés de 18% à 3%. L'accompagnement personnalisé fait toute la différence.",
      author: "Dr. Adjoua KOFFI",
      role: "Pharmacienne titulaire"
    },
    lessons: [
      'L\'importance de la formation continue du personnel',
      'L\'impact crucial d\'un bon système de traçabilité',
      'La nécessité d\'un suivi régulier des indicateurs'
    ],
    duration: '4 mois',
    pack: 'WAYO'
  },
  {
    id: 'pharmacie-abidjan',
    title: 'Groupe Pharmacies Santé Plus',
    location: 'Marcory, Abidjan',
    context: 'Réseau de 3 pharmacies avec difficultés de coordination RH et baisse de motivation des équipes.',
    problem: 'Turnover de 40% annuel, absence de procédures RH standardisées, et conflits interpersonnels récurrents.',
    actions: [
      'Diagnostic RH complet sur les 3 sites',
      'Création d\'un manuel de procédures unifié',
      'Formation management pour les responsables',
      'Mise en place d\'évaluations trimestrielles'
    ],
    results: {
      before: { turnover: '40%', satisfaction: '52%', performance: '68%' },
      after: { turnover: '12%', satisfaction: '89%', performance: '94%' }
    },
    testimonial: {
      text: "L'approche DJANVOUE nous a permis de structurer notre RH. Nos équipes sont plus motivées et notre turnover a chuté drastiquement.",
      author: "Dr. Brahima OUATTARA",
      role: "Directeur Groupe"
    },
    lessons: [
      'La structuration RH comme levier de performance',
      'L\'importance de l\'évaluation régulière',
      'Le management comme facteur clé de fidélisation'
    ],
    duration: '6 mois',
    pack: 'DJANVOUE'
  }
];

export default function Resultats() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-primary/10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Nos Résultats Concrets
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Des transformations mesurables dans les pharmacies ivoiriennes. 
              Découvrez nos études de cas et indicateurs de performance.
            </p>
          </div>
        </div>
      </section>

      {/* KPI Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Indicateurs de Performance
            </h2>
            <p className="text-lg text-muted-foreground">
              Résultats moyens observés chez nos clients
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {kpiData.map((kpi, index) => {
              const IconComponent = kpi.icon;
              return (
                <Card key={index} className="text-center" data-testid={`card-kpi-${index}`}>
                  <CardHeader className="pb-3">
                    <div className={`w-12 h-12 rounded-lg ${kpi.bgColor} flex items-center justify-center mx-auto mb-3`}>
                      <IconComponent className={`w-6 h-6 ${kpi.color}`} />
                    </div>
                    <CardTitle className="text-2xl font-bold">{kpi.value}</CardTitle>
                    <CardDescription>{kpi.subtitle}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{kpi.title}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Graphiques */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Évolution des écarts de stock</CardTitle>
                <CardDescription>Avant/Après intervention (Pack WAYO)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={stockData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="before" fill="#ef4444" name="Avant" />
                    <Bar dataKey="after" fill="#22c55e" name="Après" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Réduction des ruptures</CardTitle>
                <CardDescription>Nombre de ruptures par mois</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={rupturesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="ruptures" stroke="#f59e0b" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Amélioration de la marge</CardTitle>
                <CardDescription>Marge brute en pourcentage</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={margeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="marge" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Études de cas */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Études de Cas Détaillées
            </h2>
            <p className="text-lg text-muted-foreground">
              Transformations réelles de pharmacies en Côte d'Ivoire
            </p>
          </div>
          
          <div className="space-y-12">
            {caseStudies.map((study) => (
              <Card key={study.id} className="overflow-hidden" data-testid={`card-study-${study.id}`}>
                <CardHeader className="bg-primary/5">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                      <CardTitle className="text-2xl mb-2">{study.title}</CardTitle>
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {study.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {study.duration}
                        </div>
                        <Badge variant="outline">{study.pack}</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-foreground mb-2">Contexte</h4>
                        <p className="text-muted-foreground">{study.context}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-foreground mb-2">Problématique</h4>
                        <p className="text-muted-foreground">{study.problem}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-foreground mb-2">Actions mises en place</h4>
                        <ul className="space-y-2">
                          {study.actions.map((action, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-muted-foreground">
                              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-foreground mb-4">Résultats (Avant → Après)</h4>
                        <div className="grid grid-cols-1 gap-4">
                          {Object.entries(study.results.before).map(([key, beforeValue], idx) => {
                            const afterValue = (study.results.after as any)[key];
                            return (
                              <div key={key} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                <span className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-destructive">{beforeValue}</span>
                                  <span>→</span>
                                  <span className="text-primary font-semibold">{afterValue}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-foreground mb-3">Témoignage</h4>
                        <div className="bg-muted/50 p-4 rounded-lg">
                          <Quote className="w-6 h-6 text-primary mb-3" />
                          <p className="text-muted-foreground italic mb-3">"{study.testimonial.text}"</p>
                          <div className="text-sm">
                            <p className="font-semibold text-foreground">{study.testimonial.author}</p>
                            <p className="text-muted-foreground">{study.testimonial.role}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-foreground mb-2">Leçons apprises</h4>
                        <ul className="space-y-1">
                          {study.lessons.map((lesson, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                              {lesson}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Votre pharmacie sera-t-elle la prochaine ?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Rejoignez les pharmaciens qui ont transformé leur officine 
            avec des résultats mesurables et durables.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" data-testid="button-cta-diagnostic">
              Demander un diagnostic gratuit
            </Button>
            <Button variant="outline" size="lg" data-testid="button-cta-resultats">
              Voir d'autres résultats
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}