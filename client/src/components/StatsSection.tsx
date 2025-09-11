import { Award, Users, MapPin, BookOpen, TrendingUp } from 'lucide-react';

const stats = [
  {
    icon: Users,
    value: '5+',
    label: 'Pharmacies',
    sublabel: 'transformées',
    description: 'Accompagnements personnalisés',
    color: 'text-primary'
  },
  {
    icon: TrendingUp,
    value: '100%',
    label: 'Satisfaction',
    sublabel: 'client',
    description: 'Taux de satisfaction',
    color: 'text-chart-2'
  },
  {
    icon: Award,
    value: '10+',
    label: 'Années',
    sublabel: "d'expertise",
    description: 'Expérience pharmaceutique',
    color: 'text-chart-3'
  },
  {
    icon: BookOpen,
    value: '20+',
    label: 'Formations',
    sublabel: 'dispensées',
    description: 'Sessions de formation',
    color: 'text-chart-4'
  },
  {
    icon: MapPin,
    value: '3',
    label: 'Pays',
    sublabel: 'africains',
    description: "Zone d'intervention",
    color: 'text-chart-1'
  }
];

export default function StatsSection() {
  return (
    <section className="py-16 bg-primary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-serif text-foreground mb-4">
            Kemet Services en chiffres
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Des résultats qui témoignent de notre expertise et de notre engagement envers l'excellence pharmaceutique en Afrique
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div 
                key={index} 
                className="text-center group hover:scale-105 transition-all duration-300"
                data-testid={`stat-${stat.label.toLowerCase()}`}
              >
                <div className="mb-4 flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-background shadow-lg flex items-center justify-center group-hover:shadow-xl transition-shadow duration-300">
                    <IconComponent className={`w-8 h-8 ${stat.color}`} />
                  </div>
                </div>
                
                <div className="mb-2">
                  <div className={`text-3xl md:text-4xl font-bold ${stat.color} mb-1`}>
                    {stat.value}
                  </div>
                  <div className="text-lg font-semibold text-foreground">
                    {stat.label}
                  </div>
                  <div className="text-sm font-medium text-muted-foreground">
                    {stat.sublabel}
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {stat.description}
                </p>
              </div>
            );
          })}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-lg font-medium text-primary">
            Apporter aux Pharmaciens Africains des Solutions Opérationnelles et Innovantes
          </p>
        </div>
      </div>
    </section>
  );
}