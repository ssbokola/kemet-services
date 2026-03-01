import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';
import { formatCFA } from '@/lib/utils';
import ScrollReveal, { StaggerContainer, StaggerItem } from '@/components/ScrollReveal';

export default function UpcomingSessions() {
  const { data: trainingsData = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/onsite-trainings']
  });

  // Collecter toutes les sessions et les trier par date
  const upcomingSessions = trainingsData
    .flatMap(training =>
      (training.sessions || []).map((session: any) => ({
        ...session,
        trainingTitle: training.title,
        trainingSlug: training.slug,
        trainingCategory: training.category,
      }))
    )
    .filter((session: any) => {
      const sessionDate = new Date(session.startDate);
      const now = new Date();
      return sessionDate > now && session.status === 'open';
    })
    .sort((a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 3);

  if (isLoading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="h-8 w-48 bg-muted rounded mx-auto animate-pulse"></div>
          </div>
        </div>
      </section>
    );
  }

  if (upcomingSessions.length === 0) {
    return null;
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      quality: 'Qualité',
      finance: 'Finance',
      stock: 'Stock',
      hr: 'Ressources Humaines',
      auxiliaires: 'Auxiliaires',
      pharmaciens: 'Pharmaciens',
    };
    return labels[category] || category;
  };

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Prochaines Sessions de Formation
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Inscrivez-vous dès maintenant aux sessions en présentiel programmées
            </p>
          </div>
        </ScrollReveal>

        {/* Grille des sessions */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8" staggerDelay={0.12}>
          {upcomingSessions.map((session: any) => {
            const remainingPlaces = session.maxCapacity - (session.currentRegistrations || 0);
            const sessionDate = new Date(session.startDate);

            return (
              <StaggerItem key={session.id}>
                <Card
                  className="hover-elevate h-full"
                  data-testid={`card-session-${session.id}`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Badge variant="secondary" data-testid={`badge-category-${session.id}`}>
                        {getCategoryLabel(session.trainingCategory)}
                      </Badge>
                      <span className="text-lg font-bold text-primary" data-testid={`text-price-${session.id}`}>
                        {formatCFA(session.pricePerPerson)}
                      </span>
                    </div>
                    <CardTitle className="text-lg line-clamp-2" data-testid={`text-title-${session.id}`}>
                      {session.trainingTitle}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Date */}
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="font-medium" data-testid={`text-date-${session.id}`}>
                        {sessionDate.toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>

                    {/* Lieu */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span className="line-clamp-1" data-testid={`text-venue-${session.id}`}>
                        {session.venue}
                      </span>
                    </div>

                    {/* Places restantes */}
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span
                        className={remainingPlaces < 5 ? 'text-orange-600 dark:text-orange-400 font-medium' : ''}
                        data-testid={`text-places-${session.id}`}
                      >
                        {remainingPlaces} place{remainingPlaces > 1 ? 's' : ''} restante{remainingPlaces > 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Bouton inscription */}
                    <Link href={`/formation-presentiel/${session.trainingSlug}`}>
                      <Button
                        className="w-full mt-4"
                        size="sm"
                        data-testid={`button-inscribe-${session.id}`}
                      >
                        S'inscrire
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        {/* Lien vers le calendrier complet */}
        <ScrollReveal delay={0.2}>
          <div className="text-center">
            <Link href="/calendrier-formations">
              <Button
                variant="outline"
                size="lg"
                data-testid="button-view-calendar"
              >
                Voir tout le calendrier
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
