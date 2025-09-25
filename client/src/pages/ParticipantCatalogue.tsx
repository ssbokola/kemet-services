import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Clock, Star, Users, Filter, Search } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import logoImage from '@assets/LOGO KEMET CANVAS_1757585789355.png';

export default function ParticipantCatalogue() {
  const { toast } = useToast();
  const { user, isLoading, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  
  // All hooks must be called at the top level
  const queryClient = useQueryClient();

  // Fetch available courses from API - Always call hooks unconditionally
  const { data: coursesData = [], isLoading: coursesLoading, error: coursesError } = useQuery({
    queryKey: ['/api/training/courses'],
    enabled: isAuthenticated && !isLoading // Only fetch when authenticated
  });

  // Enrollment mutation
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
      queryClient.invalidateQueries({ queryKey: ['/api/training/courses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/training/my-courses'] });
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
        description: "Vous devez être connecté pour accéder au catalogue.",
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

  const allCourses = coursesData.map((course: any) => ({
    ...course,
    rating: 4.7, // Default rating since not in DB yet
    studentsCount: 50, // Default count since not in DB yet
    isPopular: course.id === '1' // Mock popularity for first course
  }));

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

  const getLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      debutant: "Débutant",
      intermediaire: "Intermédiaire", 
      avance: "Avancé"
    };
    return labels[level] || level;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      quality: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      finance: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      stock: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      hr: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      auxiliaires: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300"
    };
    return colors[category] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  };

  // Show loading state
  if (coursesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show error state
  if (coursesError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="py-12 text-center">
            <h3 className="font-medium mb-2">Erreur de chargement</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Impossible de charger le catalogue des formations.
            </p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filtrage des cours
  const filteredCourses = allCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || course.category === categoryFilter;
    const matchesLevel = levelFilter === "all" || course.level === levelFilter;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

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
            
            <div className="flex items-center gap-3">
              <img 
                src={logoImage} 
                alt="Kemet Services" 
                className="h-8 w-auto"
                data-testid="img-logo-participant-catalog"
              />
              <h1 className="text-xl font-bold text-primary" data-testid="text-page-title">
                Catalogue des Formations
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        
        {/* Filters */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Explorez nos formations spécialisées</h2>
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-sm text-muted-foreground">Contact formateur :</span>
            <a 
              href="mailto:infos@kemetservices.com" 
              className="text-primary hover:underline font-medium"
              data-testid="link-contact-participant-catalog"
            >
              infos@kemetservices.com
            </a>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une formation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
            
            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[180px]" data-testid="select-category">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
                <SelectItem value="quality">Qualité</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="stock">Stock</SelectItem>
                <SelectItem value="hr">Management</SelectItem>
                <SelectItem value="auxiliaires">Auxiliaires</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Level Filter */}
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-full md:w-[180px]" data-testid="select-level">
                <SelectValue placeholder="Niveau" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous niveaux</SelectItem>
                <SelectItem value="debutant">Débutant</SelectItem>
                <SelectItem value="intermediaire">Intermédiaire</SelectItem>
                <SelectItem value="avance">Avancé</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <p className="text-sm text-muted-foreground">
            {filteredCourses.length} formation{filteredCourses.length > 1 ? 's' : ''} disponible{filteredCourses.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="hover-elevate group" data-testid={`card-course-${course.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge className={getCategoryColor(course.category)}>
                      {getCategoryLabel(course.category)}
                    </Badge>
                    <div className="flex items-center gap-2">
                      {course.isPopular && (
                        <Badge variant="default" className="text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          Populaire
                        </Badge>
                      )}
                      <Badge variant="outline">{getLevelLabel(course.level)}</Badge>
                    </div>
                  </div>
                  <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                    {course.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {course.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {course.duration}min
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {course.studentsCount}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{course.rating}</span>
                      </div>
                    </div>
                    
                    {/* Objectives Preview */}
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium">Objectifs clés :</h4>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {course.objectives.slice(0, 2).map((objective, index) => (
                          <li key={index} className="flex items-start gap-1">
                            <span className="text-primary mt-0.5">•</span>
                            {objective}
                          </li>
                        ))}
                        {course.objectives.length > 2 && (
                          <li className="text-muted-foreground/70">
                            +{course.objectives.length - 2} autres objectifs
                          </li>
                        )}
                      </ul>
                    </div>
                    
                    {/* Price and Action */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="text-lg font-bold text-primary">
                        {course.price}€
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" data-testid={`button-preview-${course.id}`}>
                          Aperçu
                        </Button>
                        <Button 
                          size="sm" 
                          data-testid={`button-enroll-${course.id}`}
                          onClick={() => enrollMutation.mutate(course.id)}
                          disabled={enrollMutation.isPending || course.enrollment}
                        >
                          {enrollMutation.isPending ? "..." : course.enrollment ? "Inscrit" : "S'inscrire"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Filter className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-medium mb-2">Aucune formation trouvée</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Essayez de modifier vos filtres ou votre recherche
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("all");
                  setLevelFilter("all");
                }}
                data-testid="button-clear-filters"
              >
                Effacer les filtres
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}