import Header from '@/components/Header';
import Hero from '@/components/Hero';
import WhyKemet from '@/components/WhyKemet';
import ServiceCards from '@/components/ServiceCards';
import FocusFormations from '@/components/FocusFormations';
import ConsultingSection from '@/components/ConsultingSection';
import ResultsSection from '@/components/ResultsSection';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Formation et Consultance Pharmacie Côte d'Ivoire - Expert ISO 9001"
        description="Formations spécialisées et consultance opérationnelle pour pharmacies d'officine en Côte d'Ivoire et Afrique de l'Ouest. Expertise ISO 9001, gestion des stocks, optimisation de la trésorerie, diagnostic gratuit. Services pour pharmaciens titulaires et auxiliaires."
        canonical="/"
        keywords="formation pharmacie Côte d'Ivoire, consultance pharmacie Afrique de l'Ouest, ISO 9001 pharmacie, gestion stocks officine Abidjan, trésorerie pharmacie, diagnostic gratuit pharmacie, formation pharmacien titulaire, formation auxiliaire pharmacie, consultant pharmaceutique Abidjan, optimisation performance pharmacie, réduction discordances stocks, certification ISO pharmacie Côte d'Ivoire"
      />
      <Header />
      <main>
        <Hero />
        <WhyKemet />
        <ServiceCards />
        <FocusFormations />
        <ConsultingSection />
        <ResultsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}