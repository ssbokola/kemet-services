import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Mail, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { jsPDF } from 'jspdf';

interface DownloadCatalogProps {
  variant?: 'default' | 'compact' | 'button-only';
  className?: string;
  title?: string;
  description?: string;
}

export function DownloadCatalog({ 
  variant = 'default',
  className,
  title = "Catalogue des Formations",
  description = "Téléchargez notre catalogue complet et découvrez toutes nos formations pharmaceutiques"
}: DownloadCatalogProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const { toast } = useToast();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleDownload = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // For button-only variant, skip email validation
    if (variant === 'button-only') {
      triggerDownload();
      return;
    }

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
      // Simulate API call for email collection
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStatus('success');
      
      toast({
        title: "Email enregistré !",
        description: "Le téléchargement de votre catalogue va commencer automatiquement.",
      });

      // Trigger download after success
      setTimeout(() => {
        triggerDownload();
        setStatus('idle');
        setEmail('');
      }, 1000);
      
    } catch (error) {
      setStatus('error');
      setErrorMessage('Une erreur est survenue. Veuillez réessayer.');
      
      toast({
        title: "Erreur de téléchargement",
        description: "Impossible de télécharger le catalogue. Veuillez réessayer plus tard.",
        variant: "destructive",
      });
    }
  };

  const triggerDownload = () => {
    // Generate a real PDF using jsPDF
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('KEMET SERVICES', 20, 25);
    doc.text('CATALOGUE DES FORMATIONS 2024', 20, 35);
    
    // Underline
    doc.setLineWidth(0.5);
    doc.line(20, 40, 190, 40);
    
    let yPos = 55;
    
    // Introduction
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text('Transformez votre pharmacie en centre d\'excellence avec nos formations', 20, yPos);
    doc.text('spécialisées adaptées aux réalités africaines.', 20, yPos + 7);
    yPos += 25;
    
    // FORMATIONS PHARMACIENS
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('FORMATIONS POUR PHARMACIENS', 20, yPos);
    yPos += 15;
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('FORMATIONS QUALITE (4 formations)', 20, yPos);
    yPos += 10;
    doc.setFont(undefined, 'normal');
    const qualiteFormations = [
      '• Mise en Place d\'un Systeme Qualite en Officine',
      '• Amelioration de la Qualite de Service',
      '• Gestion des Non-Conformites et CAPA',
      '• Audit Interne et Auto-evaluation'
    ];
    qualiteFormations.forEach(formation => {
      doc.text(formation, 25, yPos);
      yPos += 6;
    });
    yPos += 5;
    
    doc.setFont(undefined, 'bold');
    doc.text('FORMATIONS FINANCE (4 formations)', 20, yPos);
    yPos += 10;
    doc.setFont(undefined, 'normal');
    const financeFormations = [
      '• Gestion de Tresorerie pour Pharmaciens',
      '• Optimisation de la Rentabilite',
      '• Analyse Financiere d\'Officine',
      '• Negociation avec les Fournisseurs'
    ];
    financeFormations.forEach(formation => {
      doc.text(formation, 25, yPos);
      yPos += 6;
    });
    yPos += 5;
    
    doc.setFont(undefined, 'bold');
    doc.text('FORMATIONS STOCK (4 formations)', 20, yPos);
    yPos += 10;
    doc.setFont(undefined, 'normal');
    const stockFormations = [
      '• Gestion des Ecarts de Stock',
      '• Optimisation des Achats et Approvisionnements',
      '• Gestion des Perimes (Methode FEFO)',
      '• Inventaire et Controle des Stocks'
    ];
    stockFormations.forEach(formation => {
      doc.text(formation, 25, yPos);
      yPos += 6;
    });
    yPos += 5;
    
    doc.setFont(undefined, 'bold');
    doc.text('FORMATIONS RH (3 formations)', 20, yPos);
    yPos += 10;
    doc.setFont(undefined, 'normal');
    const rhFormations = [
      '• Management d\'Équipe en Pharmacie',
      '• Recrutement et Intégration du Personnel',
      '• Formation et Développement des Compétences'
    ];
    rhFormations.forEach(formation => {
      doc.text(formation, 25, yPos);
      yPos += 6;
    });
    
    // Add new page if needed
    if (yPos > 250) {
      doc.addPage();
      yPos = 30;
    } else {
      yPos += 15;
    }
    
    // FORMATIONS AUXILIAIRES
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('FORMATIONS POUR AUXILIAIRES (7 formations)', 20, yPos);
    yPos += 15;
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    const auxiliairesFormations = [
      '• Accueil et Service Client Excellence',
      '• Gestion de Commande et Facturation',
      '• Connaissance des Produits Pharmaceutiques',
      '• Techniques de Vente et Conseil',
      '• Hygiène et Sécurité en Officine',
      '• Communication Professionnelle',
      '• Gestion des Situations Difficiles'
    ];
    auxiliairesFormations.forEach(formation => {
      doc.text(formation, 25, yPos);
      yPos += 6;
    });
    yPos += 15;
    
    // MODALITÉS
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('MODALITÉS', 20, yPos);
    yPos += 12;
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    const modalites = [
      '- Lieu: Abidjan, Cote d\'Ivoire (formations sur site disponibles)',
      '- Duree: 1 a 3 jours selon la formation',
      '- Participants: 8 a 15 personnes maximum',
      '- Certification: Attestation de formation Kemet Services',
      '- Support: Manuel de formation + outils pratiques'
    ];
    modalites.forEach(modalite => {
      doc.text(modalite, 25, yPos);
      yPos += 7;
    });
    yPos += 15;
    
    // CONTACT
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('CONTACT & INSCRIPTION', 20, yPos);
    yPos += 12;
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text('Email: ssbokola@gmail.com', 25, yPos);
    yPos += 7;
    doc.text('WhatsApp: +225 07 59 06 87 44', 25, yPos);
    yPos += 15;
    
    doc.setFont(undefined, 'bold');
    doc.text('Dr. Bokola Tinni Sonhon', 25, yPos);
    yPos += 7;
    doc.setFont(undefined, 'normal');
    doc.text('Pharmacien d\'Officine • Fondateur Kemet Services', 25, yPos);
    yPos += 6;
    doc.text('Doctorat en Pharmacie • MBA • Master Management Qualité', 25, yPos);
    yPos += 15;
    
    // Quote
    doc.setFontSize(10);
    doc.setFont(undefined, 'italic');
    doc.text('"Transformons ensemble les pharmacies africaines en centres d\'excellence"', 25, yPos);
    yPos += 15;
    
    // Footer
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text('© 2024 Kemet Services - Tous droits réservés', 25, yPos);
    
    // Download the PDF
    doc.save('Kemet-Services-Catalogue-Formations-2024.pdf');
    
    console.log('Catalogue PDF generated and downloaded');
  };


  if (variant === 'button-only') {
    return (
      <Button 
        onClick={handleDownload}
        variant="outline"
        className={cn("flex items-center gap-2", className)}
        data-testid="button-download-catalog"
      >
        <Download className="w-4 h-4" />
        Télécharger le catalogue
      </Button>
    );
  }

  if (variant === 'compact') {
    return (
      <Card className={cn("max-w-sm", className)}>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            {title}
          </CardTitle>
          <CardDescription className="text-sm">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleDownload} className="space-y-3">
            <div>
              <Input
                type="text"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === 'error') {
                    setStatus('idle');
                    setErrorMessage('');
                  }
                }}
                placeholder="Votre email professionnel"
                disabled={status === 'loading' || status === 'success'}
                className={cn(
                  status === 'error' && 'border-destructive',
                  status === 'success' && 'border-green-500'
                )}
                data-testid="input-catalog-email"
              />
              {errorMessage && (
                <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {errorMessage}
                </p>
              )}
            </div>
            
            <Button 
              type="submit" 
              disabled={status === 'loading' || status === 'success'}
              className="w-full"
              data-testid="button-catalog-download"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Préparation...
                </>
              ) : status === 'success' ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Téléchargement...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger (PDF gratuit)
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-3 text-xs text-muted-foreground flex items-center justify-center gap-1">
            <span>✓ 22 formations</span>
            <span>•</span>
            <span>✓ Gratuit</span>
            <span>•</span>
            <span>✓ PDF 5 pages</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("max-w-md", className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2 mb-2">
              <FileText className="w-6 h-6 text-primary" />
              {title}
            </CardTitle>
            <CardDescription>
              {description}
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-xs">
            Gratuit
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>22 formations</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>PDF 5 pages</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Tarifs inclus</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Modalités détaillées</span>
            </div>
          </div>
          
          <form onSubmit={handleDownload} className="space-y-3">
            <div>
              <Input
                type="text"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === 'error') {
                    setStatus('idle');
                    setErrorMessage('');
                  }
                }}
                placeholder="Votre email professionnel"
                disabled={status === 'loading' || status === 'success'}
                className={cn(
                  status === 'error' && 'border-destructive',
                  status === 'success' && 'border-green-500'
                )}
                data-testid="input-catalog-email"
              />
              {errorMessage && (
                <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {errorMessage}
                </p>
              )}
            </div>
            
            <Button 
              type="submit" 
              disabled={status === 'loading' || status === 'success'}
              className="w-full"
              data-testid="button-catalog-download"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Préparation du téléchargement...
                </>
              ) : status === 'success' ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Téléchargement en cours...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger le catalogue
                </>
              )}
            </Button>
          </form>
          
          <p className="text-xs text-muted-foreground text-center">
            En téléchargeant, vous acceptez de recevoir nos actualités formations par email.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Preset configurations
export const KemetCatalog = {
  // Configuration par défaut
  Default: (props?: Partial<DownloadCatalogProps>) => (
    <DownloadCatalog {...props} />
  ),

  // Version compacte pour sidebar
  Compact: (props?: Partial<DownloadCatalogProps>) => (
    <DownloadCatalog 
      variant="compact"
      title="Catalogue Formations"
      description="Découvrez nos 22 formations pharmaceutiques"
      {...props} 
    />
  ),

  // Bouton simple pour header ou autres emplacements
  Button: (props?: Partial<DownloadCatalogProps>) => (
    <DownloadCatalog 
      variant="button-only"
      {...props} 
    />
  )
};