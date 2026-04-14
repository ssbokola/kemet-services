import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import {
  Calendar, Clock, MapPin, Users, Video, Award, ArrowLeft,
  CheckCircle, Send, Phone, Mail, User, Building2, MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { trackWhatsAppClick, trackEvent } from '@/components/GoogleAnalytics';
import { getEventBySlug, getTypeLabel, getTypeColor, events2026 } from '@/data/events2026';

export default function EventDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const event = getEventBySlug(slug || '');
  const [activeTab, setActiveTab] = useState<'description' | 'infos'>('description');
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    participantName: '',
    email: '',
    phone: '',
    role: '',
    officine: '',
    message: ''
  });

  const registrationMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/training-registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de l\'inscription');
      }
      return response.json();
    },
    onSuccess: () => {
      setSubmitted(true);
      trackEvent('event_registration', {
        event_category: 'conversion',
        event_label: event?.title || slug,
        value: event?.price || 0
      });
      toast({
        title: 'Inscription envoyée !',
        description: 'Nous vous contacterons sous 24h pour confirmer votre place.'
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registrationMutation.mutate({
      trainingId: event?.id.toString(),
      trainingTitle: event?.title,
      participantName: formData.participantName,
      email: formData.email,
      phone: formData.phone,
      role: formData.role || 'pharmacien-titulaire',
      officine: formData.officine,
      sessionType: event?.format === 'Zoom' ? 'en-ligne' : 'inter-entreprise',
      preferredDate: event?.dateLabel,
      message: formData.message,
      experienceLevel: 'intermediaire',
      companySize: '1-5',
      participantsCount: 1,
      dataConsent: true,
      marketingConsent: false
    });
  };

  const handleWhatsApp = () => {
    trackWhatsAppClick();
    const text = encodeURIComponent(
      `Bonjour, je souhaite m'inscrire à l'événement "${event?.title}" du ${event?.dateLabel}. Merci de me recontacter.`
    );
    window.open(`https://wa.me/2250759068744?text=${text}`, '_blank');
  };

  if (!event) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Événement non trouvé</h1>
            <Link href="/calendrier-2026">
              <Button><ArrowLeft className="w-4 h-4 mr-2" /> Retour au calendrier</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const isPast = new Date(event.date) < new Date();

  // Find related events (same type, different event)
  const related = events2026
    .filter(e => e.id !== event.id && e.type === event.type)
    .slice(0, 3);

  // Schema.org Event JSON-LD
  const eventSchema = {
    '@context': 'https://schema.org',
    '@type': 'EducationEvent',
    name: event.title,
    description: event.description,
    startDate: event.date,
    eventAttendanceMode: event.format === 'Zoom'
      ? 'https://schema.org/OnlineEventAttendanceMode'
      : 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: isPast
      ? 'https://schema.org/EventPostponed'
      : 'https://schema.org/EventScheduled',
    location: event.format === 'Zoom'
      ? { '@type': 'VirtualLocation', url: 'https://zoom.us' }
      : { '@type': 'Place', name: 'Abidjan', address: { '@type': 'PostalAddress', addressLocality: 'Abidjan', addressCountry: 'CI' } },
    organizer: {
      '@type': 'Organization',
      name: 'Kemet Services',
      url: 'https://kemetservices.com'
    },
    offers: event.isFree
      ? { '@type': 'Offer', price: '0', priceCurrency: 'XOF', availability: 'https://schema.org/InStock' }
      : { '@type': 'Offer', price: String(event.price), priceCurrency: 'XOF', availability: 'https://schema.org/InStock' },
    isAccessibleForFree: event.isFree
  };

  const tabs = [
    { id: 'description' as const, label: 'Description' },
    { id: 'infos' as const, label: 'Infos pratiques' },
  ];

  return (
    <>
      <Helmet>
        <title>{event.title} | Kemet Services</title>
        <meta name="description" content={event.description} />
        <link rel="canonical" href={`https://kemetservices.com/evenement/${event.slug}`} />
        <meta property="og:title" content={`${event.title} | Kemet Services`} />
        <meta property="og:description" content={event.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://kemetservices.com/evenement/${event.slug}`} />
        <script type="application/ld+json">{JSON.stringify(eventSchema)}</script>
      </Helmet>
      <Header />

      <main className="min-h-screen bg-background">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Accueil</Link>
            <span>/</span>
            <Link href="/calendrier-2026" className="hover:text-foreground">Calendrier 2026</Link>
            <span>/</span>
            <span className="text-foreground truncate">{event.title}</span>
          </nav>
        </div>

        {/* Hero */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: Content */}
            <div className="lg:col-span-2">
              {/* Title area */}
              <div className="mb-6">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge className={getTypeColor(event.type)}>
                    {getTypeLabel(event.type)}
                  </Badge>
                  {event.isFree && (
                    <Badge variant="outline" className="border-gold text-gold-dark">
                      Gratuit
                    </Badge>
                  )}
                  {event.fdfpEligible && (
                    <Badge className="bg-amber-100 text-amber-800 border border-amber-300">
                      <Award className="w-3 h-3 mr-1" /> Éligible FDFP
                    </Badge>
                  )}
                  {event.cobranding && (
                    <Badge variant="secondary">Co-branding : {event.cobranding}</Badge>
                  )}
                </div>
                <h1 className="text-2xl md:text-4xl font-serif font-bold text-foreground mb-3">
                  {event.title}
                </h1>
                <p className="text-lg font-accent italic text-muted-foreground">
                  {event.targetAudience === 'pharmaciens'
                    ? 'Formation destinée aux pharmaciens titulaires et gérants'
                    : 'Formation destinée aux auxiliaires en pharmacie'}
                </p>
              </div>

              {/* Key details bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-xl mb-8">
                <div className="text-center">
                  <Calendar className="w-5 h-5 mx-auto mb-1 text-primary" />
                  <div className="text-xs text-muted-foreground">Date</div>
                  <div className="text-sm font-semibold">{event.dateLabel}</div>
                </div>
                <div className="text-center">
                  <Users className="w-5 h-5 mx-auto mb-1 text-primary" />
                  <div className="text-xs text-muted-foreground">Public</div>
                  <div className="text-sm font-semibold capitalize">{event.targetAudience}</div>
                </div>
                <div className="text-center">
                  <Clock className="w-5 h-5 mx-auto mb-1 text-primary" />
                  <div className="text-xs text-muted-foreground">Durée</div>
                  <div className="text-sm font-semibold">{event.duration}</div>
                </div>
                <div className="text-center">
                  {event.format === 'Zoom'
                    ? <Video className="w-5 h-5 mx-auto mb-1 text-primary" />
                    : <MapPin className="w-5 h-5 mx-auto mb-1 text-primary" />}
                  <div className="text-xs text-muted-foreground">Format</div>
                  <div className="text-sm font-semibold">{event.format}</div>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b mb-6">
                <div className="flex gap-0">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === tab.id
                          ? 'border-primary text-primary'
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab content */}
              <div className="min-h-[300px]">
                {activeTab === 'description' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold mb-3">À qui s'adresse cet événement ?</h2>
                      <p className="text-muted-foreground leading-relaxed">{event.description}</p>
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold mb-3">Objectifs</h2>
                      <ul className="space-y-2">
                        {event.objectives.map((obj, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                            <span className="text-muted-foreground">{obj}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {event.fdfpEligible && (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Award className="w-5 h-5 text-amber-600" />
                          <span className="font-semibold text-amber-800">Prise en charge FDFP</span>
                        </div>
                        <p className="text-sm text-amber-700">
                          Cette formation est éligible à la prise en charge par le FDFP.
                          Kemet Services monte votre dossier gratuitement.
                          <Link href="/fdfp" className="underline ml-1 font-medium">En savoir plus →</Link>
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'infos' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold mb-3">Informations pratiques</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-sm text-muted-foreground mb-1">Date</div>
                          <div className="font-semibold">{event.dateLabel}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-sm text-muted-foreground mb-1">Durée</div>
                          <div className="font-semibold">{event.duration}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-sm text-muted-foreground mb-1">Lieu</div>
                          <div className="font-semibold">{event.location}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-sm text-muted-foreground mb-1">Tarif</div>
                          <div className="font-semibold">
                            {event.isFree ? 'Gratuit' : `${event.price?.toLocaleString('fr-FR')} FCFA`}
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-sm text-muted-foreground mb-1">Public cible</div>
                          <div className="font-semibold capitalize">{event.targetAudience}</div>
                        </CardContent>
                      </Card>
                      {event.maxParticipants && (
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-sm text-muted-foreground mb-1">Places limitées</div>
                            <div className="font-semibold">{event.maxParticipants} participants max</div>
                          </CardContent>
                        </Card>
                      )}
                    </div>

                    {event.fdfpEligible && (
                      <div className="mt-4">
                        <h3 className="font-semibold mb-2">Documents à fournir (FDFP)</h3>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Registre de commerce (RCCM)</li>
                          <li>• Attestation FDFP à jour</li>
                          <li>• Liste des participants</li>
                          <li>• Demande de prise en charge signée</li>
                        </ul>
                        <p className="text-sm text-amber-700 mt-2">
                          Kemet Services monte le dossier pour vous — contactez-nous 30 jours avant la date.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Related events */}
              {related.length > 0 && (
                <div className="mt-12">
                  <Separator className="mb-8" />
                  <h2 className="text-xl font-semibold mb-4">Événements similaires</h2>
                  <div className="grid sm:grid-cols-3 gap-4">
                    {related.map(r => (
                      <Link key={r.id} href={`/evenement/${r.slug}`}>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                          <CardContent className="p-4">
                            <Badge className={`${getTypeColor(r.type)} mb-2`} >
                              {getTypeLabel(r.type)}
                            </Badge>
                            <h3 className="font-medium text-sm line-clamp-2">{r.title}</h3>
                            <p className="text-xs text-muted-foreground mt-1">{r.dateLabel}</p>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right sidebar: Price card + Registration */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Price card */}
                <Card className="border-2 border-primary/20">
                  <CardContent className="p-6 text-center">
                    {event.isFree ? (
                      <div className="text-3xl font-bold text-gold-dark mb-1">Gratuit</div>
                    ) : (
                      <>
                        <div className="text-3xl font-bold text-foreground mb-1">
                          {event.price?.toLocaleString('fr-FR')} <span className="text-lg">FCFA</span>
                        </div>
                        {event.fdfpEligible && (
                          <p className="text-xs text-amber-600 font-medium">Éligible prise en charge FDFP</p>
                        )}
                      </>
                    )}
                    <Separator className="my-4" />
                    <div className="text-left space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> {event.dateLabel}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" /> {event.duration}
                      </div>
                      <div className="flex items-center gap-2">
                        {event.format === 'Zoom' ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                        {event.location}
                      </div>
                      {event.maxParticipants && (
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" /> {event.maxParticipants} places max
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Registration form or confirmation */}
                {isPast ? (
                  <Card className="bg-muted/50">
                    <CardContent className="p-6 text-center">
                      <p className="font-semibold text-muted-foreground">Cet événement est terminé</p>
                      <Link href="/calendrier-2026">
                        <Button variant="outline" className="mt-4 w-full">Voir les prochains événements</Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : submitted ? (
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-6 text-center">
                      <CheckCircle className="w-12 h-12 text-primary mx-auto mb-3" />
                      <h3 className="font-bold text-lg mb-2">Inscription envoyée !</h3>
                      <p className="text-sm text-muted-foreground">
                        Nous vous contacterons sous 24h pour confirmer votre place et les modalités de paiement.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">S'inscrire</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="name" className="text-sm">
                            <User className="w-3 h-3 inline mr-1" /> Nom complet *
                          </Label>
                          <Input
                            id="name"
                            required
                            value={formData.participantName}
                            onChange={e => setFormData(p => ({ ...p, participantName: e.target.value }))}
                            placeholder="Dr. Kouamé Yao"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email" className="text-sm">
                            <Mail className="w-3 h-3 inline mr-1" /> Email *
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                            placeholder="email@officine.com"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone" className="text-sm">
                            <Phone className="w-3 h-3 inline mr-1" /> Téléphone *
                          </Label>
                          <Input
                            id="phone"
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                            placeholder="07 XX XX XX XX"
                          />
                        </div>
                        <div>
                          <Label htmlFor="role" className="text-sm">Fonction</Label>
                          <Select
                            value={formData.role}
                            onValueChange={v => setFormData(p => ({ ...p, role: v }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pharmacien-titulaire">Pharmacien titulaire</SelectItem>
                              <SelectItem value="pharmacien-adjoint">Pharmacien adjoint</SelectItem>
                              <SelectItem value="gerant">Gérant</SelectItem>
                              <SelectItem value="auxiliaire">Auxiliaire</SelectItem>
                              <SelectItem value="autre">Autre</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="officine" className="text-sm">
                            <Building2 className="w-3 h-3 inline mr-1" /> Officine
                          </Label>
                          <Input
                            id="officine"
                            value={formData.officine}
                            onChange={e => setFormData(p => ({ ...p, officine: e.target.value }))}
                            placeholder="Pharmacie du Plateau"
                          />
                        </div>
                        <div>
                          <Label htmlFor="message" className="text-sm">Message (optionnel)</Label>
                          <Textarea
                            id="message"
                            value={formData.message}
                            onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                            placeholder="Questions, besoins spécifiques..."
                            rows={2}
                          />
                        </div>

                        <Button
                          type="submit"
                          className="w-full"
                          size="lg"
                          disabled={registrationMutation.isPending}
                        >
                          {registrationMutation.isPending ? (
                            'Envoi en cours...'
                          ) : (
                            <><Send className="w-4 h-4 mr-2" /> S'inscrire</>
                          )}
                        </Button>

                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <Separator />
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground">ou</span>
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          className="w-full border-green-500 text-green-700 hover:bg-green-50"
                          onClick={handleWhatsApp}
                        >
                          <MessageCircle className="w-4 h-4 mr-2" /> Inscription via WhatsApp
                        </Button>

                        <p className="text-xs text-muted-foreground text-center">
                          En soumettant ce formulaire, vous acceptez d'être recontacté par Kemet Services.
                        </p>
                      </form>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
