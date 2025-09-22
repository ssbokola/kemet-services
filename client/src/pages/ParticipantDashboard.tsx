import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Award, LogOut, User } from "lucide-react";
import { Link } from "wouter";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function ParticipantDashboard() {
  const { toast } = useToast();
  const { user, isLoading, isAuthenticated } = useAuth();

  // Redirect if not authenticated - blueprint:javascript_log_in_with_replit
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour accéder à cette page.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const displayName = (user as any)?.firstName && (user as any)?.lastName 
    ? `${(user as any).firstName} ${(user as any).lastName}`
    : (user as any)?.email || 'Participant';

  const initials = (user as any)?.firstName && (user as any)?.lastName
    ? `${(user as any).firstName[0]}${(user as any).lastName[0]}`
    : (user as any)?.email?.[0]?.toUpperCase() || 'P';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/">
                <h1 className="text-xl font-bold text-primary hover:opacity-80 transition-opacity" data-testid="link-home">
                  Kemet Services
                </h1>
              </Link>
              <Badge variant="secondary">Espace Participant</Badge>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={(user as any)?.profileImageUrl || ''} alt={displayName} />
                  <AvatarFallback className="text-sm">{initials}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden sm:block" data-testid="text-user-name">
                  {displayName}
                </span>
              </div>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => window.location.href = '/api/logout'}
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only sm:ml-2">Déconnexion</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2" data-testid="text-welcome-title">
            Bienvenue, {(user as any)?.firstName || 'Participant'} !
          </h2>
          <p className="text-muted-foreground">
            Accédez à vos formations spécialisées en pharmacie d'officine
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Mes Formations */}
          <Card className="hover-elevate" data-testid="card-my-courses">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Mes Formations
              </CardTitle>
              <CardDescription>
                Accédez à vos formations en cours et complétées
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/participant/formations">
                <Button className="w-full" data-testid="button-access-courses">
                  Accéder aux formations
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Progression */}
          <Card data-testid="card-progress">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Progression
              </CardTitle>
              <CardDescription>
                Suivez votre progression dans les formations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Formations complétées</span>
                  <span className="font-medium" data-testid="text-completed-count">0/0</span>
                </div>
                <div className="w-full bg-secondary h-2 rounded-full">
                  <div className="bg-primary h-2 rounded-full w-0 transition-all duration-300"></div>
                </div>
                <Badge variant="outline" className="w-fit">
                  <Clock className="h-3 w-3 mr-1" />
                  0h d'apprentissage
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Profil */}
          <Card data-testid="card-profile">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Mon Profil
              </CardTitle>
              <CardDescription>
                Gérez vos informations personnelles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Email :</span>
                  <span className="ml-2" data-testid="text-user-email">{(user as any)?.email}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Statut :</span>
                  <Badge variant="secondary" className="ml-2">Participant actif</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-12">
          <h3 className="text-xl font-semibold mb-4">Actions rapides</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="hover-elevate">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Formations disponibles</h4>
                    <p className="text-sm text-muted-foreground">
                      Découvrez les nouvelles formations
                    </p>
                  </div>
                  <Link href="/participant/catalogue">
                    <Button variant="outline" data-testid="button-browse-catalog">
                      Parcourir
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Support</h4>
                    <p className="text-sm text-muted-foreground">
                      Besoin d'aide ? Contactez-nous
                    </p>
                  </div>
                  <Link href="/contact">
                    <Button variant="outline" data-testid="button-support">
                      Contacter
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}