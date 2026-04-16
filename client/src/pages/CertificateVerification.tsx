/**
 * Page publique de vérification d'un certificat — Lot 3.
 *
 * Route : /certificats/:code (avec code) ou /certificats (sans code → formulaire)
 *
 * Comportement :
 *   - Pas de gate d'authentification : tout visiteur (employeur, ordre…) peut
 *     vérifier l'authenticité d'un code KMT-YYYY-NNNN.
 *   - GET /api/certificates/verify/:code renvoie les infos sanitisées
 *     (nom du titulaire, formation, score, date).
 *   - Si l'utilisateur est connecté ET est le titulaire, on lui propose
 *     en plus un bouton "Télécharger mon PDF" qui pointe vers
 *     /api/certificates/:code/download (authentifié).
 */
import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import {
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Search,
  Download,
  Award,
  Calendar,
  Percent,
  User as UserIcon,
  BookOpen,
} from "lucide-react";

// ----------------------------------------------------------------------
// Types (miroir de server/routes/certificates.ts)
// ----------------------------------------------------------------------

interface VerifyResponseValid {
  valid: true;
  certificate: {
    verificationCode: string;
    certificateNumber: string;
    finalScore: number;
    completedAt: string; // ISO
    issuedAt: string;    // ISO
  };
  holder: { name: string };
  course: { title: string; slug: string };
}

interface VerifyResponseInvalid {
  valid: false;
  error: string;
}

type VerifyResponse = VerifyResponseValid | VerifyResponseInvalid;

