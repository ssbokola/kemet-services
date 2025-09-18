import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';
import { useLocation } from 'wouter';

interface GoogleAnalyticsProps {
  trackingId?: string;
}

// Étendre l'interface Window pour inclure gtag
declare global {
  interface Window {
    gtag: (command: string, ...args: any[]) => void;
    dataLayer: any[];
  }
}

// Hook pour tracker les pages
export const usePageTracking = (trackingId?: string) => {
  const [location] = useLocation();

  useEffect(() => {
    if (trackingId && window.gtag) {
      window.gtag('config', trackingId, {
        page_path: location,
        page_title: document.title,
        page_location: window.location.href
      });
    }
  }, [location, trackingId]);
};

// Fonction utilitaire pour tracker les événements
export const trackEvent = (eventName: string, parameters: Record<string, any> = {}) => {
  if (window.gtag) {
    window.gtag('event', eventName, parameters);
  }
};

// Fonctions de tracking spécialisées pour Kemet Services
export const trackFormationPDFDownload = (formationName: string) => {
  trackEvent('pdf_download', {
    event_category: 'engagement',
    event_label: formationName,
    value: 1
  });
};

export const trackContactFormSubmit = (formType: 'diagnostic' | 'contact' | 'newsletter') => {
  trackEvent('form_submit', {
    event_category: 'conversion',
    event_label: formType,
    value: 1
  });
};

export const trackConsultingInterest = (serviceType: string) => {
  trackEvent('consulting_interest', {
    event_category: 'engagement',
    event_label: serviceType,
    value: 1
  });
};

export const trackPhoneClick = () => {
  trackEvent('phone_click', {
    event_category: 'contact',
    event_label: 'phone_number',
    value: 1
  });
};

export const trackWhatsAppClick = () => {
  trackEvent('whatsapp_click', {
    event_category: 'contact', 
    event_label: 'whatsapp',
    value: 1
  });
};

const GoogleAnalytics: React.FC<GoogleAnalyticsProps> = ({ trackingId }) => {
  // Ne pas charger GA4 si pas d'ID de tracking ou en développement local sans variable explicite  
  const shouldLoadGA = trackingId && (
    import.meta.env.PROD || 
    import.meta.env.VITE_GA_DEV === 'true' ||
    import.meta.env.DEV // Vite utilise DEV au lieu de NODE_ENV === 'development'
  );

  // Debug: Log tracking configuration (remove in production)
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('Google Analytics Debug:', {
        trackingId,
        shouldLoadGA,
        env: import.meta.env.NODE_ENV,
        isDev: import.meta.env.NODE_ENV === 'development',
        isProd: import.meta.env.PROD,
        gaDevMode: import.meta.env.VITE_GA_DEV,
        conditions: {
          hastrackingId: !!trackingId,
          isProdEnv: import.meta.env.PROD,
          isGaDevTrue: import.meta.env.VITE_GA_DEV === 'true',
          isViteDev: import.meta.env.DEV
        }
      });
    }
  }, [trackingId, shouldLoadGA]);

  // Hook pour tracker automatiquement les changements de page
  usePageTracking(shouldLoadGA ? trackingId : undefined);

  if (!shouldLoadGA) {
    return null;
  }

  // Détecter si c'est Google Tag Manager (GTM-) ou Google Analytics 4 (G-)
  const isGTM = trackingId?.startsWith('GTM-');
  const isGA4 = trackingId?.startsWith('G-');

  return (
    <Helmet>
      {isGTM ? (
        // Google Tag Manager
        <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${trackingId}`} />
          <script>
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${trackingId}');
            `}
          </script>
        </>
      ) : isGA4 ? (
        // Google Analytics 4
        <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${trackingId}`} />
          <script>
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${trackingId}', {
                page_title: document.title,
                page_location: window.location.href,
                send_page_view: true
              });
            `}
          </script>
        </>
      ) : (
        // ID de tracking non reconnu
        <script>
          {`console.warn('Google Analytics: ID de tracking non reconnu:', '${trackingId}');`}
        </script>
      )}
    </Helmet>
  );
};

export default GoogleAnalytics;