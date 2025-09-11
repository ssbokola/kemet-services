import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, 
  Users, 
  FileText, 
  ArrowRight, 
  MessageCircle,
  Download,
  Stethoscope
} from 'lucide-react';
import { useLocation } from 'wouter';
import { KemetCatalog } from '@/components/DownloadCatalog';

export default function ServiceCards() {
  const [, setLocation] = useLocation();

  const handleFormationsClick = () => {
    setLocation('/formations');
  };

  const handleConsultingClick = () => {
    setLocation('/consulting');
  };

  const handleResourcesClick = () => {
    setLocation('/ressources');
  };

  const handleAProposClick = () => {
    setLocation('/a-propos');
  };

  const handleWhatsAppClick = () => {
    window.open('https://wa.me/225759068744?text=Bonjour%20Kemet%20Services%2C%0A%0AJe%20souhaite%20obtenir%20plus%20d%27informations%20sur%20vos%20services.%0A%0ACordialement', '_blank');
  };

  const handleDiagnosticClick = () => {
    setLocation('/diagnostic');
  };

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-serif text-foreground mb-4">
            Nos Services d'Excellence
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Des solutions complètes et personnalisées pour transformer votre pharmacie 
            en centre d'excellence opérationnelle.
          </p>
        </div>

        {/* Service Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Formations Card */}
          <Card className="group hover-elevate cursor-pointer h-full" onClick={handleFormationsClick} data-testid="card-formations">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <GraduationCap className="w-8 h-8 text-primary" />
              </div>
              <Badge variant="secondary" className="mx-auto mb-2">
                22 formations
              </Badge>
              <CardTitle className="text-xl font-semibold">
                Formations
              </CardTitle>
              <CardDescription className="text-sm">
                Qualité • Finance • Stock • RH
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Programmes certifiés adaptés aux réalités africaines pour pharmaciens et auxiliaires.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                data-testid="button-formations-explore"
              >
                Découvrir nos formations
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Consulting Card */}
          <Card className="group hover-elevate cursor-pointer h-full" onClick={handleConsultingClick} data-testid="card-consulting">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-chart-1/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-chart-1/20 transition-colors">
                <Users className="w-8 h-8 text-chart-1" />
              </div>
              <Badge variant="secondary" className="mx-auto mb-2">
                Sur mesure
              </Badge>
              <CardTitle className="text-xl font-semibold">
                Consulting
              </CardTitle>
              <CardDescription className="text-sm">
                Diagnostic • Audit • Optimisation
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Accompagnement personnalisé pour optimiser votre gestion et réduire les écarts.
              </p>
              <div className="space-y-2">
                <Button 
                  size="sm" 
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDiagnosticClick();
                  }}
                  data-testid="button-consulting-diagnostic"
                >
                  <Stethoscope className="w-4 h-4 mr-2" />
                  Diagnostic gratuit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleWhatsAppClick();
                  }}
                  data-testid="button-consulting-whatsapp"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Ressources Card */}
          <Card className="group hover-elevate cursor-pointer h-full" onClick={handleResourcesClick} data-testid="card-ressources">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-chart-2/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-chart-2/20 transition-colors">
                <FileText className="w-8 h-8 text-chart-2" />
              </div>
              <Badge variant="secondary" className="mx-auto mb-2">
                PDF gratuit
              </Badge>
              <CardTitle className="text-xl font-semibold">
                Ressources
              </CardTitle>
              <CardDescription className="text-sm">
                Guides • Outils • Documentation
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Catalogue complet, guides pratiques et outils pour votre pharmacie.
              </p>
              <div className="space-y-2">
                <div onClick={(e) => e.stopPropagation()}>
                  <KemetCatalog.Button className="w-full" />
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  data-testid="button-ressources-explore"
                >
                  Explorer les ressources
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Dr. Bokola Card */}
          <Card className="group hover-elevate cursor-pointer h-full" onClick={handleAProposClick} data-testid="card-a-propos">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 rounded-full overflow-hidden mb-4 border-2 border-primary/20 group-hover:border-primary/40 transition-colors bg-primary/10 flex items-center justify-center">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <Badge variant="secondary" className="mx-auto mb-2">
                Expert pharmacien
              </Badge>
              <CardTitle className="text-xl font-semibold">
                Dr. Bokola
              </CardTitle>
              <CardDescription className="text-sm">
                Fondateur • 10+ ans • Pan-africain
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Doctorat Pharmacie, MBA, Master Qualité. 5+ pharmacies transformées.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                data-testid="button-a-propos-about"
              >
                En savoir plus
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

        </div>

        {/* Bottom CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-muted/30 rounded-2xl p-8 md:p-12">
            <h3 className="text-2xl md:text-3xl font-bold font-serif text-foreground mb-4">
              Prêt à transformer votre pharmacie ?
            </h3>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Rejoignez les pharmaciens africains qui ont déjà optimisé leur gestion 
              et amélioré leurs performances avec Kemet Services.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                onClick={handleDiagnosticClick}
                className="text-lg px-8 py-6"
                data-testid="button-bottom-diagnostic"
              >
                <Stethoscope className="w-5 h-5 mr-2" />
                Commencer par un diagnostic gratuit
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={handleWhatsAppClick}
                className="text-lg px-8 py-6"
                data-testid="button-bottom-whatsapp"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Discuter avec Dr. Bokola
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}