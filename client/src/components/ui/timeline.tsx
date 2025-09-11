import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon, CheckCircle, Circle, Search, Target, Users, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimelineStep {
  id: string;
  numero: string;
  titre: string;
  description: string;
  duree?: string;
  icon: LucideIcon;
  status?: 'completed' | 'current' | 'upcoming';
}

interface TimelineProps {
  steps: TimelineStep[];
  orientation?: 'horizontal' | 'vertical';
  showConnectors?: boolean;
  className?: string;
}

export function Timeline({ 
  steps, 
  orientation = 'horizontal', 
  showConnectors = true,
  className 
}: TimelineProps) {
  // Static grid classes for production builds
  const getHorizontalGridClasses = (stepCount: number) => {
    const cols = Math.min(stepCount, 4);
    switch (cols) {
      case 1: return 'grid-cols-1 md:grid-cols-1';
      case 2: return 'grid-cols-1 md:grid-cols-2';
      case 3: return 'grid-cols-1 md:grid-cols-3';
      case 4: return 'grid-cols-1 md:grid-cols-4';
      default: return 'grid-cols-1 md:grid-cols-4';
    }
  };

  return (
    <div className={cn(
      'w-full',
      orientation === 'horizontal' ? 'grid gap-6' : 'space-y-6',
      orientation === 'horizontal' && steps.length > 0 && getHorizontalGridClasses(steps.length),
      className
    )} data-testid="timeline-container">
      {steps.map((step, index) => {
        const IconComponent = step.icon;
        const isLast = index === steps.length - 1;
        
        return (
          <div 
            key={step.id} 
            className={cn(
              'relative',
              orientation === 'vertical' && 'flex gap-4'
            )}
            data-testid={`timeline-step-${step.id}`}
          >
            {/* Connector Line - only for horizontal orientation */}
            {showConnectors && !isLast && orientation === 'horizontal' && (
              <div className="hidden md:block absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-0.5 bg-primary z-10" />
            )}
            
            {/* Step Content */}
            <Card className={cn(
              'overflow-hidden hover-elevate transition-all duration-200',
              step.status === 'current' && 'ring-2 ring-primary ring-offset-2',
              step.status === 'completed' && 'bg-primary/5',
              orientation === 'vertical' && 'flex-1'
            )}>
              <CardHeader>
                <div className={cn(
                  'flex gap-3 mb-3',
                  orientation === 'vertical' ? 'items-start' : 'items-center'
                )}>
                  {/* Step Number */}
                  <div className="relative">
                    <div className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm',
                      step.status === 'completed' 
                        ? 'bg-primary text-primary-foreground' 
                        : step.status === 'current'
                        ? 'bg-primary/20 text-primary border-2 border-primary'
                        : 'bg-muted text-muted-foreground'
                    )}>
                      {step.status === 'completed' ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        step.numero
                      )}
                    </div>
                    
                    {/* Vertical connector */}
                    {showConnectors && !isLast && orientation === 'vertical' && (
                      <div className="absolute left-1/2 transform -translate-x-1/2 top-12 w-0.5 h-6 bg-border" />
                    )}
                  </div>
                  
                  {/* Icon & Status */}
                  <div className="flex items-center gap-2">
                    <IconComponent className={cn(
                      'w-6 h-6',
                      step.status === 'completed' ? 'text-primary' : 'text-muted-foreground'
                    )} />
                    
                    {step.status && (
                      <Badge 
                        variant={step.status === 'completed' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {step.status === 'completed' ? 'Terminé' : 
                         step.status === 'current' ? 'En cours' : 'À venir'}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <CardTitle className="text-lg">{step.titre}</CardTitle>
                
                {step.duree && (
                  <Badge variant="outline" className="w-fit text-xs">
                    <Circle className="w-3 h-3 mr-1" />
                    {step.duree}
                  </Badge>
                )}
              </CardHeader>
              
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}

// Timeline preset pour le parcours client Kemet Services
export function KemetClientTimeline({ className }: { className?: string }) {
  const steps: TimelineStep[] = [
    {
      id: 'audit',
      numero: '01',
      titre: 'Audit Initial',
      description: 'Diagnostic complet de votre pharmacie avec analyse des processus et identification des axes d\'amélioration.',
      duree: '1-2 semaines',
      icon: Search,
      status: 'current'
    },
    {
      id: 'plan',
      numero: '02',
      titre: 'Plan 90 jours',
      description: 'Élaboration d\'un plan d\'action détaillé avec objectifs mesurables et étapes claires.',
      duree: '1 semaine',
      icon: Target,
      status: 'upcoming'
    },
    {
      id: 'formation',
      numero: '03',
      titre: 'Formation',
      description: 'Formation personnalisée de vos équipes sur les nouveaux processus et outils.',
      duree: '2-4 semaines',
      icon: Users,
      status: 'upcoming'
    },
    {
      id: 'suivi',
      numero: '04',
      titre: 'Suivi',
      description: 'Accompagnement continu avec mesure des résultats et ajustements si nécessaire.',
      duree: 'En continu',
      icon: TrendingUp,
      status: 'upcoming'
    }
  ];

  return (
    <Timeline 
      steps={steps} 
      orientation="horizontal"
      showConnectors={true}
      className={className}
    />
  );
}