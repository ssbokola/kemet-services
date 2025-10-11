import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Clock, AlertCircle, CheckCircle2, XCircle } from "lucide-react";

interface QuizQuestion {
  id: string;
  questionText: string;
  questionType: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: string[];
  points: number;
  order: number;
}

interface Quiz {
  id: string;
  title: string;
  description?: string;
  passingScore: number;
  timeLimit?: number;
  maxAttempts?: number;
  isFinalQuiz: boolean;
  questions: QuizQuestion[];
}

export default function QuizViewer() {
  const { quizId } = useParams<{ quizId: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [quizResult, setQuizResult] = useState<any>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const isSubmittingRef = useRef(false);

  // Fetch quiz data
  const { data: quizData, isLoading } = useQuery<{ success: boolean; quiz: Quiz }>({
    queryKey: ['/api/quizzes', quizId],
  });

  // Fetch previous attempts
  const { data: resultsData, isLoading: isLoadingResults, error: resultsError } = useQuery<{ success: boolean; results: any[]; bestResult: any }>({
    queryKey: ['/api/quizzes', quizId, 'results'],
    enabled: !!quizId,
  });

  const quiz = quizData?.quiz;
  const previousAttempts = resultsData?.results || [];
  const bestResult = resultsData?.bestResult;
  const hasResultsError = !!resultsError;

  // Submit quiz mutation
  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!startedAt) throw new Error("Quiz non démarré");
      
      // Calculate time spent: use timer if available, otherwise wall-clock delta
      const timeSpent = (quiz?.timeLimit && timeRemaining !== null)
        ? (quiz.timeLimit * 60 - timeRemaining)
        : Math.floor((new Date().getTime() - new Date(startedAt).getTime()) / 1000);

      // Normalize short answer responses (trim whitespace)
      const normalizedAnswers = Object.entries(answers).reduce((acc, [questionId, answer]) => {
        const question = quiz?.questions.find(q => q.id === questionId);
        if (question?.questionType === 'short_answer') {
          acc[questionId] = answer.trim();
        } else {
          acc[questionId] = answer;
        }
        return acc;
      }, {} as Record<string, string>);

      const response = await apiRequest(
        'POST',
        `/api/quizzes/${quizId}/submit`,
        {
          answers: normalizedAnswers,
          startedAt,
          timeSpent,
        }
      );
      const data = await response.json();
      return data;
    },
    onSuccess: (data: any) => {
      isSubmittingRef.current = false;
      setQuizResult(data.result);
      setShowResults(true);
      queryClient.invalidateQueries({ queryKey: ['/api/quizzes', quizId, 'results'] });
      queryClient.invalidateQueries({ queryKey: ['/api/mon-compte'] });
      queryClient.invalidateQueries({ queryKey: ['/api/formations/my-enrollments'] });
    },
    onError: (error: any) => {
      isSubmittingRef.current = false;
      toast({
        title: "Erreur",
        description: error.message || "Impossible de soumettre le quiz.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = useCallback((isTimedOut = false) => {
    // Prevent double submission
    if (isSubmittingRef.current) return;
    
    // Check if all questions are answered (only if NOT timed out)
    const unanswered = quiz?.questions.filter(q => !answers[q.id]) || [];
    
    if (!isTimedOut && unanswered.length > 0) {
      toast({
        title: "Questions non répondues",
        description: `Il reste ${unanswered.length} question(s) sans réponse.`,
        variant: "destructive",
      });
      return;
    }

    isSubmittingRef.current = true;
    submitMutation.mutate();
  }, [quiz?.questions, answers, submitMutation, toast]);

  // Initialize timer when quiz starts
  useEffect(() => {
    if (quiz?.timeLimit && hasStarted && timeRemaining === null) {
      setTimeRemaining(quiz.timeLimit * 60); // Convert minutes to seconds
    }
  }, [quiz?.timeLimit, hasStarted, timeRemaining]);

  // Timer countdown with auto-submit
  useEffect(() => {
    if (!hasStarted || timeRemaining === null || timeRemaining <= 0 || showResults || isSubmittingRef.current) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 1) {
          // Auto-submit when time runs out (force submit even with unanswered questions)
          if (!isSubmittingRef.current) {
            handleSubmit(true); // true = isTimedOut
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, showResults, handleSubmit]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = quiz?.questions.length || 0;
  const progressPercent = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Quiz non trouvé
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Le quiz que vous recherchez n'existe pas ou a été supprimé.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate('/mon-compte')} data-testid="button-back-dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au tableau de bord
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Show results page
  if (showResults && quizResult) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {quizResult.passed ? (
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  ) : (
                    <XCircle className="h-6 w-6 text-destructive" />
                  )}
                  {quizResult.passed ? 'Quiz réussi !' : 'Quiz échoué'}
                </CardTitle>
                <CardDescription className="mt-2">{quiz.title}</CardDescription>
              </div>
              <Badge variant={quizResult.passed ? "default" : "destructive"} className="text-lg px-4 py-2">
                {quizResult.score}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border bg-card">
                <p className="text-sm text-muted-foreground">Score obtenu</p>
                <p className="text-2xl font-bold" data-testid="text-score-earned">
                  {quizResult.earnedPoints} / {quizResult.totalPoints} points
                </p>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <p className="text-sm text-muted-foreground">Note requise</p>
                <p className="text-2xl font-bold">{quiz.passingScore}%</p>
              </div>
            </div>

            {quizResult.passed ? (
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                <p className="text-green-800 dark:text-green-200">
                  Félicitations ! Vous avez réussi le quiz avec un score de {quizResult.score}%.
                  {quiz.isFinalQuiz && " Vous avez terminé la formation avec succès !"}
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
                <p className="text-amber-800 dark:text-amber-200">
                  Vous n'avez pas atteint le score requis ({quiz.passingScore}%). 
                  {quiz.maxAttempts && ` Tentative ${quizResult.attemptNumber} sur ${quiz.maxAttempts}.`}
                  {(!quiz.maxAttempts || quizResult.attemptNumber < quiz.maxAttempts) && 
                    " Vous pouvez réessayer pour améliorer votre score."}
                </p>
              </div>
            )}

            {/* Detailed Results */}
            {quizResult.questions && quizResult.questions.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Détails des réponses</h3>
                {quizResult.questions
                  .sort((a: any, b: any) => a.order - b.order)
                  .map((question: any, index: number) => (
                    <Card key={question.id} className={question.isCorrect ? "border-green-200 dark:border-green-800" : "border-amber-200 dark:border-amber-800"}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-base">
                            Question {index + 1}
                          </CardTitle>
                          {question.isCorrect ? (
                            <Badge variant="default" className="bg-green-600">
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
                        <CardDescription className="mt-2">{question.questionText}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {/* User Answer */}
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Votre réponse :</p>
                          <p className="text-sm" data-testid={`text-user-answer-${question.id}`}>
                            {question.questionType === 'multiple_choice' && question.options 
                              ? question.options[parseInt(question.userAnswer)] || "Non répondu"
                              : question.questionType === 'true_false'
                                ? question.userAnswer === 'true' ? 'Vrai' : question.userAnswer === 'false' ? 'Faux' : "Non répondu"
                                : question.userAnswer || "Non répondu"}
                          </p>
                        </div>

                        {/* Correct Answer (if incorrect) */}
                        {!question.isCorrect && (
                          <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                            <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">Bonne réponse :</p>
                            <p className="text-sm text-green-700 dark:text-green-300" data-testid={`text-correct-answer-${question.id}`}>
                              {question.questionType === 'multiple_choice' && question.options 
                                ? question.options[parseInt(question.correctAnswer)]
                                : question.questionType === 'true_false'
                                  ? question.correctAnswer === 'true' ? 'Vrai' : 'Faux'
                                  : question.correctAnswer}
                            </p>
                          </div>
                        )}

                        {/* Explanation */}
                        {question.explanation && (
                          <div className="p-3 rounded-lg bg-muted">
                            <p className="text-sm font-medium mb-1">Explication :</p>
                            <p className="text-sm text-muted-foreground">{question.explanation}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex gap-3">
            <Button 
              onClick={() => navigate('/mon-compte')} 
              variant="outline"
              data-testid="button-back-dashboard"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au tableau de bord
            </Button>
            {!quizResult.passed && (!quiz.maxAttempts || quizResult.attemptNumber < quiz.maxAttempts) && (
              <Button 
                onClick={() => window.location.reload()}
                data-testid="button-retry-quiz"
              >
                Réessayer le quiz
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Show initial screen with history
  if (!hasStarted) {
    // Allow starting quiz even if results failed to load
    const canAttempt = !quiz.maxAttempts || previousAttempts.length < quiz.maxAttempts;
    const showHistory = !isLoadingResults && !hasResultsError && previousAttempts.length > 0;

    return (
      <div className="container mx-auto p-6 max-w-4xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{quiz.title}</CardTitle>
            {quiz.description && (
              <CardDescription>{quiz.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border bg-card">
                <p className="text-sm text-muted-foreground">Note de passage</p>
                <p className="text-2xl font-bold">{quiz.passingScore}%</p>
              </div>
              {quiz.timeLimit && (
                <div className="p-4 rounded-lg border bg-card">
                  <p className="text-sm text-muted-foreground">Temps limité</p>
                  <p className="text-2xl font-bold">{quiz.timeLimit} min</p>
                </div>
              )}
            </div>

            {/* Show error message if history failed to load but allow quiz start */}
            {hasResultsError && (
              <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Impossible de charger l'historique des tentatives. Vous pouvez quand même commencer le quiz.
                </p>
              </div>
            )}

            {/* Show loading state for history */}
            {isLoadingResults && (
              <div className="space-y-3">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            )}

            {showHistory && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Tentatives précédentes</h3>
                  {bestResult && (
                    <Badge variant={bestResult.passed ? "default" : "secondary"}>
                      Meilleur score: {bestResult.score}%
                    </Badge>
                  )}
                </div>

                <div className="space-y-3">
                  {previousAttempts
                    .sort((a: any, b: any) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
                    .slice(0, 5)
                    .map((attempt: any, index: number) => (
                      <div 
                        key={attempt.id} 
                        className="p-4 rounded-lg border bg-card flex items-center justify-between"
                        data-testid={`attempt-${attempt.id}`}
                      >
                        <div>
                          <p className="font-medium">
                            Tentative {attempt.attemptNumber}
                            {index === 0 && <span className="text-muted-foreground text-sm ml-2">(plus récente)</span>}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(attempt.completedAt).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-2xl font-bold">{attempt.score}%</p>
                            <p className="text-sm text-muted-foreground">{attempt.earnedPoints}/{attempt.totalPoints} pts</p>
                          </div>
                          <Badge variant={attempt.passed ? "default" : "destructive"}>
                            {attempt.passed ? "Réussi" : "Échoué"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>

                {quiz.maxAttempts && (
                  <p className="text-sm text-muted-foreground">
                    Tentatives utilisées : {previousAttempts.length} / {quiz.maxAttempts}
                  </p>
                )}
              </div>
            )}

            {!canAttempt && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive">
                <p className="text-destructive font-medium">
                  Nombre maximum de tentatives atteint ({quiz.maxAttempts})
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex gap-3">
            <Button 
              onClick={() => navigate('/mon-compte')} 
              variant="outline"
              data-testid="button-back-dashboard"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au tableau de bord
            </Button>
            {canAttempt && (
              <Button 
                onClick={() => {
                  setHasStarted(true);
                  setStartedAt(new Date().toISOString());
                }}
                data-testid="button-start-quiz"
              >
                {previousAttempts.length > 0 ? 'Nouvelle tentative' : 'Commencer le quiz'}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Show quiz questions
  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-quiz-title">{quiz.title}</h1>
          {quiz.description && (
            <p className="text-muted-foreground mt-2">{quiz.description}</p>
          )}
        </div>
        {quiz.timeLimit && timeRemaining !== null && (
          <Badge 
            variant={timeRemaining < 60 ? "destructive" : "secondary"}
            className="text-lg px-4 py-2"
            data-testid="badge-timer"
          >
            <Clock className="h-4 w-4 mr-2" />
            {formatTime(timeRemaining)}
          </Badge>
        )}
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progression</span>
          <span className="font-medium" data-testid="text-progress">
            {answeredCount} / {totalQuestions} questions
          </span>
        </div>
        <Progress value={progressPercent} />
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {quiz.questions
          .sort((a, b) => a.order - b.order)
          .map((question, index) => (
            <Card key={question.id}>
              <CardHeader>
                <CardTitle className="text-lg">
                  <span className="text-muted-foreground mr-2">Question {index + 1}</span>
                  <Badge variant="secondary" className="ml-2">
                    {question.points} point{question.points > 1 ? 's' : ''}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  {question.questionText}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {question.questionType === 'multiple_choice' && question.options && (
                  <RadioGroup
                    value={answers[question.id] || ''}
                    onValueChange={(value) => setAnswers({ ...answers, [question.id]: value })}
                    data-testid={`radio-group-question-${question.id}`}
                  >
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center space-x-2 p-3 rounded-lg hover-elevate">
                        <RadioGroupItem 
                          value={optionIndex.toString()} 
                          id={`${question.id}-${optionIndex}`}
                          data-testid={`radio-option-${question.id}-${optionIndex}`}
                        />
                        <Label 
                          htmlFor={`${question.id}-${optionIndex}`}
                          className="flex-1 cursor-pointer"
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {question.questionType === 'true_false' && (
                  <RadioGroup
                    value={answers[question.id] || ''}
                    onValueChange={(value) => setAnswers({ ...answers, [question.id]: value })}
                    data-testid={`radio-group-question-${question.id}`}
                  >
                    <div className="flex items-center space-x-2 p-3 rounded-lg hover-elevate">
                      <RadioGroupItem 
                        value="true" 
                        id={`${question.id}-true`}
                        data-testid={`radio-true-${question.id}`}
                      />
                      <Label htmlFor={`${question.id}-true`} className="flex-1 cursor-pointer">
                        Vrai
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 rounded-lg hover-elevate">
                      <RadioGroupItem 
                        value="false" 
                        id={`${question.id}-false`}
                        data-testid={`radio-false-${question.id}`}
                      />
                      <Label htmlFor={`${question.id}-false`} className="flex-1 cursor-pointer">
                        Faux
                      </Label>
                    </div>
                  </RadioGroup>
                )}

                {question.questionType === 'short_answer' && (
                  <Input
                    value={answers[question.id] || ''}
                    onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
                    placeholder="Votre réponse..."
                    data-testid={`input-answer-${question.id}`}
                  />
                )}
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Submit Button */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              <p>Score requis pour réussir : <span className="font-semibold">{quiz.passingScore}%</span></p>
              {quiz.maxAttempts && (
                <p className="mt-1">Nombre de tentatives maximum : <span className="font-semibold">{quiz.maxAttempts}</span></p>
              )}
            </div>
            <Button
              onClick={() => handleSubmit(false)}
              disabled={submitMutation.isPending || answeredCount < totalQuestions}
              size="lg"
              data-testid="button-submit-quiz"
            >
              {submitMutation.isPending ? 'Soumission...' : 'Soumettre le quiz'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
