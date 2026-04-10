import SEO from '@/components/SEO';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Helmet } from 'react-helmet-async';
import {
  Award,
  FileText,
  CheckCircle,
  ArrowRight,
  MessageCircle,
  ClipboardList,
  Send,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';
import { trackWhatsAppClick } from '@/components/GoogleAnalytics';

const steps = [
  { icon: GraduationCap, title: 'Choisissez votre formation', description: 'Parcourez notre catalogue de 22 formations et sélectionnez celle qui correspond à vos besoins.' },
  { icon: ClipboardList, title: 'Kemet monte le dossier FDFP', description: 'Nous préparons l\'intégralité du dossier administratif : programme, devis, convention de formation.' },
  { icon: Send, title: 'Soumission au FDFP', description: 'Le dossier complet est soumis au Fonds de Développement de la Formation Professionnelle.' },
  { icon: ShieldCheck, title: 'Validation et prise en charge', description: 'Le FDFP valide la prise en charge. Vous ne payez que le reste à charge éventuel.' },
  { icon: Award, title: 'Formation réalisée', description: 'Vous suivez la formation. Kemet fournit l\'attestation de présence et le rapport au FDFP.' },
];

const documents = [
  'Programme détaillé de la formation',
  'Convention de formation',
  'Facture pro forma',
  'Attestation de présence',
  'Rapport de formation post-session',
  'Certificat de réalisation',
];

const faqItems = [
  {
    question: 'Qu\'est-ce que le FDFP ?',
    answer: 'Le Fonds de Développement de la Formation Professionnelle (FDFP) est l\'organisme ivoirien qui finance la formation continue des salariés via la Taxe d\'Apprentissage (0,4%) et la Taxe Additionnelle à la Formation Professionnelle Continue (1,2% de la masse salariale).'
  },
  {
    question: 'Toutes les formations Kemet sont-elles éligibles ?',
    answer: 'Oui, nos 22 formations sont éligibles à la prise en charge FDFP. Kemet Services est un prestataire reconnu qui répond aux critères du FDFP.'
  },
  {
    question: 'Quel est le taux de prise en charge ?',
    answer: 'Le taux de prise en charge peut aller jusqu\'à 100% selon votre situation et le type de formation. Le FDFP évalue chaque dossier individuellement.'
  },
  {
    question: 'Combien de temps prend la validation du dossier ?',
    answer: 'Le traitement d\'un dossier FDFP prend généralement 2 à 4 semaines. Nous vous recommandons de soumettre votre demande au moins 1 mois avant la date souhaitée de formation.'
  },
  {
    question: 'Kemet s\'occupe-t-il de toute la procédure ?',
    answer: 'Oui, Kemet Services prend en charge le montage complet du dossier FDFP : préparation des documents, soumission et suivi jusqu\'à validation. Vous n\'avez rien à faire.'
  },
];

export default function FDFP() {
  const handleWhatsAppClick = () => {
    trackWhatsAppClick();
    window.open(
      'https://wa.me/2250759068744?text=Bonjour%20Kemet%20Services%2C%0AJe%20souhaite%20des%20informations%20sur%20la%20prise%20en%20charge%20FDFP%20pour%20une%20formation.',
      '_blank'
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Formations Pharmacie Eligibles FDFP - Prise en Charge"
        description="Toutes nos formations pharmacie sont eligibles a la prise en charge FDFP. Kemet Services monte votre dossier. Jusqu'a 100% finances. 22 formations disponibles."
        canonical="/fdfp"
        keywords="FDFP formation pharmacie, prise en charge FDFP, financement formation Cote d'Ivoire, FDFP pharmacie, taxe apprentissage formation"
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
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6" style={{ backgroundColor: '#03341C', color: '#C4A41E' }}>
            <Award className="w-4 h-4" />
            Eligible FDFP
          </span>
          <h1 className="text-4xl md:text-5xl font-bold font-serif text-foreground mb-6">
            Formations Pharmacie Eligibles FDFP — Prise en Charge Jusqu'a 100%
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Toutes nos 22 formations sont eligibles a la prise en charge par le FDFP.
            Kemet Services vous accompagne dans le montage du dossier de A a Z.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={handleWhatsAppClick}>
              <MessageCircle className="w-5 h-5 mr-2" />
              Demander un accompagnement FDFP
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/formations">
                Voir les formations <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Qu'est-ce que le FDFP */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold font-serif text-foreground mb-6">
            Qu'est-ce que le FDFP ?
          </h2>
          <div className="prose prose-lg max-w-none text-muted-foreground">
            <p>
              Le <strong className="text-foreground">Fonds de Developpement de la Formation Professionnelle (FDFP)</strong> est
              l'organisme ivoirien charge de financer la formation continue des salaries du secteur prive.
              Il est alimente par deux contributions obligatoires des entreprises :
            </p>
            <ul className="space-y-2 mt-4">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span><strong className="text-foreground">Taxe d'Apprentissage (TA)</strong> : 0,4% de la masse salariale</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span><strong className="text-foreground">Taxe Additionnelle (FPC)</strong> : 1,2% de la masse salariale</span>
              </li>
            </ul>
            <p className="mt-4">
              En tant que pharmacien employeur, vous cotisez deja au FDFP. Profitez de ce droit pour former votre equipe
              sans impact sur votre tresorerie.
            </p>
          </div>
        </div>
      </section>

      {/* Comment ca marche */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold font-serif text-foreground mb-10 text-center">
            Comment ca marche ?
          </h2>
          <div className="space-y-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
                      <Icon className="w-5 h-5 text-primary" />
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Documents fournis */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold font-serif text-foreground mb-8">
            Documents fournis par Kemet Services
          </h2>
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {documents.map((doc, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-foreground">{doc}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold font-serif text-foreground mb-10 text-center">
            Questions frequentes sur le FDFP
          </h2>
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-2">{item.question}</h3>
                  <p className="text-muted-foreground">{item.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-16 bg-primary/5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold font-serif text-foreground mb-4">
            Faites financer votre formation
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Contactez-nous pour demarrer le montage de votre dossier FDFP. Notre equipe s'occupe de tout.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={handleWhatsAppClick}>
              <MessageCircle className="w-5 h-5 mr-2" />
              Accompagnement FDFP
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
