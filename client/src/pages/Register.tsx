import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { UserPlus, Loader2, Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Mots de passe différents',
        description: 'Le mot de passe et sa confirmation ne correspondent pas.',
        variant: 'destructive',
      });
      return;
    }

    if (formData.password.length < 8) {
      toast({
        title: 'Mot de passe trop court',
        description: 'Le mot de passe doit contenir au moins 8 caractères.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiRequest('POST', '/api/auth/register', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
      });
      const body = await res.json();

      toast({
        title: 'Compte créé !',
        description: body.message || 'Bienvenue sur Kemet Services.',
      });

      // Invalidate any cached auth state before redirecting
      await queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      setLocation('/mon-compte');
    } catch (error: any) {
      // apiRequest throws "STATUS: {json-string}" — try to parse the JSON tail
      const raw = error?.message || '';
      let description = 'Erreur lors de la création du compte. Veuillez réessayer.';
      const jsonMatch = raw.match(/\{.*\}$/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.error) description = parsed.error;
        } catch { /* keep default */ }
      }
      toast({ title: 'Inscription impossible', description, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-teal-600 text-white flex items-center justify-center">
            <UserPlus className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl">Créer un compte</CardTitle>
          <CardDescription>
            Rejoignez Kemet Services pour accéder à nos formations en ligne.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-register">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  type="text"
                  autoComplete="given-name"
                  required
                  value={formData.firstName}
                  onChange={handleChange('firstName')}
                  data-testid="input-firstName"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  type="text"
                  autoComplete="family-name"
                  required
                  value={formData.lastName}
                  onChange={handleChange('lastName')}
                  data-testid="input-lastName"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange('email')}
                data-testid="input-email"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  minLength={8}
                  required
                  value={formData.password}
                  onChange={handleChange('password')}
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
                value={formData.confirmPassword}
                onChange={handleChange('confirmPassword')}
                data-testid="input-confirmPassword"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700"
              disabled={isSubmitting}
              data-testid="button-register"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Création en cours…
                </>
              ) : (
                'Créer mon compte'
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Déjà un compte ?{' '}
            <Link href="/login" className="text-teal-700 hover:underline font-medium">
              Se connecter
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
