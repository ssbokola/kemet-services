import { MessageCircle } from 'lucide-react';
import { trackWhatsAppClick } from '@/components/GoogleAnalytics';

export default function StickyWhatsApp() {
  const handleClick = () => {
    trackWhatsAppClick();
    window.open(
      'https://wa.me/2250759068744?text=Bonjour%20Kemet%20Services%2C%0AJe%20souhaite%20obtenir%20plus%20d%27informations.',
      '_blank'
    );
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full shadow-lg px-4 py-3 text-white font-semibold text-sm transition-transform hover:scale-105 active:scale-95"
      style={{ backgroundColor: '#25D366' }}
      aria-label="Contacter sur WhatsApp"
      data-testid="sticky-whatsapp"
    >
      <MessageCircle className="w-5 h-5" />
      <span className="hidden sm:inline">WhatsApp</span>
    </button>
  );
}
