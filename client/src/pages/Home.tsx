import Header from '@/components/Header';
import Hero from '@/components/Hero';
import WhyKemet from '@/components/WhyKemet';
import ServiceCards from '@/components/ServiceCards';
import FormationDetails from '@/components/FormationDetails';
import FocusFormations from '@/components/FocusFormations';
import ConsultingSection from '@/components/ConsultingSection';
import ResultsSection from '@/components/ResultsSection';
import CTASection from '@/components/CTASection';
import LeadCaptureForm from '@/components/LeadCaptureForm';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Formation Gestion Officine Côte d'Ivoire | Réduire Écarts Stock & Améliorer Trésorerie"
        description="Formations pratiques et consultance pour pharmacies en Côte d'Ivoire : réduction écarts de stock, optimisation trésorerie, certification ISO 9001. Résultats mesurables pour pharmaciens titulaires et auxiliaires. Audit stock pharmacie, formation qualité officine, consultant pharmaceutique Abidjan."
        canonical="/"
        ogType="website"
        ogImage="https://kemetservices.com/og-image-home.jpg"
        keywords="formation gestion officine Côte d'Ivoire, audit stock pharmacie Abidjan, formation qualité officine, consultance pharmaceutique Afrique Ouest, réduction écarts stock pharmacie, optimisation trésorerie officine, certification ISO 9001 pharmacie CI, formation pharmacien titulaire Abidjan, formation auxiliaire pharmacie, consultant officine Côte d'Ivoire, gestion périmés pharmacie, amélioration performance pharmacie, formation gestion stock pharmaceutique"
      />
      <Header />
      <main>
        {/* Hero avec accroche forte */}
        <Hero />
        
        {/* Section pourquoi Kemet */}
        <WhyKemet />
        
        {/* Cartes de services */}
        <ServiceCards />
        
        {/* Section descriptive détaillée - NOUVEAU */}
        <section className="relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Contenu principal */}
              <div className="lg:col-span-2">
                <FormationDetails />
              </div>
              
              {/* Formulaire sidebar - NOUVEAU */}
              <div className="lg:col-span-1">
                <LeadCaptureForm />
              </div>
            </div>
          </div>
        </section>
        
        {/* Formations phares */}
        <FocusFormations />
        
        {/* Consulting */}
        <ConsultingSection />
        
        {/* Résultats et témoignages - Preuves sociales */}
        <ResultsSection />
        
        {/* CTA final */}
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}