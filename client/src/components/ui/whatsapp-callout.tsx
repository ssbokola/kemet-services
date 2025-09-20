import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, X, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { trackWhatsAppClick } from '@/components/GoogleAnalytics';

interface WhatsAppCalloutProps {
  phoneNumber?: string;
  message?: string;
  position?: 'bottom-right' | 'bottom-left';
  className?: string;
  autoShow?: boolean;
  showDelay?: number;
}

export function WhatsAppCallout({ 
  phoneNumber = '225759068744',
  message = 'Bonjour Kemet Services,\n\nJe souhaite obtenir plus d\'informations sur vos services de consulting pharmaceutique.\n\nCordialement',
  position = 'bottom-right',
  className,
  autoShow = true,
  showDelay = 3000
}: WhatsAppCalloutProps) {
  const [isVisible, setIsVisible] = useState(!autoShow);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (autoShow) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, showDelay);

      return () => clearTimeout(timer);
    }
  }, [autoShow, showDelay]);

  const handleWhatsAppClick = () => {
    // Track WhatsApp click with beacon transport for reliability
    trackWhatsAppClick();
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  if (!isVisible) return null;

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6'
  };

  return (
    <>
      {/* Backdrop when expanded */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/10 z-30"
          onClick={handleClose}
          data-testid="whatsapp-backdrop"
        />
      )}
      
      <div 
        className={cn(
          'fixed z-40 transition-all duration-300 ease-in-out',
          positionClasses[position],
          className
        )}
        data-testid="whatsapp-callout"
      >
      {/* Expanded Card */}
      {isExpanded && (
        <Card className="mb-4 w-80 sm:w-72 max-w-[calc(100vw-3rem)] shadow-lg border-green-200 animate-in slide-in-from-bottom-2 duration-300">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-foreground">Kemet Services</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6"
                onClick={handleClose}
                data-testid="button-close-callout"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground mb-3">
              Bonjour ! Besoin d'aide avec votre pharmacie ? 
              Dr. Bokola et son équipe sont disponibles sur WhatsApp.
            </p>
            
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2 text-xs text-green-700 dark:text-green-300 mb-1">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="font-medium">Disponible maintenant</span>
              </div>
              <p className="text-xs text-green-600 dark:text-green-400">
                Lun-Ven: 8h-18h • Sam: 8h-13h • Dimanche: Fermé
              </p>
            </div>
            
            <div className="space-y-2">
              <Button 
                onClick={handleWhatsAppClick}
                className="w-full bg-green-600 dark:bg-green-500"
                data-testid="button-whatsapp-chat"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Démarrer une conversation
              </Button>
              
              <div className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
                <span>✓ Réponse rapide</span>
                <span>•</span>
                <span>✓ Conseil gratuit</span>
                <span>•</span>
                <span>✓ Expert pharmacien</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Button */}
      <div className="flex items-center gap-2">
        {/* Notification Badge */}
        {!isExpanded && (
          <div 
            className="bg-white rounded-full shadow-lg p-2 cursor-pointer hover-elevate animate-in zoom-in-50 duration-500"
            onClick={toggleExpanded}
            data-testid="button-expand-callout"
          >
            <div className="text-xs font-medium text-foreground px-2 flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              Une question ?
            </div>
          </div>
        )}
        
        {/* WhatsApp Button */}
        <Button
          size="icon"
          onClick={isExpanded ? handleWhatsAppClick : toggleExpanded}
          className="rounded-full bg-green-600 dark:bg-green-500 shadow-lg"
          data-testid="button-whatsapp-main"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </div>

      {/* Pulse Animation Ring */}
      <div className={cn(
        'absolute inset-0 rounded-full -z-10',
        'bg-green-600/20 animate-ping pointer-events-none',
        isExpanded && 'hidden'
      )} />
      </div>
    </>
  );
}

// Preset configurations
export const KemetWhatsAppCallout = {
  // Configuration par défaut pour Kemet Services
  Default: (props?: Partial<WhatsAppCalloutProps>) => (
    <WhatsAppCallout
      phoneNumber="225759068744"
      message="Bonjour Kemet Services,\n\nJe souhaite obtenir plus d'informations sur vos services.\n\nCordialement"
      {...props}
    />
  ),

  // Pour les demandes de consulting
  Consulting: (props?: Partial<WhatsAppCalloutProps>) => (
    <WhatsAppCallout
      phoneNumber="225759068744"
      message="Bonjour,\n\nJe suis intéressé(e) par vos services de consulting pour optimiser ma pharmacie.\n\nPouvez-vous me donner plus d'informations ?\n\nCordialement"
      {...props}
    />
  ),

  // Pour les formations
  Formation: (props?: Partial<WhatsAppCalloutProps>) => (
    <WhatsAppCallout
      phoneNumber="225759068744"
      message="Bonjour,\n\nJe souhaite m'inscrire à vos formations pharmaceutiques.\n\nPouvez-vous me fournir le calendrier et les tarifs ?\n\nMerci"
      {...props}
    />
  ),

  // Pour le diagnostic gratuit
  Diagnostic: (props?: Partial<WhatsAppCalloutProps>) => (
    <WhatsAppCallout
      phoneNumber="225759068744"
      message="Bonjour,\n\nJe souhaite bénéficier de votre diagnostic gratuit pour ma pharmacie.\n\nQuand pouvons-nous planifier un rendez-vous ?\n\nCordialement"
      {...props}
    />
  )
};