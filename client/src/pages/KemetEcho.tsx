import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { 
  BarChart3, 
  Users, 
  MessageSquare, 
  TrendingUp, 
  CheckCircle2, 
  Star,
  Smartphone,
  Shield,
  Zap,
  Target,
  Clock,
  Award
} from 'lucide-react';

export default function KemetEcho() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    pharmacyName: '',
    offerType: '',
    message: '',
    dataConsent: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.dataConsent) {
      toast({
        title: "Consentement requis",
        description: "Vous devez accepter le traitement de vos données personnelles.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/kemet-echo-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de l\'envoi de la demande');
      }

      toast({
        title: "Demande envoyée avec succès !",
        description: "Notre équipe vous contactera dans les 24 heures pour organiser votre démonstration."
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        pharmacyName: '',
        offerType: '',
        message: '',
        dataConsent: false
      });

    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <Helmet>
        <title>Kemet Echo - Baromètre Client | Kemet Services</title>
        <meta name="description" content="Kemet Echo : Solution innovante de satisfaction client pour pharmacies et cliniques en Côte d'Ivoire. CSAT, NPS, enquêtes anonymes, rapports détaillés. Essai gratuit 30 jours." />
        <meta property="og:title" content="Kemet Echo - Baromètre Client pour Pharmacies" />
        <meta property="og:description" content="Mesurez et améliorez la satisfaction de vos clients avec Kemet Echo. Tableau de bord en temps réel, enquêtes personnalisées, rapports détaillés." />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        {/* Hero Section */}
        <section className="relative py-16 px-4 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20">
          <div className="container mx-auto max-w-7xl">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-semibold mb-4">
                  ✨ Nouveau Produit
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                  Kemet Echo
                </h1>
                <p className="text-2xl text-primary font-semibold mb-4">
                  Baromètre Client pour Pharmacies
                </p>
                <p className="text-lg text-muted-foreground mb-6">
                  Mesurez et améliorez la satisfaction de vos clients en temps réel. 
                  Solution complète avec tableau de bord, enquêtes personnalisées et rapports détaillés.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button 
                    size="lg" 
                    variant="default"
                    onClick={() => document.getElementById('demo-form')?.scrollIntoView({ behavior: 'smooth' })}
                    data-testid="button-demo-request"
                  >
                    <Target className="mr-2 h-5 w-5" />
                    Demander une démo
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                    data-testid="button-view-features"
                  >
                    Découvrir les fonctionnalités
                  </Button>
                </div>
              </div>
              
              <div className="hidden md:block">
                <Card className="bg-white/80 dark:bg-card/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <BarChart3 className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">Tableau de bord en temps réel</div>
                          <div className="text-sm text-muted-foreground">Suivez vos indicateurs clés</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <MessageSquare className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">Enquêtes personnalisées</div>
                          <div className="text-sm text-muted-foreground">CSAT, NPS, questions ouvertes</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <TrendingUp className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">Rapports détaillés</div>
                          <div className="text-sm text-muted-foreground">Analyses et recommandations</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 px-4">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Fonctionnalités Complètes
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Tout ce dont vous avez besoin pour comprendre et améliorer l'expérience de vos clients
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Star className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Score CSAT</CardTitle>
                  <CardDescription>
                    Mesurez la satisfaction client après chaque visite avec des questions simples et efficaces
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Net Promoter Score</CardTitle>
                  <CardDescription>
                    Identifiez vos promoteurs et détracteurs pour améliorer votre réputation
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Enquêtes Anonymes</CardTitle>
                  <CardDescription>
                    Collectez des retours authentiques grâce à l'anonymat garanti
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Dashboard Analytics</CardTitle>
                  <CardDescription>
                    Visualisez vos données en temps réel avec des graphiques interactifs
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Alertes Instantanées</CardTitle>
                  <CardDescription>
                    Recevez des notifications en cas de retour négatif pour réagir rapidement
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Rapports Mensuels</CardTitle>
                  <CardDescription>
                    Recevez des analyses détaillées et des recommandations d'amélioration
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Choisissez Votre Offre
              </h2>
              <p className="text-lg text-muted-foreground">
                Des solutions adaptées à tous les besoins et budgets
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {/* Freemium */}
              <Card className="border-2">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle>Freemium</CardTitle>
                    <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                      Gratuit
                    </div>
                  </div>
                  <CardDescription>Essai gratuit 30 jours</CardDescription>
                  <div className="mt-4">
                    <div className="text-3xl font-bold text-foreground">0 FCFA</div>
                    <div className="text-sm text-muted-foreground">pendant 30 jours</div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span className="text-sm">Jusqu'à 100 réponses/mois</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span className="text-sm">Dashboard basique</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span className="text-sm">CSAT et NPS</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span className="text-sm">Support par email</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Premium */}
              <Card className="border-2 border-primary relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground rounded-full text-sm font-semibold">
                  Populaire
                </div>
                <CardHeader>
                  <CardTitle>Premium</CardTitle>
                  <CardDescription>Pour un suivi complet</CardDescription>
                  <div className="mt-4">
                    <div className="text-3xl font-bold text-foreground">15 000 FCFA</div>
                    <div className="text-sm text-muted-foreground">par mois</div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span className="text-sm">Réponses illimitées</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span className="text-sm">Dashboard avancé</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span className="text-sm">Toutes les métriques</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span className="text-sm">Rapports mensuels</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span className="text-sm">Alertes en temps réel</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span className="text-sm">Support prioritaire</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Pack Clé en Main */}
              <Card className="border-2">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle>Pack Clé en Main</CardTitle>
                    <Smartphone className="h-5 w-5 text-primary" />
                  </div>
                  <CardDescription>Solution complète avec matériel</CardDescription>
                  <div className="mt-4">
                    <div className="text-3xl font-bold text-foreground">Sur devis</div>
                    <div className="text-sm text-muted-foreground">installation incluse</div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span className="text-sm">Tablette dédiée fournie</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span className="text-sm">Installation sur site</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span className="text-sm">Formation du personnel</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span className="text-sm">Maintenance incluse</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span className="text-sm">Garantie matériel 1 an</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span className="text-sm">Support dédié</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Why Choose Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Pourquoi Choisir Kemet Echo ?
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Facile à Utiliser</h3>
                <p className="text-muted-foreground">
                  Interface intuitive ne nécessitant aucune formation technique. Mise en place en moins de 5 minutes.
                </p>
              </div>

              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Données Sécurisées</h3>
                <p className="text-muted-foreground">
                  Hébergement sécurisé, conformité RGPD, anonymat garanti pour vos clients.
                </p>
              </div>

              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Support Local</h3>
                <p className="text-muted-foreground">
                  Équipe basée en Côte d'Ivoire, disponible en français, support WhatsApp réactif.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Demo Request Form */}
        <section id="demo-form" className="py-16 px-4 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20">
          <div className="container mx-auto max-w-3xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Demander une Démonstration
              </h2>
              <p className="text-lg text-muted-foreground">
                Remplissez ce formulaire et notre équipe vous contactera dans les 24 heures
              </p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom complet *</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Votre nom"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                        data-testid="input-name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pharmacyName">Nom pharmacie/clinique *</Label>
                      <Input
                        id="pharmacyName"
                        type="text"
                        placeholder="Nom de votre établissement"
                        value={formData.pharmacyName}
                        onChange={(e) => handleInputChange('pharmacyName', e.target.value)}
                        required
                        data-testid="input-pharmacy"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="votre@email.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                        data-testid="input-email"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+225 XX XX XX XX XX"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        required
                        data-testid="input-phone"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="offerType">Offre souhaitée *</Label>
                    <Select
                      value={formData.offerType}
                      onValueChange={(value) => handleInputChange('offerType', value)}
                      required
                    >
                      <SelectTrigger id="offerType" data-testid="select-offer">
                        <SelectValue placeholder="Sélectionnez une offre" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="freemium">Freemium - Essai gratuit 30 jours</SelectItem>
                        <SelectItem value="premium">Premium - 15 000 FCFA/mois</SelectItem>
                        <SelectItem value="pack">Pack clé en main - Tablette + Installation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message (optionnel)</Label>
                    <Textarea
                      id="message"
                      placeholder="Questions ou besoins spécifiques..."
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      rows={4}
                      data-testid="textarea-message"
                    />
                  </div>

                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="dataConsent"
                      checked={formData.dataConsent}
                      onCheckedChange={(checked) => handleInputChange('dataConsent', checked)}
                      required
                      data-testid="checkbox-consent"
                    />
                    <Label htmlFor="dataConsent" className="text-sm font-normal cursor-pointer">
                      J'accepte le traitement de mes données personnelles conformément à la{' '}
                      <Link href="/confidentialite" className="text-primary hover:underline">
                        politique de confidentialité
                      </Link>
                      . *
                    </Label>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    variant="default"
                    className="w-full"
                    disabled={isSubmitting}
                    data-testid="button-submit"
                  >
                    {isSubmitting ? 'Envoi en cours...' : 'Demander une démonstration'}
                  </Button>

                  <p className="text-sm text-muted-foreground text-center">
                    Notre équipe vous contactera dans les 24 heures pour organiser votre démonstration personnalisée.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
