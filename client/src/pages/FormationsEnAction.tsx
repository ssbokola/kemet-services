import { Helmet } from 'react-helmet-async';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, MapPin } from 'lucide-react';
import formationPhoto1 from '@assets/IMG-20250923-WA0140_1758720885449.jpg';
import formationPhoto2 from '@assets/IMG-20250923-WA0143_1758720885450.jpg';

export default function FormationsEnAction() {
  const formations = [
    {
      id: 1,
      titre: "Formation Réduction des Écarts de Stock",
      date: "Septembre 2024",
      lieu: "Abidjan, Côte d'Ivoire",
      public: "Pharmaciens",
      participants: "25+ participants",
      photos: [
        {
          url: formationPhoto1,
          alt: "Formateurs Kemet Services devant le banner de formation",
          description: "Nos experts formateurs prêts à partager leur expertise"
        },
        {
          url: formationPhoto2,
          alt: "Photo de groupe avec tous les pharmaciens participants",
          description: "Participants pharmaciens à la formation sur la gestion des stocks"
        }
      ],
      description: "Formation spécialisée destinée aux pharmaciens pour optimiser la gestion des stocks et réduire significativement les écarts d'inventaire.",
      thematiques: [
        "Audit des stocks",
        "Méthodes de contrôle",
        "Optimisation des processus",
        "Outils de gestion"
      ]
    }
  ];

  return (
    <>
      <Helmet>
        <title>Nos Formations en Action | Kemet Services</title>
        <meta name="description" content="Découvrez nos formations professionnelles en action. Photos et témoignages de nos sessions de formation pour pharmaciens en Côte d'Ivoire." />
        <meta property="og:title" content="Nos Formations en Action | Kemet Services" />
        <meta property="og:description" content="Découvrez nos formations professionnelles en action. Photos et témoignages de nos sessions de formation pour pharmaciens." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 dark:from-slate-900 dark:to-slate-800">
        {/* Hero Section */}
        <section className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                Nos Formations
                <span className="text-teal-600 dark:text-teal-400"> en Action</span>
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">
                Découvrez nos sessions de formation professionnelle et l'engagement de nos participants pharmaciens à travers des moments authentiques de partage et d'apprentissage.
              </p>
            </div>
          </div>
        </section>

        {/* Formations Gallery */}
        <section className="pb-20">
          <div className="container mx-auto px-4">
            <div className="space-y-16">
              {formations.map((formation) => (
                <Card key={formation.id} className="overflow-hidden shadow-xl">
                  <CardContent className="p-0">
                    {/* Formation Header */}
                    <div className="bg-teal-600 dark:bg-teal-700 text-white p-8">
                      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                        <h2 className="text-2xl md:text-3xl font-bold">
                          {formation.titre}
                        </h2>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formation.date}
                          </Badge>
                          <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                            <MapPin className="w-4 h-4 mr-1" />
                            {formation.lieu}
                          </Badge>
                          <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                            <Users className="w-4 h-4 mr-1" />
                            {formation.participants}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-lg text-teal-50 mb-4">
                        {formation.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {formation.thematiques.map((thematique, index) => (
                          <Badge key={index} variant="outline" className="border-white/30 text-white hover:bg-white/10">
                            {thematique}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Photos Grid */}
                    <div className="p-8">
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                        Moments de Formation
                      </h3>
                      <div className="grid md:grid-cols-2 gap-8">
                        {formation.photos.map((photo, index) => (
                          <div key={index} className="space-y-4">
                            <div className="overflow-hidden rounded-lg shadow-lg group">
                              <img
                                src={photo.url}
                                alt={photo.alt}
                                className="w-full h-64 md:h-80 object-cover transition-transform duration-300 group-hover:scale-105"
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

                    {/* Formation Details */}
                    <div className="bg-slate-50 dark:bg-slate-800 p-8">
                      <div className="grid md:grid-cols-3 gap-6 text-center">
                        <div>
                          <div className="text-3xl font-bold text-teal-600 dark:text-teal-400 mb-2">
                            {formation.participants.split('+')[0]}+
                          </div>
                          <div className="text-slate-600 dark:text-slate-300 font-medium">
                            Pharmaciens Formés
                          </div>
                        </div>
                        <div>
                          <div className="text-3xl font-bold text-teal-600 dark:text-teal-400 mb-2">
                            {formation.thematiques.length}
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
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-teal-600 dark:bg-teal-700 py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Participez à Nos Prochaines Formations
            </h2>
            <p className="text-xl text-teal-50 mb-8 max-w-3xl mx-auto">
              Rejoignez notre communauté de pharmaciens qui transforment leurs pratiques grâce à nos formations spécialisées. 
              Des experts reconnus, des méthodes éprouvées, des résultats concrets.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/formations"
                className="bg-white text-teal-600 px-8 py-3 rounded-lg font-semibold hover:bg-teal-50 transition-colors duration-200"
                data-testid="link-formations"
              >
                Découvrir Nos Formations
              </a>
              <a
                href="/contact"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-teal-600 transition-colors duration-200"
                data-testid="link-contact"
              >
                Nous Contacter
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}