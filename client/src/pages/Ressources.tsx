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
import { KemetNewsletter } from '@/components/ui/newsletter';

const categories = [
  { id: 'tous', name: 'Tous les articles', count: 2 },
  { id: 'gestion-stock', name: 'Gestion des stocks', count: 1 },
  { id: 'performance', name: 'Performance', count: 0 },
  { id: 'finance', name: 'Finance & Trésorerie', count: 1 }
];

const articles = [
  {
    id: 'tresorerie-oxygene-officine',
    title: 'La trésorerie : l\'oxygène de votre officine',
    excerpt: 'Maîtrisez votre trésorerie pour payer à l\'heure, servir sans stress et décider avec clarté. Guide pratique avec outils concrets.',
    content: `
# La trésorerie : l'oxygène de votre officine

La trésorerie, c'est l'oxygène de l'officine : elle permet de payer à l'heure, de servir sans stress et de décider avec clarté. On la subit quand on découvre trop tard un creux ; on la maîtrise quand on le voit venir.

## Le cycle cash : votre boussole financière

Le point de départ, c'est le cycle cash : **BFR = Stock + Créances clients – Dettes fournisseurs**

Votre mission : réduire ce qui immobilise (stock, créances) et optimiser ce qui vous donne de l'air (délais fournisseurs).

## Quatre repères simples, chaque semaine

### 1. Visibilité à 13 semaines
Un solde et une prévision à 13 semaines pour visualiser à l'avance les creux et les pics.

### 2. BFR en perspective
Le BFR en FCFA et en jours de CA (combien de jours de ventes sont "coincés").

### 3. Suivi des créances
Le DSO (jours de crédit clients) et le taux de recouvrement à J+60 pour éviter les impayés qui s'installent.

### 4. Gestion des fournisseurs
Le DPO (jours fournisseurs) et les échéances lourdes à venir pour planifier sans surprise.

## Le rituel qui change tout (15 min, chaque lundi)

### Mise à jour Tréso 13 semaines
- **Encaissements :** comptant + recouvrements
- **Décaissements :** fournisseurs, salaires, charges

### Seuil d'alerte
Fixez un seuil d'alerte = **2 semaines de charges fixes**

### Action immédiate
Si le solde passe dessous :
- Décaler une facture
- Accélérer un recouvrement  
- Réduire une commande

> **Petit geste, grande sérénité**

## Cas concret : La crise du CHU de Yopougon

### Le défi
Fermeture temporaire du CHU de Yopougon → Chute d'activité de **70%** pour l'officine voisine

### Les actions en 2 semaines
1. **Gel des achats** sur les produits B/C
2. **Recalibrage** des points de commande sur les produits A
3. **Négociation** passage de J+5 à J+30 avec les grossistes
4. **Inventaire tournant** (10-15 réf. A/jour) pour éliminer les écarts

### Le résultat
Maintien de la trésorerie malgré la crise grâce à une réaction rapide et structurée.

## Outils Kemet Services

📩 **Besoin du modèle Tréso 13 semaines** (format Kemet Services) + guide d'utilisation ?

Contactez-nous pour recevoir vos outils personnalisés.

> **À retenir :** Une trésorerie maîtrisée, c'est la liberté de développer votre officine sans stress financier.
    `,
    author: 'Équipe Kemet Services',
    date: '2024-09-20',
    readTime: '7 min',
    category: 'finance',
    tags: ['Trésorerie', 'BFR', 'Gestion financière', 'Cash flow'],
    formationLiee: 'Optimisation de la Trésorerie d\'Officine'
  },
  {
    id: '5-erreurs-gestion-stocks-officine',
    title: '5 erreurs fréquentes dans la gestion des stocks en officine et comment les éviter efficacement',
    excerpt: 'Découvrez les 5 erreurs les plus courantes dans la gestion des stocks en pharmacie ivoirienne et les astuces pratiques pour les éviter au quotidien.',
    content: `
# 5 erreurs fréquentes dans la gestion des stocks en officine et comment les éviter efficacement

👋 **Chers confrères et consœurs pharmaciens**,

En officine, nous savons tous qu'un petit oubli dans la gestion des stocks peut rapidement coûter très cher : clients mécontents face aux ruptures, produits perdus ou périmés, trésorerie qui s'essouffle dangereusement… Voici 5 erreurs particulièrement fréquentes dans nos pharmacies en Côte d'Ivoire, accompagnées d'astuces simples mais efficaces pour les éviter au quotidien.

---

## ✅ Erreur n°1 : Commander "au feeling" sans méthode précise

👉 On se fie trop souvent à la mémoire, aux impressions ou aux habitudes d'achat. Résultat prévisible : accumulation excessive de certains produits d'un côté, ruptures de stock fréquentes de l'autre. Cette pratique déséquilibre progressivement les finances de l'officine.

💡 **Astuce** : appuyez-vous systématiquement sur l'historique détaillé des ventes et pensez à anticiper les variations saisonnières (période de paludisme, rentrée scolaire, fêtes de fin d'année) pour ajuster vos commandes avec précision.

---

## ✅ Erreur n°2 : Déballer sans vérifier minutieusement

👉 Les colis arrivent en nombre, l'équipe est pressée par d'autres tâches… mais un produit manquant, endommagé ou une erreur de saisie dans le logiciel peut facilement passer inaperçu, créant des écarts significatifs entre stock réel et théorique.

💡 **Astuce** : utilisez systématiquement une petite check-list de réception et instaurez la pratique du double contrôle à deux personnes, particulièrement pour les produits coûteux ou à forte rotation.

---

## ✅ Erreur n°3 : Repousser continuellement les mini-inventaires réguliers

👉 On se dit invariablement "on verra plus tard, quand on aura moins de clients"… et les écarts entre stock informatique et stock physique grossissent en silence jusqu'à devenir problématiques lors du bilan annuel.

💡 **Astuce** : bloquez impérativement 30 minutes chaque semaine pour vérifier un rayon différent. Cette routine simple permet d'identifier rapidement les anomalies. Mieux vaut corriger régulièrement de petits écarts que de découvrir de grosses différences trop tard.

---

## ✅ Erreur n°4 : Oublier de surveiller activement les dates courtes

👉 Un carton de médicaments reste oublié au fond d'une étagère, et hop, 50 boîtes deviennent périmées sans avoir été vendues = argent irrémédiablement perdu et risque sanitaire potentiel pour les patients.

💡 **Astuce** : adoptez rigoureusement le principe FEFO (First Expired, First Out) dans votre rangement quotidien et programmez une vérification systématique des dates tous les mois, avec mise en évidence des produits à écouler prioritairement.

---

## ✅ Erreur n°5 : Laisser chaque membre de l'équipe faire à sa façon

👉 Un auxiliaire commande d'une certaine manière, un autre procède au déballage différemment, et un troisième range selon sa propre logique… Ce manque de standardisation crée inévitablement des erreurs, des incompréhensions et des tensions au sein de l'équipe officinale.

💡 **Astuce** : formalisez collectivement des règles simples, claires et documentées pour chaque processus lié aux stocks, puis formez régulièrement toute l'équipe pour garantir une application cohérente et harmonieuse des procédures.

---

✨ **Le secret d'une gestion optimale :** chaque petite erreur systématiquement évitée = trésorerie solidement protégée + clients durablement satisfaits + réputation professionnelle continuellement renforcée dans votre quartier.

**Kemet Services** est là pour vous accompagner pas à pas, avec expertise et bienveillance, vers une officine plus performante, plus rentable et plus sereine au quotidien 💚.

> **À retenir :** Une méthode structurée peut réduire vos erreurs de stock de 80% en quelques mois seulement.
    `,
    author: 'Équipe Kemet Services',
    date: '2024-09-25',
    readTime: '6 min',
    category: 'gestion-stock',
    tags: ['Stock', 'Erreurs courantes', 'Procédures', 'FEFO'],
    formationLiee: 'La Gestion des Stocks et Approvisionnements'
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
            <div className="mt-6">
              <KemetNewsletter.Compact 
                title="Newsletter Kemet"
                placeholder="votre@email.ci"
              />
            </div>
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