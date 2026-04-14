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
import ScrollReveal, { StaggerContainer, StaggerItem } from '@/components/ScrollReveal';

export default function ServiceCards() {
  const [, setLocation] = useLocation();

  const handleFormationsClick = () => {
    setLocation('/calendrier-2026');
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
    window.location.href = '/grille-prediagnostic.html';
  };

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-foreground mb-4">
              Nos Services d'Excellence
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Des solutions complètes et personnalisées pour transformer votre pharmacie
              en centre d'excellence opérationnelle.
            </p>
          </div>
        </ScrollReveal>

        {/* Service Cards Grid */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={0.1}>

          {/* Formations Card */}
          <StaggerItem>
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
                <span className="text-sm text-primary font-medium hover:underline" data-testid="link-formations-explore">
                  Découvrir nos formations →
                </span>
              </CardContent>
            </Card>
          </StaggerItem>

          {/* Consulting Card */}
          <StaggerItem>
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
                <span className="text-sm text-primary font-medium hover:underline" data-testid="link-consulting-explore">
                  Découvrir nos packs →
                </span>
              </CardContent>
            </Card>
          </StaggerItem>

          {/* Ressources Card */}
          <StaggerItem>
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
                <span className="text-sm text-primary font-medium hover:underline" data-testid="link-ressources-explore">
                  Explorer les ressources →
                </span>
              </CardContent>
            </Card>
          </StaggerItem>

          {/* Dr. Bokola Card */}
          <StaggerItem>
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
                <span className="text-sm text-primary font-medium hover:underline" data-testid="link-a-propos-about">
                  En savoir plus →
                </span>
              </CardContent>
            </Card>
          </StaggerItem>

        </StaggerContainer>

        {/* Bottom CTA Section */}
        <ScrollReveal delay={0.2}>
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
        </ScrollReveal>
      </div>
    </section>
  );
}
