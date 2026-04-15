/**
 * Final quiz (quiz de certification) management card for AdminCourseContent.
 *
 * Shows the current state of the AI-generated question pool for the course,
 * and lets the admin upload/replace the PDF that Claude uses to generate it.
 *
 * This component is self-contained: it owns its own state, queries,
 * mutations, and error handling. It just needs a `courseId` prop.
 */
import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Sparkles,
  Upload,
  Trash2,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Clock,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FinalQuizSummary {
  exists: boolean;
  id?: string;
  questionsCount?: number;
  sourcePdfName?: string | null;
  sourcePdfSizeBytes?: number | null;
  aiModel?: string;
  generatedAt?: string;
  updatedAt?: string;
}

function formatBytes(bytes: number | null | undefined): string {
  if (!bytes || bytes <= 0) return '—';
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} ko`;
  return `${(bytes / 1024 / 1024).toFixed(2)} Mo`;
}

function formatDate(iso: string | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default function FinalQuizSection({ courseId }: { courseId: string }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Query: current quiz summary
  const { data, isLoading } = useQuery<FinalQuizSummary>({
    queryKey: ['/api/admin/courses', courseId, 'final-quiz'],
    queryFn: async () => {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/courses/${courseId}/final-quiz`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Erreur de chargement');
      return response.json();
    },
    enabled: !!courseId,
  });

  // Mutation: upload PDF + generate
  const generateMutation = useMutation({
    mutationFn: async (file: File) => {
      const token = localStorage.getItem('admin_token');
      const formData = new FormData();
      formData.append('pdf', file);

      const response = await fetch(`/api/admin/courses/${courseId}/final-quiz/generate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        let message = 'Erreur de génération du quiz.';
        try {
          const payload = await response.json();
          if (payload?.error) message = payload.error;
        } catch { /* ignore */ }
        throw new Error(message);
      }
      return response.json();
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/courses', courseId, 'final-quiz'] });
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      toast({
        title: 'Quiz généré avec succès',
        description: `${result.questionsCount} questions créées par Claude.`,
      });
    },
    onError: (err: Error) => {
      toast({
        title: 'Échec de la génération',
        description: err.message || 'Une erreur est survenue.',
        variant: 'destructive',
      });
    },
  });

  // Mutation: delete current quiz
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/courses/${courseId}/final-quiz`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        let message = 'Erreur de suppression.';
        try {
          const payload = await response.json();
          if (payload?.error) message = payload.error;
        } catch { /* ignore */ }
        throw new Error(message);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/courses', courseId, 'final-quiz'] });
      toast({ title: 'Quiz supprimé' });
    },
    onError: (err: Error) => {
      toast({
        title: 'Échec de la suppression',
        description: err.message,
        variant: 'destructive',
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && file.type !== 'application/pdf') {
      toast({
        title: 'Format invalide',
        description: 'Seuls les fichiers PDF sont acceptés.',
        variant: 'destructive',
      });
      e.target.value = '';
      return;
    }
    // Client-side size check (30 MB) — matches server limit.
    if (file && file.size > 30 * 1024 * 1024) {
      toast({
        title: 'Fichier trop volumineux',
        description: 'Le PDF doit peser moins de 30 Mo.',
        variant: 'destructive',
      });
      e.target.value = '';
      return;
    }
    setSelectedFile(file);
  };

  const handleGenerate = () => {
    if (!selectedFile) return;
    generateMutation.mutate(selectedFile);
  };

  const exists = data?.exists === true;

  return (
    <Card className="border-amber-200">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Quiz de certification (généré par IA)
            </CardTitle>
            <CardDescription className="mt-1.5">
              Téléversez le PDF du support de formation. Claude génère
              automatiquement un pool de 30 questions QCM ; chaque apprenant
              tirera 10 questions aléatoires pour obtenir son certificat (seuil : 8/10).
            </CardDescription>
          </div>
          {exists && (
            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Actif
            </Badge>
          )}
          {!exists && !isLoading && (
            <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Non configuré
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Current state summary */}
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Chargement…</div>
        ) : exists ? (
          <div className="rounded-lg border bg-muted/30 p-4 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{data?.sourcePdfName || 'PDF sans nom'}</span>
              <span className="text-muted-foreground">({formatBytes(data?.sourcePdfSizeBytes)})</span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground">
              <span><strong>{data?.questionsCount ?? 0}</strong> questions dans le pool</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Généré le {formatDate(data?.generatedAt)}
              </span>
              {data?.updatedAt && data.updatedAt !== data.generatedAt && (
                <span>Mis à jour le {formatDate(data?.updatedAt)}</span>
              )}
            </div>
            {data?.aiModel && (
              <div className="text-xs text-muted-foreground">Modèle : {data.aiModel}</div>
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
            Aucun quiz n'est encore configuré pour cette formation. Téléversez
            le PDF ci-dessous pour lancer la génération automatique.
          </div>
        )}

        {/* Upload form */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf"
              onChange={handleFileChange}
              disabled={generateMutation.isPending}
              className="block text-sm file:mr-3 file:rounded-md file:border-0 file:bg-amber-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-amber-700 hover:file:bg-amber-100 disabled:opacity-50"
              data-testid="input-final-quiz-pdf"
            />
            <Button
              onClick={handleGenerate}
              disabled={!selectedFile || generateMutation.isPending}
              className="bg-amber-600 hover:bg-amber-700"
              data-testid="button-generate-final-quiz"
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Génération en cours…
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  {exists ? 'Regénérer le quiz' : 'Générer le quiz'}
                </>
              )}
            </Button>
          </div>

          {selectedFile && (
            <p className="text-xs text-muted-foreground">
              Sélectionné : <strong>{selectedFile.name}</strong> ({formatBytes(selectedFile.size)})
            </p>
          )}

          <p className="text-xs text-muted-foreground">
            Format accepté : PDF uniquement, 30 Mo maximum. La génération prend
            généralement 20 à 60 secondes.
          </p>
        </div>

        {/* Danger zone */}
        {exists && (
          <div className="pt-2 border-t">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  disabled={deleteMutation.isPending}
                  data-testid="button-delete-final-quiz"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer le quiz actuel
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer le quiz de certification ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Le pool de {data?.questionsCount ?? '—'} questions sera définitivement
                    supprimé. Les tentatives déjà soumises par les apprenants ne seront
                    pas affectées (elles gardent leur snapshot). Pour reprendre,
                    téléversez un nouveau PDF.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteMutation.mutate()}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Supprimer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
