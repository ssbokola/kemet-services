/**
 * Page de retour après paiement Wave — Lot 4.
 *
 * Route : /paiement/retour/:orderId
 *
 * Appelée par PayDunya comme `return_url` ET `cancel_url` (avec `?cancelled=1`).
 * Rôle : polling du statut de l'order jusqu'à ce qu'il sorte de `pending`.
 *
 * États affichés :
 *   - loading  → spinner + "Nous vérifions votre paiement..."
 *   - completed → carte verte + bouton "Accéder à ma formation"
 *   - cancelled → carte orange + bouton "Réessayer"
 *   - failed    → carte rouge + bouton "Réessayer" + lien contact
 *   - timeout   → carte bleue + "Votre paiement est en cours, vous recevrez un email
 *                 de confirmation dès réception."
 *
 * Sécurité : endpoint /api/payments/wave/status/:orderId est strict owner-only
 * (renvoie 403 si ce n'est pas la commande de l'utilisateur connecté).
 */
import { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'wouter';
import { Helmet } from 'react-helmet-async';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  Clock,
  Mail,
  ArrowRight,
  ShoppingCart,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type OrderStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

interface StatusResponse {
  success: boolean;
  status: OrderStatus;
  transactionId?: string | null;
  amount?: number;
  currency?: string;
  course?: { id: string; title: string; slug: string } | null;
  error?: string;
}

// Nombre max de tentatives de polling (~30 s avec intervalle de 3 s)
const MAX_POLL_ATTEMPTS = 10;
const POLL_INTERVAL_MS = 3000;

// ---------------------------------------------------------------------------
// Composant principal
// ---------------------------------------------------------------------------

export default function PaymentReturn() {
  const params = useParams<{ orderId: string }>();
  const [location] = useLocation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const orderId = params.orderId || '';
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const wasCancelled = searchParams.get('cancelled') === '1';

  const [pollAttempts, setPollAttempts] = useState(0);
  const [timedOut, setTimedOut] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery<StatusResponse>({
    queryKey: ['/api/payments/wave/status', orderId],
    queryFn: async () => {
      const res = await fetch(`/api/payments/wave/status/${orderId}`, {
        credentials: 'include',
      });
      if (!res.ok && res.status !== 404) {
        // Laisse react-query gérer l'erreur (affichage de fallback)
        throw new Error(`HTTP ${res.status}`);
      }
      return res.json();
    },
    enabled: !!orderId && isAuthenticated && !timedOut,
    // Polling uniquement tant que le statut est pending
    refetchInterval: (query) => {
      const s = query.state.data?.status;
      if (s === 'completed' || s === 'failed' || s === 'cancelled') return false;
      if (pollAttempts >= MAX_POLL_ATTEMPTS) return false;
      return POLL_INTERVAL_MS;
    },
    retry: false,
  });

  // Incrémenter le compteur de tentatives à chaque refetch
  useEffect(() => {
    if (data?.status === 'pending') {
      setPollAttempts((n) => {
        const next = n + 1;
        if (next >= MAX_POLL_ATTEMPTS) setTimedOut(true);
        return next;
      });
    }
  }, [data?.status, data]);

  // Si le paiement devient completed, invalider les caches d'enrollment pour
  // que /mon-compte et les pages formation reflètent immédiatement l'inscription.
  useEffect(() => {
    if (data?.status === 'completed') {
      queryClient.invalidateQueries({ queryKey: ['/api/formations/my-enrollments'] });
      if (data.course?.id) {
        queryClient.invalidateQueries({
          queryKey: ['/api/formations', data.course.id, 'enrollment-status'],
        });
      }
    }
  }, [data?.status, data?.course?.id, queryClient]);

  // Format FCFA
  const formatAmount = (n?: number) =>
    typeof n === 'number'
      ? new Intl.NumberFormat('fr-FR').format(n) + ' FCFA'
      : '—';

  // Non authentifié → redirection vers login
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = `/login?redirect=${encodeURIComponent(location)}`;
    }
  }, [authLoading, isAuthenticated, location]);

  // ---------------- Rendu selon état ----------------

  const renderContent = () => {
    // Pas encore chargé
    if (isLoading && !data) {
      return <LoadingCard message="Nous vérifions votre paiement…" />;
    }

    // Erreur réseau / 404 / 403
    if (isError || !data?.success) {
      return (
        <Card className="max-w-xl mx-auto border-red-200" data-testid="card-payment-error">
          <CardHeader className="bg-red-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Commande introuvable</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              Nous n'avons pas pu récupérer les informations de cette commande.
              Elle n'existe peut-être pas ou appartient à un autre compte.
            </p>
            <Button asChild variant="outline" className="w-full" data-testid="button-back-catalogue">
              <Link href="/formations">Retour au catalogue</Link>
            </Button>
          </CardContent>
        </Card>
      );
    }

    const status = data.status;

    // Succès
    if (status === 'completed') {
      return (
        <Card className="max-w-xl mx-auto shadow-lg" data-testid="card-payment-success">
          <CardHeader className="bg-gradient-to-br from-emerald-50 to-teal-50 border-b">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <Badge className="bg-emerald-600 hover:bg-emerald-700 mb-1">Paiement confirmé</Badge>
                <CardTitle>Merci ! Votre inscription est validée</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-5 space-y-4">
            {data.course && (
              <div className="bg-muted/50 border rounded-lg p-3 space-y-1">
                <div className="text-xs text-muted-foreground uppercase tracking-wide">
                  Formation
                </div>
                <div className="font-medium text-sm" data-testid="text-course-title">
                  {data.course.title}
                </div>
                {data.amount && (
                  <div className="flex items-baseline justify-between pt-2 border-t mt-2">
                    <span className="text-sm text-muted-foreground">Montant payé</span>
                    <span className="text-lg font-bold text-emerald-700">
                      {formatAmount(data.amount)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {data.transactionId && (
              <p className="text-xs text-muted-foreground">
                Référence transaction :{' '}
                <code className="font-mono bg-muted px-1.5 py-0.5 rounded" data-testid="text-transaction-id">
                  {data.transactionId}
                </code>
              </p>
            )}

            <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <Mail className="w-4 h-4 text-blue-700 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-900">
                Un email de confirmation vous a été envoyé. Vous pouvez dès à présent
                accéder au contenu de votre formation.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                asChild
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                data-testid="button-access-course"
              >
                <Link href="/mon-compte">
                  Accéder à ma formation <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              {data.course && (
                <Button asChild variant="outline" className="flex-1" data-testid="button-view-course">
                  <Link href={`/formation/${data.course.slug}`}>Voir la fiche formation</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      );
    }

    // Annulé par le client
    if (status === 'cancelled' || wasCancelled) {
      return (
        <Card className="max-w-xl mx-auto border-amber-200" data-testid="card-payment-cancelled">
          <CardHeader className="bg-amber-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <Badge variant="secondary" className="bg-amber-500 text-white hover:bg-amber-600 mb-1">
                  Paiement annulé
                </Badge>
                <CardTitle>Paiement non finalisé</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              Vous avez annulé le paiement ou la transaction n'a pas été confirmée.
              Aucun débit n'a été effectué sur votre compte Wave.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              {data.course && (
                <Button asChild className="flex-1" data-testid="button-retry-payment">
                  <Link href={`/formation/${data.course.slug}`}>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Réessayer le paiement
                  </Link>
                </Button>
              )}
              <Button asChild variant="outline" className="flex-1" data-testid="button-back-catalogue">
                <Link href="/formations">Retour au catalogue</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Échec
    if (status === 'failed') {
      return (
        <Card className="max-w-xl mx-auto border-red-200" data-testid="card-payment-failed">
          <CardHeader className="bg-red-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <Badge variant="destructive" className="mb-1">Paiement échoué</Badge>
                <CardTitle>La transaction n'a pas pu aboutir</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              Le paiement a été refusé par Wave. Vérifiez que votre compte Wave est
              bien approvisionné et réessayez. Aucun montant ne vous a été prélevé.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              {data.course && (
                <Button asChild className="flex-1" data-testid="button-retry-payment">
                  <Link href={`/formation/${data.course.slug}`}>Réessayer</Link>
                </Button>
              )}
              <Button asChild variant="outline" className="flex-1" data-testid="button-contact-support">
                <a href="mailto:infos@kemetservices.com?subject=Probl%C3%A8me%20de%20paiement">
                  <Mail className="w-4 h-4 mr-2" />
                  Contacter le support
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Timeout (toujours pending après ~30s de polling)
    if (status === 'pending' && (timedOut || pollAttempts >= MAX_POLL_ATTEMPTS)) {
      return (
        <Card className="max-w-xl mx-auto border-blue-200" data-testid="card-payment-pending">
          <CardHeader className="bg-blue-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <Badge className="bg-blue-600 hover:bg-blue-700 mb-1">Paiement en cours</Badge>
                <CardTitle>Traitement en cours</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              Nous n'avons pas encore reçu la confirmation définitive de Wave. Cela peut
              prendre quelques minutes. Vous recevrez un email dès que le paiement sera
              confirmé, et votre accès à la formation sera activé automatiquement.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={() => {
                  setPollAttempts(0);
                  setTimedOut(false);
                  refetch();
                }}
                variant="outline"
                className="flex-1"
                data-testid="button-retry-check"
              >
                Vérifier à nouveau
              </Button>
              <Button asChild variant="outline" className="flex-1" data-testid="button-goto-account">
                <Link href="/mon-compte">Voir mon compte</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Polling en cours (pending, non timeout)
    return (
      <LoadingCard
        message="Nous vérifions votre paiement…"
        subMessage={`Tentative ${pollAttempts + 1}/${MAX_POLL_ATTEMPTS}`}
      />
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Paiement — Kemet Services</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <Header />

      <main className="py-10 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Paiement de votre formation
            </h1>
            <p className="text-muted-foreground mt-2">
              Commande{' '}
              <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-sm">
                {orderId.slice(0, 8)}…
              </code>
            </p>
          </div>

          {renderContent()}
        </div>
      </main>

      <Footer />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Composant interne : carte de chargement
// ---------------------------------------------------------------------------

function LoadingCard({
  message,
  subMessage,
}: {
  message: string;
  subMessage?: string;
}) {
  return (
    <Card className="max-w-xl mx-auto" data-testid="card-payment-loading">
      <CardContent className="pt-10 pb-10 text-center space-y-3">
        <Loader2 className="w-10 h-10 text-teal-600 animate-spin mx-auto" />
        <p className="text-base font-medium">{message}</p>
        {subMessage && <p className="text-xs text-muted-foreground">{subMessage}</p>}
      </CardContent>
    </Card>
  );
}
