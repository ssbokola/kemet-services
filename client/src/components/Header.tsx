import { Link, useLocation } from 'wouter';
import { forwardRef } from 'react';
import logoImage from '@assets/LOGO KEMET CANVAS_1757585789355.png';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

interface RouterLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  'data-testid'?: string;
}

const RouterLink = forwardRef<HTMLAnchorElement, RouterLinkProps>(
  (props, ref) => {
    const { href, children, className, ...rest } = props;
    const [, setLocation] = useLocation();
    
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      // Allow default browser navigation for:
      // - Middle click (button !== 0)
      // - Modifier keys (Ctrl/Cmd/Shift/Alt for new tab/window)
      // - Links with target attribute
      const isModifiedEvent = e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;
      const isNonLeftClick = e.button !== 0;
      
      if (isModifiedEvent || isNonLeftClick) {
        return; // Let browser handle it
      }
      
      e.preventDefault();
      setLocation(href);
    };
    
    return (
      <a 
        href={href} 
        ref={ref} 
        className={className} 
        onClick={handleClick}
        {...rest}
      >
        {children}
      </a>
    );
  }
);
RouterLink.displayName = 'RouterLink';

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
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50 shadow-sm transition-all duration-300">
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
                      location === '/calendrier-2026' || location === '/formations-presentiel' || location === '/fdfp' || location.startsWith('/evenement/')
                        ? 'text-primary' 
                        : 'text-muted-foreground'
                    }`}
                    data-testid="dropdown-formations"
                  >
                    Formations
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[240px] gap-1 p-2">
                      <li>
                        <NavigationMenuLink asChild>
                          <RouterLink
                            href="/calendrier-2026"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground bg-primary/5"
                            data-testid="link-calendrier-2026"
                          >
                            <div className="text-sm font-medium leading-none text-primary">Calendrier 2026</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              13 événements à venir
                            </p>
                          </RouterLink>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <RouterLink
                            href="/formations-presentiel"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            data-testid="link-formations-presentiel"
                          >
                            <div className="text-sm font-medium leading-none">Catalogue Formations</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              22 formations disponibles
                            </p>
                          </RouterLink>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <RouterLink
                            href="/fdfp"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            data-testid="link-fdfp-nav"
                          >
                            <div className="text-sm font-medium leading-none">Prise en charge FDFP</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Jusqu'à 100% financés
                            </p>
                          </RouterLink>
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