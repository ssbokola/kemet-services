/**
 * Page apprenant — Quiz de certification (final quiz).
 *
 * Route : /formation-quiz/:courseId
 *
 * Trois états :
 *   1. LANDING (statut) — GET /api/final-quiz/:courseId/status
 *      Montre : dispo ou non, tentatives précédentes, meilleur score,
 *      cooldown, bouton "Commencer le quiz" (désactivé pendant cooldown).
 *   2. EN COURS — après POST /api/final-quiz/:courseId/start
 *      10 questions tirées au sort avec A/B/C/D, pas de timer par défaut,
 *      bouton "Soumettre" à la fin.
 *   3. RÉSULTAT — après POST /api/final-quiz/attempts/:id/submit
 *      Score + pass/fail, review détaillée avec bonnes réponses + explications,
 *      et si réussi : code de vérification du certificat KMT-YYYY-NNNN.
 *
 * Les bonnes réponses ne sont JAMAIS visibles pendant la tentative — elles
 * n'arrivent qu'avec la réponse du submit.
 */
import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Award,
  Clock,
  RefreshCw,
} from "lucide-react";

// ----------------------------------------------------------------------
// Types (miroir de server/routes/final-quiz.ts)
// ----------------------------------------------------------------------

interface FinalQuizStatus {
  exists: boolean;
  message?: string;
  questionsPerAttempt?: number;
  passThreshold?: number;
  totalAttempts?: number;
  bestScore?: number | null;
  hasPassed?: boolean;
  cooldownUntil?: string | null;
  lastAttempt?: {
    id: string;
    score: number | null;
    passed: boolean | null;
    startedAt: string;
    submittedAt: string | null;
  } | null;
  recentAttempts?: Array<{
    id: string;
    score: number | null;
    passed: boolean | null;
    startedAt: string;
    submittedAt: string | null;
  }>;
}

interface StartResponse {
  attemptId: string;
  questions: Array<{ question: string; options: string[] }>;
  questionsCount: number;
  passThreshold: number;
  startedAt: string;
}

interface ReviewItem {
  index: number;
  question: string;
  options: string[];
  userAnswer: "A" | "B" | "C" | "D" | null;
  correctAnswer: "A" | "B" | "C" | "D";
  isCorrect: boolean;
  explanation?: string;
}

interface SubmitResponse {
  attemptId: string;
  score: number;
  total: number;
  passed: boolean;
  passThreshold: number;
  submittedAt: string;
  review: ReviewItem[];
  certificate: { id: string; verificationCode: string } | null;
}

type Letter = "A" | "B" | "C" | "D";

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

