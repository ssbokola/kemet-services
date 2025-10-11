import { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  HelpCircle,
  CheckCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Quiz {
  id: string;
  lessonId?: string;
  courseId?: string;
  title: string;
  description: string;
  passingScore: number;
  timeLimit: number | null;
  maxAttempts: number | null;
  isFinalQuiz: boolean;
  order: number;
  isPublished: boolean;
}

interface Question {
  id: string;
  quizId: string;
  questionText: string;
  questionType: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  points: number;
  order: number;
}

export default function AdminQuizManager() {
  const [, navigate] = useLocation();
  const [, params] = useRoute('/admin/lessons/:lessonId/quiz');
  const lessonId = params?.lessonId;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [quizDialog, setQuizDialog] = useState(false);
  const [questionDialog, setQuestionDialog] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    passingScore: 70,
    timeLimit: null as number | null,
    maxAttempts: null as number | null,
    isPublished: false,
  });

  const [questionForm, setQuestionForm] = useState({
    questionText: '',
    questionType: 'multiple_choice',
    options: ['', '', '', ''],
    correctAnswer: '0',
    explanation: '',
    points: 1,
  });

  // Auth guard
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
  }, [navigate]);

  // Fetch quizzes for this lesson
  const { data: quizzes, isLoading: quizzesLoading } = useQuery<Quiz[]>({
    queryKey: ['/api/admin/quizzes', lessonId],
    queryFn: async () => {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/quizzes?lessonId=${lessonId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Erreur de chargement');
      return response.json();
    },
    enabled: !!lessonId,
  });

  // Fetch questions for selected quiz
  const { data: questions } = useQuery<Question[]>({
    queryKey: ['/api/admin/quiz-questions', selectedQuiz?.id],
    queryFn: async () => {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/quiz-questions?quizId=${selectedQuiz?.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Erreur de chargement');
      return response.json();
    },
    enabled: !!selectedQuiz?.id,
  });

  // Create Quiz mutation
  const createQuizMutation = useMutation({
    mutationFn: async (data: typeof quizForm) => {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/quizzes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...data, lessonId, order: quizzes?.length || 0 }),
      });
      if (!response.ok) throw new Error('Erreur de création');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/quizzes', lessonId] });
      setQuizDialog(false);
      setQuizForm({ title: '', description: '', passingScore: 70, timeLimit: null, maxAttempts: null, isPublished: false });
      toast({ title: 'Quiz créé avec succès' });
    },
  });

  // Update Quiz mutation
  const updateQuizMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof quizForm> }) => {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/quizzes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Erreur de mise à jour');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/quizzes', lessonId] });
      setQuizDialog(false);
      setSelectedQuiz(null);
      toast({ title: 'Quiz mis à jour avec succès' });
    },
  });

  // Delete Quiz mutation
  const deleteQuizMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/quizzes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Erreur de suppression');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/quizzes', lessonId] });
      toast({ title: 'Quiz supprimé avec succès' });
    },
  });

  // Create Question mutation
  const createQuestionMutation = useMutation({
    mutationFn: async (data: typeof questionForm) => {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/quiz-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...data, quizId: selectedQuiz?.id, order: questions?.length || 0 }),
      });
      if (!response.ok) throw new Error('Erreur de création');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/quiz-questions', selectedQuiz?.id] });
      setQuestionDialog(false);
      setQuestionForm({
        questionText: '',
        questionType: 'multiple_choice',
        options: ['', '', '', ''],
        correctAnswer: '0',
        explanation: '',
        points: 1,
      });
      toast({ title: 'Question créée avec succès' });
    },
  });

  // Update Question mutation
  const updateQuestionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof questionForm> }) => {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/quiz-questions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Erreur de mise à jour');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/quiz-questions', selectedQuiz?.id] });
      setQuestionDialog(false);
      setSelectedQuestion(null);
      toast({ title: 'Question mise à jour avec succès' });
    },
  });

  // Delete Question mutation
  const deleteQuestionMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/quiz-questions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Erreur de suppression');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/quiz-questions', selectedQuiz?.id] });
      toast({ title: 'Question supprimée avec succès' });
    },
  });

  const handleEditQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setQuizForm({
      title: quiz.title,
      description: quiz.description,
      passingScore: quiz.passingScore,
      timeLimit: quiz.timeLimit,
      maxAttempts: quiz.maxAttempts,
      isPublished: quiz.isPublished,
    });
    setQuizDialog(true);
  };

  const handleEditQuestion = (question: Question) => {
    setSelectedQuestion(question);
    setQuestionForm({
      questionText: question.questionText,
      questionType: question.questionType,
      options: question.options || ['', '', '', ''],
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      points: question.points,
    });
    setQuestionDialog(true);
  };

  if (quizzesLoading) {
    return <div className="p-8">Chargement...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => window.history.back()}
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Gestion des Quiz</h1>
            <p className="text-muted-foreground">Créez des quiz et questions pour évaluer vos apprenants</p>
          </div>
        </div>
        <Button
          onClick={() => {
            setSelectedQuiz(null);
            setQuizForm({ title: '', description: '', passingScore: 70, timeLimit: null, maxAttempts: null, isPublished: false });
            setQuizDialog(true);
          }}
          data-testid="button-add-quiz"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau quiz
        </Button>
      </div>

      {/* Quizzes List */}
      <div className="grid gap-4">
        {quizzes && quizzes.length > 0 ? (
          quizzes.map((quiz) => (
            <Card key={quiz.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {quiz.title}
                      <Badge variant={quiz.isPublished ? "default" : "secondary"}>
                        {quiz.isPublished ? "Publié" : "Brouillon"}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{quiz.description}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditQuiz(quiz)}
                      data-testid={`button-edit-quiz-${quiz.id}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" data-testid={`button-delete-quiz-${quiz.id}`}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer ce quiz ? Toutes les questions associées seront également supprimées.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteQuizMutation.mutate(quiz.id)}
                            data-testid="button-confirm-delete-quiz"
                          >
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Score minimum:</span>
                    <span className="ml-2 font-medium">{quiz.passingScore}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Durée:</span>
                    <span className="ml-2 font-medium">{quiz.timeLimit ? `${quiz.timeLimit} min` : 'Illimitée'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tentatives:</span>
                    <span className="ml-2 font-medium">{quiz.maxAttempts || 'Illimitées'}</span>
                  </div>
                </div>

                {/* Questions Section */}
                <div className="mt-4 border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <HelpCircle className="w-4 h-4" />
                      Questions ({questions?.length || 0})
                    </h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedQuiz(quiz);
                        setSelectedQuestion(null);
                        setQuestionForm({
                          questionText: '',
                          questionType: 'multiple_choice',
                          options: ['', '', '', ''],
                          correctAnswer: '0',
                          explanation: '',
                          points: 1,
                        });
                        setQuestionDialog(true);
                      }}
                      data-testid={`button-add-question-${quiz.id}`}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Ajouter une question
                    </Button>
                  </div>

                  {selectedQuiz?.id === quiz.id && questions && questions.length > 0 ? (
                    <div className="space-y-2">
                      {questions.map((question) => (
                        <div key={question.id} className="flex items-start justify-between p-3 bg-muted/30 rounded-md">
                          <div className="flex-1">
                            <p className="font-medium">{question.questionText}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline">{question.questionType}</Badge>
                              <span className="text-sm text-muted-foreground">{question.points} pt(s)</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditQuestion(question)}
                              data-testid={`button-edit-question-${question.id}`}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" data-testid={`button-delete-question-${question.id}`}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Êtes-vous sûr de vouloir supprimer cette question ?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteQuestionMutation.mutate(question.id)}
                                    data-testid="button-confirm-delete-question"
                                  >
                                    Supprimer
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : selectedQuiz?.id === quiz.id ? (
                    <p className="text-sm text-muted-foreground py-4">Aucune question. Commencez par en créer une.</p>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedQuiz(quiz)}
                      data-testid={`button-view-questions-${quiz.id}`}
                    >
                      Voir les questions
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-8">
              <p className="text-muted-foreground text-center">
                Aucun quiz. Créez un quiz pour évaluer vos apprenants.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quiz Dialog */}
      <Dialog open={quizDialog} onOpenChange={setQuizDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedQuiz ? 'Modifier le quiz' : 'Nouveau quiz'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="quiz-title">Titre</Label>
              <Input
                id="quiz-title"
                value={quizForm.title}
                onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                data-testid="input-quiz-title"
              />
            </div>
            <div>
              <Label htmlFor="quiz-description">Description</Label>
              <Textarea
                id="quiz-description"
                value={quizForm.description}
                onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                data-testid="input-quiz-description"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="quiz-passing">Score minimum (%)</Label>
                <Input
                  id="quiz-passing"
                  type="number"
                  min="0"
                  max="100"
                  value={quizForm.passingScore}
                  onChange={(e) => setQuizForm({ ...quizForm, passingScore: parseInt(e.target.value) })}
                  data-testid="input-quiz-passing"
                />
              </div>
              <div>
                <Label htmlFor="quiz-time">Durée (min)</Label>
                <Input
                  id="quiz-time"
                  type="number"
                  value={quizForm.timeLimit || ''}
                  onChange={(e) => setQuizForm({ ...quizForm, timeLimit: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder="Illimitée"
                  data-testid="input-quiz-time"
                />
              </div>
              <div>
                <Label htmlFor="quiz-attempts">Tentatives max</Label>
                <Input
                  id="quiz-attempts"
                  type="number"
                  value={quizForm.maxAttempts || ''}
                  onChange={(e) => setQuizForm({ ...quizForm, maxAttempts: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder="Illimitées"
                  data-testid="input-quiz-attempts"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="quiz-published"
                checked={quizForm.isPublished}
                onChange={(e) => setQuizForm({ ...quizForm, isPublished: e.target.checked })}
                data-testid="input-quiz-published"
              />
              <Label htmlFor="quiz-published">Publier le quiz</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                if (selectedQuiz) {
                  updateQuizMutation.mutate({ id: selectedQuiz.id, data: quizForm });
                } else {
                  createQuizMutation.mutate(quizForm);
                }
              }}
              disabled={createQuizMutation.isPending || updateQuizMutation.isPending}
              data-testid="button-save-quiz"
            >
              {selectedQuiz ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Question Dialog */}
      <Dialog open={questionDialog} onOpenChange={setQuestionDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedQuestion ? 'Modifier la question' : 'Nouvelle question'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="question-text">Question</Label>
              <Textarea
                id="question-text"
                value={questionForm.questionText}
                onChange={(e) => setQuestionForm({ ...questionForm, questionText: e.target.value })}
                rows={3}
                data-testid="input-question-text"
              />
            </div>
            <div>
              <Label>Type de question</Label>
              <select
                className="w-full p-2 border rounded-md"
                value={questionForm.questionType}
                onChange={(e) => setQuestionForm({ ...questionForm, questionType: e.target.value })}
                data-testid="select-question-type"
              >
                <option value="multiple_choice">Choix multiple</option>
                <option value="true_false">Vrai/Faux</option>
                <option value="short_answer">Réponse courte</option>
              </select>
            </div>
            {questionForm.questionType === 'multiple_choice' && (
              <div className="space-y-2">
                <Label>Options de réponse</Label>
                {questionForm.options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...questionForm.options];
                        newOptions[index] = e.target.value;
                        setQuestionForm({ ...questionForm, options: newOptions });
                      }}
                      placeholder={`Option ${index + 1}`}
                      data-testid={`input-option-${index}`}
                    />
                    <input
                      type="radio"
                      name="correct-answer"
                      checked={questionForm.correctAnswer === index.toString()}
                      onChange={() => setQuestionForm({ ...questionForm, correctAnswer: index.toString() })}
                      data-testid={`radio-correct-${index}`}
                    />
                  </div>
                ))}
              </div>
            )}
            <div>
              <Label htmlFor="question-explanation">Explication (optionnel)</Label>
              <Textarea
                id="question-explanation"
                value={questionForm.explanation}
                onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                rows={2}
                placeholder="Explication affichée après la réponse..."
                data-testid="input-question-explanation"
              />
            </div>
            <div>
              <Label htmlFor="question-points">Points</Label>
              <Input
                id="question-points"
                type="number"
                min="1"
                value={questionForm.points}
                onChange={(e) => setQuestionForm({ ...questionForm, points: parseInt(e.target.value) })}
                data-testid="input-question-points"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                if (selectedQuestion) {
                  updateQuestionMutation.mutate({ id: selectedQuestion.id, data: questionForm });
                } else {
                  createQuestionMutation.mutate(questionForm);
                }
              }}
              disabled={createQuestionMutation.isPending || updateQuestionMutation.isPending}
              data-testid="button-save-question"
            >
              {selectedQuestion ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
