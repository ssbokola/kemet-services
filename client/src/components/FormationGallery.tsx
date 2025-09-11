import { Card, CardContent } from '@/components/ui/card';

const galleryImages = [
  {
    src: '/images/tresorerie-salle.jpg',
    alt: 'Formation Gestion de Trésorerie - Cadre moderne',
    caption: 'Formation "Gestion de Trésorerie" dans un cadre moderne - 28 mai 2024'
  },
  {
    src: '/images/hero-formation.jpg',
    alt: 'Salle de formation avec participants',
    caption: 'Formation "Gérer Efficacement la Commande" - 16 mars 2024'
  },
  {
    src: '/images/tresorerie-formateur.jpg',
    alt: 'Formateur expliquant la gestion de trésorerie',
    caption: 'Formation ciblée pharmaciens - Approche pédagogique adaptée'
  },
  {
    src: '/images/tresorerie-groupe2.jpg',
    alt: 'Travail de groupe entre pharmaciens',
    caption: 'Exercices pratiques de gestion financière en petits groupes'
  },
  {
    src: '/images/gallery-5.jpg',
    alt: 'Formateur expert en action',
    caption: 'Expertise de terrain et accompagnement personnalisé'
  },
  {
    src: '/images/tresorerie-groupe-final.jpg',
    alt: 'Photo de groupe formation trésorerie',
    caption: 'Pharmaciens satisfaits - Formation Gestion de Trésorerie'
  }
];

export default function FormationGallery() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-serif text-foreground mb-4">
            Nos formations en images
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Découvrez l'ambiance de nos sessions de formation et l'engagement de nos participants
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {galleryImages.map((image, index) => (
            <Card 
              key={index} 
              className="overflow-hidden border-0 shadow-lg hover-elevate transition-all duration-300"
              data-testid={`card-gallery-${index}`}
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img 
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {image.caption}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            <div className="bg-card p-6 rounded-lg shadow-sm">
              <div className="text-lg font-semibold text-foreground mb-2">
                Formation du 16 mars 2024
              </div>
              <div className="text-muted-foreground">
                Auxiliaires en pharmacie - Gestion de commande
              </div>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-sm">
              <div className="text-lg font-semibold text-foreground mb-2">
                Formation du 28 mai 2024
              </div>
              <div className="text-muted-foreground">
                Pharmaciens - Gestion de trésorerie
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}