import { Button } from '@/components/ui/button';
import { ArrowRight, MessageCircle } from 'lucide-react';
import heroImage from '@assets/_D6A2216_1757585998505.jpg';
import logoImage from '@assets/LOGO KEMET CANVAS_1757585789355.png';

export default function Hero() {
  const handleDiagnosticClick = () => {
    console.log('Diagnostic gratuit triggered');
    // In a real app, this would open a modal or navigate to form
  };

  const handleFormationsClick = () => {
    console.log('Découvrir formations triggered');
    // In a real app, this would navigate to /formations
  };

  return (
    <section className="relative min-h-[90vh] flex items-center bg-background">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/images/hero-formation.jpg" 
          alt="Formation pharmacie en Côte d'Ivoire" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4 mb-6">
            <img 
              src="/images/logo.png" 
              alt="Kemet Services" 
              className="h-16 w-auto"
              data-testid="img-hero-logo"
            />
            <h1 className="text-4xl md:text-6xl font-bold font-serif text-foreground leading-tight">
              La qualité qui fait grandir votre officine
            </h1>
          </div>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
            Formations ciblées et consultance opérationnelle pour pharmacies d'officine en Côte d'Ivoire.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              onClick={handleDiagnosticClick}
              className="text-lg px-8 py-6"
              data-testid="button-hero-diagnostic"
            >
              Diagnostic gratuit
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={handleFormationsClick}
              className="text-lg px-8 py-6 bg-background/80 backdrop-blur-sm border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              data-testid="button-hero-formations"
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Découvrir nos formations
            </Button>
          </div>

          {/* Trust Badge */}
          <div className="mt-12 flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>ISO 9001:2015</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Bonnes Pratiques de FABRICATION</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Ancrage terrain Côte d'Ivoire</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}