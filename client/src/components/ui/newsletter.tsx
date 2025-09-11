import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Check, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface NewsletterProps {
  title?: string;
  description?: string;
  placeholder?: string;
  className?: string;
  variant?: 'default' | 'compact' | 'minimal';
  showBenefits?: boolean;
}

const benefits = [
  'Conseils exclusifs pour pharmaciens',
  'Études de cas détaillées',
  'Alertes réglementaires',
  'Tendances du secteur pharmaceutique'
];

export function Newsletter({ 
  title = "Restez informé avec notre newsletter",
  description = "Recevez nos derniers conseils et actualités pharmaceutiques directement dans votre boîte mail",
  placeholder = "Votre adresse email professionnelle",
  className,
  variant = 'default',
  showBenefits = true
}: NewsletterProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const { toast } = useToast();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setErrorMessage('Veuillez saisir votre adresse email');
      setStatus('error');
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage('Veuillez saisir une adresse email valide');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      // Simulate API call - in real app, this would call your newsletter API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setStatus('success');
      setEmail('');
      
      toast({
        title: "Inscription réussie !",
        description: "Merci de vous être inscrit à notre newsletter. Vous recevrez bientôt nos dernières actualités.",
      });

      // Reset after success display
      setTimeout(() => {
        setStatus('idle');
      }, 3000);
      
    } catch (error) {
      setStatus('error');
      setErrorMessage('Une erreur est survenue. Veuillez réessayer.');
      
      toast({
        title: "Erreur d'inscription",
        description: "Impossible de vous inscrire pour le moment. Veuillez réessayer plus tard.",
        variant: "destructive",
      });
    }
  };

  const renderVariant = () => {
    switch (variant) {
      case 'compact':
        return (
          <div className={cn('max-w-md', className)}>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="text"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    // Clear error when user starts typing
                    if (status === 'error') {
                      setStatus('idle');
                      setErrorMessage('');
                    }
                  }}
                  placeholder={placeholder}
                  disabled={status === 'loading' || status === 'success'}
                  className={cn(
                    status === 'error' && 'border-destructive',
                    status === 'success' && 'border-green-500'
                  )}
                  data-testid="input-newsletter-email"
                />
                {errorMessage && (
                  <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errorMessage}
                  </p>
                )}
              </div>
              
              <Button 
                type="submit" 
                disabled={status === 'loading' || status === 'success'}
                className="px-6"
                data-testid="button-newsletter-submit"
              >
                {status === 'loading' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : status === 'success' ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Mail className="w-4 h-4" />
                )}
              </Button>
            </form>
          </div>
        );

      case 'minimal':
        return (
          <div className={cn('text-center max-w-sm mx-auto', className)}>
            <h4 className="font-semibold text-foreground mb-2">{title}</h4>
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={placeholder}
                disabled={status === 'loading' || status === 'success'}
                className={cn(
                  status === 'error' && 'border-destructive',
                  status === 'success' && 'border-green-500'
                )}
                data-testid="input-newsletter-email"
              />
              
              {errorMessage && (
                <p className="text-xs text-destructive flex items-center justify-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errorMessage}
                </p>
              )}
              
              <Button 
                type="submit" 
                size="sm"
                disabled={status === 'loading' || status === 'success'}
                className="w-full"
                data-testid="button-newsletter-submit"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Inscription...
                  </>
                ) : status === 'success' ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Inscrit !
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    S'inscrire
                  </>
                )}
              </Button>
            </form>
          </div>
        );

      default:
        return (
          <Card className={cn('overflow-hidden', className)} data-testid="newsletter-card">
            <CardHeader className="bg-primary/5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">{title}</CardTitle>
                  <CardDescription className="mt-1">
                    {description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              {showBenefits && (
                <div className="mb-6">
                  <h4 className="font-semibold text-foreground mb-3">Ce que vous recevrez :</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        {benefit}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={placeholder}
                    disabled={status === 'loading' || status === 'success'}
                    className={cn(
                      'text-base',
                      status === 'error' && 'border-destructive',
                      status === 'success' && 'border-green-500'
                    )}
                    data-testid="input-newsletter-email"
                  />
                  
                  {errorMessage && (
                    <p className="text-sm text-destructive mt-2 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errorMessage}
                    </p>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  size="lg"
                  disabled={status === 'loading' || status === 'success'}
                  className="w-full"
                  data-testid="button-newsletter-submit"
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Inscription en cours...
                    </>
                  ) : status === 'success' ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Inscription réussie !
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      S'inscrire à la newsletter
                    </>
                  )}
                </Button>
              </form>
              
              <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <Badge variant="outline" className="text-xs">
                  Gratuit
                </Badge>
                <span>•</span>
                <span>Pas de spam</span>
                <span>•</span>
                <span>Désabonnement facile</span>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return renderVariant();
}

// Preset configurations pour Kemet Services
export const KemetNewsletter = {
  // Newsletter complète pour la page ressources
  Default: (props?: Partial<NewsletterProps>) => (
    <Newsletter
      title="Newsletter Kemet Services"
      description="Restez à la pointe des bonnes pratiques pharmaceutiques avec nos conseils d'experts"
      placeholder="pharmacien@exemple.com"
      showBenefits={true}
      {...props}
    />
  ),

  // Version compacte pour footer ou sidebar
  Compact: (props?: Partial<NewsletterProps>) => (
    <Newsletter
      variant="compact"
      placeholder="Votre email"
      showBenefits={false}
      {...props}
    />
  ),

  // Version minimale pour popups ou modales
  Minimal: (props?: Partial<NewsletterProps>) => (
    <Newsletter
      variant="minimal"
      title="Restez informé"
      placeholder="email@exemple.com"
      showBenefits={false}
      {...props}
    />
  )
};