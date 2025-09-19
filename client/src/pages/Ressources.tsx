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
import SEO from '@/components/SEO';

const categories = [
  { id: 'tous', name: 'Tous les articles', count: 2 },
  { id: 'gestion-stock', name: 'Gestion des stocks', count: 2 },
  { id: 'performance', name: 'Performance', count: 0 },
  { id: 'finance', name: 'Finance & Trésorerie', count: 0 }
];

const articles = [
  {
    id: 'comment-eviter-ruptures-stock-pharmacie',
    title: 'Guide pratique – Comment éviter les ruptures de stock dans votre pharmacie',
    excerpt: 'Un guide complet pour comprendre les causes des ruptures de stock et mettre en place des stratégies efficaces pour les prévenir dans votre officine.',
    content: `
# 🌱 Guide pratique – Comment éviter les ruptures de stock dans votre pharmacie

## 💬 Introduction

Imaginez : un client entre, pressé, il cherche un médicament pour son enfant malade. Vous ouvrez le tiroir… vide. Ce silence devant l'étagère, c'est une occasion ratée : le client repart frustré, et vous, vous perdez à la fois une vente et un peu de sa confiance.

Les ruptures de stock, ça arrive à tout le monde. Mais bonne nouvelle : il existe des méthodes simples pour en réduire la fréquence. Voyons ensemble comment.

---

## Les causes fréquentes des ruptures de stock

Plusieurs facteurs expliquent pourquoi une pharmacie peut se retrouver en rupture de stock sur certains produits.

### • Commande tardive 
Lorsque le stock diminue progressivement sans qu'aucune commande ne soit lancée à temps, il devient inévitable de manquer le produit au moment où un client en a besoin. Cette inattention à la baisse des niveaux de stock conduit directement à la rupture.

### • Manque de communication 
Si le personnel au comptoir ne signale pas l'absence d'un produit, l'information ne remonte pas et aucune mesure corrective n'est prise. Ce défaut de communication interne aggrave le risque de ne pas pouvoir répondre à une demande.

### • Dépendance à un seul fournisseur 
S'appuyer sur un unique grossiste peut se révéler risqué. En cas de rupture chez ce partenaire, il devient impossible de s'approvisionner rapidement, laissant la pharmacie dans l'impasse.

### • Produits saisonniers 
Certains médicaments, comme ceux contre la toux, la grippe ou le paludisme, connaissent des pics de demande à des périodes précises de l'année. Même si ces hausses sont prévisibles, elles sont souvent sous-estimées, ce qui expose l'officine à des ruptures évitables.

---

## Les bonnes pratiques pour prévenir les ruptures de stock

Pour limiter les situations de pénurie dans votre officine, il est essentiel d'adopter quelques réflexes simples mais efficaces.

### • Constituer un stock de sécurité pour les produits vitaux 
Il est recommandé de maintenir en permanence un petit stock tampon sur les médicaments essentiels, notamment ceux classés parmi les Top 300 ou en catégorie A. Ce stock de sécurité permet de faire face aux imprévus sans impacter la délivrance de traitements critiques.

### • Paramétrer des seuils d'alerte dans le logiciel métier 
En programmant des seuils d'alerte sur votre outil de gestion, vous êtes averti automatiquement dès qu'un produit atteint un niveau critique. Cela facilite l'anticipation des commandes avant qu'une rupture ne survienne.

### • Varier les grossistes pour plus de flexibilité 
S'appuyer sur plusieurs fournisseurs évite la dépendance à un seul interlocuteur. En cas de rupture chez votre grossiste habituel, vous avez ainsi la possibilité de vous approvisionner rapidement auprès d'un autre partenaire.

### • Observer les variations saisonnières 
Il est pertinent de noter chaque année les périodes de forte demande (par exemple, lors des pics de grippe, de paludisme ou de toux). Cette observation vous permet d'anticiper et d'ajuster vos commandes en conséquence.

### • Réaliser des mini-inventaires réguliers 
Effectuer des contrôles rapides et fréquents, en particulier sur les rayons sensibles, aide à détecter rapidement toute anomalie et à réagir avant qu'un produit ne vienne à manquer.

### • Exploiter les données pour cibler les produits à risque 
L'analyse des données de votre officine permet d'identifier les références fréquemment concernées par les ruptures. Vous pouvez alors concentrer vos efforts de prévention sur ces produits spécifiques.

---

## Gérer la situation avec professionnalisme

Face à une rupture de stock, il est primordial d'adopter une attitude professionnelle et transparente envers le client. Il convient d'éviter toute improvisation et d'informer clairement la personne concernée de la situation. Cette transparence renforce la relation de confiance avec la clientèle et permet d'apaiser d'éventuelles inquiétudes.

Lorsque le produit demandé n'est plus disponible, il est recommandé de proposer immédiatement une alternative qui aura été préalablement validée par le pharmacien. Cela garantit que la solution proposée respecte la sécurité et l'efficacité du traitement du patient.

Si aucune alternative satisfaisante n'est envisageable sur le moment, il peut s'avérer nécessaire de passer une commande urgente afin de répondre au besoin du client dans les meilleurs délais. Cette réactivité témoigne du sérieux de l'officine et de son engagement envers la satisfaction du patient.

Enfin, il est essentiel de noter chaque incident de rupture. Garder une trace de ces situations permettra par la suite d'analyser les causes et d'en tirer des enseignements utiles pour améliorer la gestion des stocks et prévenir de futures pénuries.

---

## Suivre pour s'améliorer

Pour progresser dans la gestion des ruptures de stock, il est important de mettre en place un suivi rigoureux. Commencez par compter chaque mois le nombre de ruptures survenues dans votre officine et analysez leur évolution dans le temps. Ce suivi régulier permet de mesurer l'efficacité des actions mises en place et d'identifier les tendances.

Il est également recommandé de réunir l'ensemble de l'équipe au moins une fois par mois afin d'ajuster collectivement les seuils d'alerte et les méthodes de gestion utilisées. Cette démarche collaborative favorise l'implication de chacun et permet d'adapter rapidement les pratiques aux réalités du terrain.

L'objectif est de trouver le juste équilibre : il s'agit d'éviter les ruptures, tout en veillant à ne pas surstocker inutilement, ce qui aurait pour conséquence de bloquer votre trésorerie. Un suivi attentif et des ajustements réguliers sont donc essentiels pour optimiser la gestion des stocks et garantir un service de qualité à vos clients.

---

## Conclusion

Il est illusoire de penser qu'une pharmacie puisse totalement éliminer le risque de rupture de stock. Cependant, ce qui fait véritablement la différence, c'est la capacité de l'équipe officinale à anticiper, maîtriser et réduire ces situations. En adoptant une gestion rigoureuse et professionnelle, la pharmacie parvient non seulement à limiter le stress généré par les ruptures, mais aussi à renforcer la confiance de sa clientèle. Cette démarche contribue également à l'amélioration de la rentabilité de l'officine.

> **À retenir :** Une approche méthodique et un suivi régulier peuvent réduire vos ruptures de stock de 70% en quelques mois.

**Kemet Services** vous accompagne dans cette démarche d'optimisation avec des formations pratiques et un suivi personnalisé 💚.
    `,
    author: 'Dr. Kouamé ADJOUA',
    date: '2024-09-19',
    readTime: '5 min',
    category: 'gestion-stock',
    tags: ['Ruptures de stock', 'Prévention', 'Gestion proactive', 'Seuils d\'alerte'],
    formationLiee: 'La Gestion des Stocks et Approvisionnements'
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
    readTime: '3 min',
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
      <SEO 
        title="Ressources & Articles Pharmacie - Guides Pratiques"
        description="Guides pratiques, conseils d'experts et bonnes pratiques pour optimiser votre pharmacie en Côte d'Ivoire. Articles sur la gestion des stocks, erreurs courantes et solutions."
        canonical="/ressources"
        keywords="ressources pharmacie, guides pratiques pharmacie, bonnes pratiques officine, gestion stocks pharmacie, conseils experts pharmacie Côte d'Ivoire, articles formation"
      />
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