import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Clock, Users, BookOpen, TrendingUp, Heart, DollarSign, UserPlus, Download } from 'lucide-react';
import { useLocation } from 'wouter';
import { formations, mainCategories, pharmacienSubCategories } from '@shared/formations';
import { generateCatalogPDF } from '@/utils/pdfGenerator';
import { FormationsSEO } from '@/components/SEO';
import logoImage from '@assets/LOGO KEMET CANVAS_1757585789355.png';

export default function Formations() {
  const [selectedMainCategory, setSelectedMainCategory] = useState('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState('all');
  const [, setLocation] = useLocation();

  // Filtrage par catégorie principale
  const getFilteredFormations = () => {
    let filtered = formations;
    
    // Filtrer par public cible
    if (selectedMainCategory === 'pharmaciens') {
      filtered = formations.filter(formation => formation.targetAudience === 'pharmaciens');
    } else if (selectedMainCategory === 'auxiliaires') {
      filtered = formations.filter(formation => formation.targetAudience === 'auxiliaires');
    }
    
    // Filtrer par sous-catégorie (seulement si pharmaciens est sélectionné)
    if (selectedMainCategory === 'pharmaciens' && selectedSubCategory !== 'all') {
      filtered = filtered.filter(formation => formation.category === selectedSubCategory);
    }
    
    return filtered;
  };

  const filteredFormations = getFilteredFormations();

  // Réinitialiser la sous-catégorie quand on change de catégorie principale
  const handleMainCategoryChange = (categoryId: string) => {
    setSelectedMainCategory(categoryId);
    setSelectedSubCategory('all');
  };

  const handleInscription = (formationId: number) => {
    // Navigate to inscription page with formation ID
    setLocation(`/inscription-formation?trainingId=${formationId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <FormationsSEO 
        title="Catalogue Formations Pharmacie Côte d'Ivoire - ISO 9001, Stocks, Trésorerie"
        description="Formations spécialisées pour pharmaciens titulaires et auxiliaires en Côte d'Ivoire et Afrique de l'Ouest : certification ISO 9001, gestion optimisée des stocks, maîtrise de la trésorerie, développement du potentiel humain. Catalogue PDF gratuit à télécharger."
        canonical="/formations"
        keywords="formation pharmacien Côte d'Ivoire, formation auxiliaire pharmacie Abidjan, certification ISO 9001 pharmacie, formation gestion stocks officine, formation trésorerie pharmacie, formation continue pharmaceutique, catalogue formations PDF gratuit, formation qualité pharmacie, optimisation stocks pharmacie, formation potentiel humain pharmacie, Afrique de l'Ouest, formation professionnelle pharmacie"
      />
      <Header />
      
      <main className="pt-8">
        {/* Hero Section */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex items-center justify-center gap-4 mb-6">
              <img 
                src={logoImage} 
                alt="Kemet Services" 
                className="h-16 w-auto"
                data-testid="img-logo-catalog"
              />
              <h1 className="text-4xl md:text-5xl font-bold font-serif text-foreground">
                Catalogue de formations
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-4">
              Formations spécialisées pour pharmaciens et personnel d'officine en Côte d'Ivoire
            </p>
            <div className="flex items-center justify-center gap-2 mb-8">
              <span className="text-sm text-muted-foreground">Contact direct :</span>
              <a 
                href="mailto:infos@kemetservices.com" 
                className="text-primary hover:underline font-medium"
                data-testid="link-contact-catalog"
              >
                infos@kemetservices.com
              </a>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={generateCatalogPDF}
                size="lg"
                className="gap-2"
                data-testid="button-download-catalog"
              >
                <Download className="w-5 h-5" />
                Télécharger le catalogue PDF
              </Button>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="py-8 bg-background border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Catégories principales */}
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Choisir votre public cible</h3>
              <div className="flex flex-wrap gap-3 justify-center">
                {mainCategories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedMainCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleMainCategoryChange(category.id)}
                    className={selectedMainCategory === category.id ? category.color : ''}
                    data-testid={`filter-main-${category.id}`}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Sous-catégories pour pharmaciens */}
            {selectedMainCategory === 'pharmaciens' && (
              <div className="text-center">
                <h4 className="text-md font-medium text-muted-foreground mb-3">Spécialités</h4>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button
                    variant={selectedSubCategory === 'all' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSubCategory('all')}
                    className={selectedSubCategory === 'all' ? 'bg-primary' : ''}
                    data-testid="filter-sub-all"
                  >
                    Toutes les spécialités
                  </Button>
                  {pharmacienSubCategories.map((subCategory) => (
                    <Button
                      key={subCategory.id}
                      variant={selectedSubCategory === subCategory.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedSubCategory(subCategory.id)}
                      className={selectedSubCategory === subCategory.id ? subCategory.color : ''}
                      data-testid={`filter-sub-${subCategory.id}`}
                    >
                      {subCategory.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Formations Grid */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Résultats */}
            <div className="text-center mb-8">
              <p className="text-muted-foreground">
                <span className="font-semibold text-foreground">{filteredFormations.length}</span> formation{filteredFormations.length > 1 ? 's' : ''} disponible{filteredFormations.length > 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredFormations.map((formation) => {
                const IconComponent = formation.icon;
                
                return (
                  <Card key={formation.id} className="hover-elevate transition-all">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="p-3 rounded-lg bg-primary/10">
                          <IconComponent className="w-6 h-6 text-primary" />
                        </div>
                        <Badge variant="outline" className="text-sm font-medium">
                          {formation.price}
                        </Badge>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-foreground leading-snug">
                        {formation.title}
                      </h3>
                      
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {formation.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {formation.duration}
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {formation.format}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-2">Objectifs :</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {formation.objectives.slice(0, 3).map((objective, index) => (
                              <li key={index} className="flex items-start">
                                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                {objective}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="pt-2">
                          <Button 
                            onClick={() => handleInscription(formation.id)}
                            className="w-full"
                            data-testid={`button-inscription-${formation.id}`}
                          >
                            <UserPlus className="w-4 h-4 mr-2" />
                            S'inscrire à cette formation
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            {filteredFormations.length === 0 && (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Aucune formation trouvée
                  </h3>
                  <p className="text-muted-foreground">
                    Essayez de modifier vos filtres pour voir plus de formations.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold font-serif text-foreground mb-6">
              Formation sur mesure ?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Nous proposons également des formations personnalisées adaptées aux besoins spécifiques de votre officine.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => setLocation('/contact')}
                data-testid="button-contact-custom-training"
              >
                Demander une formation sur mesure
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => setLocation('/diagnostic')}
                data-testid="button-diagnostic-needs"
              >
                Évaluer mes besoins
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}