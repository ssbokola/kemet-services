import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  Mail,
  MapPin,
  Phone,
  Target,
  TrendingUp,
  User,
  Users,
  Zap,
  Building2
} from "lucide-react";
import { formatCFA } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";

export default function BootcampStock() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    organization: "",
    pricingTier: "smart_pay" as 'classic' | 'smart_pay' | 'team_pack' | 'max_boost',
    numberOfParticipants: 2,
    sessionsCount: 4 // For Classic tier: 1-4 sessions
  });

  // Pricing calculation based on tier
  const calculatePrice = () => {
    const { pricingTier, numberOfParticipants, sessionsCount } = formData;
    
    switch (pricingTier) {
      case 'classic':
        return 50000 * sessionsCount; // 50k per session (1-4 sessions)
      case 'smart_pay':
        return 160000; // -20% discount (all 4 sessions)
      case 'team_pack':
        return 170000 * numberOfParticipants; // -15% per person (all 4 sessions)
      case 'max_boost':
        return 136000 * numberOfParticipants; // -35% per person (all 4 sessions)
      default:
        return 200000;
    }
  };

  const registrationMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/bootcamp-registrations', {
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
      console.log('Registration response:', response);
      
      if (response.paymentUrl) {
        // Redirect to Wave payment page
        console.log('Redirecting to payment:', response.paymentUrl);
        window.location.href = response.paymentUrl;
      } else if (response.requiresManualPayment) {
        // Manual payment required - show success message
        console.log('Manual payment required, showing toast');
        toast({
          title: "✅ Inscription enregistrée !",
          description: response.message || "Notre équipe vous contactera sous peu pour finaliser le paiement.",
          duration: 8000
        });
        // Reset form
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          organization: "",
          pricingTier: "smart_pay",
          numberOfParticipants: 2,
          sessionsCount: 4
        });
      } else {
        console.log('Standard success, showing toast');
        toast({
          title: "Inscription réussie",
          description: "Votre inscription a été confirmée."
        });
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    registrationMutation.mutate({
      bootcampName: 'bootcamp-stock-nov-2025',
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      organization: formData.organization,
      pricingTier: formData.pricingTier,
      numberOfParticipants: formData.numberOfParticipants,
      sessionsCount: formData.sessionsCount,
      totalAmount: calculatePrice()
    });
  };

  const sessions = [
    { date: "22 novembre", module: "AUX-04 : Commander avec méthode", description: "Anticiper les besoins et éviter le surstock comme les ruptures" },
    { date: "29 novembre", module: "AUX-10 : Réceptionner sans erreur", description: "Maîtriser les portes d'entrée physiques et théoriques du stock" },
    { date: "06 décembre", module: "AUX-05 : Gérer les réclamations grossiste", description: "Traiter de façon conforme toutes les réclamations dans les délais" },
    { date: "13 décembre", module: "AUX-11 & AUX-12 : Réduire les écarts de stock", description: "Comprendre les causes et appliquer les bonnes pratiques" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground py-20">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <Badge className="mb-4 text-lg px-4 py-2" data-testid="badge-bootcamp">
                ÉVÉNEMENT SPÉCIAL - PLACES LIMITÉES
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6" data-testid="heading-title">
                BOOTCAMP STOCK+
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-primary-foreground/90">
                4 modules pour 1 mission : ne plus subir le stock
              </p>
              <div className="flex flex-wrap justify-center gap-6 text-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>Du 22 novembre au 13 décembre 2025</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>Samedis 8h30 - 11h30</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  <span>Abidjan</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Bootcamp Section */}
        <section className="py-16 bg-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Pourquoi un Bootcamp Stock+ ?</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Le stock, c'est souvent le chaos silencieux : ventes ratées, écarts inexpliqués... Chaque erreur coûte du temps et de l'argent.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card className="hover-elevate">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Target className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg">Formation 100% pratique</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Cas réels, exercices, fiches mémo et certificat à la clé
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <TrendingUp className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg">Résultats visibles</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Des résultats concrets dès le retour en officine
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Zap className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg">Auxiliaires autonomes</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Former des auxiliaires rigoureux pour un stock fluide et rentable
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Program Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Le Programme du Bootcamp</h2>
              <p className="text-lg text-muted-foreground">
                4 modules pour reprendre le contrôle du stock
              </p>
            </div>

            <div className="grid gap-6 max-w-4xl mx-auto">
              {sessions.map((session, index) => (
                <Card key={index} className="hover-elevate">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-4 flex-1">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                            {index + 1}
                          </div>
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2">{session.module}</CardTitle>
                          <CardDescription>{session.description}</CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline" className="flex-shrink-0">
                        <Calendar className="h-3 w-3 mr-1" />
                        {session.date}
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing & Registration Section */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Tarifs et Inscription</h2>
              <p className="text-lg text-muted-foreground">
                Choisissez la formule qui vous convient
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Pricing Cards */}
              <div className="space-y-4">
                <Card className={formData.pricingTier === 'classic' ? 'border-primary' : ''}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <Badge className="mb-2 bg-green-500">CLASSIC</Badge>
                        <CardTitle>Paiement par session</CardTitle>
                        <CardDescription className="mt-2">Flexibilité maximale - Payez session par session</CardDescription>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold">{formatCFA(50000)}</p>
                        <p className="text-sm text-muted-foreground">par session</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        <span>Choisissez 1 à 4 sessions</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        <span>Limite PayDunya: 50 000 F par paiement</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        <span>Parfait pour budget échelonné</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className={formData.pricingTier === 'smart_pay' ? 'border-primary' : ''}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <Badge className="mb-2 bg-yellow-500">SMART PAY</Badge>
                        <CardTitle>Les 4 sessions - Paiement unique</CardTitle>
                        <CardDescription className="mt-2">Économisez 20%</CardDescription>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold">{formatCFA(160000)}</p>
                        <p className="text-sm text-muted-foreground line-through">{formatCFA(200000)}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-yellow-500" />
                        <span>Accès aux 4 sessions</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-yellow-500" />
                        <span>-20% de réduction (40 000 F d'économie)</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-yellow-500" />
                        <span>1 participant</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className={formData.pricingTier === 'team_pack' ? 'border-primary' : ''}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <Badge className="mb-2 bg-blue-500">TEAM PACK</Badge>
                        <CardTitle>Groupe (2+ participants)</CardTitle>
                        <CardDescription className="mt-2">Économisez 15% par personne</CardDescription>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold">{formatCFA(170000)}</p>
                        <p className="text-sm text-muted-foreground">par personne</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-blue-500" />
                        <span>Les 4 sessions pour tous</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-blue-500" />
                        <span>-15% de réduction (30 000 F d'économie/pers)</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-blue-500" />
                        <span>Minimum 2 participants</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className={formData.pricingTier === 'max_boost' ? 'border-primary' : ''}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <Badge className="mb-2 bg-red-500">MAX BOOST</Badge>
                        <CardTitle>Groupe + Paiement comptant</CardTitle>
                        <CardDescription className="mt-2">Meilleure économie - jusqu'à 35%</CardDescription>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold">{formatCFA(136000)}</p>
                        <p className="text-sm text-muted-foreground">par personne</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-red-500" />
                        <span>Les 4 sessions pour tous</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-red-500" />
                        <span>-35% de réduction (64 000 F d'économie/pers)</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-red-500" />
                        <span>Minimum 2 participants</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Registration Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Inscription Bootcamp Stock+</CardTitle>
                  <CardDescription>
                    Complétez vos informations pour réserver votre place
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
                      <Label htmlFor="organization">Pharmacie / Organisation *</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="organization"
                          value={formData.organization}
                          onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                          placeholder="Nom de votre pharmacie"
                          required
                          className="pl-10"
                          data-testid="input-organization"
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <Label>Formule tarifaire *</Label>
                      <RadioGroup
                        value={formData.pricingTier}
                        onValueChange={(value: any) => {
                          // Reset participants to 2 when switching to team_pack or max_boost
                          const newParticipants = (value === 'team_pack' || value === 'max_boost') ? 2 : 1;
                          // Reset sessions to 4 when switching away from Classic
                          const newSessions = (value === 'classic') ? formData.sessionsCount : 4;
                          setFormData({ ...formData, pricingTier: value, numberOfParticipants: newParticipants, sessionsCount: newSessions });
                        }}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="classic" id="classic" data-testid="radio-classic" />
                          <Label htmlFor="classic" className="cursor-pointer">
                            Classic - {formatCFA(50000)}/session (Paiement par session)
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="smart_pay" id="smart_pay" data-testid="radio-smartpay" />
                          <Label htmlFor="smart_pay" className="cursor-pointer">
                            Smart Pay - {formatCFA(160000)} (-20%, 4 sessions)
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="team_pack" id="team_pack" data-testid="radio-teampack" />
                          <Label htmlFor="team_pack" className="cursor-pointer">
                            Team Pack - {formatCFA(170000)}/pers (-15%, 4 sessions)
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="max_boost" id="max_boost" data-testid="radio-maxboost" />
                          <Label htmlFor="max_boost" className="cursor-pointer">
                            Max Boost - {formatCFA(136000)}/pers (-35%, 4 sessions)
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {formData.pricingTier === 'classic' && (
                      <div className="space-y-2">
                        <Label htmlFor="sessions">Nombre de sessions (1-4)</Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="sessions"
                            type="number"
                            min="1"
                            max="4"
                            value={formData.sessionsCount}
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              const validValue = isNaN(value) || value < 1 ? 1 : (value > 4 ? 4 : value);
                              setFormData({ ...formData, sessionsCount: validValue });
                            }}
                            className="pl-10"
                            data-testid="input-sessions"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Payez session par session ({formatCFA(50000)} chacune)
                        </p>
                      </div>
                    )}

                    {(formData.pricingTier === 'team_pack' || formData.pricingTier === 'max_boost') && (
                      <div className="space-y-2">
                        <Label htmlFor="participants">Nombre de participants</Label>
                        <div className="relative">
                          <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="participants"
                            type="number"
                            min="2"
                            max="10"
                            value={formData.numberOfParticipants}
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              // Enforce minimum 2 participants for group tiers
                              const validValue = isNaN(value) || value < 2 ? 2 : (value > 10 ? 10 : value);
                              setFormData({ ...formData, numberOfParticipants: validValue });
                            }}
                            className="pl-10"
                            data-testid="input-participants"
                          />
                        </div>
                      </div>
                    )}

                    <div className="p-4 bg-primary/5 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Total à payer</span>
                        <span className="text-2xl font-bold text-primary" data-testid="text-total">
                          {formatCFA(calculatePrice())}
                        </span>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={registrationMutation.isPending}
                      data-testid="button-submit"
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
        </section>

        {/* Contact Section */}
        <section className="py-16 bg-card">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-6">Besoin d'informations ?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Contactez-nous pour toute question sur le Bootcamp Stock+
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <a href="https://wa.me/2250759068744" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="lg">
                  <Phone className="h-5 w-5 mr-2" />
                  075 906 8744
                </Button>
              </a>
              <a href="mailto:infos@kemetservices.com">
                <Button variant="outline" size="lg">
                  <Mail className="h-5 w-5 mr-2" />
                  infos@kemetservices.com
                </Button>
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
