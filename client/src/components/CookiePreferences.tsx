import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Settings, Shield, BarChart3, Cookie } from 'lucide-react';
import { useCookieContext, cookieCategories, defaultConsent, type CookieConsent } from '@/components/CookieManager';

const categoryIcons = {
  necessary: Shield,
  functional: Settings,
  analytics: BarChart3,
  marketing: Cookie
};

export default function CookiePreferences() {
  const { consent, showPreferencesModal, setShowPreferencesModal, saveConsent } = useCookieContext();
  const [tempConsent, setTempConsent] = useState<CookieConsent | null>(null);

  // Synchroniser tempConsent avec consent quand le modal s'ouvre
  useEffect(() => {
    if (showPreferencesModal) {
      setTempConsent(consent ?? defaultConsent);
    }
  }, [showPreferencesModal, consent]);

  const handleCategoryToggle = (category: keyof CookieConsent, value: boolean) => {
    if (category === 'necessary' || !tempConsent) return; // Les cookies nécessaires ne peuvent pas être désactivés
    
    setTempConsent(prev => prev ? {
      ...prev,
      [category]: value
    } : null);
  };

  const handleSavePreferences = () => {
    if (tempConsent) {
      saveConsent(tempConsent);
    }
  };

  const handleAcceptAll = () => {
    if (tempConsent) {
      const allAccepted: CookieConsent = {
        ...tempConsent,
        analytics: true,
        marketing: true,
        functional: true,
        timestamp: Date.now()
      };
      saveConsent(allAccepted);
    }
  };

  const handleRejectOptional = () => {
    if (tempConsent) {
      const onlyNecessary: CookieConsent = {
        ...tempConsent,
        analytics: false,
        marketing: false,
        functional: false,
        timestamp: Date.now()
      };
      saveConsent(onlyNecessary);
    }
  };

  return (
    <Dialog open={showPreferencesModal} onOpenChange={setShowPreferencesModal}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Préférences de cookies</DialogTitle>
          <DialogDescription>
            Gérez vos préférences de cookies par catégorie. Les cookies strictement nécessaires sont toujours activés.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {cookieCategories.map((category) => {
            const Icon = categoryIcons[category.id as keyof typeof categoryIcons];
            const isChecked = category.required ? true : Boolean(tempConsent?.[category.id as keyof CookieConsent]);
            
            return (
              <Card key={category.id} className="border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-primary" />
                      <div>
                        <CardTitle className="text-base">{category.name}</CardTitle>
                        {category.required && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            Toujours activé
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Checkbox
                      id={`cookie-${category.id}`}
                      checked={isChecked}
                      disabled={category.required}
                      onCheckedChange={(checked) => 
                        handleCategoryToggle(category.id as keyof CookieConsent, !!checked)
                      }
                      data-testid={`checkbox-${category.id}`}
                      aria-label={`Toggle ${category.name}`}
                      role="checkbox"
                      aria-describedby={`desc-${category.id}`}
                    />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p id={`desc-${category.id}`} className="text-sm text-muted-foreground mb-2">
                    {category.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <strong>Exemples :</strong> {category.examples}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowPreferencesModal(false)}
              data-testid="button-cancel-preferences"
            >
              Annuler
            </Button>
            <Button 
              variant="outline" 
              onClick={handleRejectOptional}
              data-testid="button-reject-optional-preferences"
            >
              Rejeter optionnels
            </Button>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={handleAcceptAll}
              data-testid="button-accept-all-preferences"
            >
              Accepter tout
            </Button>
            <Button 
              onClick={handleSavePreferences}
              data-testid="button-save-preferences"
            >
              Sauvegarder
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}