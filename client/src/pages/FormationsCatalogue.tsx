import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, BookOpen, Filter } from 'lucide-react';
import { categoryLabels } from '@/data/formations';
import { formatPriceCFA } from '@/lib/utils';

interface Formation {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  duration: number;
  price: number;
  isPublished: boolean;
  thumbnail?: string;
}

export default function FormationsCatalogue() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { data, isLoading, error } = useQuery<{ success: boolean; formations: Formation[] }>({
    queryKey: ['/api/formations'],
  });

  const formations = data?.formations || [];

  const filteredFormations = formations.filter((formation) => {
    const categoryMatch = selectedCategory === 'all' || formation.category === selectedCategory;
    return categoryMatch && formation.isPublished;
  });

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}min`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h${mins}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Formations en ligne - Kemet Services</title>
        <meta name="description" content="Catalogue de formations en ligne pour pharmaciens : gestion de stock, service client, finance, management d'équipe. Apprenez à votre rythme avec des experts." />
      </Helmet>

      <Header />

      <main className="pt-8">
        <section className="py-12 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold font-serif text-foreground mb-4">
                Formations en ligne
              </h1>
              <p className="text-xl text-muted-foreground">
                Développez vos compétences à votre rythme avec nos formations pratiques et certifiantes
              </p>
            </div>
          </div>
        </section>

        <section className="py-8 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-6">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold text-foreground">Filtrer par</h3>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Catégorie</h4>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedCategory === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory('all')}
                    data-testid="filter-category-all"
                  >
                    Toutes
                  </Button>
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <Button
                      key={key}
                      variant={selectedCategory === key ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(key)}
                      data-testid={`filter-category-${key}`}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i}>
                    <CardHeader className="space-y-3">
                      <Skeleton className="h-48 w-full" />
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <p className="text-destructive">Une erreur est survenue lors du chargement des formations</p>
              </div>
            ) : filteredFormations.length === 0 ? (
              <div className="text-center py-16">
                <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Aucune formation trouvée
                </h3>
                <p className="text-muted-foreground">
                  Essayez de modifier vos filtres pour voir plus de formations
                </p>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <p className="text-muted-foreground" data-testid="text-results-count">
                    <span className="font-semibold text-foreground">{filteredFormations.length}</span>{' '}
                    formation{filteredFormations.length > 1 ? 's' : ''} disponible{filteredFormations.length > 1 ? 's' : ''}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredFormations.map((formation) => (
                    <Card key={formation.id} className="hover-elevate flex flex-col" data-testid={`card-formation-${formation.slug}`}>
                      <CardHeader className="p-0">
                        {formation.thumbnail ? (
                          <img
                            src={formation.thumbnail}
                            alt={formation.title}
                            className="w-full h-48 object-cover rounded-t-lg"
                          />
                        ) : (
                          <div className="w-full h-48 bg-muted rounded-t-lg flex items-center justify-center">
                            <BookOpen className="w-12 h-12 text-muted-foreground" />
                          </div>
                        )}
                      </CardHeader>

                      <CardContent className="flex-1 pt-6 space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" data-testid={`badge-category-${formation.slug}`}>
                            {categoryLabels[formation.category as keyof typeof categoryLabels]}
                          </Badge>
                        </div>

                        <h3 className="text-lg font-semibold text-foreground leading-snug" data-testid={`title-${formation.slug}`}>
                          {formation.title}
                        </h3>

                        <p className="text-muted-foreground text-sm line-clamp-3">
                          {formation.description}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{formatDuration(formation.duration)}</span>
                          </div>
                          <div className="font-semibold text-primary">
                            {formatPriceCFA(formation.price)}
                          </div>
                        </div>
                      </CardContent>

                      <CardFooter className="pt-4">
                        <Button asChild className="w-full" data-testid={`button-voir-${formation.slug}`}>
                          <Link href={`/formation/${formation.slug}`}>
                            Voir la formation
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
