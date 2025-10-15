import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams, Link, useLocation } from 'wouter';
import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Clock, BookOpen, CheckCircle2, AlertCircle, Users, Download, FileText, Link as LinkIcon } from 'lucide-react';
import { categoryLabels } from '@/data/formations';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { isUnauthorizedError } from '@/lib/authUtils';

interface Lesson {
  id: string;
  title: string;
  duration: number;
  isFree?: boolean;
}

interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

interface CourseResource {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  type: 'pdf' | 'checklist' | 'template' | 'link' | 'other';
  url: string;
  fileSize: number | null;
  order: number;
  isPublished: boolean;
  createdAt: string;
}

interface Formation {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  level: string;
  duration: number;
  price: number;
  thumbnail?: string;
  objectives?: string[];
  prerequisites?: string[];
  targetAudience?: string[];
  modules?: Module[];
}

interface EnrollmentStatus {
  success: boolean;
  isEnrolled: boolean;
  enrollment: {
    id: string;
    userId: string;
    courseId: string;
    enrolledAt: string;
  } | null;
}

export default function FormationDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const { data, isLoading, error } = useQuery<{ success: boolean; formation: Formation }>({
    queryKey: ['/api/formations/slug', slug],
    enabled: !!slug,
  });

  const formation = data?.formation;

  // Vérifier le statut d'inscription
  const { data: enrollmentStatusData, isLoading: isLoadingStatus } = useQuery<EnrollmentStatus>({
    queryKey: ['/api/formations', formation?.id, 'enrollment-status'],
    enabled: !!formation?.id && isAuthenticated,
  });

  const isEnrolled = enrollmentStatusData?.isEnrolled ?? false;

  // Récupérer les ressources du cours (uniquement si inscrit)
  const { data: resourcesData } = useQuery<{ success: boolean; resources: CourseResource[] }>({
    queryKey: ['/api/formations', formation?.id, 'resources'],
    enabled: !!formation?.id && isAuthenticated && isEnrolled,
  });

  const resources = resourcesData?.resources || [];

  // Réinitialiser les caches d'inscription et de ressources quand l'utilisateur n'est plus authentifié
  useEffect(() => {
    if (!isAuthenticated && formation?.id) {
      queryClient.removeQueries({ 
        queryKey: ['/api/formations', formation.id, 'enrollment-status'] 
      });
      queryClient.removeQueries({ 
        queryKey: ['/api/formations', formation.id, 'resources'] 
      });
    }
  }, [isAuthenticated, formation?.id]);

  // Mutation pour l'inscription
  const enrollMutation = useMutation({
    mutationFn: async () => {
      if (!formation?.id) throw new Error('Formation ID manquant');
      const response = await apiRequest('POST', `/api/formations/${formation.id}/enroll`);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Inscription réussie !',
        description: data.message || 'Vous êtes maintenant inscrit à cette formation',
      });
      // Invalider le cache pour rafraîchir le statut et les ressources
      queryClient.invalidateQueries({ 
        queryKey: ['/api/formations', formation?.id, 'enrollment-status'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['/api/formations', formation?.id, 'resources'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['/api/formations/my-enrollments'] 
      });
      // Rediriger vers mon compte après 1 seconde
      setTimeout(() => {
        setLocation('/mon-compte');
      }, 1000);
    },
    onError: (error: Error) => {
      // Gérer les erreurs 401 Unauthorized
      if (isUnauthorizedError(error)) {
        toast({
          title: 'Non authentifié',
          description: 'Vous devez être connecté pour vous inscrire',
          variant: 'destructive',
        });
        setTimeout(() => {
          window.location.href = '/api/login';
        }, 1000);
        return;
      }

      // Gérer les erreurs 400 (déjà inscrit)
      if (error.message.includes('400')) {
        toast({
          title: 'Déjà inscrit',
          description: 'Vous êtes déjà inscrit à cette formation',
          variant: 'destructive',
        });
        // Invalider le cache pour mettre à jour le statut
        queryClient.invalidateQueries({ 
          queryKey: ['/api/formations', formation?.id, 'enrollment-status'] 
        });
        return;
      }

      // Autres erreurs
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue lors de l\'inscription',
        variant: 'destructive',
      });
    },
  });

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} min`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}min`;
  };

  const formatPrice = (price: number) => {
    return `${(price / 1000).toFixed(0)} 000 FCFA`;
  };

  const handleInscription = () => {
    enrollMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="py-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !formation) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="py-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Formation non trouvée</h1>
            <p className="text-muted-foreground mb-6">
              La formation que vous recherchez n'existe pas ou n'est plus disponible
            </p>
            <Button asChild data-testid="button-retour-catalogue">
              <Link href="/formations">Retour au catalogue</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{formation.title} - Kemet Services</title>
        <meta name="description" content={formation.description} />
      </Helmet>

      <Header />

      <main>
        <section className="py-12 bg-muted/30">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="outline" data-testid="badge-category">
                {categoryLabels[formation.category as keyof typeof categoryLabels]}
              </Badge>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold font-serif text-foreground mb-6" data-testid="text-title">
              {formation.title}
            </h1>

            <p className="text-xl text-muted-foreground mb-8">{formation.description}</p>

            <div className="flex flex-wrap items-center gap-6 text-foreground">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">{formatDuration(formation.duration)}</span>
              </div>
              <div className="text-2xl font-bold text-primary" data-testid="text-price">
                {formatPrice(formation.price)}
              </div>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            {formation.objectives && formation.objectives.length > 0 && (
              <Card>
                <CardHeader>
                  <h2 className="text-2xl font-semibold font-serif text-foreground flex items-center gap-2">
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                    Ce que vous allez apprendre
                  </h2>
                </CardHeader>
                <CardContent>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {formation.objectives.map((objective, index) => (
                      <li key={index} className="flex items-start gap-2" data-testid={`objective-${index}`}>
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-foreground">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {formation.prerequisites && formation.prerequisites.length > 0 && (
              <Card>
                <CardHeader>
                  <h2 className="text-2xl font-semibold font-serif text-foreground flex items-center gap-2">
                    <AlertCircle className="w-6 h-6 text-primary" />
                    Prérequis
                  </h2>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {formation.prerequisites.map((prerequisite, index) => (
                      <li key={index} className="flex items-start gap-2" data-testid={`prerequisite-${index}`}>
                        <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                        <span className="text-muted-foreground">{prerequisite}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {formation.targetAudience && formation.targetAudience.length > 0 && (
              <Card>
                <CardHeader>
                  <h2 className="text-2xl font-semibold font-serif text-foreground flex items-center gap-2">
                    <Users className="w-6 h-6 text-primary" />
                    Public cible
                  </h2>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {formation.targetAudience.map((audience, index) => (
                      <li key={index} className="flex items-start gap-2" data-testid={`audience-${index}`}>
                        <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                        <span className="text-muted-foreground">{audience}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {formation.modules && formation.modules.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold font-serif text-foreground mb-6 flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-primary" />
                  Contenu de la formation
                </h2>
                <div className="space-y-4">
                  {formation.modules.map((module, moduleIndex) => (
                    <Card key={module.id} data-testid={`module-${moduleIndex}`}>
                      <CardHeader>
                        <h3 className="text-lg font-semibold text-foreground">
                          Module {moduleIndex + 1}: {module.title}
                        </h3>
                        {module.description && (
                          <p className="text-muted-foreground text-sm">{module.description}</p>
                        )}
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {module.lessons.map((lesson, lessonIndex) => (
                            <li
                              key={lesson.id}
                              className="flex items-center justify-between py-2 border-b border-border last:border-0"
                              data-testid={`lesson-${moduleIndex}-${lessonIndex}`}
                            >
                              <div className="flex items-center gap-3">
                                <BookOpen className="w-4 h-4 text-muted-foreground" />
                                <span className="text-foreground">{lesson.title}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">{lesson.duration} min</span>
                                {lesson.isFree && (
                                  <Badge variant="outline" className="text-xs" data-testid={`badge-free-${moduleIndex}-${lessonIndex}`}>
                                    Gratuit
                                  </Badge>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Resources Section - Uniquement pour les utilisateurs authentifiés et inscrits */}
            {isAuthenticated && isEnrolled && resources && resources.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold font-serif text-foreground mb-6 flex items-center gap-2">
                  <Download className="w-6 h-6 text-primary" />
                  Supports de cours
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {resources.map((resource) => (
                    <Card 
                      key={resource.id} 
                      className="hover-elevate"
                      data-testid={`resource-${resource.id}`}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            {resource.type === 'pdf' && <FileText className="w-6 h-6 text-primary" />}
                            {resource.type === 'checklist' && <CheckCircle2 className="w-6 h-6 text-primary" />}
                            {resource.type === 'template' && <FileText className="w-6 h-6 text-primary" />}
                            {resource.type === 'link' && <LinkIcon className="w-6 h-6 text-primary" />}
                            {resource.type === 'other' && <Download className="w-6 h-6 text-primary" />}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground mb-1">
                              {resource.title}
                            </h3>
                            {resource.description && (
                              <p className="text-sm text-muted-foreground mb-3">
                                {resource.description}
                              </p>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              data-testid={`button-download-${resource.id}`}
                            >
                              <a 
                                href={resource.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2"
                              >
                                <Download className="w-4 h-4" />
                                {resource.type === 'link' ? 'Voir le lien' : 'Télécharger'}
                              </a>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <Card className="bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Prêt à commencer ?
                    </h3>
                    <p className="text-muted-foreground">
                      {isEnrolled 
                        ? 'Accédez à votre espace de formation' 
                        : 'Inscrivez-vous maintenant et commencez votre apprentissage'}
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 w-full md:w-auto">
                    {!isAuthenticated ? (
                      <Button 
                        size="lg" 
                        asChild 
                        className="w-full md:w-auto" 
                        data-testid="button-login"
                      >
                        <a href="/api/login">Se connecter pour s'inscrire</a>
                      </Button>
                    ) : isEnrolled ? (
                      <Button 
                        size="lg" 
                        asChild 
                        className="w-full md:w-auto" 
                        data-testid="button-access-formation"
                      >
                        <Link href="/mon-compte">Accéder à ma formation</Link>
                      </Button>
                    ) : (
                      <Button 
                        size="lg" 
                        onClick={handleInscription} 
                        disabled={enrollMutation.isPending || isLoadingStatus}
                        className="w-full md:w-auto" 
                        data-testid="button-inscription"
                      >
                        {enrollMutation.isPending ? 'Inscription en cours...' : 'S\'inscrire à la formation'}
                      </Button>
                    )}
                    <div className="text-center">
                      <span className="text-2xl font-bold text-primary">{formatPrice(formation.price)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
