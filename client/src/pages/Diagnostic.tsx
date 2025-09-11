import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, CheckCircle2, MessageCircle, Phone, MapPin } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';

const diagnosticSchema = z.object({
  pharmacyName: z.string().min(2, 'Le nom de la pharmacie est requis'),
  managerName: z.string().min(2, 'Le nom du responsable est requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(10, 'Numéro de téléphone invalide'),
  location: z.string().min(2, 'La localisation est requise'),
  yearsOperation: z.string().min(1, 'Veuillez indiquer les années d\'activité'),
  teamSize: z.string().min(1, 'Veuillez indiquer la taille de votre équipe'),
  challenges: z.array(z.string()).min(1, 'Veuillez sélectionner au moins un défi'),
  description: z.string().min(10, 'Veuillez décrire vos besoins en détail'),
  contactPreference: z.string().min(1, 'Veuillez choisir votre préférence de contact'),
  dataConsent: z.boolean().refine(val => val === true, {
    message: 'Vous devez accepter le traitement de vos données personnelles'
  }),
  marketingConsent: z.boolean().optional()
});

type DiagnosticForm = z.infer<typeof diagnosticSchema>;

const challengeOptions = [
  { id: 'stock', label: 'Gestion des stocks et écarts' },
  { id: 'commande', label: 'Optimisation des commandes' },
  { id: 'tresorerie', label: 'Gestion de trésorerie' },
  { id: 'perimes', label: 'Réduction des périmés' },
  { id: 'conseil', label: 'Amélioration du conseil client' },
  { id: 'orthopédie', label: 'Développement secteur orthopédie' },
  { id: 'qualite', label: 'Mise en place qualité/certification' },
  { id: 'equipe', label: 'Formation et gestion d\'équipe' }
];

export default function Diagnostic() {
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<DiagnosticForm>({
    resolver: zodResolver(diagnosticSchema),
    defaultValues: {
      pharmacyName: '',
      managerName: '',
      email: '',
      phone: '',
      location: '',
      yearsOperation: '',
      teamSize: '',
      challenges: [],
      description: '',
      contactPreference: '',
      dataConsent: false,
      marketingConsent: false
    }
  });

  const onSubmit = async (data: DiagnosticForm) => {
    try {
      // TODO: Envoyer les données vers le backend sécurisé
      // Removal of PII logging for privacy compliance
      
      // Simuler l'envoi
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitted(true);
      toast({
        title: "Diagnostic envoyé !",
        description: "Nous vous recontacterons sous 24h pour programmer votre diagnostic gratuit.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  };

  const handleChallengeChange = (challengeId: string, checked: boolean) => {
    const currentChallenges = form.getValues('challenges');
    if (checked) {
      form.setValue('challenges', [...currentChallenges, challengeId]);
    } else {
      form.setValue('challenges', currentChallenges.filter(id => id !== challengeId));
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16">
          <div className="max-w-4xl mx-auto px-4 py-24">
            <Card className="text-center border-0 shadow-lg">
              <CardContent className="p-12">
                <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-6" />
                <h1 className="text-3xl font-bold text-foreground mb-4">
                  Diagnostic envoyé avec succès !
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Merci pour votre confiance. Un expert Kemet Services vous contactera dans les 24h 
                  pour programmer votre diagnostic gratuit et personnalisé.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg">
                    <Link href="/">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Retour à l'accueil
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link href="/formations">
                      Découvrir nos formations
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="bg-primary/5 py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Diagnostic Gratuit de Votre Pharmacie
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Bénéficiez d'une analyse professionnelle personnalisée de votre officine 
              et découvrez nos recommandations d'amélioration.
            </p>
            <div className="flex items-center justify-center space-x-8 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span>100% Gratuit</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span>Sans engagement</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span>Expertise locale</span>
              </div>
            </div>
          </div>
        </section>

        {/* Form Section */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-center">
                  Informations sur votre pharmacie
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  {/* Informations générales */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="pharmacyName">Nom de la pharmacie *</Label>
                      <Input
                        id="pharmacyName"
                        {...form.register('pharmacyName')}
                        placeholder="Pharmacie du Centre"
                        data-testid="input-pharmacy-name"
                      />
                      {form.formState.errors.pharmacyName && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.pharmacyName.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="managerName">Nom du responsable *</Label>
                      <Input
                        id="managerName"
                        {...form.register('managerName')}
                        placeholder="Dr. Jean Kouame"
                        data-testid="input-manager-name"
                      />
                      {form.formState.errors.managerName && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.managerName.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email professionnel *</Label>
                      <Input
                        id="email"
                        type="email"
                        {...form.register('email')}
                        placeholder="contact@pharmacie.ci"
                        data-testid="input-email"
                      />
                      {form.formState.errors.email && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Numéro de téléphone *</Label>
                      <Input
                        id="phone"
                        {...form.register('phone')}
                        placeholder="+225 07 XX XX XX XX"
                        data-testid="input-phone"
                      />
                      {form.formState.errors.phone && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.phone.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Localisation *</Label>
                      <Input
                        id="location"
                        {...form.register('location')}
                        placeholder="Cocody, Abidjan"
                        data-testid="input-location"
                      />
                      {form.formState.errors.location && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.location.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="yearsOperation">Années d'activité *</Label>
                    <Select onValueChange={(value) => form.setValue('yearsOperation', value)}>
                      <SelectTrigger data-testid="select-years-operation">
                        <SelectValue placeholder="Nombre d'années d'activité" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="moins-1">Moins d'1 an</SelectItem>
                        <SelectItem value="1-3">1 à 3 ans</SelectItem>
                        <SelectItem value="3-5">3 à 5 ans</SelectItem>
                        <SelectItem value="5-10">5 à 10 ans</SelectItem>
                        <SelectItem value="plus-10">Plus de 10 ans</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.yearsOperation && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.yearsOperation.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="teamSize">Taille de l'équipe officinale *</Label>
                    <Select onValueChange={(value) => form.setValue('teamSize', value)}>
                      <SelectTrigger data-testid="select-team-size">
                        <SelectValue placeholder="Nombre d'employés" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="moins-5">Moins de 5 employés</SelectItem>
                        <SelectItem value="5-10">5 à 10 employés</SelectItem>
                        <SelectItem value="10-20">10 à 20 employés</SelectItem>
                        <SelectItem value="plus-20">Plus de 20 employés</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.teamSize && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.teamSize.message}
                      </p>
                    )}
                  </div>

                  {/* Défis actuels */}
                  <div className="space-y-4">
                    <Label>Quels sont vos principaux défis actuels ? *</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {challengeOptions.map((challenge) => (
                        <div key={challenge.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={challenge.id}
                            onCheckedChange={(checked) => 
                              handleChallengeChange(challenge.id, checked === true)
                            }
                            data-testid={`checkbox-challenge-${challenge.id}`}
                          />
                          <Label htmlFor={challenge.id} className="text-sm">
                            {challenge.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {form.formState.errors.challenges && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.challenges.message}
                      </p>
                    )}
                  </div>

                  {/* Description détaillée */}
                  <div className="space-y-2">
                    <Label htmlFor="description">
                      Décrivez vos besoins et objectifs d'amélioration *
                    </Label>
                    <Textarea
                      id="description"
                      {...form.register('description')}
                      placeholder="Décrivez en détail vos défis actuels, vos objectifs d'amélioration et ce que vous attendez de ce diagnostic..."
                      className="min-h-32"
                      data-testid="textarea-description"
                    />
                    {form.formState.errors.description && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.description.message}
                      </p>
                    )}
                  </div>

                  {/* Préférence de contact */}
                  <div className="space-y-2">
                    <Label>Comment préférez-vous être contacté ? *</Label>
                    <Select onValueChange={(value) => form.setValue('contactPreference', value)}>
                      <SelectTrigger data-testid="select-contact-preference">
                        <SelectValue placeholder="Choisir votre préférence" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="phone">Appel téléphonique</SelectItem>
                        <SelectItem value="visit">Visite sur site</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.contactPreference && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.contactPreference.message}
                      </p>
                    )}
                  </div>

                  {/* Cases de consentement RGPD */}
                  <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
                    <h4 className="font-semibold text-foreground">Protection de vos données personnelles</h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="dataConsent"
                          checked={form.watch('dataConsent')}
                          onCheckedChange={(checked) => form.setValue('dataConsent', !!checked)}
                          data-testid="checkbox-data-consent"
                        />
                        <div className="flex-1">
                          <Label htmlFor="dataConsent" className="text-sm leading-relaxed cursor-pointer">
                            J'accepte que mes données personnelles soient traitées par Kemet Services pour réaliser le diagnostic gratuit et me recontacter. <span className="text-destructive">*</span>
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Consultez notre <Link href="/confidentialite" className="text-primary hover:underline">Politique de Confidentialité</Link> pour plus de détails.
                          </p>
                        </div>
                      </div>
                      {form.formState.errors.dataConsent && (
                        <p className="text-sm text-destructive ml-6">
                          {form.formState.errors.dataConsent.message}
                        </p>
                      )}
                      
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="marketingConsent"
                          checked={form.watch('marketingConsent')}
                          onCheckedChange={(checked) => form.setValue('marketingConsent', !!checked)}
                          data-testid="checkbox-marketing-consent"
                        />
                        <div className="flex-1">
                          <Label htmlFor="marketingConsent" className="text-sm leading-relaxed cursor-pointer">
                            J'accepte de recevoir des communications marketing de Kemet Services (formations, conseils, offres spéciales). Je peux me désinscrire à tout moment.
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Optionnel - Vous pouvez vous désinscrire en nous contactant à infos@kemetservices.com
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      type="submit"
                      size="lg"
                      className="flex-1"
                      disabled={form.formState.isSubmitting}
                      data-testid="button-submit-diagnostic"
                    >
                      {form.formState.isSubmitting ? 'Envoi en cours...' : 'Demander mon diagnostic gratuit'}
                    </Button>
                    <Button variant="outline" size="lg" asChild>
                      <Link href="/">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Retour
                      </Link>
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Contact Info */}
        <section className="bg-muted/30 py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h3 className="text-2xl font-bold text-foreground mb-6">
              Questions ? Contactez-nous directement
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center space-y-2">
                <MessageCircle className="w-8 h-8 text-primary" />
                <span className="font-semibold">WhatsApp</span>
                <span className="text-muted-foreground">+225 07 08 09 10 11</span>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <Phone className="w-8 h-8 text-primary" />
                <span className="font-semibold">Téléphone</span>
                <span className="text-muted-foreground">+225 27 22 XX XX XX</span>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <MapPin className="w-8 h-8 text-primary" />
                <span className="font-semibold">Bureau</span>
                <span className="text-muted-foreground">Abidjan, Cocody</span>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}