import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Menu, X, MessageCircle } from 'lucide-react';
import { KemetCatalog } from '@/components/DownloadCatalog';
import logoImage from '@assets/LOGO KEMET CANVAS_1757585789355.png';

const navigation = [
  { name: 'Accueil', href: '/' },
  { name: 'Formations', href: '/formations' },
  { name: 'Consulting', href: '/consulting' },
  { name: 'À propos', href: '/a-propos' },
  { name: 'Ressources', href: '/ressources' },
  { name: 'Contact', href: '/contact' },
];

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  const handleWhatsAppClick = () => {
    console.log('WhatsApp contact triggered');
    window.open('https://wa.me/225759068744', '_blank');
  };

  const handleDiagnosticClick = () => {
    // Use wouter navigation instead of window.location
    window.location.href = '/diagnostic';
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 hover-elevate">
            <img 
              src={logoImage} 
              alt="Kemet Services" 
              className="h-16 w-auto"
              data-testid="img-logo"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link 
                key={item.name} 
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location === item.href 
                    ? 'text-primary border-b-2 border-primary pb-4' 
                    : 'text-muted-foreground'
                }`}
                data-testid={`link-nav-${item.name.toLowerCase()}`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center space-x-4">
            <KemetCatalog.Button />
            <Button 
              variant="outline" 
              onClick={handleWhatsAppClick}
              className="text-primary border-primary"
              data-testid="button-whatsapp"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp
            </Button>
            <Button 
              onClick={handleDiagnosticClick}
              data-testid="button-diagnostic"
            >
              Diagnostic gratuit
            </Button>
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <Link 
                  key={item.name} 
                  href={item.href}
                  className={`text-sm font-medium transition-colors ${
                    location === item.href ? 'text-primary' : 'text-muted-foreground'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  data-testid={`link-mobile-${item.name.toLowerCase()}`}
                >
                  {item.name}
                </Link>
              ))}
              <div className="flex flex-col space-y-2 pt-4 border-t border-border">
                <KemetCatalog.Button className="justify-start text-sm" />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleWhatsAppClick}
                  className="justify-start text-primary border-primary"
                  data-testid="button-mobile-whatsapp"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
                <Button 
                  size="sm"
                  onClick={handleDiagnosticClick}
                  className="justify-start"
                  data-testid="button-mobile-diagnostic"
                >
                  Diagnostic gratuit
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}