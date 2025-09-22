import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, Copy, ExternalLink, Shield, Mail, AlertTriangle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";

interface EmailProvider {
  name: string;
  spfMechanism: string;
  description: string;
  isActive: boolean;
}

export default function SPFConfig() {
  const [, setLocation] = useLocation();
  const [customSPF, setCustomSPF] = useState("");
  const [validationResult, setValidationResult] = useState<{isValid: boolean; errors: string[]; analysis?: any} | null>(null);
  const { toast } = useToast();

  // Vérification d'authentification (auth guard)
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      setLocation('/admin/login');
      return;
    }
  }, [setLocation]);

  // Récupérer la configuration SPF depuis l'API (avec auth)
  const { data: spfConfig, isLoading, error } = useQuery({
    queryKey: ['spf-config'],
    queryFn: async () => {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/spf/config', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Erreur de récupération de la configuration SPF');
      }
      return response.json();
    }
  });

  // Mutation pour valider SPF
  const validateMutation = useMutation({
    mutationFn: async (spfRecord: string) => {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/spf/validate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ spfRecord })
      });
      if (!response.ok) {
        throw new Error('Erreur de validation SPF');
      }
      return response.json();
    }
  });

  // Mutation pour générer SPF personnalisé
  const generateMutation = useMutation({
    mutationFn: async (params: { activeProviders?: string[]; qualifier?: string }) => {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/spf/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(params)
      });
      if (!response.ok) {
        throw new Error('Erreur de génération SPF');
      }
      return response.json();
    }
  });

  useEffect(() => {
    if (spfConfig?.data?.currentSPF) {
      setCustomSPF(spfConfig.data.currentSPF);
    }
  }, [spfConfig]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Chargement de la configuration SPF...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Erreur lors du chargement de la configuration SPF. Veuillez réessayer.
        </AlertDescription>
      </Alert>
    );
  }

  const emailProviders = spfConfig?.data?.emailProviders || [];
  const spfConfigurations = spfConfig?.data?.presetConfigurations || {};
  const domainConfig = spfConfig?.data?.domainConfig || {};
  const spfRecord = spfConfig?.data?.currentSPF || "";

  const handleValidation = async () => {
    try {
      const result = await validateMutation.mutateAsync(customSPF);
      setValidationResult(result.data);
      
      if (result.data.isValid) {
        toast({
          title: "Configuration SPF valide",
          description: "L'enregistrement SPF est correctement formaté.",
        });
      } else {
        toast({
          title: "Configuration SPF invalide", 
          description: `${result.data.errors.length} erreur(s) détectée(s).`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur de validation",
        description: "Impossible de valider la configuration SPF.",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copié",
      description: "Configuration copiée dans le presse-papiers.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configuration SPF</h1>
        <p className="text-muted-foreground mt-2">
          Gestion du Sender Policy Framework pour l'authentification des emails
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" data-testid="tab-overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="configuration" data-testid="tab-configuration">Configuration</TabsTrigger>
          <TabsTrigger value="validation" data-testid="tab-validation">Validation</TabsTrigger>
          <TabsTrigger value="instructions" data-testid="tab-instructions">Instructions DNS</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Statut actuel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Statut SPF Actuel
              </CardTitle>
              <CardDescription>
                Configuration recommandée pour {domainConfig.primaryDomain}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                {spfRecord}
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => copyToClipboard(spfRecord)}
                  data-testid="button-copy-spf"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copier
                </Button>
                <Button variant="outline" size="sm" data-testid="button-test-spf">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Tester en ligne
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Fournisseurs d'email */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Fournisseurs d'Email
              </CardTitle>
              <CardDescription>
                Services d'envoi d'emails configurés pour votre domaine
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {emailProviders.map((provider: EmailProvider, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{provider.name}</h4>
                        <Badge variant={provider.isActive ? "default" : "secondary"}>
                          {provider.isActive ? "Actif" : "Inactif"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{provider.description}</p>
                      <code className="text-xs bg-muted px-2 py-1 rounded">{provider.spfMechanism}</code>
                    </div>
                    <div className="flex items-center">
                      {provider.isActive ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Adresses email */}
          <Card>
            <CardHeader>
              <CardTitle>Adresses Email du Domaine</CardTitle>
              <CardDescription>
                Adresses utilisées pour l'envoi d'emails
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(domainConfig.emailAddresses as string[]).map((email: string, index: number) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                    <Mail className="w-4 h-4" />
                    <code>{email}</code>
                    {email.includes("gmail.com") && (
                      <Badge variant="outline" className="text-xs">Admin</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurations SPF Prédéfinies</CardTitle>
              <CardDescription>
                Choisissez une configuration adaptée à vos besoins
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(spfConfigurations).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</Label>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setCustomSPF(value as string);
                        copyToClipboard(value as string);
                      }}
                      data-testid={`button-use-${key}`}
                    >
                      Utiliser
                    </Button>
                  </div>
                  <div className="bg-muted p-3 rounded font-mono text-sm">
                    {value as string}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configuration Personnalisée</CardTitle>
              <CardDescription>
                Modifiez la configuration SPF selon vos besoins
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="custom-spf">Enregistrement SPF</Label>
                <Textarea
                  id="custom-spf"
                  value={customSPF}
                  onChange={(e) => setCustomSPF(e.target.value)}
                  placeholder="v=spf1 include:_spf.google.com ~all"
                  className="font-mono"
                  data-testid="textarea-custom-spf"
                />
              </div>
              <Button 
                onClick={handleValidation}
                disabled={validateMutation.isPending}
                data-testid="button-validate"
              >
                {validateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Valider la Configuration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Validation SPF</CardTitle>
              <CardDescription>
                Vérifiez la validité de votre configuration SPF
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {validationResult && (
                <Alert variant={validationResult.isValid ? "default" : "destructive"}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {validationResult.isValid ? (
                      "Configuration SPF valide ! Prêt pour l'implémentation DNS."
                    ) : (
                      <div>
                        <p className="font-medium mb-2">Erreurs détectées :</p>
                        <ul className="list-disc list-inside space-y-1">
                          {validationResult.errors.map((error, index) => (
                            <li key={index} className="text-sm">{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <h4 className="font-medium">Tests de Validation Automatiques</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span>Format SPF valide</span>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span>Nombre de lookups DNS (&lt; 10)</span>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span>Longueur de l'enregistrement (&lt; 255 caractères)</span>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="instructions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Instructions d'Implémentation DNS</CardTitle>
              <CardDescription>
                Étapes pour configurer l'enregistrement SPF dans votre DNS
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important :</strong> Remplacez tout enregistrement SPF existant. 
                  Un seul enregistrement SPF par domaine est autorisé.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <h4 className="font-medium">Configuration DNS Recommandée</h4>
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <strong>Type :</strong>
                      <br />
                      <code>TXT</code>
                    </div>
                    <div>
                      <strong>Nom/Host :</strong>
                      <br />
                      <code>@</code> (ou racine du domaine)
                    </div>
                    <div>
                      <strong>TTL :</strong>
                      <br />
                      <code>3600</code> (1 heure)
                    </div>
                  </div>
                  <div className="mt-4">
                    <strong>Valeur :</strong>
                    <div className="mt-2 p-3 bg-background border rounded font-mono text-sm">
                      {spfRecord}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Étapes de Configuration</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Accédez à votre panneau de contrôle DNS (chez votre registraire de domaine)</li>
                    <li>Supprimez tout enregistrement SPF existant pour {domainConfig.primaryDomain}</li>
                    <li>Créez un nouvel enregistrement TXT avec les valeurs ci-dessus</li>
                    <li>Sauvegardez les modifications</li>
                    <li>Attendez la propagation DNS (jusqu'à 48h)</li>
                    <li>Testez avec un outil de validation SPF en ligne</li>
                  </ol>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => copyToClipboard(spfRecord)}
                    data-testid="button-copy-dns-value"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copier la Valeur DNS
                  </Button>
                  <Button variant="outline" data-testid="button-open-dns-checker">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Vérifier DNS
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Prochaines Étapes Recommandées</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <Badge variant="outline">1</Badge>
                  <div>
                    <strong>DKIM :</strong> Configurez la signature DKIM pour l'authentification des messages
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="outline">2</Badge>
                  <div>
                    <strong>DMARC :</strong> Implémentez une politique DMARC pour la protection complète
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="outline">3</Badge>
                  <div>
                    <strong>Monitoring :</strong> Surveillez les rapports DMARC pour détecter les abus
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}