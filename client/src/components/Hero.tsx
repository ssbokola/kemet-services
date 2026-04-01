import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Package, TrendingUp, Shield, BarChart3 } from 'lucide-react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import heroImage from '@assets/_D6A2216_1757585998505.jpg';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] },
  }),
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, delay: 0.4 + i * 0.12, ease: [0.25, 0.1, 0.25, 1] },
  }),
};

export default function Hero() {
  const [, setLocation] = useLocation();

  const handleDiagnosticClick = () => {
    window.location.href = '/grille-prediagnostic.html';
  };

  const handleFormationsClick = () => {
    setLocation('/formations');
  };

  const handleKemetEchoClick = () => {
    setLocation('/kemet-echo');
  };

  const services = [
    {
      icon: Package,
      title: 'Gestion des stocks',
      description: 'Réduisez les ruptures et optimisez votre inventaire'
    },
    {
      icon: TrendingUp,
      title: 'Performance financière',
      description: 'Améliorez votre trésorerie et votre rentabilité'
    },
    {
      icon: Shield,
      title: 'Qualité & conformité',
      description: 'Assurez la conformité et la qualité opérationnelle'
    }
  ];

  return (
    <section className="relative min-h-[90vh] flex items-center bg-background overflow-hidden">
      {/* Background Image with Overlay */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.4, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <img
          src={heroImage}
          alt="Formation pharmacie en Côte d'Ivoire - Atelier pratique gestion stocks et trésorerie"
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/85 to-background/50"></div>
      </motion.div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl">
          {/* Surtitre */}
          <motion.p
            className="text-primary font-semibold mb-4 text-lg"
            data-testid="text-hero-subtitle"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.1}
          >
            Cabinet de formation et consulting en qualité pharmaceutique
          </motion.p>

          {/* Title - Accroche orientée bénéfices */}
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif text-foreground leading-tight mb-6"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.2}
          >
            Formations pratiques pour pharmacies : réduire les écarts de stock, améliorer la trésorerie
          </motion.h1>

          {/* Subtitle avec valeur ajoutée */}
          <motion.p
            className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.3}
          >
            Formations métier pour officines ivoiriennes avec résultats mesurables. Expertise ISO 9001, gestion optimisée des stocks et de la trésorerie, développement du potentiel humain.
          </motion.p>

          {/* 3 Services phares avec icônes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {services.map((service, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                custom={index}
              >
                <Card className="bg-background/80 backdrop-blur-sm border-primary/20 h-full" data-testid={`card-service-${index}`}>
                  <CardContent className="p-4">
                    <service.icon className="w-8 h-8 text-primary mb-3" />
                    <h3 className="font-semibold text-foreground mb-2 text-base">
                      {service.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-snug">
                      {service.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* CTAs */}
          <motion.div
            className="flex flex-col sm:flex-row flex-wrap gap-4 mb-8"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.7}
          >
            <Button
              size="lg"
              onClick={handleDiagnosticClick}
              className="text-lg px-8 py-6"
              data-testid="button-hero-diagnostic"
            >
              Demandez un diagnostic gratuit
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleFormationsClick}
              className="text-lg px-8 py-6 bg-background/80 backdrop-blur-sm border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              data-testid="button-hero-formations"
            >
              Voir nos formations
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleKemetEchoClick}
              className="text-lg px-8 py-6 bg-primary/10 backdrop-blur-sm border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              data-testid="button-hero-kemet-echo"
            >
              <BarChart3 className="mr-2 h-5 w-5" />
              Kemet Echo - Satisfaction Client
            </Button>
          </motion.div>

          {/* Trust Badge */}
          <motion.div
            className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.85}
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>ISO 9001:2015</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Bonnes Pratiques de fabrication</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Ancrage terrain Côte d'Ivoire</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
