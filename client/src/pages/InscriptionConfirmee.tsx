import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Calendar, MapPin, Mail, Phone } from "lucide-react";
import { Link } from "wouter";

export default function InscriptionConfirmee() {
  const [location] = useLocation();
  const params = new URLSearchParams(location.split('?')[1]);
  const registrationId = params.get('registrationId');

  // Fetch registration details
  const { data: registration, isLoading } = useQuery({
    queryKey: ['/api/session-registrations', registrationId],
    enabled: !!registrationId
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="py-12 text-center">
            <h3 className="font-medium mb-2">Inscription non trouvée</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Cette inscription n'existe pas ou n'est plus disponible
            </p>
            <Link href="/formations-presentiel">
              <Button variant="outline" data-testid="button-back-catalog">
                Retour au catalogue
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Success Card */}
          <Card className="mb-8">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl">Inscription confirmée !</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-muted-foreground">
                  Votre paiement a été traité avec succès et votre inscription est confirmée.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Un email de confirmation vous a été envoyé à <strong>{registration.participantEmail}</strong>
                </p>
              </div>

              {/* Registration Details */}
              <div className="border-t pt-6 space-y-4">
                <h3 className="font-semibold">Détails de votre inscription</h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-muted-foreground">{registration.participantEmail}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Téléphone</p>
                      <p className="text-muted-foreground">{registration.participantPhone}</p>
                    </div>
                  </div>

                  {registration.organization && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Organisation</p>
                        <p className="text-muted-foreground">{registration.organization}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Next Steps */}
              <div className="border-t pt-6">
                <h3 className="font-semibold mb-3">Prochaines étapes</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Vous recevrez un email de confirmation avec tous les détails de la formation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Un rappel vous sera envoyé 48h avant la session</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Pour toute question, contactez-nous à infos@kemetservices.com</span>
                  </li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Link href="/formations-presentiel" className="flex-1">
                  <Button variant="outline" className="w-full" data-testid="button-back-catalog">
                    Voir d'autres formations
                  </Button>
                </Link>
                <Link href="/" className="flex-1">
                  <Button className="w-full" data-testid="button-home">
                    Retour à l'accueil
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
