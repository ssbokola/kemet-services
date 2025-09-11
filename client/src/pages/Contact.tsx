import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Mail, 
  Phone, 
  MapPin, 
  Clock,
  Send,
  CheckCircle
} from 'lucide-react';
import Header from '@/components/Header';
import { Link } from 'wouter';

const roleOptions = [
  { value: 'pharmacien-titulaire', label: 'Pharmacien(ne) Titulaire' },
  { value: 'pharmacien-adjoint', label: 'Pharmacien(ne) Adjoint(e)' },
  { value: 'preparateur', label: 'Préparateur/trice' },
  { value: 'auxiliaire', label: 'Auxiliaire en pharmacie' },
  { value: 'directeur', label: 'Directeur/trice' },
  { value: 'autre', label: 'Autre' }
];

const objetOptions = [
  { value: 'consulting', label: 'Demande de consulting' },
  { value: 'formation', label: 'Information formation' },
  { value: 'diagnostic', label: 'Diagnostic gratuit' },
  { value: 'devis', label: 'Demande de devis' },
  { value: 'partenariat', label: 'Partenariat' },
  { value: 'autre', label: 'Autre demande' }
];

export default function Contact() {
  const [formData, setFormData] = useState({
    nom: '',
    role: '',
    officine: '',
    telephone: '',
    email: '',
    objet: '',
    message: '',
    dataConsent: false,
    marketingConsent: false
  });
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation du consentement obligatoire
    if (!formData.dataConsent) {
      alert('Vous devez accepter le traitement de vos données personnelles pour envoyer ce message.');
      return;
    }
    
    setIsLoading(true);
    
    // Simulation d'envoi
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitted(true);
    setIsLoading(false);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        nom: '',
        role: '',
        officine: '',
        telephone: '',
        email: '',
        objet: '',
        message: '',
        dataConsent: false,
        marketingConsent: false
      });
    }, 3000);
  };

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(
      `Bonjour Kemet Services,\n\nJe souhaite obtenir plus d'informations sur vos services.\n\nCordialement,\n${formData.nom || '[Votre nom]'}`
    );
    window.open(`https://wa.me/225759068744?text=${message}`, '_blank');
  };

  const handleEmailClick = () => {
    const subject = encodeURIComponent('Demande d\'information - Kemet Services');
    const body = encodeURIComponent(
      `Bonjour,\n\nJe souhaite obtenir plus d'informations sur vos services.\n\nCordialement,\n${formData.nom || '[Votre nom]'}`
    );
    window.open(`mailto:infos@kemetservices.com?subject=${subject}&body=${body}`, '_blank');
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[80vh]">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="text-center pt-6">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">Message envoyé !</h2>
              <p className="text-muted-foreground mb-4">
                Merci pour votre message. Nous vous répondrons dans les plus brefs délais.
              </p>
              <Badge variant="secondary">
                Réponse sous 24h ouvrées
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-primary/10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Contactez-nous
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Prêt à transformer votre pharmacie ? Nos experts vous accompagnent 
              avec des solutions personnalisées et des résultats mesurables.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Formulaire de contact */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Envoyez-nous un message</CardTitle>
                <CardDescription>
                  Remplissez ce formulaire et nous vous répondrons dans les 24h ouvrées.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nom">Nom et Prénom *</Label>
                      <Input
                        id="nom"
                        required
                        value={formData.nom}
                        onChange={(e) => setFormData({...formData, nom: e.target.value})}
                        placeholder="Dr. Kouame ADJOUA"
                        data-testid="input-nom"
                      />
                    </div>
                    <div>
                      <Label htmlFor="role">Rôle *</Label>
                      <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                        <SelectTrigger data-testid="select-role">
                          <SelectValue placeholder="Sélectionnez votre rôle" />
                        </SelectTrigger>
                        <SelectContent>
                          {roleOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="officine">Nom de l'officine *</Label>
                    <Input
                      id="officine"
                      required
                      value={formData.officine}
                      onChange={(e) => setFormData({...formData, officine: e.target.value})}
                      placeholder="Pharmacie du Plateau"
                      data-testid="input-officine"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="telephone">Téléphone *</Label>
                      <Input
                        id="telephone"
                        type="tel"
                        required
                        value={formData.telephone}
                        onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                        placeholder="+225 XX XX XX XX XX"
                        data-testid="input-telephone"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">E-mail *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="votre@email.ci"
                        data-testid="input-email"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="objet">Objet de la demande *</Label>
                    <Select value={formData.objet} onValueChange={(value) => setFormData({...formData, objet: value})}>
                      <SelectTrigger data-testid="select-objet">
                        <SelectValue placeholder="Sélectionnez l'objet de votre demande" />
                      </SelectTrigger>
                      <SelectContent>
                        {objetOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      placeholder="Décrivez votre demande ou vos besoins..."
                      rows={5}
                      data-testid="textarea-message"
                    />
                  </div>
                  
                  {/* Cases de consentement RGPD */}
                  <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
                    <h4 className="font-semibold text-foreground">Protection de vos données personnelles</h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="dataConsent"
                          checked={formData.dataConsent}
                          onCheckedChange={(checked) => setFormData({...formData, dataConsent: !!checked})}
                          data-testid="checkbox-data-consent"
                        />
                        <div className="flex-1">
                          <Label htmlFor="dataConsent" className="text-sm leading-relaxed cursor-pointer">
                            J'accepte que mes données personnelles soient traitées par Kemet Services pour traiter ma demande et me recontacter. <span className="text-destructive">*</span>
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Consultez notre <Link href="/confidentialite" className="text-primary hover:underline">Politique de Confidentialité</Link> pour plus de détails.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="marketingConsent"
                          checked={formData.marketingConsent}
                          onCheckedChange={(checked) => setFormData({...formData, marketingConsent: !!checked})}
                          data-testid="checkbox-marketing-consent"
                        />
                        <div className="flex-1">
                          <Label htmlFor="marketingConsent" className="text-sm leading-relaxed cursor-pointer">
                            J'accepte de recevoir des communications marketing de Kemet Services (formations, conseils, offres spéciales). Je peux me désinscrire à tout moment.
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Optionnel - Vous pouvez vous désinscrire en nous contactant à infos@kemetservices.com
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                    data-testid="button-submit"
                  >
                    {isLoading ? (
                      'Envoi en cours...'
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Envoyer le message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
          
          {/* Informations de contact */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Autres moyens de contact</CardTitle>
                <CardDescription>
                  Contactez-nous rapidement par WhatsApp ou e-mail
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-green-600 border-green-200 hover:bg-green-50"
                  onClick={handleWhatsAppClick}
                  data-testid="button-whatsapp-contact"
                >
                  <MessageCircle className="w-4 h-4 mr-3" />
                  WhatsApp : +225 75 90 68 xxx
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleEmailClick}
                  data-testid="button-email-contact"
                >
                  <Mail className="w-4 h-4 mr-3" />
                  infos@kemetservices.com
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Informations pratiques</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Localisation</p>
                    <p className="text-sm text-muted-foreground">
                      Abidjan, Côte d'Ivoire<br />
                      Interventions sur tout le territoire
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Horaires</p>
                    <p className="text-sm text-muted-foreground">
                      Lun - Ven : 8h00 - 18h00<br />
                      Sam : 8h00 - 14h00
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Réactivité</p>
                    <p className="text-sm text-muted-foreground">
                      Réponse garantie sous 24h ouvrées<br />
                      Urgences : contact WhatsApp
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Pourquoi nous choisir ?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>Expertise 100% pharmaceutique</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>Solutions adaptées à la Côte d'Ivoire</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>Résultats mesurables et durables</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>Accompagnement personnalisé</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}