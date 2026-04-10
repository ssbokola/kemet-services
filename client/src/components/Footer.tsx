import { Button } from '@/components/ui/button';
import { MessageCircle, Mail, MapPin, Linkedin } from 'lucide-react';
import { Link } from 'wouter';
import logoImage from '@assets/LOGO KEMET CANVAS_1757585789355.png';
import { trackWhatsAppClick, trackEvent } from '@/components/GoogleAnalytics';

const footerLinks = {
  services: [
    { name: 'Formations', href: '/formations' },
    { name: 'Consulting', href: '/consulting' },
    { name: 'Diagnostic', href: '/grille-prediagnostic.html' },
    { name: 'Kemet Echo', href: '/kemet-echo' },
    { name: 'Prise en charge FDFP', href: '/fdfp' }
  ],
  company: [
    { name: 'À propos', href: '/a-propos' },
    { name: 'Galerie', href: '/galerie' },
    { name: 'Ressources', href: '/ressources' },
    { name: 'Contact', href: '/contact' },
    { name: 'FAQ', href: '/faq' }
  ],
  legal: [
    { name: 'Mentions légales', href: '/mentions-legales' },
    { name: 'Politique de confidentialité', href: '/confidentialite' },
    { name: 'Politique de cookies', href: '/politique-cookies' },
    { name: 'Gérer les cookies', href: '#', action: 'openCookiePreferences' }
  ]
};

export default function Footer() {
  const handleEmailClick = () => {
    trackEvent('email_click', {
      event_category: 'contact',
      event_label: 'footer_email',
      value: 1
    });
    window.location.href = 'mailto:infos@kemetservices.com';
  };

  const handleWhatsAppClick = () => {
    trackWhatsAppClick();
    window.open('https://wa.me/225759068744', '_blank');
  };

  const handleMapsClick = () => {
    console.log('Google Maps Abidjan triggered');
    // In a real app, this would open Google Maps with specific location
  };

  const handleLinkedInClick = () => {
    trackEvent('linkedin_click', {
      event_category: 'social',
      event_label: 'footer_linkedin',
      value: 1
    });
    window.open('https://linkedin.com/company/kemet-services', '_blank', 'noopener,noreferrer');
  };

  const handleCookiePreferencesClick = () => {
    if ((window as any).openCookiePreferences) {
      (window as any).openCookiePreferences();
    }
  };

  return (
    <footer className="bg-muted/30 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <img
              src={logoImage}
              alt="Kemet Services"
              className="h-12 w-auto mb-6"
              data-testid="img-footer-logo"
            />
            <p className="text-muted-foreground leading-relaxed mb-6">
              Cabinet de formation et consultance spécialisé dans l'optimisation des pharmacies d'officine en Côte d'Ivoire.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <button 
                onClick={handleEmailClick}
                className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
                data-testid="button-footer-email"
              >
                <Mail className="w-4 h-4 mr-3" />
                infos@kemetservices.com
              </button>
              <button 
                onClick={handleMapsClick}
                className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
                data-testid="button-footer-location"
              >
                <MapPin className="w-4 h-4 mr-3" />
                Mamie Adjoua, Yopougon - Abidjan, Côte d'Ivoire
              </button>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-foreground font-semibold mb-6">Services</h3>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    data-testid={`link-footer-${link.name.toLowerCase()}`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-foreground font-semibold mb-6">Entreprise</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    data-testid={`link-footer-${link.name.toLowerCase()}`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Legal */}
          <div>
            <h3 className="text-foreground font-semibold mb-6">Contact</h3>
            <div className="space-y-4 mb-8">
              <Button 
                size="sm"
                onClick={handleWhatsAppClick}
                className="w-full justify-start"
                data-testid="button-footer-whatsapp"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Écrire sur WhatsApp
              </Button>
              <Button 
                variant="outline"
                size="sm"
                onClick={handleLinkedInClick}
                className="w-full justify-start"
                data-testid="button-footer-linkedin"
              >
                <Linkedin className="w-4 h-4 mr-2" />
                LinkedIn
              </Button>
            </div>

            <div>
              <h4 className="text-foreground font-medium mb-3">Légal</h4>
              <ul className="space-y-2">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    {link.action === 'openCookiePreferences' ? (
                      <button
                        onClick={handleCookiePreferencesClick}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        data-testid={`button-footer-${link.name.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        {link.name}
                      </button>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                        data-testid={`link-footer-${link.name.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Kemet Services. Tous droits réservés.
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <span className="text-xs text-muted-foreground">Accompagnement vers la certification ISO 9001:2015</span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">BPF</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}