import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Calendar, 
  Clock, 
  Search, 
  BookOpen, 
  TrendingUp,
  Package,
  Target,
  ArrowRight,
  FileText
} from 'lucide-react';
import Header from '@/components/Header';

const categories = [
  { id: 'tous', name: 'Tous les articles', count: 3 },
  { id: 'gestion-stock', name: 'Gestion des stocks', count: 2 },
  { id: 'performance', name: 'Performance', count: 1 }
];

const articles = [
  {
    id: 'ecarts-stock-causes-solutions',
    title: 'Les écarts de stock : causes et solutions pratiques',
    excerpt: 'Découvrez les principales causes des écarts de stock en pharmacie et les solutions concrètes pour les réduire drastiquement.',
    content: `
# Les écarts de stock : causes et solutions pratiques

Les écarts de stock représentent l'un des défis majeurs des pharmacies ivoiriennes. Un écart de stock de 15% peut représenter plusieurs millions de FCFA de perte annuelle.

## Les principales causes d'écarts

### 1. Erreurs de saisie
- Erreurs lors de la réception des marchandises
- Saisies incorrectes dans le logiciel de gestion
- Confusion entre les références similaires

### 2. Vols et démarques
- Vols internes ou externes
- Produits endommagés non déclarés
- Péremptions non comptabilisées

### 3. Processus défaillants
- Absence de contrôles réguliers
- Procédures mal définies
- Formation insuffisante du personnel

## Solutions pratiques

### Mise en place de contrôles
Effectuez des inventaires partiels hebdomadaires sur les produits à forte rotation.

### Formation du personnel
Assurez-vous que chaque membre de l'équipe maîtrise les procédures de stock.

### Système de double contrôle
Implémentez un système de vérification croisée pour les mouvements importants.

> **À retenir :** Un bon système de gestion des stocks peut réduire les écarts de 80% en 6 mois.
    `,
    author: 'Équipe Kemet Services',
    date: '2024-09-15',
    readTime: '5 min',
    category: 'gestion-stock',
    tags: ['Stock', 'Inventaire', 'Procédures'],
    formationLiee: 'La Gestion des Écarts de Stock'
  },
  {
    id: 'fefo-first-expired-first-out',
    title: 'FEFO : optimiser la rotation des médicaments',
    excerpt: 'La méthode FEFO (First Expired, First Out) est essentielle pour minimiser les périmés. Guide pratique pour sa mise en œuvre.',
    content: `
# FEFO : optimiser la rotation des médicaments

La méthode FEFO (First Expired, First Out) consiste à délivrer en priorité les produits qui ont la date de péremption la plus proche.

## Pourquoi adopter la méthode FEFO ?

### Réduction des périmés
En Côte d'Ivoire, les périmés représentent en moyenne 5-8% du chiffre d'affaires des pharmacies. La méthode FEFO peut réduire ce taux à moins de 2%.

### Amélioration de la trésorerie
Moins de périmés = moins de pertes financières = meilleure trésorerie.

## Mise en pratique

### 1. Organisation physique
- Rangement par date de péremption
- Étiquetage visible des dates
- Séparation claire des lots

### 2. Formation des équipes
Tous les collaborateurs doivent comprendre et appliquer le principe FEFO.

### 3. Contrôles réguliers
Vérifiez mensuellement l'application correcte de la méthode.

## Outils technologiques

Les logiciels modernes peuvent automatiser le FEFO en générant des alertes.

> **À retenir :** La méthode FEFO peut réduire vos périmés de 70% dès les premiers mois d'application.
    `,
    author: 'Dr. Kossonou MARIE',
    date: '2024-09-10',
    readTime: '4 min',
    category: 'gestion-stock',
    tags: ['FEFO', 'Périmés', 'Rotation'],
    formationLiee: 'La Gestion des Périmés en Officine'
  },
  {
    id: 'tableau-bord-pharmacie-kpi',
    title: 'Créer un tableau de bord efficace pour votre pharmacie',
    excerpt: 'Les indicateurs clés (KPI) indispensables pour piloter votre officine et prendre les bonnes décisions au bon moment.',
    content: `
# Créer un tableau de bord efficace pour votre pharmacie

Un tableau de bord bien conçu vous permet de piloter votre pharmacie avec précision et d'anticiper les problèmes.

## Les KPI indispensables

### 1. Indicateurs financiers
- Chiffre d'affaires quotidien/mensuel
- Marge brute par famille de produits
- Créances clients et délais de paiement

### 2. Indicateurs de stock
- Taux de rotation des produits
- Valeur des périmés mensuels
- Nombre de ruptures de stock

### 3. Indicateurs RH
- Taux d'absentéisme
- Productivité par collaborateur
- Satisfaction client

## Outils de mesure

### Logiciels spécialisés
Utilisez des outils adaptés aux pharmacies ivoiriennes.

### Fréquence de suivi
- Quotidien : CA, stock critique
- Hebdomadaire : Rotation, performance équipe
- Mensuel : Analyse globale, tendances

## Conseils pratiques

### Simplicité avant tout
Ne surchargez pas votre tableau de bord. 5-7 indicateurs suffisent.

### Visuels clairs
Utilisez des graphiques simples et des codes couleurs.

### Actions correctives
Chaque indicateur doit déboucher sur des actions concrètes.

> **À retenir :** Un bon tableau de bord consulté quotidiennement peut améliorer votre rentabilité de 15% en un an.
    `,
    author: 'Équipe Kemet Services',
    date: '2024-09-05',
    readTime: '6 min',
    category: 'performance',
    tags: ['KPI', 'Tableau de bord', 'Management'],
    formationLiee: 'Mesurer la Performance de son Officine'
  }
];

