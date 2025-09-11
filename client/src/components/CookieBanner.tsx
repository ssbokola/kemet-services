import { Button } from '@/components/ui/button';
import { Settings, Cookie } from 'lucide-react';
import { Link } from 'wouter';
import { useCookieContext, defaultConsent, type CookieConsent, COOKIE_POLICY_VERSION } from '@/components/CookieManager';

export default function CookieBanner() {
  const { needsConsentBanner, saveConsent, setShowPreferencesModal } = useCookieContext();

  const handleAcceptAll = () => {
    const allAccepted: CookieConsent = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
      timestamp: Date.now(),
      version: COOKIE_POLICY_VERSION
    };
    saveConsent(allAccepted);
  };

  const handleRejectOptional = () => {
    saveConsent(defaultConsent);
  };

  const openPreferences = () => {
    setShowPreferencesModal(true);
  };

  if (!needsConsentBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg">
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Cookie className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Gestion des cookies</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Nous utilisons des cookies pour améliorer votre expérience sur notre site. 
              Vous pouvez accepter tous les cookies ou personnaliser vos préférences.
            </p>
            <div className="mt-2">
              <Link href="/politique-cookies" className="text-xs text-primary hover:underline">
                En savoir plus sur notre politique de cookies
              </Link>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 min-w-fit">
            <Button 
              variant="outline" 
              size="sm"
              onClick={openPreferences}
              data-testid="button-customize-cookies"
            >
              <Settings className="w-4 h-4 mr-2" />
              Personnaliser
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRejectOptional}
              data-testid="button-reject-optional"
            >
              Rejeter optionnels
            </Button>
            
            <Button 
              size="sm" 
              onClick={handleAcceptAll}
              data-testid="button-accept-all"
            >
              Accepter tout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}