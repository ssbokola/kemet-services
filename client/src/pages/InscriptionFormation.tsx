import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, useRoute } from 'wouter';
import { ArrowLeft, Send, Calendar, Users, Clock, CheckCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { insertTrainingRegistrationSchema, type InsertTrainingRegistration } from '@shared/schema';
import { formations, getFormationById } from '@shared/formations';
import { apiRequest, queryClient } from '@/lib/queryClient';

export default function InscriptionFormation() {
  const [, setLocation] = useLocation();
  const [match] = useRoute('/inscription-formation');
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  // Get training ID from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const trainingIdParam = urlParams.get('trainingId');
  const selectedTraining = trainingIdParam ? getFormationById(parseInt(trainingIdParam)) : null;

  const form = useForm<InsertTrainingRegistration>({
    resolver: zodResolver(insertTrainingRegistrationSchema),
    defaultValues: {
      trainingId: selectedTraining?.id.toString() || '',
      trainingTitle: selectedTraining?.title || '',
      participantName: '',
      role: 'pharmacien-titulaire',
      officine: '',
      email: '',
      phone: '',
      experienceLevel: 'intermediaire',
      companySize: '1-5',
      participantsCount: 1,
      sessionType: 'inter-entreprise',
      preferredDate: '',
      message: '',
      dataConsent: false,
      marketingConsent: false
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertTrainingRegistration) => {
      const response = await apiRequest('POST', '/api/training-registrations', data);
      return response.json();
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({
        title: "Inscription enregistrée !",
        description: "Nous vous recontacterons sous 24h pour confirmer votre formation.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/training-registrations'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur d'inscription",
        description: error.error || "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = async (data: InsertTrainingRegistration) => {
    mutation.mutate(data);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16">
          <section className="py-16">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <Card>
                <CardContent className="pt-16 pb-12">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
                  <h1 className="text-3xl font-bold font-serif text-foreground mb-4">
                    Inscription confirmée !
                  </h1>
                  <p className="text-lg text-muted-foreground mb-8">
                    Votre demande d'inscription à la formation a été enregistrée avec succès. 
                    Nous vous recontacterons sous 24h pour confirmer les détails.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button onClick={() => setLocation('/formations')} variant="outline">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Retour aux formations
                    </Button>
                    <Button onClick={() => setLocation('/')}>
                      Accueil
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
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
        <section className="py-16 bg-muted/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold font-serif text-foreground mb-6">
              Inscription à la Formation
            </h1>
            <p className="text-xl text-muted-foreground">
              Inscrivez-vous à nos formations professionnelles spécialisées
            </p>
          </div>
        </section>

        {/* Selected Training Info */}
        {selectedTraining && (
          <section className="py-8 bg-primary/5">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl mb-2">{selectedTraining.title}</CardTitle>
                      <CardDescription className="text-base mb-4">
                        {selectedTraining.description}
                      </CardDescription>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {selectedTraining.duration}
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {selectedTraining.format}
                        </div>
                        <Badge variant="outline">{selectedTraining.price}</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </div>
          </section>
        )}

        {/* Registration Form */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card>
              <CardHeader>
                <CardTitle>Formulaire d'inscription</CardTitle>
                <CardDescription>
                  Veuillez remplir ce formulaire pour vous inscrire à la formation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    
                    {/* Formation Selection */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Sélection de la formation</h3>
                      
                      <FormField
                        control={form.control}
                        name="trainingId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Formation souhaitée *</FormLabel>
                            <Select 
                              onValueChange={(value) => {
                                field.onChange(value);
                                const training = getFormationById(parseInt(value));
                                if (training) {
                                  form.setValue('trainingTitle', training.title);
                                }
                              }} 
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger data-testid="select-training">
                                  <SelectValue placeholder="Choisir une formation" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {formations.map((formation) => (
                                  <SelectItem key={formation.id} value={formation.id.toString()}>
                                    {formation.title} - {formation.price}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Personal Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Informations personnelles</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="participantName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nom et prénom *</FormLabel>
                              <FormControl>
                                <Input placeholder="Dr. Jean Dupont" {...field} data-testid="input-participant-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="role"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Fonction *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-role">
                                    <SelectValue placeholder="Sélectionner votre fonction" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="pharmacien-titulaire">Pharmacien titulaire</SelectItem>
                                  <SelectItem value="pharmacien-adjoint">Pharmacien adjoint</SelectItem>
                                  <SelectItem value="auxiliaire">Auxiliaire en pharmacie</SelectItem>
                                  <SelectItem value="etudiant">Étudiant en pharmacie</SelectItem>
                                  <SelectItem value="autre">Autre</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="officine"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom de l'officine *</FormLabel>
                            <FormControl>
                              <Input placeholder="Pharmacie Centrale" {...field} data-testid="input-officine" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email *</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="jean.dupont@example.com" {...field} data-testid="input-email" />
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
                              <FormLabel>Téléphone *</FormLabel>
                              <FormControl>
                                <Input placeholder="+225 XX XX XX XX XX" {...field} data-testid="input-phone" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Training Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Détails de la formation</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="experienceLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Niveau d'expérience *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-experience-level">
                                    <SelectValue placeholder="Sélectionner votre niveau" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="debutant">Débutant</SelectItem>
                                  <SelectItem value="intermediaire">Intermédiaire</SelectItem>
                                  <SelectItem value="avance">Avancé</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="companySize"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Taille de l'équipe *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-company-size">
                                    <SelectValue placeholder="Nombre de personnes" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="1-5">1-5 personnes</SelectItem>
                                  <SelectItem value="6-10">6-10 personnes</SelectItem>
                                  <SelectItem value="11-20">11-20 personnes</SelectItem>
                                  <SelectItem value="20+">Plus de 20 personnes</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="participantsCount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nombre de participants *</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="1" 
                                  max="50" 
                                  placeholder="1" 
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                  data-testid="input-participants-count"
                                />
                              </FormControl>
                              <FormDescription>
                                Nombre de personnes qui participeront à cette formation
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="sessionType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Type de session *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-session-type">
                                    <SelectValue placeholder="Type de formation" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="inter-entreprise">Inter-entreprise (avec d'autres pharmacies)</SelectItem>
                                  <SelectItem value="intra-entreprise">Intra-entreprise (pour votre équipe uniquement)</SelectItem>
                                  <SelectItem value="en-ligne">En ligne (formation digitale)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="preferredDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date souhaitée (optionnel)</FormLabel>
                            <FormControl>
                              <Input 
                                type="date" 
                                {...field} 
                                data-testid="input-preferred-date"
                              />
                            </FormControl>
                            <FormDescription>
                              Si vous avez une préférence de date, nous essaierons de l'accommoder
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Message ou besoins spécifiques (optionnel)</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Décrivez vos objectifs spécifiques, contraintes ou questions particulières..." 
                                className="min-h-[100px]"
                                {...field}
                                data-testid="textarea-message"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Consent Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Consentements</h3>
                      
                      <FormField
                        control={form.control}
                        name="dataConsent"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid="checkbox-data-consent"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="cursor-pointer">
                                J'accepte que mes données personnelles soient traitées par Kemet Services pour traiter ma demande d'inscription et organiser la formation. <span className="text-destructive">*</span>
                              </FormLabel>
                              <FormDescription>
                                Consultez notre{' '}
                                <button
                                  type="button"
                                  onClick={() => setLocation('/confidentialite')}
                                  className="text-primary hover:underline"
                                >
                                  Politique de Confidentialité
                                </button>{' '}
                                pour plus de détails.
                              </FormDescription>
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
                                data-testid="checkbox-marketing-consent"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="cursor-pointer">
                                J'accepte de recevoir des communications marketing de Kemet Services (nouvelles formations, conseils, offres spéciales).
                              </FormLabel>
                              <FormDescription>
                                Optionnel - Vous pouvez vous désinscrire à tout moment en nous contactant à infos@kemetservices.com
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                      <Button
                        type="button"
                        size="lg"
                        className="flex-1"
                        disabled={mutation.isPending}
                        onClick={form.handleSubmit(onSubmit)}
                        data-testid="button-submit-registration"
                      >
                        {mutation.isPending ? 'Inscription en cours...' : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Envoyer ma demande d'inscription
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="lg" 
                        type="button"
                        onClick={() => setLocation('/formations')}
                        data-testid="button-back-formations"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Retour aux formations
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}