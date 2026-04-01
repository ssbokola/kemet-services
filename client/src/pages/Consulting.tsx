import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Target, 
  Package, 
  DollarSign, 
  Shield, 
  Award,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';
import Header from '@/components/Header';
import { ConsultingSEO } from '@/components/SEO';
import { useLocation } from 'wouter';
import { trackWhatsAppClick } from '@/components/GoogleAnalytics';

const consultingPacks = [
  {
    id: 'djanvoue',
    name: 'DJANVOUE',
    subtitle: 'Ressources Humaines - GPEC',
    description: 'État des lieux, objectifs SMART, évaluation compétences/motivation pour optimiser votre équipe.',
    icon: Users,
    color: 'bg-blue-500',
    price: 'Sur devis',
    duration: '3-6 mois',
    deliverables: [
      'Manuel de procédures RH',
      'Tableau de bord RH',
      'Fiches d\'évaluation trimestrielle',
      'Contrats d\'objectifs personnalisés'
    ],
    objectives: [
      'Structurer la gestion des ressources humaines',
      'Développer les compétences de l\'équipe',
      'Améliorer la motivation et l\'engagement',
      'Mettre en place un système d\'évaluation efficace'
    ]
  },
  {
    id: 'clientele',
    name: 'CLIENTÈLE',
    subtitle: 'Acquisition & Fidélisation',
    description: 'Stratégie commerciale, base clients et suivi satisfaction pour développer votre patientèle.',
    icon: Target,
    color: 'bg-green-500',
    price: 'Sur devis',
    duration: '3-4 mois',
    deliverables: [
      'Rapport trimestriel de performance',
      'Recommandations personnalisées',
      'Rapport d\'évaluation de satisfaction',
      'Plan d\'action commercial'
    ],
    objectives: [
      'Augmenter l\'acquisition de nouveaux clients',
      'Améliorer la fidélisation existante',
      'Optimiser la stratégie commerciale',
      'Mesurer et améliorer la satisfaction'
    ]
  },
  {
    id: 'wayo',
    name: 'WAYO',
    subtitle: 'Gestion Stock - Écarts & Périmés',
    description: 'Maîtrise des écarts et périmés avec indicateurs et tableaux de bord personnalisés.',
    icon: Package,
    color: 'bg-orange-500',
    price: 'Sur devis',
    duration: '2-3 mois',
    deliverables: [
      'Tableaux de bord de suivi',
      'Rapports trimestriels périmés/écarts',
      'Procédures de gestion optimisées',
      'Indicateurs de performance clés'
    ],
    objectives: [
      'Réduire significativement les écarts de stock',
      'Minimiser les pertes liées aux périmés',
      'Optimiser la rotation des produits',
      'Améliorer la rentabilité du stock'
    ]
  },
  {
    id: 'tresorerie',
    name: 'TRÉSORERIE',
    subtitle: 'Optimisation Financière',
    description: 'Budget, suivi et analyse des charges pour optimiser votre trésorerie et réduire les coûts.',
    icon: DollarSign,
    color: 'bg-emerald-500',
    price: 'Sur devis',
    duration: '2-4 mois',
    deliverables: [
      'Plan de trésorerie optimisé',
      'Analyse détaillée des charges',
      'Tableau de bord financier',
      'Recommandations d\'économies'
    ],
    objectives: [
      'Optimiser la gestion de trésorerie',
      'Réduire les coûts de non-qualité',
      'Améliorer la rentabilité',
      'Sécuriser les flux financiers'
    ]
  },
  {
    id: 'serenite',
    name: 'SÉRÉNITÉ',
    subtitle: 'Risk Management',
    description: 'Identification, évaluation et traitement des risques avec matrice de suivi actualisée.',
    icon: Shield,
    color: 'bg-purple-500',
    price: 'Sur devis',
    duration: '3-5 mois',
    deliverables: [
      'Cartographie complète des risques',
      'Matrice de risques actualisée',
      'Plan de traitement des risques',
      'Procédures de suivi et contrôle'
    ],
    objectives: [
      'Identifier tous les risques opérationnels',
      'Évaluer et prioriser les risques',
      'Mettre en place des mesures préventives',
      'Assurer un suivi continu'
    ]
  },
  {
    id: 'iso9001',
    name: 'ISO 9001:2015',
    subtitle: 'Système Management Qualité',
    description: 'SWOT, diagnostic qualité, plan d\'action et accompagnement à la certification ISO 9001.',
    icon: Award,
    color: 'bg-indigo-500',
    price: 'Sur devis',
    duration: '6-12 mois',
    deliverables: [
      'Politique qualité personnalisée',
      'Organigramme et cartographie processus',
      'Documentation complète ISO 9001',
      'Indicateurs qualité et rapports'
    ],
    objectives: [
      'Obtenir la certification ISO 9001:2015',
      'Structurer le système qualité',
      'Améliorer la satisfaction client',
      'Optimiser tous les processus'
    ]
  }
];

