import { Link, useLocation } from 'wouter';
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

          {/* Navigation */}
          <nav className="flex items-center space-x-6 lg:space-x-8">
            {navigation.map((item) => (
              <Link 
                key={item.name} 
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary whitespace-nowrap ${
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

        </div>

      </div>
    </header>
  );
}