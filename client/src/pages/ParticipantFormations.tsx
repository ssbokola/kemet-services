import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Clock, CheckCircle, PlayCircle, Lock } from "lucide-react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatPriceCFA } from "@/lib/utils";

export default function ParticipantFormations() {
  const { toast } = useToast();
  const { user, isLoading, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user's enrolled courses - Remove enabled condition to fix hooks order
  const { data: enrolledCourses = [], isLoading: enrolledLoading, error: enrolledError } = useQuery({
    queryKey: ['/api/training/my-courses']
  });

  // Fetch available courses for recommendations
  const { data: availableCoursesData = [], isLoading: availableLoading } = useQuery({
    queryKey: ['/api/training/courses']
  });

  // Enrollment mutation for recommendations - Must be declared before early returns
  const enrollMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const response = await fetch(`/api/training/enroll/${courseId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Enrollment failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/training/my-courses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/training/courses'] });
      toast({
        title: "Inscription réussie",
        description: "Vous êtes maintenant inscrit à cette formation.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur d'inscription",
        description: "Une erreur est survenue lors de l'inscription.",
        variant: "destructive",
      });
    }
  });

  // Redirect if not authenticated - blueprint:javascript_log_in_with_replit
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour accéder à vos formations.",
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

  // Show loading state
  if (enrolledLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show error state
  if (enrolledError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="py-12 text-center">
            <h3 className="font-medium mb-2">Erreur de chargement</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Impossible de charger vos formations.
            </p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filter available courses to show only non-enrolled ones as recommendations
  const enrolledIds = new Set(enrolledCourses.map((course: any) => course.id));
  const availableCourses = availableCoursesData
    .filter((course: any) => !enrolledIds.has(course.id))
    .slice(0, 3); // Show only 3 recommendations

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      quality: "Qualité",
      finance: "Finance", 
      stock: "Stock",
      hr: "Management",
      auxiliaires: "Auxiliaires"
    };
    return labels[category] || category;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      in_progress: { label: "En cours", variant: "default" },
      completed: { label: "Terminée", variant: "outline" },
      not_started: { label: "Non commencée", variant: "secondary" }
    };
    return labels[status] || { label: status, variant: "secondary" };
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/participant/dashboard">
                <Button variant="ghost" size="sm" data-testid="button-back-dashboard">
                  ← Retour au tableau de bord
                </Button>
              </Link>
            </div>
            
            <h1 className="text-xl font-bold text-primary" data-testid="text-page-title">
              Mes Formations
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        
        {/* Formations en cours */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6" data-testid="text-current-courses-title">
            Formations en cours
          </h2>
          
          {enrolledCourses.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {enrolledCourses.map((course: any) => {
                const statusInfo = getStatusLabel(course.status || 'active');
                const progress = course.progressPercent || 0;
                return (
                  <Card key={course.id} className="hover-elevate" data-testid={`card-course-${course.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="secondary">{getCategoryLabel(course.category)}</Badge>
                        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                      </div>
                      <CardTitle className="text-lg leading-tight">{course.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {course.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Progress */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progression</span>
                            <span className="font-medium">{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              Formation disponible
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {course.duration}min
                            </span>
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                          {progress === 100 ? (
                            <Button variant="outline" className="flex-1" data-testid={`button-review-${course.id}`}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Revoir le cours
                            </Button>
                          ) : (
                            <Button className="flex-1" data-testid={`button-continue-${course.id}`}>
                              <PlayCircle className="h-4 w-4 mr-2" />
                              Continuer
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-medium mb-2">Aucune formation en cours</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Explorez notre catalogue pour commencer votre première formation
                </p>
                <Link href="/participant/catalogue">
                  <Button data-testid="button-browse-catalog">
                    Parcourir le catalogue
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Formations recommandées */}
        <section>
          <h2 className="text-2xl font-bold mb-6" data-testid="text-recommended-title">
            Formations recommandées
          </h2>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {availableCourses.map((course) => (
              <Card key={course.id} className="hover-elevate" data-testid={`card-available-${course.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="secondary">{getCategoryLabel(course.category)}</Badge>
                  </div>
                  <CardTitle className="text-lg leading-tight">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {course.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {course.modules} modules
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {course.duration}min
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2">
                      <div className="text-lg font-bold text-primary">
                        {formatPriceCFA(course.price)}
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        data-testid={`button-enroll-${course.id}`}
                        onClick={() => enrollMutation.mutate(course.id)}
                        disabled={enrollMutation.isPending}
                      >
                        {enrollMutation.isPending ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-2" />
                        ) : (
                          <Lock className="h-3 w-3 mr-2" />
                        )}
                        {enrollMutation.isPending ? 'Inscription...' : "S'inscrire"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}