import { useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { BookOpen, Mail, User as UserIcon } from 'lucide-react';

interface UserData {
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
}

export default function MonCompte() {
  const { user: authUser, isLoading, isAuthenticated } = useAuth();
  const user = authUser as UserData;
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation('/login');
    }
  }, [isLoading, isAuthenticated, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="py-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center">
              <p className="text-muted-foreground">Chargement...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return `${first}${last}`.toUpperCase() || 'U';
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Mon compte - Kemet Services</title>
        <meta name="description" content="Gérez vos formations et suivez votre progression" />
      </Helmet>

      <Header />

      <main className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <Card>
            <CardHeader className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20" data-testid="avatar-user">
                  <AvatarImage src={user.profileImageUrl} alt={`${user.firstName} ${user.lastName}`} />
                  <AvatarFallback className="text-2xl">
                    {getInitials(user.firstName, user.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold font-serif text-foreground" data-testid="text-username">
                    {user.firstName} {user.lastName}
                  </h1>
                  <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span data-testid="text-email">{user.email}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold font-serif text-foreground">Mes Formations</h2>
              <Button asChild data-testid="button-explorer">
                <Link href="/formations">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Explorer les formations
                </Link>
              </Button>
            </div>

            <Card>
              <CardContent className="py-16">
                <div className="text-center max-w-md mx-auto">
                  <div className="bg-muted/50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                    <BookOpen className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3" data-testid="text-no-formations">
                    Vous n'êtes inscrit à aucune formation
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Commencez votre parcours d'apprentissage en explorant notre catalogue de formations
                  </p>
                  <Button asChild size="lg" data-testid="button-explorer-formations">
                    <Link href="/formations">
                      Explorer les formations
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <h2 className="text-2xl font-semibold font-serif text-foreground flex items-center gap-2">
                <UserIcon className="w-6 h-6 text-primary" />
                Informations du compte
              </h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Prénom</label>
                  <p className="text-foreground mt-1" data-testid="text-firstname">{user.firstName || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nom</label>
                  <p className="text-foreground mt-1" data-testid="text-lastname">{user.lastName || '-'}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-foreground mt-1" data-testid="text-user-email">{user.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
