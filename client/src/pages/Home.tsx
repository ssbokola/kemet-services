import Header from '@/components/Header';
import Hero from '@/components/Hero';
import WhyKemet from '@/components/WhyKemet';
import StatsSection from '@/components/StatsSection';
import ServiceCards from '@/components/ServiceCards';
import FocusFormations from '@/components/FocusFormations';
import ConsultingSection from '@/components/ConsultingSection';
import ResultsSection from '@/components/ResultsSection';
import FormationGallery from '@/components/FormationGallery';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <WhyKemet />
        <StatsSection />
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