import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, Phone, ArrowRight } from 'lucide-react';

export default function CTASection() {
  const handleWhatsAppClick = () => {
    console.log('WhatsApp CTA triggered');
    window.open('https://wa.me/225759068744', '_blank');
  };

  const handleDiagnosticClick = () => {
    console.log('Diagnostic CTA triggered');
    // In a real app, this would open contact form
  };

  const handleEmailClick = () => {
    window.location.href = 'mailto:infos@kemetservices.com';
  };

  return (
    <section className="py-24 bg-primary/5">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="border-0 shadow-2xl bg-gradient-to-br from-background to-muted/20">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-foreground mb-6">
              Prêt à transformer votre officine ?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto">
              Contactez-nous dès aujourd'hui pour un diagnostic gratuit et découvrez comment optimiser vos performances.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button 
                size="lg"
                onClick={handleDiagnosticClick}
                className="text-lg px-8 py-6"
                data-testid="button-cta-diagnostic"
              >
                Diagnostic gratuit
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={handleWhatsAppClick}
                className="text-lg px-8 py-6 text-primary border-primary"
                data-testid="button-cta-whatsapp"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                WhatsApp
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
      </div>
    </section>
  );
}