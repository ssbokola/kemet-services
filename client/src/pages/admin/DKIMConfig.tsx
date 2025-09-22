import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  Key, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Copy, 
  RefreshCw, 
  Zap, 
  Settings,
  FileText,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function DKIMConfig() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // État local pour les formulaires
  const [customDKIM, setCustomDKIM] = useState('');
  const [selectedSelector, setSelectedSelector] = useState('kemet2024');
  const [selectedDomain, setSelectedDomain] = useState('kemetservices.com');
  const [keyLength, setKeyLength] = useState<number>(2048);
  const [checkDomain, setCheckDomain] = useState('kemetservices.com');
  const [checkSelector, setCheckSelector] = useState('kemet2024');
  const [showPrivateKey, setShowPrivateKey] = useState(false);

  // Auth guard - redirection si pas de token
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      setLocation('/admin/login');
      return;
    }
  }, [setLocation]);

  // Récupérer la configuration DKIM depuis l'API (avec auth)
  const { data: dkimConfig, isLoading, error } = useQuery({
    queryKey: ['dkim-config'],
    queryFn: async () => {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/dkim/config', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Erreur de récupération de la configuration DKIM');
      }
      return response.json();
    }
  });

  // Mutation pour valider DKIM
  const validateMutation = useMutation({
    mutationFn: async (dkimRecord: string) => {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/dkim/validate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ dkimRecord })
      });
      if (!response.ok) {
        throw new Error('Erreur de validation DKIM');
      }
      return response.json();
    }
  });

  // Mutation pour générer DKIM (nouvelle API sécurisée)
  const generateMutation = useMutation({
    mutationFn: async (params: { selector: string; domain: string; keyLength: number }) => {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/dkim/keypair', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(params)
      });
      if (!response.ok) {
        throw new Error('Erreur de génération DKIM');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Clés DKIM générées !",
        description: "⚠️ IMPORTANT: Sauvegardez immédiatement la clé privée. Elle ne sera plus accessible.",
        variant: "default"
      });
    }
  });

  // Mutation pour vérifier DKIM DNS
  const checkMutation = useMutation({
    mutationFn: async (params: { domain: string; selector: string }) => {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/dkim/check', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(params)
      });
      if (!response.ok) {
        throw new Error('Erreur de vérification DKIM');
      }
      return response.json();
    }
  });

  // Fonction pour copier dans le presse-papiers
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copié !",
      description: "Le texte a été copié dans le presse-papiers.",
      duration: 2000
    });
  };

  // Gestionnaires d'événements
  const handleValidate = () => {
    if (!customDKIM.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un enregistrement DKIM à valider.",
        variant: "destructive"
      });
      return;
    }
    validateMutation.mutate(customDKIM);
  };

  const handleGenerate = () => {
    generateMutation.mutate({
      selector: selectedSelector,
      domain: selectedDomain,
      keyLength
    });
  };

  const handleCheck = () => {
    checkMutation.mutate({
      domain: checkDomain,
      selector: checkSelector
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin" />
        <span className="ml-2">Chargement de la configuration DKIM...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <XCircle className="w-8 h-8 text-red-500" />
        <span className="ml-2">Erreur de chargement de la configuration DKIM</span>
      </div>
    );
  }

  const emailServices = dkimConfig?.data?.emailServices || [];
  const domainConfig = dkimConfig?.data?.domainConfig || {};
  const presetConfigurations = dkimConfig?.data?.presetConfigurations || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configuration DKIM</h1>
          <p className="text-muted-foreground">
            Gestion des signatures DomainKeys Identified Mail pour {domainConfig.primaryDomain}
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-2">
          <Key className="w-4 h-4" />
          Authentification Email
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="overview" data-testid="tab-overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="services" data-testid="tab-services">Services</TabsTrigger>
          <TabsTrigger value="generate" data-testid="tab-generate">Générer</TabsTrigger>
          <TabsTrigger value="validate" data-testid="tab-validate">Valider</TabsTrigger>
          <TabsTrigger value="check" data-testid="tab-check">Vérifier</TabsTrigger>
        </TabsList>

        {/* Vue d'ensemble */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                État DKIM actuel
              </CardTitle>
              <CardDescription>
                Résumé de la configuration DKIM pour vos services email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {emailServices.map((service: any, index: number) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{service.name}</h4>
                      <Badge variant={service.isActive ? "default" : "secondary"}>
                        {service.isActive ? "Actif" : "Inactif"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{service.description}</p>
                    <div className="text-xs space-y-1">
                      <div><strong>Sélecteur:</strong> <code>{service.selector}</code></div>
                      <div><strong>Configuration:</strong> {service.setupType}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configurations prédéfinies</CardTitle>
              <CardDescription>
                Configurations DKIM recommandées selon vos services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(presetConfigurations).map(([key, config]: [string, any]) => (
                  <div key={key} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</h4>
                          <Badge variant={config.isAutoManaged ? "default" : "outline"}>
                            {config.isAutoManaged ? "Auto-géré" : "Manuel"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{config.description}</p>
                        <p className="text-xs">{config.instructions}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Services Email */}
        <TabsContent value="services" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Services Email et DKIM
              </CardTitle>
              <CardDescription>
                Configuration DKIM pour chaque service email utilisé
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {emailServices.map((service: any, index: number) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{service.name}</h4>
                          <Badge variant={service.isActive ? "default" : "secondary"}>
                            {service.isActive ? "Actif" : "Inactif"}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCheckDomain(service.domain);
                          setCheckSelector(service.selector);
                        }}
                        data-testid={`button-check-${service.name.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        Vérifier DNS
                      </Button>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <strong>Domaine:</strong> <code>{service.domain}</code>
                      </div>
                      <div>
                        <strong>Sélecteur:</strong> <code>{service.selector}</code>
                      </div>
                      <div>
                        <strong>Type de configuration:</strong> {service.setupType}
                      </div>
                      <div>
                        <strong>Enregistrement DNS:</strong> <code>{service.selector}._domainkey.{service.domain}</code>
                      </div>
                    </div>
                    
                    {service.instructions && (
                      <div className="p-3 bg-muted rounded text-sm">
                        <strong>Instructions:</strong> {service.instructions}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Génération DKIM */}
        <TabsContent value="generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Générer des clés DKIM
              </CardTitle>
              <CardDescription>
                Créer une nouvelle paire de clés DKIM personnalisée
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="selector">Sélecteur</Label>
                  <Input
                    id="selector"
                    value={selectedSelector}
                    onChange={(e) => setSelectedSelector(e.target.value)}
                    placeholder="kemet2024"
                    data-testid="input-selector"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="domain">Domaine</Label>
                  <Input
                    id="domain"
                    value={selectedDomain}
                    onChange={(e) => setSelectedDomain(e.target.value)}
                    placeholder="kemetservices.com"
                    data-testid="input-domain"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="keyLength">Longueur de clé (bits)</Label>
                  <Select value={keyLength.toString()} onValueChange={(value) => setKeyLength(Number(value))}>
                    <SelectTrigger data-testid="select-key-length">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1024">1024 bits (déprécié)</SelectItem>
                      <SelectItem value="2048">2048 bits (recommandé)</SelectItem>
                      <SelectItem value="4096">4096 bits (sécurité maximale)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={handleGenerate}
                disabled={generateMutation.isPending}
                className="w-full"
                data-testid="button-generate-dkim"
              >
                {generateMutation.isPending ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Key className="w-4 h-4 mr-2" />
                )}
                Générer la paire de clés DKIM
              </Button>

              {generateMutation.data && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                  <h4 className="font-medium flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Clés DKIM générées avec succès
                  </h4>
                  
                  {/* Avertissement de sécurité critique */}
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <h5 className="font-medium text-red-800">⚠️ ATTENTION CRITIQUE</h5>
                    </div>
                    <p className="text-sm text-red-700 mb-2">
                      {generateMutation.data.data.warning}
                    </p>
                    <p className="text-xs text-red-600">
                      {generateMutation.data.data.securityNote}
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Clé privée - affichage sécurisé */}
                    {generateMutation.data.data.privateKey && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Clé privée DKIM (⚠️ Critique)</Label>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowPrivateKey(!showPrivateKey)}
                            data-testid="button-toggle-private-key"
                          >
                            {showPrivateKey ? (
                              <EyeOff className="w-4 h-4 mr-2" />
                            ) : (
                              <Eye className="w-4 h-4 mr-2" />
                            )}
                            {showPrivateKey ? "Masquer" : "Afficher"}
                          </Button>
                        </div>
                        
                        {showPrivateKey ? (
                          <div className="space-y-2">
                            <Textarea
                              value={generateMutation.data.data.privateKey}
                              readOnly
                              rows={8}
                              className="font-mono text-xs bg-red-50 border-red-200"
                              data-testid="textarea-private-key"
                            />
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(generateMutation.data.data.privateKey)}
                                data-testid="button-copy-private-key"
                              >
                                <Copy className="w-4 h-4 mr-2" />
                                Copier la clé privée
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const blob = new Blob([generateMutation.data.data.privateKey], { type: 'text/plain' });
                                  const url = URL.createObjectURL(blob);
                                  const a = document.createElement('a');
                                  a.href = url;
                                  a.download = `dkim-${generateMutation.data.data.selector}-${generateMutation.data.data.domain}-private.key`;
                                  a.click();
                                  URL.revokeObjectURL(url);
                                }}
                                data-testid="button-download-private-key"
                              >
                                <FileText className="w-4 h-4 mr-2" />
                                Télécharger .key
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 bg-muted rounded text-sm text-center">
                            <AlertTriangle className="w-4 h-4 mx-auto mb-2" />
                            Clé privée masquée pour la sécurité. Cliquez sur "Afficher" pour la révéler.
                          </div>
                        )}
                      </div>
                    )}

                    <div>
                      <Label>Clé publique DKIM</Label>
                      <div className="flex items-center gap-2">
                        <Textarea
                          value={generateMutation.data.data.publicKey}
                          readOnly
                          rows={6}
                          className="font-mono text-xs"
                          data-testid="textarea-public-key"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(generateMutation.data.data.publicKey)}
                          data-testid="button-copy-public-key"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label>Enregistrement DNS TXT</Label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 p-2 bg-background rounded text-sm break-all">
                          {generateMutation.data.data.dnsRecord}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(generateMutation.data.data.dnsRecord)}
                          data-testid="button-copy-dns"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label>Instructions DNS</Label>
                      <div className="p-3 bg-background rounded text-sm">
                        <p><strong>Type:</strong> TXT</p>
                        <p><strong>Nom:</strong> {generateMutation.data.data.dnsInstructions.name}</p>
                        <p><strong>Valeur:</strong> {generateMutation.data.data.dnsInstructions.value}</p>
                        <p className="text-muted-foreground mt-2">
                          Ajoutez cet enregistrement TXT dans votre DNS pour activer DKIM
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Validation DKIM */}
        <TabsContent value="validate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Valider un enregistrement DKIM
              </CardTitle>
              <CardDescription>
                Vérifier la syntaxe et la conformité d'un enregistrement DKIM
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dkim-record">Enregistrement DKIM</Label>
                <Textarea
                  id="dkim-record"
                  value={customDKIM}
                  onChange={(e) => setCustomDKIM(e.target.value)}
                  placeholder="v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA..."
                  rows={4}
                  data-testid="textarea-dkim-record"
                />
              </div>

              <Button 
                onClick={handleValidate}
                disabled={validateMutation.isPending}
                className="w-full"
                data-testid="button-validate-dkim"
              >
                {validateMutation.isPending ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                Valider l'enregistrement DKIM
              </Button>

              {validateMutation.data && (
                <div className="space-y-4 p-4 border rounded-lg">
                  <div className="flex items-center gap-2">
                    {validateMutation.data.data.isValid ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <h4 className="font-medium">
                      {validateMutation.data.data.isValid ? "Enregistrement DKIM valide" : "Enregistrement DKIM invalide"}
                    </h4>
                  </div>

                  {validateMutation.data.data.errors?.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="font-medium text-red-600">Erreurs:</h5>
                      {validateMutation.data.data.errors.map((error: string, index: number) => (
                        <p key={index} className="text-sm text-red-600 flex items-center gap-2">
                          <XCircle className="w-4 h-4" />
                          {error}
                        </p>
                      ))}
                    </div>
                  )}

                  {validateMutation.data.data.warnings?.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="font-medium text-yellow-600">Avertissements:</h5>
                      {validateMutation.data.data.warnings.map((warning: string, index: number) => (
                        <p key={index} className="text-sm text-yellow-600 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          {warning}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vérification DNS */}
        <TabsContent value="check" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Vérifier les enregistrements DKIM DNS
              </CardTitle>
              <CardDescription>
                Contrôler la présence et la validité des enregistrements DKIM publiés
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="check-domain">Domaine</Label>
                  <Input
                    id="check-domain"
                    value={checkDomain}
                    onChange={(e) => setCheckDomain(e.target.value)}
                    placeholder="kemetservices.com"
                    data-testid="input-check-domain"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="check-selector">Sélecteur</Label>
                  <Input
                    id="check-selector"
                    value={checkSelector}
                    onChange={(e) => setCheckSelector(e.target.value)}
                    placeholder="kemet2024"
                    data-testid="input-check-selector"
                  />
                </div>
              </div>

              <div className="p-3 bg-muted rounded text-sm">
                <p><strong>Enregistrement à vérifier:</strong></p>
                <code>{checkSelector}._domainkey.{checkDomain}</code>
              </div>

              <Button 
                onClick={handleCheck}
                disabled={checkMutation.isPending}
                className="w-full"
                data-testid="button-check-dns"
              >
                {checkMutation.isPending ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4 mr-2" />
                )}
                Vérifier l'enregistrement DNS
              </Button>

              {checkMutation.data && (
                <div className="space-y-4 p-4 border rounded-lg">
                  <div className="flex items-center gap-2">
                    {checkMutation.data.data.hasRecord ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <h4 className="font-medium">
                      {checkMutation.data.data.hasRecord ? "Enregistrement DKIM trouvé" : "Aucun enregistrement DKIM"}
                    </h4>
                  </div>

                  <div className="text-sm space-y-2">
                    <p><strong>Domaine:</strong> {checkMutation.data.data.domain}</p>
                    <p><strong>Sélecteur:</strong> {checkMutation.data.data.selector}</p>
                    <p><strong>Vérification:</strong> {checkMutation.data.data.lastChecked}</p>
                  </div>

                  {checkMutation.data.data.record && (
                    <div className="space-y-2">
                      <Label>Enregistrement trouvé</Label>
                      <div className="p-3 bg-background rounded font-mono text-sm break-all">
                        {checkMutation.data.data.record}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(checkMutation.data.data.record)}
                        data-testid="button-copy-record"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copier
                      </Button>
                    </div>
                  )}

                  {checkMutation.data.data.validation && (
                    <div className="space-y-2">
                      <Label>Validation</Label>
                      <div className="space-y-2">
                        <Badge variant={checkMutation.data.data.validation.isValid ? "default" : "destructive"}>
                          {checkMutation.data.data.validation.isValid ? "Valide" : "Invalide"}
                        </Badge>
                        
                        {checkMutation.data.data.validation.errors?.length > 0 && (
                          <div className="space-y-1">
                            {checkMutation.data.data.validation.errors.map((error: string, index: number) => (
                              <p key={index} className="text-sm text-red-600 flex items-center gap-2">
                                <XCircle className="w-4 h-4" />
                                {error}
                              </p>
                            ))}
                          </div>
                        )}

                        {checkMutation.data.data.validation.warnings?.length > 0 && (
                          <div className="space-y-1">
                            {checkMutation.data.data.validation.warnings.map((warning: string, index: number) => (
                              <p key={index} className="text-sm text-yellow-600 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                {warning}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {checkMutation.data.data.error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                      <strong>Erreur:</strong> {checkMutation.data.data.error}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}