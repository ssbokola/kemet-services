import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { KeyRound, Loader2, Mail, CheckCircle2 } from 'lucide-react';

export default function ForgotPassword() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiRequest('POST', '/api/auth/forgot-password', { email });
      setSent(true);
    } catch (error: any) {
      // Even on error we show the generic success to avoid leaking existence
      // UNLESS the response is clearly a validation error (400)
      const raw = error?.message || '';
      if (raw.startsWith('400:')) {
        toast({
          title: 'Adresse email invalide',
          description: 'Veuillez vérifier votre adresse email.',
          variant: 'destructive',
        });
      } else {
        // Network / server error
        setSent(true); // fail-safe: still show generic message
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-teal-600 text-white flex items-center justify-center">
            {sent ? <CheckCircle2 className="w-6 h-6" /> : <KeyRound className="w-6 h-6" />}
          </div>
          <CardTitle className="text-2xl">
            {sent ? 'Email envoyé' : 'Mot de passe oublié'}
          </CardTitle>
          <CardDescription>
            {sent
              ? 'Si un compte existe avec cette adresse, vous recevrez un email sous quelques minutes.'
              : 'Entrez votre adresse email. Nous vous enverrons un lien pour réinitialiser votre mot de passe.'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {sent ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-teal-50 border border-teal-200 rounded-lg text-sm text-teal-900">
                <Mail className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Vérifiez votre boîte de réception</p>
                  <p className="mt-1 text-teal-800">
                    Le lien est valable <strong>1 heure</strong>. Pensez à regarder dans vos spams
                    si vous ne le voyez pas.
                  </p>
                </div>
              </div>
              <Link href="/login">
                <Button variant="outline" className="w-full" data-testid="button-back-to-login">
                  Retour à la connexion
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-forgot-password">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  data-testid="input-email"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700"
                disabled={isSubmitting}
                data-testid="button-submit"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Envoi…
                  </>
                ) : (
                  'Envoyer le lien de réinitialisation'
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                <Link href="/login" className="text-teal-700 hover:underline">
                  Retour à la connexion
                </Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
