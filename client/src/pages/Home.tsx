import Header from '@/components/Header';
import Hero from '@/components/Hero';
import WhyKemet from '@/components/WhyKemet';
import ServiceCards from '@/components/ServiceCards';
import FocusFormations from '@/components/FocusFormations';
import ConsultingSection from '@/components/ConsultingSection';
import ResultsSection from '@/components/ResultsSection';
import FormationGallery from '@/components/FormationGallery';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Formation et Consultance Pharmacie Côte d'Ivoire"
        description="Formations ciblées et consultance opérationnelle pour pharmacies d'officine en Côte d'Ivoire. Expertise ISO 9001, gestion des stocks, optimisation de la trésorerie et amélioration de la performance."
        canonical="/"
        keywords="formation pharmacie Côte d'Ivoire, consultance pharmacie, ISO 9001 pharmacie, gestion stocks officine, trésorerie pharmacie, diagnostic gratuit pharmacie, Abidjan"
      />
      <Header />
      <main>
        <Hero />
        <WhyKemet />
        <ServiceCards />
        <FocusFormations />
        <ConsultingSection />
        <ResultsSection />
        <FormationGallery />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}