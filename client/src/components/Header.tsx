import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
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
  const [location] = useLocation();

  const handleWhatsAppClick = () => {
    console.log('WhatsApp contact triggered');
    window.open('https://wa.me/225759068744', '_blank');
  };

  const handleDiagnosticClick = () => {
    window.location.href = '/diagnostic';
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-y-3 py-3 md:h-20 md:flex-nowrap md:py-0">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 hover-elevate">
            <img 
              src={logoImage} 
              alt="Kemet Services" 
              className="h-12 md:h-16 w-auto"
              data-testid="img-logo"
            />
          </Link>

          {/* Navigation */}
          <nav className="flex flex-wrap items-center gap-x-3 gap-y-2 md:flex-nowrap md:space-x-6 lg:space-x-8">
            {navigation.map((item) => (
              <Link 
                key={item.name} 
                href={item.href}
                className={`text-xs md:text-sm font-medium transition-colors hover:text-primary whitespace-nowrap ${
                  location === item.href 
                    ? 'text-primary border-b-2 border-primary pb-1 md:pb-4' 
                    : 'text-muted-foreground'
                }`}
                data-testid={`link-nav-${item.name.toLowerCase()}`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* CTAs */}
          <div className="flex items-center gap-2 md:space-x-4">
            <div className="hidden md:block">
              <KemetCatalog.Button />
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleWhatsAppClick}
              className="text-primary border-primary"
              data-testid="button-whatsapp"
            >
              <MessageCircle className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">WhatsApp</span>
            </Button>
            <Button 
              size="sm"
              onClick={handleDiagnosticClick}
              data-testid="button-diagnostic"
            >
              <span className="hidden md:inline">Diagnostic gratuit</span>
              <span className="md:hidden">Diagnostic</span>
            </Button>
          </div>

        </div>

      </div>
    </header>
  );
}