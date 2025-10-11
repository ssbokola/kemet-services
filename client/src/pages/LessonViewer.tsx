import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { CheckCircle2, ChevronLeft, ChevronRight, Lock, PlayCircle, Clock, BookOpen, List } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface LessonProgress {
  status: 'not_started' | 'in_progress' | 'completed';
  timeSpent?: number;
  completedAt?: string;
}

interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  content: string;
  videoUrl?: string;
  duration?: number;
  order: number;
  isPublished: boolean;
  isFree: boolean;
  accessible: boolean;
  progress?: LessonProgress;
}

export default function LessonViewer() {
  const { lessonId } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [startTime] = useState(Date.now());
  const [showTOC, setShowTOC] = useState(false);

  // Fetch lesson details
  const { data: lessonData, isLoading } = useQuery<{ success: boolean; lesson: Lesson }>({
    queryKey: ['/api/lessons', lessonId],
    enabled: !!lessonId,
  });

  const lesson = lessonData?.lesson;

  // Fetch module lessons for navigation
  const { data: moduleLessonsData } = useQuery<{ success: boolean; lessons: Lesson[] }>({
    queryKey: ['/api/lessons/module', lesson?.moduleId],
    enabled: !!lesson?.moduleId,
  });

  const moduleLessons = moduleLessonsData?.lessons || [];
  const currentIndex = moduleLessons.findIndex(l => l.id === lessonId);
  const previousLesson = currentIndex > 0 ? moduleLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < moduleLessons.length - 1 ? moduleLessons[currentIndex + 1] : null;

  // Mark lesson as completed mutation
  const completeLesson = useMutation({
    mutationFn: async () => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000 / 60); // minutes
      return apiRequest('PUT', `/api/lessons/${lessonId}/progress`, {
        status: 'completed',
        timeSpent,
        completedAt: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      // Invalidate lesson detail
      queryClient.invalidateQueries({ queryKey: ['/api/lessons', lessonId] });
      // Invalidate ALL module lessons queries (not just this specific module)
      queryClient.invalidateQueries({ queryKey: ['/api/lessons/module'], exact: false });
      // Invalidate dashboard and enrollments
      queryClient.invalidateQueries({ queryKey: ['/api/mon-compte'] });
      queryClient.invalidateQueries({ queryKey: ['/api/formations/my-enrollments'] });
      toast({
        title: "Leçon terminée !",
        description: "Votre progression a été enregistrée.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de marquer la leçon comme terminée.",
        variant: "destructive",
      });
    },
  });

  // Extract YouTube video ID from URL
  const getYouTubeEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = match && match[2].length === 11 ? match[2] : null;
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Skeleton className="h-12 w-2/3 mb-6" />
        <Skeleton className="h-96 w-full mb-6" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Leçon introuvable.</p>
            <div className="flex justify-center mt-4">
              <Button onClick={() => navigate('/mon-compte')} data-testid="button-back-to-dashboard">
                Retour au tableau de bord
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!lesson.accessible && !lesson.isFree) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Leçon verrouillée
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Vous devez compléter les leçons précédentes pour accéder à celle-ci.
            </p>
            <Button onClick={() => navigate('/mon-compte')} data-testid="button-back-to-dashboard">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Retour au tableau de bord
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isCompleted = lesson.progress?.status === 'completed';

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/mon-compte')}
            data-testid="button-back"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          {isCompleted && (
            <Badge variant="default" className="flex items-center gap-2" data-testid="badge-completed">
              <CheckCircle2 className="w-4 h-4" />
              Terminée
            </Badge>
          )}
        </div>
        <h1 className="text-3xl font-bold mb-2" data-testid="text-lesson-title">{lesson.title}</h1>
        {lesson.duration && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span data-testid="text-lesson-duration">{lesson.duration} minutes</span>
          </div>
        )}
      </div>

      {/* Video Player */}
      {lesson.videoUrl && (
        <Card className="mb-6">
          <CardContent className="p-0">
            <div className="aspect-video w-full">
              <iframe
                src={getYouTubeEmbedUrl(lesson.videoUrl)}
                title={lesson.title}
                className="w-full h-full rounded-t-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                data-testid="video-player"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lesson Content */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlayCircle className="w-5 h-5" />
            Contenu de la leçon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-slate dark:prose-invert max-w-none" data-testid="lesson-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {lesson.content}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      {/* Table of Contents Sidebar */}
      {showTOC && moduleLessons.length > 0 && (
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg">Table des matières</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowTOC(false)}
              data-testid="button-close-toc"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {moduleLessons.map((l, index) => (
                  <Button
                    key={l.id}
                    variant={l.id === lessonId ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => navigate(`/lecon/${l.id}`)}
                    disabled={!l.accessible && !l.isFree}
                    data-testid={`toc-lesson-${index}`}
                  >
                    {!l.accessible && !l.isFree ? (
                      <Lock className="w-4 h-4 mr-2" />
                    ) : l.progress?.status === 'completed' ? (
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                    ) : (
                      <PlayCircle className="w-4 h-4 mr-2" />
                    )}
                    <span className="truncate">{index + 1}. {l.title}</span>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-4">
          <Button 
            variant="outline"
            onClick={() => setShowTOC(!showTOC)}
            data-testid="button-toggle-toc"
          >
            <List className="w-4 h-4 mr-2" />
            {showTOC ? "Masquer" : "Table des matières"}
          </Button>
          {previousLesson && (
            <Button 
              variant="outline" 
              onClick={() => navigate(`/lecon/${previousLesson.id}`)}
              disabled={!previousLesson.accessible && !previousLesson.isFree}
              data-testid="button-previous-lesson"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Leçon précédente
            </Button>
          )}
        </div>

        <div className="flex gap-4">
          {!isCompleted ? (
            <Button
              onClick={() => completeLesson.mutate()}
              disabled={completeLesson.isPending}
              data-testid="button-complete-lesson"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {completeLesson.isPending ? "Enregistrement..." : "Marquer comme terminée"}
            </Button>
          ) : nextLesson ? (
            <Button
              onClick={() => navigate(`/lecon/${nextLesson.id}`)}
              disabled={!nextLesson.accessible && !nextLesson.isFree}
              data-testid="button-next-lesson"
            >
              Leçon suivante
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
