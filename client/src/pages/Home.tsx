import Header from '@/components/Header';
import Hero from '@/components/Hero';
import WhyKemet from '@/components/WhyKemet';
import StatsSection from '@/components/StatsSection';
import { KemetCatalog } from '@/components/DownloadCatalog';
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
        
        {/* Catalogue Download Section */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
              <div className="lg:w-1/2">
                <h2 className="text-3xl md:text-4xl font-bold font-serif text-foreground mb-4">
                  Catalogue des Formations 2024
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Découvrez notre offre complète de 22 formations spécialisées pour les pharmaciens 
                  et auxiliaires. Développez les compétences de votre équipe avec nos programmes 
                  certifiés et adaptés aux réalités africaines.
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                    Qualité • Finance • Stock • RH
                  </span>
                  <span className="bg-chart-2/10 text-chart-2 px-3 py-1 rounded-full text-sm font-medium">
                    Formation sur site disponible
                  </span>
                </div>
              </div>
              <div className="lg:w-1/2 max-w-md">
                <KemetCatalog.Default />
              </div>
            </div>
          </div>
        </section>
        
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