interface AuthUser {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

const CODE_REGEX = /^KMT-\d{4}-\d{4}$/;

function formatFrenchDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

// ----------------------------------------------------------------------
// Formulaire de saisie du code (route /certificats sans param)
// ----------------------------------------------------------------------

function CodeInputForm() {
  const [, setLocation] = useLocation();
  const [inputCode, setInputCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputCode.trim().toUpperCase();
    if (!CODE_REGEX.test(trimmed)) {
      setError("Format de code invalide. Attendu : KMT-AAAA-XXXX (ex: KMT-2026-0042).");
      return;
    }
    setError(null);
    setLocation(`/certificats/${trimmed}`);
  };

  return (
    <Card className="max-w-xl mx-auto" data-testid="card-cert-verify-form">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-teal-600" />
          Vérifier un certificat Kemet Services
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Entrez le code de vérification figurant au bas du certificat (format{" "}
          <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">
            KMT-AAAA-XXXX
          </code>
          ) pour en confirmer l'authenticité.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3" data-testid="form-cert-verify">
          <Input
            type="text"
            placeholder="KMT-2026-0042"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            className="font-mono uppercase tracking-wider"
            maxLength={13}
            data-testid="input-cert-code"
          />
          {error && (
            <p className="text-sm text-red-600" data-testid="text-cert-form-error">
              {error}
            </p>
          )}
          <Button
            type="submit"
            className="w-full bg-teal-600 hover:bg-teal-700"
            data-testid="button-cert-verify-submit"
          >
            <Search className="w-4 h-4 mr-2" />
            Vérifier ce certificat
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ----------------------------------------------------------------------
// Affichage d'un résultat valide
// ----------------------------------------------------------------------

function ValidCertificateCard({
  data,
  currentUser,
}: {
  data: VerifyResponseValid;
  currentUser: AuthUser | null | undefined;
}) {
  const { certificate, holder, course } = data;
  const downloadUrl = `/api/certificates/${certificate.verificationCode}/download`;
  // On ne sait pas côté client si l'utilisateur courant est le titulaire
  // (le endpoint public ne renvoie volontairement pas de userId). On propose
  // le download à tout utilisateur connecté : le backend fera la vérif stricte
  // (403 si pas le titulaire).
  const showDownload = !!currentUser;

  return (
    <Card className="max-w-2xl mx-auto shadow-lg" data-testid="card-cert-valid">
      <CardHeader className="bg-gradient-to-br from-teal-50 to-emerald-50 border-b">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-teal-600 flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7 text-white" />
          </div>
          <div>
            <Badge className="bg-teal-600 hover:bg-teal-700 mb-1">Certificat authentique</Badge>
            <CardTitle className="text-xl">Ce certificat est valide et vérifié</CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-5">
        <div className="grid sm:grid-cols-2 gap-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <UserIcon className="w-3.5 h-3.5" />
              Titulaire
            </div>
            <p className="text-lg font-semibold" data-testid="text-cert-holder">
              {holder.name}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <BookOpen className="w-3.5 h-3.5" />
              Formation
            </div>
            <p className="text-base font-medium" data-testid="text-cert-course">
              {course.title}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              Délivré le
            </div>
            <p className="text-base" data-testid="text-cert-date">
              {formatFrenchDate(certificate.completedAt)}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Percent className="w-3.5 h-3.5" />
              Score obtenu
            </div>
            <p className="text-base" data-testid="text-cert-score">
              <span className="text-2xl font-bold text-teal-700">
                {certificate.finalScore} %
              </span>
              <span className="text-sm text-muted-foreground ml-2">au quiz de certification</span>
            </p>
          </div>
        </div>

        <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-teal-800 mb-1">
            Code de vérification
          </div>
          <p className="font-mono text-lg font-bold text-teal-900 tracking-wider" data-testid="text-cert-code">
            {certificate.verificationCode}
          </p>
          <p className="text-xs text-teal-700 mt-2">
            Ce code est unique et ne peut pas être falsifié. Toute personne peut
            le saisir sur cette même page pour reconfirmer l'authenticité.
          </p>
        </div>

        {showDownload && (
          <div className="pt-2">
            <Button
              asChild
              variant="outline"
              className="w-full border-teal-600 text-teal-700 hover:bg-teal-50"
              data-testid="button-cert-download"
            >
              <a href={downloadUrl} target="_blank" rel="noreferrer">
                <Download className="w-4 h-4 mr-2" />
                Télécharger le PDF (titulaire uniquement)
              </a>
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Seul le titulaire peut télécharger le PDF. Si vous n'êtes pas
              le titulaire, le téléchargement sera refusé.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ----------------------------------------------------------------------
// Affichage d'un résultat invalide
// ----------------------------------------------------------------------

function InvalidCertificateCard({ message, code }: { message: string; code: string }) {
  return (
    <Card className="max-w-xl mx-auto border-red-200" data-testid="card-cert-invalid">
      <CardHeader className="bg-red-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center">
            <XCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <Badge variant="destructive" className="mb-1">Certificat non reconnu</Badge>
            <CardTitle className="text-lg">Ce code ne correspond à aucun certificat</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        <p className="text-sm text-muted-foreground">
          Code recherché :{" "}
          <code className="font-mono bg-muted px-2 py-0.5 rounded">{code}</code>
        </p>
        <p className="text-sm">{message}</p>
        <p className="text-sm text-muted-foreground">
          Vérifiez que le code est saisi sans espace et respecte le format{" "}
          <code className="font-mono">KMT-AAAA-XXXX</code>. Si le problème
          persiste, contactez <a href="mailto:infos@kemetservices.com" className="text-teal-700 hover:underline">infos@kemetservices.com</a>.
        </p>
        <Button asChild variant="outline" className="w-full" data-testid="button-cert-retry">
          <Link href="/certificats">Saisir un autre code</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

// ----------------------------------------------------------------------
// Page principale
// ----------------------------------------------------------------------

export default function CertificateVerification() {
  const params = useParams<{ code?: string }>();
  const { user, isLoading: authLoading } = useAuth();
  const code = params.code ? params.code.trim().toUpperCase() : null;

  // Normaliser l'URL en majuscules (si l'utilisateur tape kmt-2026-0042)
  const [, setLocation] = useLocation();
  useEffect(() => {
    if (params.code && params.code !== code) {
      setLocation(`/certificats/${code}`, { replace: true });
    }
  }, [params.code, code, setLocation]);

  const formatValid = code ? CODE_REGEX.test(code) : false;

  const { data, isLoading, isError } = useQuery<VerifyResponse>({
    queryKey: ["/api/certificates/verify", code],
    queryFn: async () => {
      const res = await fetch(`/api/certificates/verify/${code}`);
      if (!res.ok && res.status !== 404 && res.status !== 400) {
        throw new Error(`Erreur serveur ${res.status}`);
      }
      return res.json();
    },
    enabled: !!code && formatValid,
    retry: false,
  });

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>
          {code
            ? `Vérifier le certificat ${code} — Kemet Services`
            : "Vérifier un certificat — Kemet Services"}
        </title>
        <meta
          name="description"
          content="Page de vérification publique des certificats Kemet Services. Entrez le code pour authentifier un certificat de formation."
        />
      </Helmet>

      <Header />

      <main className="py-10 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-xs font-medium mb-3">
              <Award className="w-3.5 h-3.5" />
              Vérification publique
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Vérification de certificat
            </h1>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              Confirmez l'authenticité d'un certificat Kemet Services en saisissant
              son code de vérification.
            </p>
          </div>

          {/* Pas de code dans l'URL → formulaire de saisie */}
          {!code && <CodeInputForm />}

          {/* Code dans l'URL mais format invalide */}
          {code && !formatValid && (
            <InvalidCertificateCard
              code={code}
              message="Le code saisi n'a pas le bon format (attendu : KMT-AAAA-XXXX)."
            />
          )}

          {/* Requête en cours */}
          {code && formatValid && isLoading && (
            <Card className="max-w-2xl mx-auto">
              <CardContent className="pt-6 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          )}

          {/* Erreur réseau */}
          {code && formatValid && isError && (
            <InvalidCertificateCard
              code={code}
              message="Une erreur réseau est survenue. Réessayez dans quelques instants."
            />
          )}

          {/* Résultat */}
          {code && formatValid && data && !isLoading && (
            <>
              {data.valid ? (
                <ValidCertificateCard data={data} currentUser={user as AuthUser | null} />
              ) : (
                <InvalidCertificateCard code={code} message={data.error} />
              )}
            </>
          )}

          {/* Lien vers le formulaire si on est sur un code (pour re-chercher) */}
          {code && (
            <div className="text-center mt-6">
              <Button asChild variant="ghost" size="sm" data-testid="link-cert-another">
                <Link href="/certificats">Vérifier un autre certificat →</Link>
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
