import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle, 
  ArrowLeft,
  CreditCard,
  Phone,
  Mail,
  User
} from "lucide-react";
import { Link } from "wouter";
import { formatCFA } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function FormationPresentielDetails() {
  const { slug } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "",
    organization: ""
  });

  // Fetch formation details
  const { data: formation, isLoading } = useQuery<any>({
    queryKey: ['/api/onsite-trainings', slug],
    enabled: !!slug
  });

  // Create registration mutation
  const registrationMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/session-registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de l\'inscription');
      }
      
      return await response.json();
    },
    onSuccess: (response: any) => {
      if (response.paymentUrl) {
        // Redirect to Wave payment
        window.location.href = response.paymentUrl;
      } else {
        toast({
          title: "Inscription réussie",
          description: "Votre inscription a été confirmée."
        });
        queryClient.invalidateQueries({ queryKey: ['/api/onsite-trainings', slug] });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'inscription",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSessionId) {
      toast({
        title: "Session requise",
        description: "Veuillez sélectionner une session",
        variant: "destructive"
      });
      return;
    }

    const selectedSession = formation?.sessions?.find((s: any) => s.id === selectedSessionId);
    if (!selectedSession) return;

    registrationMutation.mutate({
      sessionId: selectedSessionId,
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      organization: formData.organization
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!formation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="py-12 text-center">
            <h3 className="font-medium mb-2">Formation non trouvée</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Cette formation n'existe pas ou n'est plus disponible
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

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      quality: "Qualité",
      finance: "Finance",
      stock: "Stock",
      hr: "Management",
      auxiliaires: "Auxiliaires"
    };
    return labels[category] || category;
  };

  const selectedSession = formation.sessions?.find((s: any) => s.id === selectedSessionId);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Link href="/formations-presentiel">
            <Button variant="ghost" size="sm" data-testid="button-back-catalog">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au catalogue
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Formation Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Category */}
            <div>
              <Badge className="mb-3">{getCategoryLabel(formation.category)}</Badge>
              <h1 className="text-3xl font-bold mb-3" data-testid="text-formation-title">
                {formation.title}
              </h1>
              <p className="text-muted-foreground text-lg">{formation.description}</p>
            </div>

            {/* Meta Info */}
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{formation.defaultDuration} heures</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{formation.defaultLocation || 'Abidjan'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>Maximum {formation.sessions?.[0]?.maxCapacity || 30} participants</span>
              </div>
            </div>

            <Separator />

            {/* Objectives */}
            {formation.objectives && formation.objectives.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Objectifs de la formation</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {formation.objectives.map((objective: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>{objective}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Content Preview */}
            {formation.contentSummary && (
              <Card>
                <CardHeader>
                  <CardTitle>Contenu de la formation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    {formation.contentSummary.split('\n').map((paragraph: string, index: number) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Available Sessions */}
            <Card>
              <CardHeader>
                <CardTitle>Sessions disponibles</CardTitle>
                <CardDescription>
                  Sélectionnez une session pour vous inscrire
                </CardDescription>
              </CardHeader>
              <CardContent>
                {formation.sessions && formation.sessions.length > 0 ? (
                  <div className="space-y-3">
                    {formation.sessions.map((session: any) => {
                      const remainingPlaces = session.maxCapacity - (session.currentRegistrations || 0);
                      const isAvailable = remainingPlaces > 0 && session.status === 'open';
                      
                      return (
                        <button
                          key={session.id}
                          onClick={() => isAvailable && setSelectedSessionId(session.id)}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                            selectedSessionId === session.id 
                              ? 'border-primary bg-primary/5' 
                              : isAvailable 
                                ? 'border-border hover-elevate' 
                                : 'border-border opacity-50 cursor-not-allowed'
                          }`}
                          disabled={!isAvailable}
                          data-testid={`button-select-session-${session.id}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">
                                  {new Date(session.startDate).toLocaleDateString('fr-FR', { 
                                    weekday: 'long',
                                    day: 'numeric', 
                                    month: 'long', 
                                    year: 'numeric' 
                                  })}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {new Date(session.startDate).toLocaleTimeString('fr-FR', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })} - {new Date(session.endDate).toLocaleTimeString('fr-FR', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </span>
                              </div>
                              {session.venue && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  <span>{session.venue}{session.address ? `, ${session.address}` : ''}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2 text-sm">
                                <Users className="h-3 w-3" />
                                <span className={remainingPlaces < 5 && remainingPlaces > 0 ? 'text-orange-600 dark:text-orange-400 font-medium' : ''}>
                                  {remainingPlaces} place{remainingPlaces > 1 ? 's' : ''} restante{remainingPlaces > 1 ? 's' : ''}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-primary">
                                {formatCFA(session.pricePerPerson || formation.defaultPrice)}
                              </div>
                              {!isAvailable && (
                                <Badge variant="secondary" className="mt-1">Complet</Badge>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <Alert>
                    <AlertDescription>
                      Aucune session n'est actuellement programmée pour cette formation. 
                      Contactez-nous pour être informé des prochaines sessions.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Registration Form */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Formulaire d'inscription</CardTitle>
                <CardDescription>
                  Complétez vos informations pour vous inscrire
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nom complet *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="Votre nom complet"
                        required
                        className="pl-10"
                        data-testid="input-fullname"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="votre@email.com"
                        required
                        className="pl-10"
                        data-testid="input-email"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+225 XX XX XX XX XX"
                        required
                        className="pl-10"
                        data-testid="input-phone"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Fonction *</Label>
                    <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                      <SelectTrigger id="role" data-testid="select-role">
                        <SelectValue placeholder="Sélectionnez votre fonction" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pharmacien-titulaire">Pharmacien Titulaire</SelectItem>
                        <SelectItem value="pharmacien-assistant">Pharmacien Assistant</SelectItem>
                        <SelectItem value="auxiliaire">Auxiliaire en Pharmacie</SelectItem>
                        <SelectItem value="etudiant">Étudiant en Pharmacie</SelectItem>
                        <SelectItem value="autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="organization">Pharmacie / Organisation *</Label>
                    <Input
                      id="organization"
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      placeholder="Nom de votre pharmacie"
                      required
                      data-testid="input-organization"
                    />
                  </div>

                  <Separator />

                  {selectedSession && (
                    <div className="p-4 bg-primary/5 rounded-lg space-y-2">
                      <h4 className="font-medium text-sm">Session sélectionnée</h4>
                      <p className="text-sm">
                        {new Date(selectedSession.startDate).toLocaleDateString('fr-FR', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </p>
                      <div className="flex items-center justify-between pt-2 border-t border-primary/20">
                        <span className="text-sm font-medium">Total à payer</span>
                        <span className="text-xl font-bold text-primary">
                          {formatCFA(selectedSession.pricePerPerson || formation.defaultPrice)}
                        </span>
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={!selectedSessionId || registrationMutation.isPending}
                    data-testid="button-submit-registration"
                  >
                    {registrationMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Traitement en cours...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Procéder au paiement
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Paiement sécurisé via Wave Mobile Money
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
