import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon, TrendingDown, Clock, TrendingUp, Users, Package, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: {
    card: 'p-4',
    icon: 'w-8 h-8',
    iconContainer: 'w-10 h-10',
    value: 'text-lg',
    title: 'text-sm'
  },
  md: {
    card: 'p-6',
    icon: 'w-10 h-10',
    iconContainer: 'w-12 h-12',
    value: 'text-2xl',
    title: 'text-base'
  },
  lg: {
    card: 'p-8',
    icon: 'w-12 h-12',
    iconContainer: 'w-14 h-14',
    value: 'text-3xl',
    title: 'text-lg'
  }
};

const trendColors = {
  up: {
    value: 'text-green-600 dark:text-green-400',
    icon: 'bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400'
  },
  down: {
    value: 'text-red-600 dark:text-red-400',
    icon: 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400'
  },
  neutral: {
    value: 'text-blue-600 dark:text-blue-400',
    icon: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
  }
};

export function KpiCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend = 'neutral',
  size = 'md',
  className 
}: KpiCardProps) {
  const sizeConfig = sizeClasses[size];
  const trendConfig = trendColors[trend];

  return (
    <Card className={cn('text-center hover-elevate', className)} data-testid={`kpi-card-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardHeader className={cn('pb-3', sizeConfig.card)}>
        <div className={cn(
          'rounded-lg flex items-center justify-center mx-auto mb-3',
          sizeConfig.iconContainer,
          trendConfig.icon
        )}>
          <Icon className={sizeConfig.icon} />
        </div>
        <CardTitle className={cn('font-bold', sizeConfig.value, trendConfig.value)}>
          {value}
        </CardTitle>
        <CardDescription className={sizeConfig.title}>
          {subtitle}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground">{title}</p>
      </CardContent>
    </Card>
  );
}

// Preset KPI Cards pour Kemet Services
export const KemetKpiCards = {
  RupturesReduction: (props?: Partial<KpiCardProps>) => (
    <KpiCard
      title="Ruptures de stock"
      value="-35%"
      subtitle="en 60 jours"
      icon={TrendingDown}
      trend="up"
      {...props}
    />
  ),
  
  DelaiReclamations: (props?: Partial<KpiCardProps>) => (
    <KpiCard
      title="Délai réclamations"
      value="<24h"
      subtitle="temps de traitement"
      icon={Clock}
      trend="neutral"
      {...props}
    />
  ),
  
  MargeAmelioration: (props?: Partial<KpiCardProps>) => (
    <KpiCard
      title="Marge brute"
      value="+1,8 pts"
      subtitle="amélioration"
      icon={TrendingUp}
      trend="up"
      {...props}
    />
  ),
  
  SatisfactionEquipe: (props?: Partial<KpiCardProps>) => (
    <KpiCard
      title="Satisfaction équipe"
      value="94%"
      subtitle="taux de satisfaction"
      icon={Users}
      trend="up"
      {...props}
    />
  ),

  EcartsStock: (props?: Partial<KpiCardProps>) => (
    <KpiCard
      title="Écarts de stock"
      value="-80%"
      subtitle="réduction obtenue"
      icon={Package}
      trend="up"
      {...props}
    />
  ),

  RotationStock: (props?: Partial<KpiCardProps>) => (
    <KpiCard
      title="Rotation des stocks"
      value="x2,3"
      subtitle="amélioration"
      icon={RotateCcw}
      trend="up"
      {...props}
    />
  )
};