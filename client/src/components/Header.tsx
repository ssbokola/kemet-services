import { Link, useLocation } from 'wouter';
import logoImage from '@assets/LOGO KEMET CANVAS_1757585789355.png';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

const navigation = [
  { name: 'Accueil', href: '/' },
  { name: 'Galerie', href: '/galerie' },
  { name: 'Kemet Echo', href: '/kemet-echo' },
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
            
            {/* Formations Dropdown */}
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger 
                    className={`text-sm font-medium ${
                      location === '/formations' || location === '/formations-presentiel'
                        ? 'text-primary' 
                        : 'text-muted-foreground'
                    }`}
                    data-testid="dropdown-formations"
                  >
                    Formations
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[200px] gap-1 p-2">
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            href="/formations"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            data-testid="link-formations-en-ligne"
                          >
                            <div className="text-sm font-medium leading-none">Formations en Ligne</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Catalogue LMS
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            href="/formations-presentiel"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            data-testid="link-formations-presentiel"
                          >
                            <div className="text-sm font-medium leading-none">Formations en Présentiel</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Sessions programmées
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </nav>

        </div>

      </div>
    </header>
  );
}