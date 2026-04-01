import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Download, CheckCircle2, FileText, TrendingDown, Shield, Clock } from 'lucide-react';

const formSchema = z.object({
  name: z.string().trim().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().trim().email('Adresse email invalide'),
  phone: z.string().trim().optional(),
  pharmacyName: z.string().trim().optional(),
  dataConsent: z.boolean().refine(val => val === true, 
    'Vous devez accepter le traitement de vos données personnelles pour télécharger cette ressource'
  ),
  marketingConsent: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

export default function ChecklistGestion() {
  const { toast } = useToast();
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      pharmacyName: '',
      dataConsent: false,
      marketingConsent: false,
    },
  });

  const downloadMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await apiRequest('POST', '/api/lead-magnet-downloads', {
        ...data,
        resourceType: 'checklist-gestion',
        resourceTitle: 'Checklist Gestion Pharmacie - Les Essentiels'
      });
      return response.json();
    },
    onSuccess: (data: any) => {
      setDownloadUrl(data.downloadUrl);
      toast({
        title: 'Succès !',
        description: data.message,
      });
      
      // Trigger download after a short delay
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = data.downloadUrl;
        link.download = 'checklist-gestion-pharmacie.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, 500);
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue. Veuillez réessayer.',
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    downloadMutation.mutate(data);
  };

  const benefits = [
    {
      icon: TrendingDown,
      title: 'Réduire les ruptures de stock',
      description: 'Techniques éprouvées pour éviter les ruptures coûteuses'
    },
    {
      icon: Shield,
      title: 'Améliorer la conformité',
      description: 'Points de contrôle qualité essentiels'
    },
    {
      icon: Clock,
      title: 'Gagner du temps',
      description: 'Processus optimisés et automatisables'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Télécharger Checklist Gestion Pharmacie Gratuite - Guide Pratique"
        description="Téléchargez gratuitement notre checklist complète pour optimiser la gestion de votre pharmacie en Côte d'Ivoire. Réduisez les ruptures, améliorez la trésorerie et la conformité."
        canonical="/ressources/checklist-gestion"
        keywords="checklist pharmacie gratuite, guide gestion pharmacie, checklist stocks pharmacie, guide gratuit pharmacie Côte d'Ivoire, ressources pharmacie, outils gestion officine"
      />
      <Header />
      
      <main className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {!downloadUrl ? (
            <>
              {/* Hero Section */}
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                  <FileText className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold font-serif text-foreground mb-4">
                  Checklist Gestion Pharmacie
                </h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
                  Les essentiels pour optimiser votre officine au quotidien
                </p>
                <p className="text-lg text-primary font-semibold">
                  Guide PDF gratuit - 100% pratique
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                
                {/* Left: What's included */}
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-6">
                    Ce que vous allez découvrir :
                  </h2>
                  
                  <div className="space-y-4 mb-8">
                    {benefits.map((benefit, index) => (
                      <Card key={index} className="border-primary/20">
                        <CardContent className="p-4 flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <benefit.icon className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground mb-1">
                              {benefit.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {benefit.description}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-foreground mb-3">
                        ✅ Inclus dans cette checklist :
                      </h3>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>Points de contrôle quotidiens pour la gestion des stocks</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>Indicateurs clés de performance (KPI) à suivre</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>Processus de réception de commande optimisé</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>Gestion des produits à dates courtes</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>Tableaux de bord de suivi hebdomadaire</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                {/* Right: Download Form */}
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl">
                        Téléchargez votre guide gratuit
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nom complet *</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Dr. Kouamé Jean" 
                                    {...field} 
                                    data-testid="input-name"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email professionnel *</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="email"
                                    placeholder="votre@email.ci" 
                                    {...field} 
                                    data-testid="input-email"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Téléphone (optionnel)</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="+225 XX XX XX XX XX" 
                                    {...field} 
                                    data-testid="input-phone"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="pharmacyName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nom de votre pharmacie (optionnel)</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Pharmacie de..." 
                                    {...field} 
                                    data-testid="input-pharmacy"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="dataConsent"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox 
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    data-testid="checkbox-consent"
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="text-sm font-normal">
                                    J'accepte que mes données soient utilisées pour recevoir ce guide et des communications de Kemet Services *
                                  </FormLabel>
                                  <FormMessage />
                                </div>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="marketingConsent"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox 
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    data-testid="checkbox-marketing"
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="text-sm font-normal">
                                    Je souhaite recevoir des conseils et offres exclusives par email
                                  </FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />

                          <Button 
                            type="submit" 
                            className="w-full" 
                            size="lg"
                            disabled={downloadMutation.isPending}
                            data-testid="button-download"
                          >
                            {downloadMutation.isPending ? (
                              'Préparation...'
                            ) : (
                              <>
                                <Download className="w-5 h-5 mr-2" />
                                Télécharger le guide gratuit
                              </>
                            )}
                          </Button>

                          <p className="text-xs text-muted-foreground text-center">
                            Vos données sont protégées et ne seront jamais partagées.
                          </p>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          ) : (
            // Success State
            <div className="text-center max-w-2xl mx-auto">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Merci ! Votre guide est en cours de téléchargement
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Si le téléchargement ne démarre pas automatiquement, cliquez sur le bouton ci-dessous.
              </p>
              <Button 
                size="lg"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = downloadUrl;
                  link.download = 'checklist-gestion-pharmacie.pdf';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                data-testid="button-retry-download"
              >
                <Download className="w-5 h-5 mr-2" />
                Télécharger à nouveau
              </Button>

              <Card className="mt-12 bg-primary/5 border-primary/20">
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    Besoin d'un accompagnement personnalisé ?
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Nos experts peuvent vous aider à optimiser concrètement la gestion de votre pharmacie.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button variant="default" onClick={() => window.location.href = '/grille-prediagnostic.html'}>
                      Demander un diagnostic gratuit
                    </Button>
                    <Button variant="outline" onClick={() => window.location.href = '/formations'}>
                      Voir nos formations
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