function formatCooldown(untilIso: string): string {
  const diffMs = new Date(untilIso).getTime() - Date.now();
  if (diffMs <= 0) return "maintenant";
  const minutes = Math.ceil(diffMs / 60000);
  if (minutes < 60) return `dans ${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `dans ${h}h` : `dans ${h}h${m.toString().padStart(2, "0")}`;
}

function formatDateFr(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ----------------------------------------------------------------------
// Page
// ----------------------------------------------------------------------

export default function FinalQuizViewer() {
  const { courseId } = useParams<{ courseId: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // UI state : 'landing' | 'in-progress' | 'results'
  const [phase, setPhase] = useState<"landing" | "in-progress" | "results">("landing");
  const [attempt, setAttempt] = useState<StartResponse | null>(null);
  const [answers, setAnswers] = useState<Record<number, Letter>>({});
  const [result, setResult] = useState<SubmitResponse | null>(null);

  // ------ Status query ------
  const {
    data: status,
    isLoading: statusLoading,
    error: statusError,
    refetch: refetchStatus,
  } = useQuery<FinalQuizStatus>({
    queryKey: ["/api/final-quiz", courseId, "status"],
    enabled: !!courseId && phase === "landing",
    retry: (failureCount, err: any) => {
      // Ne pas réessayer si 401/403 (pas connecté / pas inscrit)
      const s = err?.status ?? err?.response?.status;
      if (s === 401 || s === 403) return false;
      return failureCount < 2;
    },
  });

  // ------ Start mutation ------
  const startMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/final-quiz/${courseId}/start`, {});
      return (await res.json()) as StartResponse;
    },
    onSuccess: (data) => {
      setAttempt(data);
      setAnswers({});
      setPhase("in-progress");
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    onError: (err: any) => {
      toast({
        title: "Impossible de démarrer le quiz",
        description: err?.message || "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
      refetchStatus();
    },
  });

  // ------ Submit mutation ------
  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!attempt) throw new Error("Aucune tentative en cours");
      // Constitue le tableau d'answers dans l'ordre des questions
      const answersArray: (Letter | null)[] = attempt.questions.map(
        (_, i) => answers[i] ?? null,
      );
      const res = await apiRequest(
        "POST",
        `/api/final-quiz/attempts/${attempt.attemptId}/submit`,
        { answers: answersArray },
      );
      return (await res.json()) as SubmitResponse;
    },
    onSuccess: (data) => {
      setResult(data);
      setPhase("results");
      // Invalide les caches : statut, enrollments, tableau de bord
      queryClient.invalidateQueries({ queryKey: ["/api/final-quiz", courseId, "status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/formations/my-enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/mon-compte"] });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    onError: (err: any) => {
      toast({
        title: "Impossible de soumettre le quiz",
        description: err?.message || "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
    },
  });

  // ----------------------------------------------------------------------
  // ÉTAT : erreur de chargement du statut (401/403/404/autre)
  // ----------------------------------------------------------------------
  if (statusError && phase === "landing") {
    const s = (statusError as any)?.status ?? (statusError as any)?.response?.status;
    const isAuthErr = s === 401 || s === 403;
    return (
      <div className="container mx-auto p-6 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              {isAuthErr ? "Accès refusé" : "Erreur"}
            </CardTitle>
            <CardDescription>
              {isAuthErr
                ? "Vous devez être inscrit à cette formation pour accéder au quiz de certification."
                : "Impossible de charger le quiz. Veuillez réessayer."}
            </CardDescription>
          </CardHeader>
          <CardFooter className="gap-3">
            <Button variant="outline" onClick={() => navigate("/mon-compte")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à mon compte
            </Button>
            {!isAuthErr && (
              <Button onClick={() => refetchStatus()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Réessayer
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // ÉTAT : chargement initial
  // ----------------------------------------------------------------------
  if (phase === "landing" && statusLoading) {
    return (
      <div className="container mx-auto p-6 max-w-3xl space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // PHASE : LANDING — statut / historique / démarrage
  // ----------------------------------------------------------------------
  if (phase === "landing" && status) {
    if (!status.exists) {
      return (
        <div className="container mx-auto p-6 max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Quiz de certification indisponible
              </CardTitle>
              <CardDescription>
                {status.message ||
                  "Le quiz de certification n'est pas encore disponible pour cette formation. Notre équipe est en train de le préparer — revenez bientôt !"}
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button variant="outline" onClick={() => navigate("/mon-compte")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à mon compte
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    const cooldownActive = !!status.cooldownUntil && new Date(status.cooldownUntil) > new Date();
    const recent = status.recentAttempts || [];

    return (
      <div className="container mx-auto p-6 max-w-3xl space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Award className="h-6 w-6 text-primary" />
                  Quiz de certification
                </CardTitle>
                <CardDescription className="mt-2">
                  Validez vos connaissances et obtenez votre certificat de réussite Kemet Services.
                </CardDescription>
              </div>
              {status.hasPassed && (
                <Badge variant="default" className="bg-green-600 shrink-0" data-testid="badge-already-passed">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Réussi
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Règles du quiz */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border bg-card">
                <p className="text-xs text-muted-foreground">Questions</p>
                <p className="text-2xl font-bold" data-testid="text-questions-count">
                  {status.questionsPerAttempt}
                </p>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <p className="text-xs text-muted-foreground">Note de passage</p>
                <p className="text-2xl font-bold" data-testid="text-pass-threshold">
                  {status.passThreshold} / {status.questionsPerAttempt}
                </p>
              </div>
              <div className="p-4 rounded-lg border bg-card col-span-2 sm:col-span-1">
                <p className="text-xs text-muted-foreground">Tentatives</p>
                <p className="text-2xl font-bold" data-testid="text-total-attempts">
                  {status.totalAttempts ?? 0}
                </p>
              </div>
            </div>

            {/* Infos règles */}
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• Les questions et les réponses sont tirées au sort à chaque tentative.</p>
              <p>• Retries illimités, mais <strong>1h de délai</strong> entre deux tentatives.</p>
              <p>• Votre certificat est émis dès que vous passez la note de réussite.</p>
            </div>

            {/* Cooldown */}
            {cooldownActive && (
              <div
                className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-start gap-3"
                data-testid="cooldown-banner"
              >
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-900 dark:text-amber-200">
                    Une tentative est déjà en cours de délai
                  </p>
                  <p className="text-amber-800 dark:text-amber-300 mt-1">
                    Vous pourrez relancer le quiz {formatCooldown(status.cooldownUntil!)}.
                  </p>
                </div>
              </div>
            )}

            {/* Historique récent */}
            {recent.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Tentatives récentes</h3>
                  {status.bestScore !== null && status.bestScore !== undefined && (
                    <Badge variant="secondary" data-testid="badge-best-score">
                      Meilleur : {status.bestScore} / {status.questionsPerAttempt}
                    </Badge>
                  )}
                </div>
                <div className="space-y-2">
                  {recent.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card"
                      data-testid={`recent-attempt-${a.id}`}
                    >
                      <div className="text-sm">
                        <p className="font-medium">
                          {a.submittedAt ? formatDateFr(a.submittedAt) : formatDateFr(a.startedAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">
                          {a.score !== null ? `${a.score} / ${status.questionsPerAttempt}` : "—"}
                        </span>
                        {a.passed === true ? (
                          <Badge className="bg-green-600">Réussi</Badge>
                        ) : a.passed === false ? (
                          <Badge variant="destructive">Échoué</Badge>
                        ) : (
                          <Badge variant="outline">En cours</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="gap-3">
            <Button variant="outline" onClick={() => navigate("/mon-compte")} data-testid="button-back">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <Button
              onClick={() => startMutation.mutate()}
              disabled={cooldownActive || startMutation.isPending}
              data-testid="button-start-final-quiz"
            >
              {startMutation.isPending
                ? "Démarrage..."
                : status.totalAttempts && status.totalAttempts > 0
                  ? "Nouvelle tentative"
                  : "Commencer le quiz"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // PHASE : IN-PROGRESS — questions en cours
  // ----------------------------------------------------------------------
  if (phase === "in-progress" && attempt) {
    const total = attempt.questions.length;
    const answeredCount = Object.keys(answers).length;
    const progressPercent = total > 0 ? (answeredCount / total) * 100 : 0;
    const allAnswered = answeredCount === total;

    const handleSubmit = () => {
      if (!allAnswered) {
        toast({
          title: "Questions non répondues",
          description: `Il reste ${total - answeredCount} question(s) sans réponse.`,
          variant: "destructive",
        });
        return;
      }
      submitMutation.mutate();
    };

    return (
      <div className="container mx-auto p-6 max-w-3xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Award className="h-6 w-6 text-primary" />
              Quiz de certification
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Score requis pour réussir : <strong>{attempt.passThreshold} / {total}</strong>
            </p>
          </div>
          <Badge variant="secondary" data-testid="badge-progress">
            {answeredCount} / {total}
          </Badge>
        </div>

        {/* Progress */}
        <Progress value={progressPercent} data-testid="progress-quiz" />

        {/* Questions */}
        <div className="space-y-4">
          {attempt.questions.map((q, i) => {
            const selected = answers[i];
            return (
              <Card key={i} data-testid={`question-card-${i}`}>
                <CardHeader>
                  <CardTitle className="text-base">
                    <span className="text-muted-foreground mr-2">Question {i + 1}</span>
                  </CardTitle>
                  <CardDescription className="text-base text-foreground mt-2">
                    {q.question}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={selected || ""}
                    onValueChange={(v) =>
                      setAnswers((prev) => ({ ...prev, [i]: v as Letter }))
                    }
                    data-testid={`radio-group-q-${i}`}
                  >
                    {q.options.map((opt, optIdx) => {
                      const letter = (["A", "B", "C", "D"] as const)[optIdx];
                      return (
                        <div
                          key={letter}
                          className="flex items-start space-x-2 p-3 rounded-lg hover-elevate"
                        >
                          <RadioGroupItem
                            value={letter}
                            id={`q${i}-${letter}`}
                            data-testid={`radio-q${i}-${letter}`}
                            className="mt-1"
                          />
                          <Label
                            htmlFor={`q${i}-${letter}`}
                            className="flex-1 cursor-pointer"
                          >
                            {opt}
                          </Label>
                        </div>
                      );
                    })}
                  </RadioGroup>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Submit bar */}
        <Card>
          <CardContent className="pt-6 flex items-center justify-between gap-4 flex-wrap">
            <p className="text-sm text-muted-foreground">
              {allAnswered
                ? "Toutes les questions sont répondues. Vous pouvez soumettre."
                : `Il reste ${total - answeredCount} question(s) sans réponse.`}
            </p>
            <Button
              onClick={handleSubmit}
              disabled={submitMutation.isPending || !allAnswered}
              size="lg"
              data-testid="button-submit-final-quiz"
            >
              {submitMutation.isPending ? "Soumission..." : "Soumettre le quiz"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // PHASE : RESULTS — score + review + certificat
  // ----------------------------------------------------------------------
  if (phase === "results" && result) {
    return (
      <div className="container mx-auto p-6 max-w-3xl space-y-6">
        {/* En-tête résultat */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  {result.passed ? (
                    <CheckCircle2 className="h-7 w-7 text-green-600" />
                  ) : (
                    <XCircle className="h-7 w-7 text-destructive" />
                  )}
                  {result.passed ? "Quiz réussi !" : "Quiz échoué"}
                </CardTitle>
                <CardDescription className="mt-2">
                  {result.passed
                    ? "Félicitations ! Vous avez atteint la note de réussite."
                    : `Vous n'avez pas atteint la note de réussite (${result.passThreshold} / ${result.total}).`}
                </CardDescription>
              </div>
              <Badge
                variant={result.passed ? "default" : "destructive"}
                className={`text-lg px-4 py-2 shrink-0 ${result.passed ? "bg-green-600" : ""}`}
                data-testid="badge-final-score"
              >
                {result.score} / {result.total}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.passed && result.certificate && (
              <div
                className="p-5 rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/40 dark:to-amber-900/30 border border-amber-200 dark:border-amber-800"
                data-testid="certificate-card"
              >
                <div className="flex items-start gap-3">
                  <Award className="h-6 w-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-2 flex-1">
                    <p className="font-semibold text-amber-900 dark:text-amber-100">
                      Votre certificat est émis
                    </p>
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      Code de vérification :
                    </p>
                    <code
                      className="block text-base font-mono font-bold text-amber-900 dark:text-amber-100 bg-white/60 dark:bg-black/20 px-3 py-2 rounded border border-amber-200 dark:border-amber-700"
                      data-testid="text-verification-code"
                    >
                      {result.certificate.verificationCode}
                    </code>
                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-2">
                      Vous recevrez votre certificat PDF par email dans les prochaines minutes.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!result.passed && (
              <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Vous pouvez retenter le quiz après un délai d'<strong>1h</strong>.
                  Révisez les questions ci-dessous pour vous préparer.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Review détaillée */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Correction détaillée</h2>
          {result.review.map((r) => (
            <Card
              key={r.index}
              className={
                r.isCorrect
                  ? "border-green-200 dark:border-green-800"
                  : "border-red-200 dark:border-red-800"
              }
              data-testid={`review-card-${r.index}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-base">Question {r.index + 1}</CardTitle>
                  {r.isCorrect ? (
                    <Badge className="bg-green-600">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Correcte
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="h-3 w-3 mr-1" />
                      Incorrecte
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-base text-foreground mt-2">
                  {r.question}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Options avec mise en évidence */}
                <div className="space-y-2">
                  {r.options.map((opt, optIdx) => {
                    const letter = (["A", "B", "C", "D"] as const)[optIdx];
                    const isCorrect = letter === r.correctAnswer;
                    const isUser = letter === r.userAnswer;
                    let classes = "p-3 rounded-lg border ";
                    if (isCorrect) {
                      classes += "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800";
                    } else if (isUser && !isCorrect) {
                      classes += "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800";
                    } else {
                      classes += "bg-card";
                    }
                    return (
                      <div key={letter} className={classes}>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm">{opt}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            {isUser && (
                              <Badge variant="outline" className="text-xs">
                                Votre réponse
                              </Badge>
                            )}
                            {isCorrect && (
                              <Badge className="bg-green-600 text-xs">
                                Bonne réponse
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {r.userAnswer === null && (
                    <p className="text-sm text-muted-foreground italic">
                      Vous n'avez pas répondu à cette question.
                    </p>
                  )}
                </div>

                {/* Explication */}
                {r.explanation && (
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                      Explication
                    </p>
                    <p className="text-sm">{r.explanation}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Actions */}
        <Card>
          <CardFooter className="pt-6 gap-3 flex-wrap">
            <Button
              variant="outline"
              onClick={() => navigate("/mon-compte")}
              data-testid="button-back-account"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à mon compte
            </Button>
            {!result.passed && (
              <Button
                onClick={() => {
                  // Retour à la landing — le statut récupéré affichera le cooldown
                  setPhase("landing");
                  setAttempt(null);
                  setResult(null);
                  setAnswers({});
                  refetchStatus();
                }}
                data-testid="button-try-again"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Voir les prochaines tentatives
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Fallback (ne devrait pas arriver en prod)
  return null;
}
