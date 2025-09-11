import { Card, CardContent } from '@/components/ui/card';

const galleryImages = [
  {
    src: '@assets/_D6A2149_1757585998503.jpg',
    alt: 'Équipement de formation - Projecteur et ordinateur',
    caption: 'Équipement professionnel pour des formations de qualité'
  },
  {
    src: '@assets/_D6A2216_1757585998505.jpg',
    alt: 'Salle de formation avec participants',
    caption: 'Formation "Gérer Efficacement la Commande" - 16 mars 2024'
  },
  {
    src: '@assets/_D6A2227_1757585998506.jpg',
    alt: 'Formateur présentant aux participants',
    caption: 'Approche pédagogique interactive et participative'
  },
  {
    src: '@assets/_D6A2267_1757585998508.jpg',
    alt: 'Travail de groupe entre participants',
    caption: 'Exercices pratiques et mises en situation'
  },
  {
    src: '@assets/_D6A2289_1757585998509.jpg',
    alt: 'Formateur expert en action',
    caption: 'Expertise de terrain et accompagnement personnalisé'
  },
  {
    src: '@assets/_D6A2300_1757585998510.jpg',
    alt: 'Photo de groupe des participants',
    caption: 'Participants satisfaits de la formation'
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
                  src={image.src.replace('@assets/', '../attached_assets/')}
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
          <div className="inline-flex items-center space-x-4 bg-card p-6 rounded-lg shadow-sm">
            <div className="text-lg font-semibold text-foreground">
              Formation du 16 mars 2024
            </div>
            <div className="w-px h-6 bg-border"></div>
            <div className="text-muted-foreground">
              Auxiliaires en pharmacie - Gestion de commande
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}