export default function Consulting() {
  const [, setLocation] = useLocation();

  const handleConsultingContact = (packName: string) => {
    // Navigate to contact page with consulting package pre-selected
    setLocation(`/contact?service=consulting&pack=${packName}`);
  };

  const handleDiagnosticClick = () => {
    window.location.href = '/grille-prediagnostic.html';
  };

  const handleWhatsAppClick = (packName?: string) => {
    trackWhatsAppClick();
    
    const baseMessage = packName 
      ? `Bonjour,\n\nJe suis intéressé(e) par votre pack de consulting "${packName}" pour optimiser ma pharmacie.\n\nPouvez-vous me donner plus d'informations et un devis ?\n\nCordialement`
      : `Bonjour,\n\nJe suis intéressé(e) par vos services de consulting pour optimiser ma pharmacie.\n\nPouvez-vous me donner plus d'informations ?\n\nCordialement`;
    
    const encodedMessage = encodeURIComponent(baseMessage);
    window.open(`https://wa.me/225759068744?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      <ConsultingSEO 
        title="Consultance Pharmacie Côte d'Ivoire - DJANVOUE, CLIENTÈLE, WAYO, TRÉSORERIE, ISO 9001"
        description="Services de consultance spécialisés pour pharmacies d'officine en Côte d'Ivoire et Afrique de l'Ouest : GPEC et gestion RH, acquisition clientèle, optimisation gestion stocks, trésorerie, risk management, certification ISO 9001. Diagnostic gratuit et devis personnalisé."
        canonical="/consulting"
        keywords="consultance pharmacie Côte d'Ivoire, conseil pharmacie Abidjan, GPEC pharmacie, gestion RH officine, optimisation stocks pharmacie, trésorerie officine, risk management pharmacie, certification ISO 9001 pharmacie, diagnostic pharmacie gratuit, consultant pharmaceutique Côte d'Ivoire, audit pharmacie, amélioration performance officine, Afrique de l'Ouest"
      />
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-primary/10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Consulting Pharmaceutique
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Le cabinet d'un pharmacien, pour les pharmaciens(ennes). 
              Des solutions sur-mesure pour optimiser votre officine.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Badge variant="secondary" className="text-sm px-4 py-2">
                <TrendingUp className="w-4 h-4 mr-2" />
                Performance
              </Badge>
              <Badge variant="secondary" className="text-sm px-4 py-2">
                <CheckCircle className="w-4 h-4 mr-2" />
                Résultats mesurables
              </Badge>
              <Badge variant="secondary" className="text-sm px-4 py-2">
                <Clock className="w-4 h-4 mr-2" />
                Accompagnement personnalisé
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Packs de Consulting */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Nos Packs de Consulting
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              6 solutions expertes pour transformer votre pharmacie et maximiser sa performance.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {consultingPacks.map((pack) => {
              const IconComponent = pack.icon;
              return (
                <Card key={pack.id} className="hover-elevate h-full" data-testid={`card-pack-${pack.id}`}>
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-3 rounded-lg ${pack.color} text-white`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{pack.name}</CardTitle>
                        <Badge variant="outline" className="text-xs mt-1">
                          {pack.duration}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription className="text-sm font-medium text-primary">
                      {pack.subtitle}
                    </CardDescription>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {pack.description}
                    </p>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Objectifs :</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {pack.objectives.slice(0, 3).map((objective, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                            {objective}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Livrables :</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {pack.deliverables.slice(0, 2).map((deliverable, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                            {deliverable}
                          </li>
                        ))}
                        {pack.deliverables.length > 2 && (
                          <li className="text-xs text-muted-foreground/70">
                            +{pack.deliverables.length - 2} autres livrables
                          </li>
                        )}
                      </ul>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="pt-4">
                    <div className="w-full">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-muted-foreground">Tarif :</span>
                        <span className="font-semibold text-primary">{pack.price}</span>
                      </div>
                      <Button 
                        className="w-full" 
                        onClick={() => handleConsultingContact(pack.name)}
                        data-testid={`button-contact-${pack.id}`}
                      >
                        Demander un devis
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-primary/5 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Prêt à transformer votre officine ?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Nos experts vous accompagnent avec des solutions personnalisées 
            et des résultats mesurables.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={handleDiagnosticClick}
              data-testid="button-cta-contact"
            >
              Demander un diagnostic gratuit
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => handleWhatsAppClick()}
              data-testid="button-cta-whatsapp"
            >
              Discuter sur WhatsApp
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}