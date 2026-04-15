import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { ShieldCheck, Loader2, AlertTriangle, Eye, EyeOff } from 'lucide-react';

export default function ResetPassword() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [token, setToken] = useState<string | null>(null);
  const [tokenMissing, setTokenMissing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('token');
    if (!t || t.length < 10) {
      setTokenMissing(true);
    } else {
      setToken(t);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (form.newPassword !== form.confirmPassword) {
      toast({
        title: 'Mots de passe différents',
        description: 'Le mot de passe et sa confirmation ne correspondent pas.',
        variant: 'destructive',
      });
      return;
    }

    if (form.newPassword.length < 8) {
      toast({
        title: 'Mot de passe trop court',
        description: 'Le mot de passe doit contenir au moins 8 caractères.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest('POST', '/api/auth/reset-password', {
        token,
        newPassword: form.newPassword,
      });

      toast({
        title: 'Mot de passe modifié',
        description: 'Vous êtes maintenant connecté(e). Bienvenue !',
      });

      await queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      setLocation('/mon-compte');
    } catch (error: any) {
      const raw = error?.message || '';
      let description = 'Lien invalide ou expiré. Veuillez recommencer la procédure.';
      const jsonMatch = raw.match(/\{.*\}$/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.error) description = parsed.error;
        } catch { /* keep default */ }
      }
      toast({
        title: 'Réinitialisation impossible',
        description,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (tokenMissing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-amber-500 text-white flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <CardTitle className="text-2xl">Lien invalide</CardTitle>
            <CardDescription>
              Ce lien de réinitialisation ne contient pas de jeton valide. Il a peut-être été
              tronqué ou copié partiellement.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/mot-de-passe-oublie">
              <Button className="w-full bg-teal-600 hover:bg-teal-700">
                Demander un nouveau lien
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="w-full">
                Retour à la connexion
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-teal-600 text-white flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl">Nouveau mot de passe</CardTitle>
          <CardDescription>
            Choisissez un nouveau mot de passe pour sécuriser votre compte.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-reset-password">
            <div className="space-y-1.5">
              <Label htmlFor="newPassword">Nouveau mot de passe</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  minLength={8}
                  required
                  value={form.newPassword}
                  onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))}
                  data-testid="input-newPassword"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">Minimum 8 caractères.</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                minLength={8}
                required
                value={form.confirmPassword}
                onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                data-testid="input-confirmPassword"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700"
              disabled={isSubmitting || !token}
              data-testid="button-submit"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Modification…
                </>
              ) : (
                'Réinitialiser le mot de passe'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
