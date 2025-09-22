import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Key, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  ArrowRight,
  Mail,
  Settings,
  FileText
} from 'lucide-react';

export default function EmailAuthOverview() {
  const [, setLocation] = useLocation();

  // Auth guard - redirection si pas de token
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      setLocation('/admin/login');
      return;
    }
  }, [setLocation]);

  // Récupérer les configurations SPF et DKIM
  const { data: spfConfig, isLoading: spfLoading } = useQuery({
    queryKey: ['spf-config'],
    queryFn: async () => {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/spf/config', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Erreur SPF');
      return response.json();
    }
  });

  const { data: dkimConfig, isLoading: dkimLoading } = useQuery({
    queryKey: ['dkim-config'],
    queryFn: async () => {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/dkim/config', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Erreur DKIM');
      return response.json();
    }
  });

  const { data: spfRecommendations } = useQuery({
    queryKey: ['spf-recommendations'],
    queryFn: async () => {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/spf/recommendations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Erreur recommandations SPF');
      return response.json();
    }
  });

  const { data: dkimRecommendations } = useQuery({
    queryKey: ['dkim-recommendations'],
    queryFn: async () => {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/dkim/recommendations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Erreur recommandations DKIM');
      return response.json();
    }
  });

  if (spfLoading || dkimLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin" />
        <span className="ml-2">Chargement de la configuration d'authentification email...</span>
      </div>
    );
  }

  const spfEmailProviders = spfConfig?.data?.emailProviders || [];
  const dkimEmailServices = dkimConfig?.data?.emailServices || [];
  const currentSPF = spfConfig?.data?.currentSPF || '';

  // Analyser l'état global de l'authentification
  const activeEmailProviders = spfEmailProviders.filter((p: any) => p.isActive);
  const activeDKIMServices = dkimEmailServices.filter((s: any) => s.isActive);
  
  const authenticationScore = () => {
    let score = 0;
    let maxScore = 100;
    
    // SPF configuré (40 points)
    if (currentSPF && currentSPF.includes('v=spf1')) score += 40;
    
    // Services email actifs avec DKIM (30 points)
    if (activeDKIMServices.length > 0) score += 30;
    
    // Configuration cohérente entre SPF et DKIM (20 points)
    const spfHasGoogle = currentSPF.includes('_spf.google.com');
    const dkimHasGoogle = activeDKIMServices.some((s: any) => s.name.includes('Google'));
    if (spfHasGoogle && dkimHasGoogle) score += 20;
    
    // Bonnes pratiques (10 points)
    if (currentSPF.includes('~all') || currentSPF.includes('-all')) score += 10;
    
    return Math.round((score / maxScore) * 100);
  };

  const score = authenticationScore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Authentification Email</h1>
          <p className="text-muted-foreground">
            Vue d'ensemble de la sécurité et authentification de vos emails
          </p>
        </div>
        <Badge variant={score >= 80 ? "default" : score >= 60 ? "secondary" : "destructive"} className="flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Score: {score}%
        </Badge>
      </div>

      {/* État général */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5" />
              SPF (Sender Policy Framework)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">État</span>
                {currentSPF ? (
                  <Badge variant="default" className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Configuré
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    Non configuré
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Fournisseurs actifs</span>
                <span className="font-medium">{activeEmailProviders.length}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => setLocation('/admin/spf')}
                data-testid="button-configure-spf"
              >
                <Settings className="w-4 h-4 mr-2" />
                Configurer SPF
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Key className="w-5 h-5" />
              DKIM (DomainKeys Identified Mail)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">État</span>
                {activeDKIMServices.length > 0 ? (
                  <Badge variant="default" className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Actif
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    À configurer
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Services actifs</span>
                <span className="font-medium">{activeDKIMServices.length}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => setLocation('/admin/dkim')}
                data-testid="button-configure-dkim"
              >
                <Key className="w-4 h-4 mr-2" />
                Configurer DKIM
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Mail className="w-5 h-5" />
              DMARC (recommandé)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">État</span>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Non configuré
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                DMARC complète la protection offerte par SPF et DKIM
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                disabled
                data-testid="button-configure-dmarc"
              >
                <FileText className="w-4 h-4 mr-2" />
                Bientôt disponible
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Services email configurés */}
      <Card>
        <CardHeader>
          <CardTitle>Services Email et Authentification</CardTitle>
          <CardDescription>
            État de la configuration SPF et DKIM pour chaque service email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {spfEmailProviders.map((provider: any, index: number) => {
              const matchingDKIM = dkimEmailServices.find((d: any) => 
                d.name.toLowerCase().includes(provider.name.toLowerCase().split('/')[0])
              );
              
              return (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium">{provider.name}</h4>
                      <Badge variant={provider.isActive ? "default" : "secondary"}>
                        {provider.isActive ? "Actif" : "Inactif"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{provider.description}</p>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        <span>SPF: {provider.isActive ? 'Configuré' : 'Non configuré'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Key className="w-3 h-3" />
                        <span>DKIM: {matchingDKIM?.isActive ? 'Configuré' : 'À configurer'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {provider.isActive && matchingDKIM?.isActive ? (
                      <Badge variant="default" className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Complet
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Partiel
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recommandations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Recommandations SPF
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {spfRecommendations?.data?.bestPractices?.slice(0, 3).map((rec: any, index: number) => (
                <div key={index} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    rec.priority === 'high' ? 'bg-red-500' : 
                    rec.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  <div>
                    <h4 className="font-medium text-sm">{rec.title}</h4>
                    <p className="text-xs text-muted-foreground">{rec.description}</p>
                  </div>
                </div>
              ))}
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-3"
                onClick={() => setLocation('/admin/spf')}
              >
                Voir toutes les recommandations SPF
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              Recommandations DKIM
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dkimRecommendations?.data?.bestPractices?.slice(0, 3).map((rec: any, index: number) => (
                <div key={index} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    rec.priority === 'high' ? 'bg-red-500' : 
                    rec.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  <div>
                    <h4 className="font-medium text-sm">{rec.title}</h4>
                    <p className="text-xs text-muted-foreground">{rec.description}</p>
                  </div>
                </div>
              ))}
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-3"
                onClick={() => setLocation('/admin/dkim')}
              >
                Voir toutes les recommandations DKIM
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Prochaines étapes */}
      <Card>
        <CardHeader>
          <CardTitle>Prochaines étapes recommandées</CardTitle>
          <CardDescription>
            Actions prioritaires pour améliorer votre authentification email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {score < 40 && (
              <div className="flex items-center gap-3 p-3 border border-red-200 rounded-lg bg-red-50">
                <XCircle className="w-5 h-5 text-red-500" />
                <div>
                  <h4 className="font-medium text-red-800">Configuration SPF manquante</h4>
                  <p className="text-sm text-red-600">Configurez SPF en premier pour protéger votre domaine contre l'usurpation.</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setLocation('/admin/spf')}
                  className="ml-auto"
                >
                  Configurer SPF
                </Button>
              </div>
            )}
            
            {score >= 40 && score < 70 && (
              <div className="flex items-center gap-3 p-3 border border-yellow-200 rounded-lg bg-yellow-50">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <div>
                  <h4 className="font-medium text-yellow-800">Ajouter DKIM</h4>
                  <p className="text-sm text-yellow-600">Complétez votre protection avec des signatures DKIM pour vos emails.</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setLocation('/admin/dkim')}
                  className="ml-auto"
                >
                  Configurer DKIM
                </Button>
              </div>
            )}
            
            {score >= 70 && score < 90 && (
              <div className="flex items-center gap-3 p-3 border border-blue-200 rounded-lg bg-blue-50">
                <Shield className="w-5 h-5 text-blue-500" />
                <div>
                  <h4 className="font-medium text-blue-800">Optimiser la configuration</h4>
                  <p className="text-sm text-blue-600">Votre configuration de base est bonne. Optimisez-la pour une sécurité maximale.</p>
                </div>
              </div>
            )}
            
            {score >= 90 && (
              <div className="flex items-center gap-3 p-3 border border-green-200 rounded-lg bg-green-50">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <h4 className="font-medium text-green-800">Configuration excellente !</h4>
                  <p className="text-sm text-green-600">Votre authentification email est optimalement configurée. Surveillez régulièrement.</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}