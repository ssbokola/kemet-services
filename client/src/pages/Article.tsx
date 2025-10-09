import { useParams, Link } from 'wouter';
import { ArrowLeft, Calendar, Clock, User, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/Header';
import { KemetNewsletter } from '@/components/ui/newsletter';
import SEO from '@/components/SEO';
import { articles } from '@/data/articles';

export default function Article() {
  const params = useParams();
  const articleId = params.id;
  
  const article = articles.find(a => a.id === articleId);

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Article non trouvé</h1>
          <p className="text-muted-foreground mb-8">
            Désolé, nous n'avons pas trouvé l'article que vous recherchez.
          </p>
          <Button asChild data-testid="button-back-ressources">
            <Link href="/ressources">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux ressources
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title={article.title}
        description={article.excerpt}
        canonical={`/article/${article.id}`}
        ogType="article"
        publishedTime={article.date}
        keywords={article.tags.join(', ')}
        author={article.author}
      />
      <Header />
      
      {/* Hero Article */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-primary/10 py-12 border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button asChild variant="ghost" className="mb-6 -ml-4" data-testid="button-back">
            <Link href="/ressources">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux ressources
            </Link>
          </Button>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {article.tags.map((tag) => (
              <Badge key={tag} variant="secondary" data-testid={`badge-tag-${tag}`}>
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6" data-testid="text-article-title">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-2" data-testid="text-author">
              <User className="w-4 h-4" />
              <span>{article.author}</span>
            </div>
            <div className="flex items-center gap-2" data-testid="text-date">
              <Calendar className="w-4 h-4" />
              <span>{new Date(article.date).toLocaleDateString('fr-FR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            <div className="flex items-center gap-2" data-testid="text-readtime">
              <Clock className="w-4 h-4" />
              <span>{article.readTime} de lecture</span>
            </div>
          </div>
        </div>
      </section>

      {/* Contenu de l'article */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Article principal */}
          <article className="lg:col-span-2" data-testid="article-content">
            <div 
              className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground prose-strong:text-foreground prose-a:text-primary hover:prose-a:text-primary/80"
              dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br />').replace(/###\s+(.+)/g, '<h3 class="text-2xl font-bold mt-8 mb-4">$1</h3>').replace(/##\s+(.+)/g, '<h2 class="text-3xl font-bold mt-10 mb-5">$1</h2>').replace(/#\s+(.+)/g, '<h1 class="text-4xl font-bold mt-12 mb-6">$1</h1>').replace(/---/g, '<hr class="my-8 border-border" />').replace(/>\s*\*\*(.+?)\*\*/g, '> <strong>$1</strong>').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>') }}
            />

            {/* Formation liée */}
            {article.formationLiee && (
              <Card className="mt-12 border-primary/20 bg-primary/5">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    📚 Formation recommandée
                  </h3>
                  <p className="text-foreground mb-4">
                    Pour approfondir ce sujet, découvrez notre formation : <strong>{article.formationLiee}</strong>
                  </p>
                  <Button asChild variant="default" data-testid="button-voir-formation">
                    <Link href="/">
                      Voir la formation
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              
              {/* Newsletter */}
              <KemetNewsletter.Compact 
                title="Recevez nos articles"
                placeholder="votre@email.ci"
              />

              {/* Autres articles */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-foreground mb-4">
                    Autres articles
                  </h3>
                  <div className="space-y-4">
                    {articles
                      .filter(a => a.id !== articleId)
                      .slice(0, 3)
                      .map((otherArticle) => (
                        <Link key={otherArticle.id} href={`/article/${otherArticle.id}`}>
                          <div className="hover-elevate p-3 rounded-lg transition-all cursor-pointer" data-testid={`link-article-${otherArticle.id}`}>
                            <h4 className="font-semibold text-sm text-foreground mb-1 line-clamp-2">
                              {otherArticle.title}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {otherArticle.readTime}
                            </p>
                          </div>
                        </Link>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