export default function Ressources() {
  const [selectedCategory, setSelectedCategory] = useState('tous');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredArticles = articles.filter(article => {
    const matchesCategory = selectedCategory === 'tous' || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-primary/10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Ressources & Articles
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Guides pratiques, conseils d'experts et bonnes pratiques 
              pour optimiser votre pharmacie en Côte d'Ivoire.
            </p>
            
            {/* Barre de recherche */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Rechercher un article..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar - Catégories */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Catégories
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors hover-elevate ${
                      selectedCategory === category.id
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-muted'
                    }`}
                    data-testid={`button-category-${category.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{category.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {category.count}
                      </Badge>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Newsletter */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Newsletter</CardTitle>
                <CardDescription>
                  Recevez nos derniers articles et conseils
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Input placeholder="votre@email.ci" data-testid="input-newsletter" />
                  <Button className="w-full" data-testid="button-newsletter">
                    S'abonner
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    1 email par mois maximum. Pas de spam.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Articles */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground">
                {selectedCategory === 'tous' 
                  ? 'Tous les articles' 
                  : categories.find(c => c.id === selectedCategory)?.name
                }
              </h2>
              <p className="text-muted-foreground">
                {filteredArticles.length} article(s) trouvé(s)
              </p>
            </div>
            
            <div className="space-y-8">
              {filteredArticles.map((article) => (
                <Card key={article.id} className="overflow-hidden hover-elevate" data-testid={`card-article-${article.id}`}>
                  <CardHeader>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {article.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <CardTitle className="text-xl hover:text-primary transition-colors">
                      {article.title}
                    </CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      {article.excerpt}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(article.date).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {article.readTime}
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {article.author}
                      </div>
                    </div>
                    
                    {/* Aperçu du contenu */}
                    <div className="prose prose-sm max-w-none mb-4">
                      <div className="text-muted-foreground">
                        {article.content.split('\n').slice(3, 6).join('\n')}...
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                      <Button variant="outline" className="flex-1" data-testid={`button-read-${article.id}`}>
                        Lire l'article complet
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                      
                      {article.formationLiee && (
                        <Button variant="secondary" className="flex-1" data-testid={`button-formation-${article.id}`}>
                          <Target className="w-4 h-4 mr-2" />
                          Formation : {article.formationLiee}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {filteredArticles.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Aucun article trouvé
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Essayez de modifier vos critères de recherche ou de sélectionner une autre catégorie.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('tous');
                    }}
                    data-testid="button-reset-search"
                  >
                    Voir tous les articles
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}