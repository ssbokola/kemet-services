import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, MapPin, Users, Search, BookOpen } from "lucide-react";
import { Link } from "wouter";
import { formatCFA } from "@/lib/utils";

export default function FormationsPresentiel() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Fetch onsite trainings
  const { data: trainingsData = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/onsite-trainings']
  });

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      quality: "Qualité",
      finance: "Finance",
      stock: "Stock",
      hr: "Management",
      auxiliaires: "Auxiliaires",
      pharmaciens: "Pharmaciens",
      client: "Client"
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      quality: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      finance: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      stock: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      pharmaciens: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300",
      hr: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      auxiliaires: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
      client: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
    };
    return colors[category] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  };

  // Filtrage des formations
  const filteredTrainings = trainingsData.filter((training: any) => {
    const matchesSearch = training.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         training.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || 
                           (training.categories && training.categories.includes(categoryFilter));
    
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" size="sm" data-testid="button-back-home">
                ← Retour à l'accueil
              </Button>
            </Link>
            
            <h1 className="text-xl font-bold text-primary" data-testid="text-page-title">
              Formations en Présentiel
            </h1>
            
            <div className="w-32" /> {/* Spacer for alignment */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        
        {/* Hero Section */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold mb-3">Catalogue des Formations Professionnelles</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Formations en présentiel pour auxiliaires et pharmaciens d'officine. 
            Toutes nos formations durent 3 heures et sont animées par des experts du secteur.
          </p>
        </div>

        {/* Bannière CTA Calendrier */}
        <Card className="mb-8 bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 bg-primary/10 rounded-full p-3">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
                <div className="text-center md:text-left">
                  <h3 className="text-lg font-semibold mb-1">Consultez nos prochaines sessions</h3>
                  <p className="text-sm text-muted-foreground">
                    Découvrez toutes les dates disponibles et inscrivez-vous en quelques clics
                  </p>
                </div>
              </div>
              <Link href="/calendrier-formations">
                <Button size="lg" data-testid="button-cta-calendar">
                  Voir le calendrier
                  <Calendar className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
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
                <SelectItem value="pharmaciens">Pharmaciens</SelectItem>
                <SelectItem value="client">Client</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filteredTrainings.length} formation{filteredTrainings.length > 1 ? 's' : ''} disponible{filteredTrainings.length > 1 ? 's' : ''}
            </p>
            <Link href="/calendrier-formations">
              <Button variant="outline" size="sm" data-testid="button-view-calendar">
                <Calendar className="h-4 w-4 mr-2" />
                Voir le calendrier
              </Button>
            </Link>
          </div>
        </div>

        {/* Trainings Grid */}
        {filteredTrainings.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTrainings.map((training: any) => (
              <Card key={training.id} className="hover-elevate group" data-testid={`card-training-${training.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <div className="flex flex-wrap gap-1">
                      {training.categories && training.categories.map((cat: string) => (
                        <Badge key={cat} className={getCategoryColor(cat)}>
                          {getCategoryLabel(cat)}
                        </Badge>
                      ))}
                    </div>
                    {training.sessions && training.sessions.length > 0 && (
                      <Badge variant="outline" className="text-xs flex-shrink-0">
                        <Calendar className="h-3 w-3 mr-1" />
                        {training.sessions.length} session{training.sessions.length > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                    {training.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {training.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Info */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {training.defaultDuration}h
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {training.defaultLocation || 'Abidjan'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Objectifs Preview */}
                    {training.objectives && training.objectives.length > 0 && (
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium">Objectifs clés :</h4>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {training.objectives.slice(0, 2).map((objective: string, index: number) => (
                            <li key={index} className="flex items-start gap-1">
                              <span className="text-primary mt-0.5">•</span>
                              {objective}
                            </li>
                          ))}
                          {training.objectives.length > 2 && (
                            <li className="text-muted-foreground/70">
                              +{training.objectives.length - 2} autres objectifs
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                    
                    {/* Next Session Info */}
                    {training.sessions && training.sessions.length > 0 && (
                      <div className="p-3 bg-primary/5 rounded-md border">
                        <p className="text-xs font-medium mb-1">Prochaine session :</p>
                        <p className="text-sm">
                          {new Date(training.sessions[0].startDate).toLocaleDateString('fr-FR', { 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric' 
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {training.sessions[0].maxCapacity - training.sessions[0].currentRegistrations} places restantes
                        </p>
                      </div>
                    )}
                    
                    {/* Price and Action */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="text-lg font-bold text-primary">
                        {formatCFA(training.defaultPrice)}
                      </div>
                      <Link href={`/formation-presentiel/${training.slug}`}>
                        <Button size="sm" data-testid={`button-details-${training.id}`}>
                          <BookOpen className="h-4 w-4 mr-2" />
                          Voir détails
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-medium mb-2">Aucune formation trouvée</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Essayez de modifier vos filtres ou votre recherche
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("all");
                }}
                data-testid="button-clear-filters"
              >
                Effacer les filtres
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Contact Section */}
        <div className="mt-12 text-center p-6 bg-primary/5 rounded-lg border">
          <h3 className="font-semibold mb-2">Besoin d'informations complémentaires ?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Notre équipe est à votre disposition pour répondre à toutes vos questions
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <a 
              href="mailto:infos@kemetservices.com" 
              className="text-primary hover:underline font-medium"
              data-testid="link-contact-email"
            >
              infos@kemetservices.com
            </a>
            <span className="text-muted-foreground">•</span>
            <a 
              href="tel:+2250506874459" 
              className="text-primary hover:underline font-medium"
              data-testid="link-contact-phone"
            >
              +225 05 06 87 44 59
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
