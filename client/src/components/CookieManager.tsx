import { useState, useEffect, createContext, useContext } from 'react';

// Types partagés
export interface CookieConsent {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  timestamp: number;
  version: string;
}

export const COOKIE_POLICY_VERSION = '1.0';
export const CONSENT_EXPIRY_DAYS = 180; // CNIL-friendly: 6 mois

export const defaultConsent: CookieConsent = {
  necessary: true, // Toujours activé
  analytics: false,
  marketing: false,
  functional: false,
  timestamp: Date.now(),
  version: COOKIE_POLICY_VERSION
};

export const cookieCategories = [
  {
    id: 'necessary',
    name: 'Cookies strictement nécessaires',
    description: 'Ces cookies sont indispensables au fonctionnement du site et ne peuvent pas être désactivés.',
    required: true,
    examples: 'Session utilisateur, sécurité CSRF, préférences de cookies'
  },
  {
    id: 'functional',
    name: 'Cookies fonctionnels',
    description: 'Ces cookies permettent d\'améliorer les fonctionnalités et la personnalisation du site.',
    required: false,
    examples: 'Préférences de langue, mode sombre, paramètres d\'affichage'
  },
  {
    id: 'analytics',
    name: 'Cookies analytiques',
    description: 'Ces cookies nous aident à comprendre comment vous utilisez notre site pour l\'améliorer.',
    required: false,
    examples: 'Google Analytics, mesures d\'audience, statistiques de performance'
  },
  {
    id: 'marketing',
    name: 'Cookies marketing',
    description: 'Ces cookies sont utilisés pour vous proposer des publicités pertinentes.',
    required: false,
    examples: 'Publicités ciblées, remarketing, réseaux sociaux'
  }
];

// Context pour partager l'état des cookies
interface CookieContextType {
  consent: CookieConsent | null;
  showPreferencesModal: boolean;
  setShowPreferencesModal: (show: boolean) => void;
  saveConsent: (consent: CookieConsent) => void;
  needsConsentBanner: boolean;
}

const CookieContext = createContext<CookieContextType | undefined>(undefined);

export function useCookieContext() {
  const context = useContext(CookieContext);
  if (context === undefined) {
    throw new Error('useCookieContext must be used within a CookieManager');
  }
  return context;
}

interface CookieManagerProps {
  children: React.ReactNode;
}

export default function CookieManager({ children }: CookieManagerProps) {
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [needsConsentBanner, setNeedsConsentBanner] = useState(false);

  useEffect(() => {
    const loadConsent = () => {
      const savedConsent = localStorage.getItem('cookie-consent');
      if (savedConsent) {
        try {
          const parsed: CookieConsent = JSON.parse(savedConsent);
          
          // Vérifier si le consentement n'a pas expiré et si la version est à jour
          const isExpired = Date.now() - parsed.timestamp > CONSENT_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
          const isOutdated = parsed.version !== COOKIE_POLICY_VERSION;
          
          if (!isExpired && !isOutdated) {
            setConsent(parsed);
            setNeedsConsentBanner(false);
          } else {
            // Consentement expiré ou version obsolète
            setNeedsConsentBanner(true);
          }
        } catch {
          setNeedsConsentBanner(true);
        }
      } else {
        setNeedsConsentBanner(true);
      }
    };

    loadConsent();
  }, []);

  const saveConsent = (newConsent: CookieConsent) => {
    const consentWithTimestamp = {
      ...newConsent,
      timestamp: Date.now(),
      version: COOKIE_POLICY_VERSION
    };
    
    localStorage.setItem('cookie-consent', JSON.stringify(consentWithTimestamp));
    setConsent(consentWithTimestamp);
    setNeedsConsentBanner(false);
    setShowPreferencesModal(false);
    
    // Déclencher les événements pour les services tiers
    window.dispatchEvent(new CustomEvent('cookieConsentChanged', { 
      detail: consentWithTimestamp 
    }));
  };

  // Exposer globalement la fonction pour ouvrir les préférences
  useEffect(() => {
    (window as any).openCookiePreferences = () => {
      setShowPreferencesModal(true);
    };

    // Nettoyer à la destruction du composant (même si cela ne devrait jamais arriver)
    return () => {
      delete (window as any).openCookiePreferences;
    };
  }, []);

  const contextValue: CookieContextType = {
    consent,
    showPreferencesModal,
    setShowPreferencesModal,
    saveConsent,
    needsConsentBanner
  };

  return (
    <CookieContext.Provider value={contextValue}>
      {children}
    </CookieContext.Provider>
  );
}

// Hook pour accéder aux préférences de cookies dans l'application (pour compatibilité)
export function useCookieConsent() {
  const { consent } = useCookieContext();
  return consent;
}