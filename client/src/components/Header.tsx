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
                      location === '/formations' || location === '/formations-presentiel' || location === '/calendrier-formations' || location === '/bootcamp-stock'
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
                            href="/formations"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            data-testid="link-formations-en-ligne"
                          >
                            <div className="text-sm font-medium leading-none">Formations en Ligne</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Catalogue LMS
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
                            <div className="text-sm font-medium leading-none">Formations en Présentiel</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Sessions programmées
                            </p>
                          </RouterLink>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <RouterLink
                            href="/calendrier-formations"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            data-testid="link-calendrier-formations"
                          >
                            <div className="text-sm font-medium leading-none">Calendrier</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Prochaines sessions
                            </p>
                          </RouterLink>
                        </NavigationMenuLink>
                      </li>
                      <li className="border-t pt-1">
                        <NavigationMenuLink asChild>
                          <RouterLink
                            href="/bootcamp-stock"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground bg-primary/5"
                            data-testid="link-bootcamp-stock"
                          >
                            <div className="text-sm font-medium leading-none text-primary">🔥 Bootcamp Stock+</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Événement spécial - Nov-Déc 2025
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