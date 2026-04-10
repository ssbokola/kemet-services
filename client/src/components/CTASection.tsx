import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, Calendar, ArrowRight, BookOpen } from 'lucide-react';
import { useLocation } from 'wouter';
import { trackWhatsAppClick, trackEvent } from '@/components/GoogleAnalytics';
import ScrollReveal from '@/components/ScrollReveal';

export default function CTASection() {
  const [, setLocation] = useLocation();

  const handleWhatsAppClick = () => {
    trackWhatsAppClick();
    window.open('https://wa.me/225759068744', '_blank');
  };

  const handleDiagnosticClick = () => {
    trackEvent('diagnostic_button_click', {
      event_category: 'conversion',
      event_label: 'cta_diagnostic',
      value: 1
    });
    window.location.href = '/grille-prediagnostic.html';
  };

  const handleFormationsClick = () => {
    trackEvent('formations_cta_click', {
      event_category: 'conversion',
      event_label: 'cta_formations',
      value: 1
    });
    setLocation('/formations');
  };

  const handleEmailClick = () => {
    trackEvent('email_click', {
      event_category: 'contact',
      event_label: 'cta_email',
      value: 1
    });
    window.location.href = 'mailto:infos@kemetservices.com';
  };

  return (
    <section className="py-24 bg-primary/5">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal duration={0.7}>
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-background to-muted/20">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold font-serif text-foreground mb-6">
                Prêt à transformer votre officine ?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto">
                Demandez votre diagnostic gratuit et découvrez comment optimiser vos performances.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Button
                  size="lg"
                  onClick={handleDiagnosticClick}
                  className="text-lg px-8 py-6"
                  data-testid="button-cta-diagnostic"
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  Demander un diagnostic gratuit
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleWhatsAppClick}
                  className="text-lg px-8 py-6 border-gold text-gold-dark hover:bg-gold/10"
                  data-testid="button-cta-whatsapp"
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Discuter sur WhatsApp
                </Button>
              </div>

              <div className="text-sm text-muted-foreground">
                <p className="mb-2">Ou contactez-nous directement :</p>
                <button
                  onClick={handleEmailClick}
                  className="text-primary hover:underline font-medium"
                  data-testid="button-cta-email"
                >
                  infos@kemetservices.com
                </button>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>
      </div>
    </section>
  );
}
