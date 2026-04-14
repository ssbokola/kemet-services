import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';
import { Calendar, MapPin, Clock, Users, ArrowRight, Video, Award, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  events2026,
  getTypeLabel,
  getTypeColor,
  type EventType
} from '@/data/events2026';

type FilterType = 'all' | EventType;

export default function Calendrier2026() {
  const [filter, setFilter] = useState<FilterType>('all');

  const filtered = filter === 'all'
    ? events2026
    : events2026.filter(e => e.type === filter);

  const filters: { value: FilterType; label: string; count: number }[] = [
    { value: 'all', label: 'Tous', count: events2026.length },
    { value: 'master-class', label: 'Master Class', count: events2026.filter(e => e.type === 'master-class').length },
    { value: 'webinaire', label: 'Webinaires', count: events2026.filter(e => e.type === 'webinaire').length },
    { value: 'formation-auxiliaires', label: 'Auxiliaires FDFP', count: events2026.filter(e => e.type === 'formation-auxiliaires').length },
  ];

  return (
    <>
      <Helmet>
        <title>Calendrier 2026 – Formations & Événements | Kemet Services</title>
        <meta name="description" content="Calendrier complet 2026 : Master Class pharmaciens, webinaires gratuits et formations auxiliaires FDFP. 13 événements pour structurer et développer votre officine." />
        <link rel="canonical" href="https://kemetservices.com/calendrier-2026" />
      </Helmet>
      <Header />

      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="bg-primary text-primary-foreground py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Badge className="bg-gold text-white mb-4 text-sm px-3 py-1">
              <Calendar className="w-4 h-4 mr-1" /> Saison 2026
            </Badge>
            <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4">
              Calendrier des événements 2026
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-3xl mx-auto">
              Master Class, webinaires gratuits et formations auxiliaires FDFP —
              13 rendez-vous pour structurer et développer votre officine.
            </p>
            <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-primary-foreground" />
                5 Master Class
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-gold" />
                4 Webinaires gratuits
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
                4 Formations Auxiliaires FDFP
              </div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
          <div className="bg-card rounded-xl shadow-md border p-4 flex flex-wrap gap-2 items-center">
            <Filter className="w-4 h-4 text-muted-foreground mr-1" />
            {filters.map(f => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filter === f.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {f.label} ({f.count})
              </button>
            ))}
          </div>
        </section>

        {/* Events grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid gap-6">
            {filtered.map(event => {
              const isPast = new Date(event.date) < new Date();
              return (
                <Link key={event.id} href={`/evenement/${event.slug}`}>
                  <Card className={`group hover:shadow-lg transition-all cursor-pointer border-l-4 ${
                    event.type === 'master-class' ? 'border-l-primary' :
                    event.type === 'webinaire' ? 'border-l-gold' :
                    'border-l-emerald-700'
                  } ${isPast ? 'opacity-60' : ''}`}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        {/* Date block */}
                        <div className="flex-shrink-0 text-center md:w-28">
                          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            {event.month}
                          </div>
                          <div className="text-2xl font-serif font-bold text-foreground">
                            {event.date.split('-')[2] === event.date.split('-')[2]
                              ? new Date(event.date).getDate()
                              : event.dateLabel.split(' ')[0]}
                          </div>
                          <div className="text-xs text-muted-foreground">2026</div>
                        </div>

                        {/* Separator */}
                        <div className="hidden md:block w-px h-16 bg-border" />

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
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
                                <Award className="w-3 h-3 mr-1" /> FDFP
                              </Badge>
                            )}
                            {isPast && (
                              <Badge variant="secondary">Terminé</Badge>
                            )}
                          </div>
                          <h2 className="text-lg md:text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                            {event.title}
                          </h2>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {event.description}
                          </p>
                        </div>

                        {/* Meta */}
                        <div className="flex flex-row md:flex-col gap-3 md:gap-2 text-sm text-muted-foreground flex-shrink-0">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" /> {event.dateLabel}
                          </span>
                          <span className="flex items-center gap-1">
                            {event.format === 'Zoom' ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                            {event.format}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" /> {event.duration}
                          </span>
                        </div>

                        {/* Price + Arrow */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="text-right">
                            {event.isFree ? (
                              <span className="text-lg font-bold text-gold-dark">Gratuit</span>
                            ) : (
                              <span className="text-lg font-bold text-foreground">
                                {event.price?.toLocaleString('fr-FR')} F
                              </span>
                            )}
                          </div>
                          <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* CTA bottom */}
        <section className="bg-muted/50 py-12">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-2xl font-serif font-bold mb-4">
              Besoin d'un programme sur mesure ?
            </h2>
            <p className="text-muted-foreground mb-6">
              Kemet Services propose aussi des formations intra-entreprise adaptées à votre officine.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/contact">
                <Button size="lg">Demander un devis</Button>
              </Link>
              <Link href="/fdfp">
                <Button size="lg" variant="outline">
                  <Award className="w-4 h-4 mr-2" /> Prise en charge FDFP
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
