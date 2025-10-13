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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  FileText,
  Video,
  CheckCircle,
  Clock,
  HelpCircle,
  List,
  Link as LinkIcon,
  Download,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Module {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  prerequisites: string[];
}

interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  videoUrl: string;
  content: string;
  duration: number;
  order: number;
  isPublished: boolean;
}

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

interface CourseResource {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  type: 'pdf' | 'checklist' | 'template' | 'link' | 'other';
  url: string;
  fileSize: number | null;
  order: number;
  isPublished: boolean;
  createdAt: string;
}

interface CourseWithContent {
  id: string;
  title: string;
  modules: (Module & { lessons: Lesson[]; quizzes: Quiz[] })[];
  finalQuiz?: Quiz;
}

export default function AdminCourseContent() {
  const [, navigate] = useLocation();
  const [, params] = useRoute('/admin/courses/:id/content');
  const courseId = params?.id;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // States for dialogs
  const [moduleDialog, setModuleDialog] = useState(false);
  const [lessonDialog, setLessonDialog] = useState(false);
  const [quizDialog, setQuizDialog] = useState(false);
  const [questionDialog, setQuestionDialog] = useState(false);
  const [resourceDialog, setResourceDialog] = useState(false);

  // States for editing
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [selectedResource, setSelectedResource] = useState<CourseResource | null>(null);

  // States for forms
  const [moduleForm, setModuleForm] = useState({
    title: '',
    description: '',
    order: 0,
  });

  const [lessonForm, setLessonForm] = useState({
    moduleId: '',
    title: '',
    description: '',
    videoUrl: '',
    content: '',
    duration: 0,
    order: 0,
    isPublished: false,
  });

  const [quizForm, setQuizForm] = useState({
    lessonId: '',
    courseId: '',
    title: '',
    description: '',
    passingScore: 70,
    timeLimit: null as number | null,
    maxAttempts: null as number | null,
    isFinalQuiz: false,
    order: 0,
    isPublished: false,
  });

  const [questionForm, setQuestionForm] = useState({
    quizId: '',
    questionText: '',
    questionType: 'multiple_choice',
    options: ['', '', '', ''],
    correctAnswer: '0',
    explanation: '',
    points: 1,
    order: 0,
  });

  const [resourceForm, setResourceForm] = useState({
    title: '',
    description: '',
    type: 'link' as 'pdf' | 'checklist' | 'template' | 'link' | 'other',
    url: '',
    order: 0,
    isPublished: true,
  });

  // Auth guard
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
  }, [navigate]);

  // Fetch course with modules, lessons, and quizzes
  const { data: course, isLoading } = useQuery<CourseWithContent>({
    queryKey: ['/api/admin/courses', courseId],
    queryFn: async () => {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Erreur de chargement');
      return response.json();
    },
    enabled: !!courseId,
  });

  // Create Module mutation
  const createModuleMutation = useMutation({
    mutationFn: async (data: typeof moduleForm) => {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/modules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...data, courseId }),
      });
      if (!response.ok) throw new Error('Erreur de création');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/courses', courseId] });
      setModuleDialog(false);
      setModuleForm({ title: '', description: '', order: 0 });
      toast({ title: 'Module créé avec succès' });
    },
  });

  // Update Module mutation
  const updateModuleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof moduleForm> }) => {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/modules/${id}`, {
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
      queryClient.invalidateQueries({ queryKey: ['/api/admin/courses', courseId] });
      setModuleDialog(false);
      setSelectedModule(null);
      toast({ title: 'Module mis à jour avec succès' });
    },
  });

  // Delete Module mutation
  const deleteModuleMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/modules/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Erreur de suppression');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/courses', courseId] });
      toast({ title: 'Module supprimé avec succès' });
    },
  });

  // Similar mutations for Lessons
  const createLessonMutation = useMutation({
    mutationFn: async (data: typeof lessonForm) => {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/lessons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Erreur de création');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/courses', courseId] });
      setLessonDialog(false);
      setLessonForm({
        moduleId: '',
        title: '',
        description: '',
        videoUrl: '',
        content: '',
        duration: 0,
        order: 0,
        isPublished: false,
      });
      toast({ title: 'Leçon créée avec succès' });
    },
  });

  const updateLessonMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof lessonForm> }) => {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/lessons/${id}`, {
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
      queryClient.invalidateQueries({ queryKey: ['/api/admin/courses', courseId] });
      setLessonDialog(false);
      setSelectedLesson(null);
      toast({ title: 'Leçon mise à jour avec succès' });
    },
  });

  const deleteLessonMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/lessons/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Erreur de suppression');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/courses', courseId] });
      toast({ title: 'Leçon supprimée avec succès' });
    },
  });

  // Similar mutations for Quizzes
  const createQuizMutation = useMutation({
    mutationFn: async (data: typeof quizForm) => {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/quizzes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Erreur de création');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/courses', courseId] });
      setQuizDialog(false);
      setQuizForm({
        lessonId: '',
        courseId: '',
        title: '',
        description: '',
        passingScore: 70,
        timeLimit: null,
        maxAttempts: null,
        isFinalQuiz: false,
        order: 0,
        isPublished: false,
      });
      toast({ title: 'Quiz créé avec succès' });
    },
  });

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
      queryClient.invalidateQueries({ queryKey: ['/api/admin/courses', courseId] });
      setQuizDialog(false);
      setSelectedQuiz(null);
      toast({ title: 'Quiz mis à jour avec succès' });
    },
  });

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
      queryClient.invalidateQueries({ queryKey: ['/api/admin/courses', courseId] });
      toast({ title: 'Quiz supprimé avec succès' });
    },
  });

  // Similar mutations for Questions
  const createQuestionMutation = useMutation({
    mutationFn: async (data: typeof questionForm) => {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/quiz-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Erreur de création');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/courses', courseId] });
      setQuestionDialog(false);
      setQuestionForm({
        quizId: '',
        questionText: '',
        questionType: 'multiple_choice',
        options: ['', '', '', ''],
        correctAnswer: '0',
        explanation: '',
        points: 1,
        order: 0,
      });
      toast({ title: 'Question créée avec succès' });
    },
  });

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
      queryClient.invalidateQueries({ queryKey: ['/api/admin/courses', courseId] });
      setQuestionDialog(false);
      setSelectedQuestion(null);
      toast({ title: 'Question mise à jour avec succès' });
    },
  });

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
      queryClient.invalidateQueries({ queryKey: ['/api/admin/courses', courseId] });
      toast({ title: 'Question supprimée avec succès' });
    },
  });

  // Fetch resources
  const { data: resourcesData } = useQuery<{ success: boolean; resources: CourseResource[] }>({
    queryKey: ['/api/admin/resources/course', courseId],
    queryFn: async () => {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/resources/course/${courseId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Erreur de chargement');
      return response.json();
    },
    enabled: !!courseId,
  });

  const resources = resourcesData?.resources || [];

  // Create Resource mutation
  const createResourceMutation = useMutation({
    mutationFn: async (data: typeof resourceForm) => {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...data, courseId }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur de création');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/resources/course', courseId] });
      setResourceDialog(false);
      setResourceForm({ title: '', description: '', type: 'link', url: '', order: 0, isPublished: true });
      toast({ title: 'Ressource créée avec succès' });
    },
    onError: (error: Error) => {
      toast({ 
        title: 'Erreur', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  // Delete Resource mutation
  const deleteResourceMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/resources/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Erreur de suppression');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/resources/course', courseId] });
      toast({ title: 'Ressource supprimée avec succès' });
    },
  });

  const handleEditModule = (module: Module) => {
    setSelectedModule(module);
    setModuleForm({
      title: module.title,
      description: module.description,
      order: module.order,
    });
    setModuleDialog(true);
  };

  const handleEditLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setLessonForm({
      moduleId: lesson.moduleId,
      title: lesson.title,
      description: lesson.description,
      videoUrl: lesson.videoUrl,
      content: lesson.content,
      duration: lesson.duration,
      order: lesson.order,
      isPublished: lesson.isPublished,
    });
    setLessonDialog(true);
  };

  const handleEditQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setQuizForm({
      lessonId: quiz.lessonId || '',
      courseId: quiz.courseId || '',
      title: quiz.title,
      description: quiz.description,
      passingScore: quiz.passingScore,
      timeLimit: quiz.timeLimit,
      maxAttempts: quiz.maxAttempts,
      isFinalQuiz: quiz.isFinalQuiz,
      order: quiz.order,
      isPublished: quiz.isPublished,
    });
    setQuizDialog(true);
  };

  const handleAddModuleClick = () => {
    setSelectedModule(null);
    setModuleForm({ title: '', description: '', order: course?.modules?.length || 0 });
    setModuleDialog(true);
  };

  const handleAddLessonClick = (moduleId: string) => {
    setSelectedLesson(null);
    const module = course?.modules.find(m => m.id === moduleId);
    setLessonForm({
      moduleId,
      title: '',
      description: '',
      videoUrl: '',
      content: '',
      duration: 0,
      order: module?.lessons?.length || 0,
      isPublished: false,
    });
    setLessonDialog(true);
  };

  const handleAddQuizClick = (lessonId?: string) => {
    setSelectedQuiz(null);
    setQuizForm({
      lessonId: lessonId || '',
      courseId: lessonId ? '' : courseId || '',
      title: '',
      description: '',
      passingScore: 70,
      timeLimit: null,
      maxAttempts: null,
      isFinalQuiz: !lessonId,
      order: 0,
      isPublished: false,
    });
    setQuizDialog(true);
  };

  if (isLoading) {
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
            onClick={() => navigate('/admin/courses')}
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{course?.title}</h1>
            <p className="text-muted-foreground">Gestion du contenu pédagogique</p>
          </div>
        </div>
        <Button onClick={handleAddModuleClick} data-testid="button-add-module">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un module
        </Button>
      </div>

      {/* Modules List */}
      <Card>
        <CardHeader>
          <CardTitle>Modules du cours</CardTitle>
          <CardDescription>
            Organisez votre cours en modules et leçons
          </CardDescription>
        </CardHeader>
        <CardContent>
          {course?.modules && course.modules.length > 0 ? (
            <Accordion type="multiple" className="w-full">
              {course.modules.map((module) => (
                <AccordionItem key={module.id} value={module.id}>
                  <AccordionTrigger className="hover-elevate">
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-5 h-5" />
                      <span className="font-medium">{module.title}</span>
                      <Badge variant="outline" className="ml-2">
                        {module.lessons?.length || 0} leçons
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">{module.description}</p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditModule(module)}
                            data-testid={`button-edit-module-${module.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" data-testid={`button-delete-module-${module.id}`}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Êtes-vous sûr de vouloir supprimer ce module ? Toutes les leçons associées seront également supprimées.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteModuleMutation.mutate(module.id)}
                                  data-testid="button-confirm-delete-module"
                                >
                                  Supprimer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>

                      {/* Lessons */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Leçons</h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddLessonClick(module.id)}
                            data-testid={`button-add-lesson-${module.id}`}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Ajouter une leçon
                          </Button>
                        </div>
                        {module.lessons && module.lessons.length > 0 ? (
                          <div className="space-y-2">
                            {module.lessons.map((lesson) => (
                              <div
                                key={lesson.id}
                                className="flex items-center justify-between p-3 bg-muted/30 rounded-md"
                              >
                                <div className="flex items-center gap-3">
                                  <Video className="w-4 h-4" />
                                  <div>
                                    <p className="font-medium">{lesson.title}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {lesson.duration} min
                                      {lesson.isPublished ? (
                                        <Badge variant="outline" className="ml-2">Publié</Badge>
                                      ) : (
                                        <Badge variant="outline" className="ml-2">Brouillon</Badge>
                                      )}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate(`/admin/lessons/${lesson.id}/quiz`)}
                                    data-testid={`button-quiz-lesson-${lesson.id}`}
                                  >
                                    <HelpCircle className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditLesson(lesson)}
                                    data-testid={`button-edit-lesson-${lesson.id}`}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="outline" size="sm" data-testid={`button-delete-lesson-${lesson.id}`}>
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Êtes-vous sûr de vouloir supprimer cette leçon ?
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => deleteLessonMutation.mutate(lesson.id)}
                                          data-testid="button-confirm-delete-lesson"
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
                        ) : (
                          <p className="text-sm text-muted-foreground py-4">Aucune leçon</p>
                        )}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Aucun module. Commencez par en créer un.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Resources Section */}
      <Card data-testid="card-resources">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Supports de cours</CardTitle>
              <CardDescription>
                Ajoutez des liens vers des ressources (PDF, checklists, etc.)
              </CardDescription>
            </div>
            <Button 
              onClick={() => {
                setSelectedResource(null);
                setResourceForm({ 
                  title: '', 
                  description: '', 
                  type: 'link', 
                  url: '', 
                  order: resources.length, 
                  isPublished: true 
                });
                setResourceDialog(true);
              }}
              data-testid="button-add-resource"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une ressource
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {resources && resources.length > 0 ? (
            <div className="space-y-3">
              {resources.map((resource) => (
                <div 
                  key={resource.id} 
                  className="flex items-center justify-between p-3 rounded-lg border hover-elevate"
                  data-testid={`resource-${resource.id}`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                      {resource.type === 'pdf' && <FileText className="w-5 h-5" />}
                      {resource.type === 'checklist' && <CheckCircle className="w-5 h-5" />}
                      {resource.type === 'template' && <FileText className="w-5 h-5" />}
                      {resource.type === 'link' && <LinkIcon className="w-5 h-5" />}
                      {resource.type === 'other' && <Download className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{resource.title}</p>
                        <Badge variant={resource.isPublished ? 'default' : 'outline'}>
                          {resource.isPublished ? 'Publié' : 'Brouillon'}
                        </Badge>
                      </div>
                      {resource.description && (
                        <p className="text-sm text-muted-foreground">{resource.description}</p>
                      )}
                      <a 
                        href={resource.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        {resource.url}
                      </a>
                    </div>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        data-testid={`button-delete-resource-${resource.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                        <AlertDialogDescription>
                          Êtes-vous sûr de vouloir supprimer cette ressource ?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteResourceMutation.mutate(resource.id)}
                          data-testid="button-confirm-delete-resource"
                        >
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Aucune ressource. Ajoutez des supports de cours.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Module Dialog */}
      <Dialog open={moduleDialog} onOpenChange={setModuleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedModule ? 'Modifier le module' : 'Nouveau module'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="module-title">Titre</Label>
              <Input
                id="module-title"
                value={moduleForm.title}
                onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                data-testid="input-module-title"
              />
            </div>
            <div>
              <Label htmlFor="module-description">Description</Label>
              <Textarea
                id="module-description"
                value={moduleForm.description}
                onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                data-testid="input-module-description"
              />
            </div>
            <div>
              <Label htmlFor="module-order">Ordre</Label>
              <Input
                id="module-order"
                type="number"
                value={moduleForm.order}
                onChange={(e) => setModuleForm({ ...moduleForm, order: parseInt(e.target.value) })}
                data-testid="input-module-order"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                if (selectedModule) {
                  updateModuleMutation.mutate({ id: selectedModule.id, data: moduleForm });
                } else {
                  createModuleMutation.mutate(moduleForm);
                }
              }}
              disabled={createModuleMutation.isPending || updateModuleMutation.isPending}
              data-testid="button-save-module"
            >
              {selectedModule ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lesson Dialog */}
      <Dialog open={lessonDialog} onOpenChange={setLessonDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedLesson ? 'Modifier la leçon' : 'Nouvelle leçon'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="lesson-title">Titre</Label>
              <Input
                id="lesson-title"
                value={lessonForm.title}
                onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                data-testid="input-lesson-title"
              />
            </div>
            <div>
              <Label htmlFor="lesson-description">Description</Label>
              <Textarea
                id="lesson-description"
                value={lessonForm.description}
                onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                data-testid="input-lesson-description"
              />
            </div>
            <div>
              <Label htmlFor="lesson-video">URL de la vidéo</Label>
              <Input
                id="lesson-video"
                value={lessonForm.videoUrl}
                onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                placeholder="https://youtube.com/..."
                data-testid="input-lesson-video"
              />
            </div>
            <div>
              <Label htmlFor="lesson-content">Contenu</Label>
              <Textarea
                id="lesson-content"
                value={lessonForm.content}
                onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                rows={5}
                data-testid="input-lesson-content"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lesson-duration">Durée (minutes)</Label>
                <Input
                  id="lesson-duration"
                  type="number"
                  value={lessonForm.duration}
                  onChange={(e) => setLessonForm({ ...lessonForm, duration: parseInt(e.target.value) })}
                  data-testid="input-lesson-duration"
                />
              </div>
              <div>
                <Label htmlFor="lesson-order">Ordre</Label>
                <Input
                  id="lesson-order"
                  type="number"
                  value={lessonForm.order}
                  onChange={(e) => setLessonForm({ ...lessonForm, order: parseInt(e.target.value) })}
                  data-testid="input-lesson-order"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="lesson-published"
                checked={lessonForm.isPublished}
                onChange={(e) => setLessonForm({ ...lessonForm, isPublished: e.target.checked })}
                data-testid="input-lesson-published"
              />
              <Label htmlFor="lesson-published">Publier la leçon</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                if (selectedLesson) {
                  updateLessonMutation.mutate({ id: selectedLesson.id, data: lessonForm });
                } else {
                  createLessonMutation.mutate(lessonForm);
                }
              }}
              disabled={createLessonMutation.isPending || updateLessonMutation.isPending}
              data-testid="button-save-lesson"
            >
              {selectedLesson ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resource Dialog */}
      <Dialog open={resourceDialog} onOpenChange={setResourceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle ressource</DialogTitle>
            <DialogDescription>
              Ajoutez un lien vers un support de cours (PDF, checklist, etc.)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="resource-title">Titre *</Label>
              <Input
                id="resource-title"
                value={resourceForm.title}
                onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                placeholder="Guide de gestion des stocks"
                data-testid="input-resource-title"
              />
            </div>
            <div>
              <Label htmlFor="resource-type">Type *</Label>
              <Select
                value={resourceForm.type}
                onValueChange={(value: any) => setResourceForm({ ...resourceForm, type: value })}
              >
                <SelectTrigger id="resource-type" data-testid="select-resource-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="checklist">Checklist</SelectItem>
                  <SelectItem value="template">Modèle/Template</SelectItem>
                  <SelectItem value="link">Lien</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="resource-url">URL *</Label>
              <Input
                id="resource-url"
                value={resourceForm.url}
                onChange={(e) => setResourceForm({ ...resourceForm, url: e.target.value })}
                placeholder="https://drive.google.com/..."
                data-testid="input-resource-url"
              />
            </div>
            <div>
              <Label htmlFor="resource-description">Description</Label>
              <Textarea
                id="resource-description"
                value={resourceForm.description}
                onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })}
                placeholder="Description facultative"
                data-testid="input-resource-description"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="resource-published"
                checked={resourceForm.isPublished}
                onChange={(e) => setResourceForm({ ...resourceForm, isPublished: e.target.checked })}
                data-testid="input-resource-published"
              />
              <Label htmlFor="resource-published">Publier la ressource</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => createResourceMutation.mutate(resourceForm)}
              disabled={createResourceMutation.isPending || !resourceForm.title || !resourceForm.url}
              data-testid="button-save-resource"
            >
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
