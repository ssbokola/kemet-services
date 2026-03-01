import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingDown, TrendingUp, Clock, Star, Quote, CheckCircle2 } from 'lucide-react';
import ScrollReveal, { StaggerContainer, StaggerItem } from '@/components/ScrollReveal';

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

const clientTestimonials = [
  {
    name: 'Dr. Kouamé Jean-Baptiste',
    role: 'Pharmacien Titulaire',
    pharmacy: 'Pharmacie de la Paix, Cocody',
    content: 'Formation ISO 9001 exceptionnelle ! Approche pratique et expertise reconnue. Notre pharmacie a obtenu la certification en 8 mois. Recommande vivement Kemet Services.',
    rating: 5,
    image: '/images/testimonial-1.jpg',
    date: 'Août 2024'
  },
  {
    name: 'Mme Adjoa Victoire',
    role: 'Pharmacienne Responsable',
    pharmacy: 'Pharmacie du Plateau, Abidjan',
    content: 'Consultance WAYO remarquable ! Réduction de 70% de nos écarts de stock en 4 mois. Formateurs compétents et suivi personnalisé. Excellent retour sur investissement.',
    rating: 5,
    image: '/images/tresorerie-participants.jpg',
    date: 'Septembre 2024'
  },
  {
    name: 'Dr. Bamba Moussa',
    role: 'Pharmacien Titulaire',
    pharmacy: 'Pharmacie Centrale, Bouaké',
    content: 'Pack TRÉSORERIE très efficace. Optimisation financière significative et tableaux de bord pratiques. Équipe professionnelle et résultats concrets.',
    rating: 5,
    image: '/images/testimonial-3.jpg',
    date: 'Juillet 2024'
  }
];

const caseStudies = [
  {
    title: 'Pharmacie du Plateau',
    location: 'Abidjan',
    service: 'Consultance WAYO - Gestion des stocks',
    duration: '4 mois',
    before: {
      label: 'Avant',
      metrics: [
        { label: 'Écarts de stock', value: '15%' },
        { label: 'Ruptures mensuelles', value: '45 produits' },
        { label: 'Produits périmés', value: '8%' }
      ]
    },
    after: {
      label: 'Après',
      metrics: [
        { label: 'Écarts de stock', value: '4,5%', improvement: '-70%' },
        { label: 'Ruptures mensuelles', value: '12 produits', improvement: '-73%' },
        { label: 'Produits périmés', value: '2%', improvement: '-75%' }
      ]
    }
  },
  {
    title: 'Pharmacie de la Paix',
    location: 'Cocody',
    service: 'Formation ISO 9001:2015',
    duration: '8 mois',
    before: {
      label: 'Avant',
      metrics: [
        { label: 'Processus documentés', value: '30%' },
        { label: 'Non-conformités', value: '25/mois' },
        { label: 'Satisfaction client', value: '3.2/5' }
      ]
    },
    after: {
      label: 'Après',
      metrics: [
        { label: 'Processus documentés', value: '100%', improvement: '+233%' },
        { label: 'Non-conformités', value: '3/mois', improvement: '-88%' },
        { label: 'Satisfaction client', value: '4.7/5', improvement: '+47%' }
      ]
    }
  }
];

export default function ResultsSection() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-foreground mb-4">
              Résultats concrets et témoignages
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Nos clients obtiennent des améliorations mesurables et durables de leurs performances
            </p>
          </div>
        </ScrollReveal>

        {/* KPIs */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20" staggerDelay={0.15}>
          {kpis.map((kpi, index) => {
            const IconComponent = kpi.icon;
            return (
              <StaggerItem key={index}>
                <Card
                  className="text-center border-0 shadow-lg hover-elevate transition-all duration-300 h-full"
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
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        {/* Client Testimonials */}
        <div className="mb-20">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h3 className="text-2xl md:text-3xl font-bold font-serif text-foreground mb-3">
                Ce que disent nos clients
              </h3>
              <p className="text-muted-foreground">
                Témoignages de pharmaciens ayant travaillé avec Kemet Services
              </p>
            </div>
          </ScrollReveal>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8" staggerDelay={0.12}>
            {clientTestimonials.map((testimonial, index) => (
              <StaggerItem key={index}>
                <Card
                  className="border-0 shadow-lg hover-elevate transition-all duration-300 overflow-hidden h-full"
                  data-testid={`card-client-testimonial-${index}`}
                >
                  <div className="h-48 overflow-hidden bg-muted/30">
                    <img
                      src={testimonial.image}
                      alt={`${testimonial.name} - ${testimonial.pharmacy}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-4">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                      ))}
                    </div>
                    <Quote className="w-8 h-8 text-primary/20 mb-3" />
                    <blockquote className="text-muted-foreground leading-relaxed mb-4">
                      {testimonial.content}
                    </blockquote>
                    <div className="border-t pt-4">
                      <div className="font-semibold text-foreground">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </div>
                      <div className="text-sm text-primary font-medium mt-1">
                        {testimonial.pharmacy}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {testimonial.date}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>

        {/* Case Studies - Before/After */}
        <div>
          <ScrollReveal>
            <div className="text-center mb-12">
              <h3 className="text-2xl md:text-3xl font-bold font-serif text-foreground mb-3">
                Études de cas : Avant / Après
              </h3>
              <p className="text-muted-foreground">
                Transformations concrètes de pharmacies accompagnées par Kemet Services
              </p>
            </div>
          </ScrollReveal>
          <StaggerContainer className="grid grid-cols-1 lg:grid-cols-2 gap-8" staggerDelay={0.15}>
            {caseStudies.map((study, index) => (
              <StaggerItem key={index}>
                <Card
                  className="border-0 shadow-lg overflow-hidden h-full"
                  data-testid={`card-case-study-${index}`}
                >
                  <div className="bg-primary/5 p-6 border-b">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-xl font-bold text-foreground mb-1">
                          {study.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {study.location}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {study.duration}
                      </Badge>
                    </div>
                    <p className="text-sm text-primary font-medium">
                      {study.service}
                    </p>
                  </div>
                  <CardContent className="p-0">
                    <div className="grid grid-cols-2 divide-x">
                      {/* Before */}
                      <div className="p-6">
                        <div className="text-center mb-4">
                          <span className="text-lg font-semibold text-muted-foreground">
                            {study.before.label}
                          </span>
                        </div>
                        <div className="space-y-3">
                          {study.before.metrics.map((metric, idx) => (
                            <div key={idx} className="text-sm">
                              <div className="text-muted-foreground mb-1">
                                {metric.label}
                              </div>
                              <div className="text-2xl font-bold text-foreground">
                                {metric.value}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* After */}
                      <div className="p-6 bg-primary/5">
                        <div className="text-center mb-4">
                          <span className="text-lg font-semibold text-primary flex items-center justify-center gap-2">
                            <CheckCircle2 className="w-5 h-5" />
                            {study.after.label}
                          </span>
                        </div>
                        <div className="space-y-3">
                          {study.after.metrics.map((metric, idx) => (
                            <div key={idx} className="text-sm">
                              <div className="text-muted-foreground mb-1">
                                {metric.label}
                              </div>
                              <div className="flex items-baseline gap-2">
                                <div className="text-2xl font-bold text-primary">
                                  {metric.value}
                                </div>
                                {metric.improvement && (
                                  <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                                    {metric.improvement}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </div>
    </section>
  );
}
