import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Send, CheckCircle } from 'lucide-react';

const leadFormSchema = z.object({
  name: z.string().min(2, 'Nom requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(8, 'Téléphone requis'),
  pharmacyName: z.string().min(2, 'Nom de la pharmacie requis'),
  interest: z.string().min(1, 'Veuillez sélectionner un intérêt'),
  message: z.string().optional(),
  dataConsent: z.boolean().refine((val) => val === true, {
    message: 'Vous devez accepter le traitement de vos données'
  })
});

type LeadFormValues = z.infer<typeof leadFormSchema>;

export default function LeadCaptureForm() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      pharmacyName: '',
      interest: '',
      message: '',
      dataConsent: false
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: LeadFormValues) => {
      const response = await apiRequest('POST', '/api/contacts', {
        name: data.name,
        email: data.email,
        phone: data.phone,
        subject: `Demande d'information - ${data.interest}`,
        message: `Pharmacie: ${data.pharmacyName}\nIntérêt: ${data.interest}\n\n${data.message || 'Pas de message spécifique'}`,
        source: 'formulaire-lead-homepage'
      });
      return response.json();
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({
        title: "Demande envoyée !",
        description: "Nous vous recontacterons sous 24h pour discuter de vos besoins.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur d'envoi",
        description: error.error || "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: LeadFormValues) => {
    mutation.mutate(data);
  };

  if (submitted) {
    return (
      <Card className="lg:sticky lg:top-24" data-testid="card-lead-success">
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-foreground mb-2">
            Demande envoyée !
          </h3>
          <p className="text-muted-foreground">
            Nous vous recontacterons sous 24h pour discuter de vos besoins spécifiques.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lg:sticky lg:top-24 shadow-xl" data-testid="card-lead-form">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">Demandez plus d'informations</CardTitle>
        <CardDescription>
          Recevez un programme personnalisé et un devis gratuit
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom et prénom *</FormLabel>
                  <FormControl>
                    <Input placeholder="Dr. Jean Dupont" {...field} data-testid="input-lead-name" />
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
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="jean.dupont@example.com" {...field} data-testid="input-lead-email" />
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
                    <Input placeholder="+225 XX XX XX XX XX" {...field} data-testid="input-lead-phone" />
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
                  <FormLabel>Nom de la pharmacie *</FormLabel>
                  <FormControl>
                    <Input placeholder="Pharmacie Centrale" {...field} data-testid="input-lead-pharmacy" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="interest"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Je suis intéressé par *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-lead-interest">
                        <SelectValue placeholder="Sélectionnez votre intérêt" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="formations">Formations</SelectItem>
                      <SelectItem value="consulting-stock">Consulting gestion des stocks</SelectItem>
                      <SelectItem value="consulting-tresorerie">Consulting trésorerie</SelectItem>
                      <SelectItem value="consulting-iso">Certification ISO 9001</SelectItem>
                      <SelectItem value="consulting-rh">Consulting RH</SelectItem>
                      <SelectItem value="diagnostic">Diagnostic gratuit</SelectItem>
                      <SelectItem value="kemet-echo">Kemet Echo - Satisfaction client</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message (optionnel)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Décrivez vos besoins ou questions..." 
                      className="min-h-[80px] resize-none"
                      {...field}
                      data-testid="textarea-lead-message"
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
                      data-testid="checkbox-lead-consent"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm cursor-pointer">
                      J'accepte que mes données soient traitées pour répondre à ma demande *
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full" 
              disabled={mutation.isPending}
              data-testid="button-lead-submit"
            >
              {mutation.isPending ? (
                'Envoi en cours...'
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Envoyer ma demande
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
