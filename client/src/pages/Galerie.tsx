import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, MapPin, Camera, Award, Target } from 'lucide-react';
import formationPhoto1 from '@assets/IMG-20250923-WA0140_1758720885449.jpg';
import formationPhoto2 from '@assets/IMG-20250923-WA0143_1758720885450.jpg';
import logoImage from '@assets/LOGO KEMET CANVAS_1757585789355.png';

export default function Galerie() {
  const mediaCategories = [
    {
      id: 'formations-recentes',
      titre: "Nos Formations en Action",
      description: "Découvrez nos sessions de formation professionnelle à travers des moments authentiques",
      icon: Users,
      medias: [
        {
          id: 'formation-stock-sept2025',
          titre: "Formation Réduction des Écarts de Stock",
          date: "Septembre 2025",
          lieu: "Abidjan, Côte d'Ivoire",
          participants: "25+ pharmaciens",
          thematiques: ["Audit des stocks", "Méthodes de contrôle", "Optimisation des processus", "Outils de gestion"],
          photos: [
            {
              url: formationPhoto1,
              alt: "Formateurs Kemet Services devant le banner de formation",
              description: "Nos experts formateurs prêts à partager leur expertise en gestion pharmaceutique"
            },
            {
              url: formationPhoto2,
              alt: "Photo de groupe avec tous les pharmaciens participants",
              description: "Participants pharmaciens lors de notre formation sur la réduction des écarts de stock"
            }
          ]
        }
      ]
    },
    {
      id: 'formations-anterieures',
      titre: "Formations Précédentes",
      description: "Retour en images sur nos précédentes sessions de formation qui ont marqué l'année",
      icon: Calendar,
      medias: [
        {
          id: 'formation-tresorerie-mai2024',
          titre: "Formation Gestion de Trésorerie",
          date: "28 mai 2024",
          lieu: "Abidjan, Côte d'Ivoire",
          participants: "Pharmaciens titulaires",
          description: "Session intensive sur la gestion financière et la trésorerie pour pharmacies d'officine",
          thematiques: ["Gestion financière", "Optimisation trésorerie", "Analyse des flux", "Rentabilité"],
          photos: [
            {
              url: '/images/tresorerie-salle.jpg',
              alt: 'Formation Gestion de Trésorerie - Cadre moderne',
              description: "Formation dans un cadre moderne et professionnel"
            },
            {
              url: '/images/tresorerie-formateur.jpg',
              alt: 'Formateur expliquant la gestion de trésorerie',
              description: "Expertise de terrain et approche pédagogique adaptée"
            },
            {
              url: '/images/tresorerie-groupe2.jpg',
              alt: 'Travail de groupe entre pharmaciens',
              description: "Exercices pratiques de gestion financière en petits groupes"
            },
            {
              url: '/images/tresorerie-groupe-final.jpg',
              alt: 'Photo de groupe formation trésorerie',
              description: "Pharmaciens satisfaits à l'issue de la formation"
            }
          ]
        },
        {
          id: 'formation-commande-mars2024',
          titre: "Formation Gestion de Commande",
          date: "16 mars 2024",
          lieu: "Abidjan, Côte d'Ivoire",
          participants: "Auxiliaires en pharmacie",
          description: "Formation spécialisée pour les auxiliaires sur la gestion efficace des commandes",
          thematiques: ["Planification commandes", "Gestion fournisseurs", "Optimisation stocks", "Procédures"],
          photos: [
            {
              url: '/images/hero-formation.jpg',
              alt: 'Salle de formation avec participants',
              description: "Session interactive avec les auxiliaires en pharmacie"
            },
            {
              url: '/images/gallery-5.jpg',
              alt: 'Formateur expert en action',
              description: "Expertise terrain et accompagnement personnalisé"
            }
          ]
        }
      ]
    },
    {
      id: 'identite',
      titre: "Identité Visuelle",
      description: "Notre identité de marque et nos éléments visuels",
      icon: Award,
      medias: [
        {
          id: 'logo-kemet',
          titre: "Logo Kemet Services",
          description: "Notre identité visuelle professionnelle reflétant notre expertise en formation pharmaceutique",
          photos: [
            {
              url: logoImage,
              alt: "Logo Kemet Services - Formation et Conseil Pharmaceutique",
              description: "Logo officiel Kemet Services - Spécialisés en formation et conseil pour pharmaciens"
            }
          ]
        }
      ]
    }
  ];

  return (
    <>
      <Helmet>
        <title>Galerie Médias | Kemet Services</title>
        <meta name="description" content="Galerie photo et médias de Kemet Services. Découvrez nos formations en action, notre identité visuelle et nos moments professionnels en Côte d'Ivoire." />
        <meta property="og:title" content="Galerie Médias | Kemet Services" />
        <meta property="og:description" content="Galerie photo et médias de Kemet Services. Découvrez nos formations professionnelles et notre expertise." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 dark:from-slate-900 dark:to-slate-800">
        {/* Hero Section */}
        <section className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-4xl mx-auto">
              <div className="flex items-center justify-center gap-3 mb-6">
                <Camera className="h-12 w-12 text-teal-600 dark:text-teal-400" />
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">
                  Galerie
                  <span className="text-teal-600 dark:text-teal-400"> Médias</span>
                </h1>
              </div>
              <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">
                Découvrez Kemet Services à travers nos formations, notre identité visuelle et nos moments professionnels. 
                Une galerie qui reflète notre expertise et notre engagement envers l'excellence pharmaceutique.
              </p>
            </div>
          </div>
        </section>

        {/* Media Categories */}
        <section className="pb-20">
          <div className="container mx-auto px-4">
            <div className="space-y-20">
              {mediaCategories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <div key={category.id} className="space-y-8">
                    {/* Category Header */}
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-3 mb-4">
                        <IconComponent className="h-8 w-8 text-teal-600 dark:text-teal-400" />
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                          {category.titre}
                        </h2>
                      </div>
                      <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                        {category.description}
                      </p>
                    </div>

                    {/* Media Items */}
                    <div className="space-y-16">
                      {category.medias.map((media) => (
                        <Card key={media.id} className="overflow-hidden shadow-xl">
                          <CardContent className="p-0">
                            {/* Media Header */}
                            <div className="bg-teal-600 dark:bg-teal-700 text-white p-8">
                              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                                <h3 className="text-2xl md:text-3xl font-bold">
                                  {media.titre}
                                </h3>
                                {'date' in media && 'lieu' in media && 'participants' in media && (
                                  <div className="flex flex-wrap gap-2">
                                    <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                                      <Calendar className="w-4 h-4 mr-1" />
                                      {media.date}
                                    </Badge>
                                    <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                                      <MapPin className="w-4 h-4 mr-1" />
                                      {media.lieu}
                                    </Badge>
                                    <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                                      <Users className="w-4 h-4 mr-1" />
                                      {media.participants}
                                    </Badge>
                                  </div>
                                )}
                              </div>
                              <p className="text-lg text-teal-50 mb-4">
                                {'description' in media ? media.description : ''}
                              </p>
                              {'thematiques' in media && media.thematiques && (
                                <div className="flex flex-wrap gap-2">
                                  {media.thematiques.map((thematique: string, index: number) => (
                                    <Badge key={index} variant="outline" className="border-white/30 text-white hover:bg-white/10">
                                      {thematique}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Photos Grid */}
                            <div className="p-8">
                              <div className={`grid gap-8 ${media.photos.length === 1 ? 'justify-center' : 'md:grid-cols-2'}`}>
                                {media.photos.map((photo, index) => (
                                  <div key={index} className="space-y-4">
                                    <div className="overflow-hidden rounded-lg shadow-lg group">
                                      <img
                                        src={photo.url}
                                        alt={photo.alt}
                                        className={`w-full ${media.photos.length === 1 ? 'max-w-md mx-auto h-64' : 'h-64 md:h-80'} object-cover transition-transform duration-300 group-hover:scale-105`}
                                        loading="lazy"
                                      />
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-300 text-center font-medium">
                                      {photo.description}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Stats for formations */}
                            {'participants' in media && 'thematiques' in media && media.participants && media.thematiques && (
                              <div className="bg-slate-50 dark:bg-slate-800 p-8">
                                <div className="grid md:grid-cols-3 gap-6 text-center">
                                  <div>
                                    <div className="text-3xl font-bold text-teal-600 dark:text-teal-400 mb-2">
                                      {media.participants.includes('+') ? media.participants.split('+')[0] + '+' : media.participants}
                                    </div>
                                    <div className="text-slate-600 dark:text-slate-300 font-medium">
                                      {'participants' in media && media.participants.includes('Auxiliaires') ? 'Auxiliaires Formés' : 'Pharmaciens Formés'}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-3xl font-bold text-teal-600 dark:text-teal-400 mb-2">
                                      {media.thematiques.length}
                                    </div>
                                    <div className="text-slate-600 dark:text-slate-300 font-medium">
                                      Thématiques Abordées
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-3xl font-bold text-teal-600 dark:text-teal-400 mb-2">
                                      1
                                    </div>
                                    <div className="text-slate-600 dark:text-slate-300 font-medium">
                                      Journée Intensive
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-teal-600 dark:bg-teal-700 py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Target className="h-10 w-10 text-white" />
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Prêt à Nous Rejoindre ?
              </h2>
            </div>
            <p className="text-xl text-teal-50 mb-8 max-w-3xl mx-auto">
              Rejoignez notre communauté de pharmaciens qui transforment leurs pratiques grâce à nos formations spécialisées. 
              Des experts reconnus, des méthodes éprouvées, une approche professionnelle.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/formations">
                <button
                  className="bg-white text-teal-600 px-8 py-3 rounded-lg font-semibold hover:bg-teal-50 transition-colors duration-200"
                  data-testid="button-formations"
                >
                  Découvrir Nos Formations
                </button>
              </Link>
              <Link href="/contact">
                <button
                  className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-teal-600 transition-colors duration-200"
                  data-testid="button-contact"
                >
                  Nous Contacter
                </button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}