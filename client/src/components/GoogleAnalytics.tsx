import { Helmet } from 'react-helmet-async';
import { useEffect, useRef } from 'react';
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

// Hook pour tracker les pages avec prévention du double page_view
export const usePageTracking = (trackingId?: string) => {
  const [location] = useLocation();
  const isFirstPageTracked = useRef(false);

  useEffect(() => {
    if (trackingId && window.gtag) {
      // Éviter le double page_view : un seul page_view par navigation
      if (!isFirstPageTracked.current) {
        isFirstPageTracked.current = true;
      }
      
      // Envoyer l'événement page_view explicite (compatible avec send_page_view: false)
      window.gtag('event', 'page_view', {
        page_path: location,
        page_title: document.title,
        page_location: window.location.href
      });
    }
  }, [location, trackingId]);
};

// Fonction utilitaire pour tracker les événements avec transport beacon
export const trackEvent = (eventName: string, parameters: Record<string, any> = {}) => {
  if (window.gtag) {
    // Utiliser transport beacon pour la fiabilité
    window.gtag('event', eventName, {
      transport_type: 'beacon',
      ...parameters
    });
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
  // Vérifier que l'ID est un vrai ID GA4
  const isGA4Id = trackingId?.startsWith('G-');
  
  // Ne supporter que GA4 (G-*) pour éviter la confusion GTM
  if (trackingId && !isGA4Id) {
    console.warn('⚠️ Google Analytics: Seuls les IDs GA4 (G-*) sont supportés. ID reçu:', trackingId);
    return null;
  }
  
  // Déterminer si nous devons charger GA
  const shouldLoadGA = (
    // Toujours charger en production si trackingId est fourni et valide
    (import.meta.env.PROD && isGA4Id) ||
    // En développement, charger seulement si VITE_GA_DEV='true' explicitement
    import.meta.env.VITE_GA_DEV === 'true'
  );

  // Debug: Log tracking configuration (development only)
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('Google Analytics Debug:', {
        trackingId,
        shouldLoadGA,
        isGA4Id,
        env: import.meta.env.NODE_ENV,
        isProd: import.meta.env.PROD,
        gaDevMode: import.meta.env.VITE_GA_DEV,
        conditions: {
          hasTrackingId: !!trackingId,
          isValidGA4: isGA4Id,
          isProdEnv: import.meta.env.PROD,
          isGaDevTrue: import.meta.env.VITE_GA_DEV === 'true'
        }
      });
    }
  }, [trackingId, shouldLoadGA, isGA4Id]);

  // Hook pour tracker automatiquement les changements de page
  usePageTracking(shouldLoadGA ? trackingId : undefined);

  if (!shouldLoadGA || !isGA4Id) {
    return null;
  }

  return (
    <Helmet>
      {/* Google Analytics 4 - Script optimisé */}
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${trackingId}`} />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${trackingId}', {
              send_page_view: false
            });
          `,
        }}
      />
    </Helmet>
  );
};

export default GoogleAnalytics;