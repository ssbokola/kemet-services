import SEO from '@/components/SEO';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, MessageCircle, HelpCircle } from 'lucide-react';
import { trackWhatsAppClick } from '@/components/GoogleAnalytics';

const faqItems = [
  {
    question: 'Combien coute une formation Kemet Services ?',
    answer: 'Nos formations courtes vont de 50 000 a 75 000 FCFA pour des sessions de 4 a 8 heures. Les packs consulting sont sur devis selon la complexite et la duree de l\'accompagnement. Toutes nos formations sont eligibles a la prise en charge FDFP.',
    link: { text: 'Voir les tarifs des formations', href: '/formations' }
  },
  {
    question: 'Les formations sont-elles eligibles au FDFP ?',
    answer: 'Oui, toutes nos 22 formations sont eligibles a la prise en charge par le FDFP (Fonds de Developpement de la Formation Professionnelle). Kemet Services s\'occupe du montage complet du dossier administratif.',
    link: { text: 'En savoir plus sur le FDFP', href: '/fdfp' }
  },
  {
    question: 'Combien de temps dure un accompagnement consulting ?',
    answer: 'La duree varie selon le pack choisi : de 2-3 mois pour le pack WAYO (gestion des stocks) a 6-12 mois pour l\'accompagnement ISO 9001:2015. Chaque accompagnement commence par un diagnostic gratuit pour definir le perimetre exact.',
    link: { text: 'Decouvrir nos packs consulting', href: '/consulting' }
  },
  {
    question: 'Qu\'est-ce que le diagnostic gratuit ?',
    answer: 'Le diagnostic gratuit est une evaluation complete de votre officine sur 4 axes : finances, stocks, qualite et ressources humaines. Il comprend 72 questions et permet d\'identifier vos axes d\'amelioration prioritaires. Le resultat est confidentiel et sans engagement.',
    link: { text: 'Faire mon diagnostic gratuit', href: '/grille-prediagnostic.html' }
  },
  {
    question: 'Kemet Services intervient-il en dehors d\'Abidjan ?',
    answer: 'Oui, nous intervenons dans toute la Cote d\'Ivoire et en Afrique de l\'Ouest. Nos formations en presentiel se tiennent principalement a Abidjan, mais nous proposons aussi des formations en ligne et des missions de consulting sur site dans toute la region.',
  },
  {
    question: 'Quelle est la difference entre une formation et un pack consulting ?',
    answer: 'Une formation est une session de 4 a 8 heures sur une thematique precise (gestion des stocks, tresorerie, etc.). Un pack consulting est un accompagnement sur plusieurs mois qui inclut un diagnostic, un plan d\'action, la mise en oeuvre et le suivi des resultats. Le consulting est personnalise a votre officine.',
  },
  {
    question: 'Comment fonctionne Kemet Echo ?',
    answer: 'Kemet Echo est notre solution de mesure de la satisfaction client. Il permet de recueillir les avis de vos clients via des enquetes anonymes, de calculer votre score CSAT et NPS, et de recevoir des alertes en temps reel. Disponible en version gratuite (Freemium), Premium et Cle en main.',
    link: { text: 'Decouvrir Kemet Echo', href: '/kemet-echo' }
  },
  {
    question: 'Quels resultats concrets peut-on attendre ?',
    answer: 'Nos clients constatent en moyenne : -30% d\'ecarts de stock en 3 mois, +20% de tresorerie optimisee, -50% de produits perimes, et une amelioration significative de la satisfaction client. Chaque accompagnement inclut des indicateurs de performance mesurables.',
  },
  {
    question: 'Qui est le formateur / consultant ?',
    answer: 'Dr Bokola Tinni Sonhon est pharmacien, titulaire d\'un MBA et d\'un Master en Management de la Qualite. Avec plus de 10 ans d\'experience terrain dans l\'optimisation des pharmacies d\'officine en Cote d\'Ivoire, il dirige personnellement les formations et les missions de consulting.',
    link: { text: 'En savoir plus sur Dr Bokola', href: '/a-propos' }
  },
  {
    question: 'Comment s\'inscrire a une formation ?',
    answer: 'Vous pouvez vous inscrire directement en ligne via notre catalogue de formations, nous contacter par WhatsApp au 0759 068 744, ou remplir notre formulaire de contact. Nous vous repondons sous 24 heures avec toutes les informations pratiques.',
    link: { text: 'Voir le catalogue', href: '/formations' }
  },
];

export default function FAQ() {
  const handleWhatsAppClick = () => {
    trackWhatsAppClick();
    window.open(
      'https://wa.me/2250759068744?text=Bonjour%20Kemet%20Services%2C%0AJ\'ai%20une%20question.',
      '_blank'
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="FAQ - Questions Frequentes"
        description="Reponses a vos questions sur les formations, le consulting, le FDFP, Kemet Echo et nos services pour pharmacies en Cote d'Ivoire. Tarifs, duree, resultats."
        canonical="/faq"
        keywords="FAQ formation pharmacie, questions frequentes kemet services, FDFP questions, consulting pharmacie questions"
      />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqItems.map(item => ({
              "@type": "Question",
              "name": item.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": item.answer
              }
            }))
          })}
        </script>
      </Helmet>

      <Header />

      {/* Hero */}
      <section className="py-16 bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <HelpCircle className="w-12 h-12 text-primary mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold font-serif text-foreground mb-4">
            Questions Frequentes
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Tout ce que vous devez savoir sur nos formations, le consulting et la prise en charge FDFP.
          </p>
        </div>
      </section>

      {/* FAQ Items */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <h2 className="text-lg font-semibold text-foreground mb-3">
                    {item.question}
                  </h2>
                  <p className="text-muted-foreground mb-3">{item.answer}</p>
                  {'link' in item && item.link && (
                    <Link href={item.link.href} className="text-sm text-primary font-medium hover:underline">
                      {item.link.text} →
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold font-serif text-foreground mb-4">
            Vous avez d'autres questions ?
          </h2>
          <p className="text-muted-foreground mb-8">
            Notre equipe vous repond sous 24 heures.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={handleWhatsAppClick}>
              <MessageCircle className="w-5 h-5 mr-2" />
              Poser ma question sur WhatsApp
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/contact">
                Formulaire de contact <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
