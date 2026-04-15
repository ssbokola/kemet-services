import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { LogIn, Loader2, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiRequest('POST', '/api/auth/login', form);
      toast({ title: 'Connexion réussie', description: 'Bon retour parmi nous !' });
      await queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      setLocation('/mon-compte');
    } catch (error: any) {
      const raw = error?.message || '';
      let description = 'Email ou mot de passe incorrect.';
      const jsonMatch = raw.match(/\{.*\}$/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.error) description = parsed.error;
        } catch { /* keep default */ }
      }
      toast({ title: 'Connexion impossible', description, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-teal-600 text-white flex items-center justify-center">
            <LogIn className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl">Connexion</CardTitle>
          <CardDescription>
            Accédez à vos formations et à votre espace apprenant.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-login">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                data-testid="input-email"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mot de passe</Label>
                <Link
                  href="/mot-de-passe-oublie"
                  className="text-xs text-teal-700 hover:underline"
                  data-testid="link-forgot-password"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  data-testid="input-password"
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
            </div>

            <Button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700"
              disabled={isSubmitting}
              data-testid="button-login"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connexion…
                </>
              ) : (
                'Se connecter'
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-muted" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">ou</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => { window.location.href = '/api/login'; }}
            data-testid="button-replit-login"
          >
            Se connecter avec Replit
          </Button>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Pas encore de compte ?{' '}
            <Link href="/inscription" className="text-teal-700 hover:underline font-medium" data-testid="link-register">
              Créer un compte
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
