import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  BookOpen,
  Search,
  Plus,
  Edit,
  Trash2,
  Filter,
  Calendar,
  Users,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Clock,
  Banknote
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatPriceCFA } from "@/lib/utils";

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  duration: number;
  price: number;
  isPublished: boolean;
  thumbnail?: string;
  objectives?: string[];
  prerequisites?: string[];
  targetAudience?: string[];
  createdAt: string;
  updatedAt: string;
}

interface PaginatedResponse {
  courses: Course[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function AdminCourses() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // States pour la liste
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [publishedFilter, setPublishedFilter] = useState('all');
  
  // States pour le formulaire
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    category: 'quality',
    duration: 60,
    price: 0,
    isPublished: false,
    objectives: [] as string[],
    prerequisites: [] as string[],
    targetAudience: [] as string[]
  });
  const [objectiveInput, setObjectiveInput] = useState('');
  const [prerequisiteInput, setPrerequisiteInput] = useState('');
  const [audienceInput, setAudienceInput] = useState('');

  // Auth guard
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      setLocation('/admin/login');
      return;
    }
  }, [setLocation]);

  // Récupérer les cours avec pagination et filtres
  const { data, isLoading, error } = useQuery<PaginatedResponse>({
    queryKey: ['/api/admin/courses', currentPage, searchQuery, categoryFilter, publishedFilter],
    queryFn: async () => {
      const token = localStorage.getItem('admin_token');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchQuery && { search: searchQuery }),
        ...(categoryFilter !== 'all' && { category: categoryFilter }),
        ...(publishedFilter !== 'all' && { published: publishedFilter })
      });

      const response = await fetch(`/api/admin/courses?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }

      return response.json();
    }
  });

  // Mutation pour créer un cours
  const createMutation = useMutation({
    mutationFn: async (courseData: typeof formData) => {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        body: JSON.stringify(courseData),
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la création');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/courses'] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: "Cours créé",
        description: "Le cours a été créé avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la création.",
        variant: "destructive",
      });
    }
  });

  // Mutation pour mettre à jour un cours
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: typeof formData }) => {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/courses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la mise à jour');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/courses'] });
      setIsEditDialogOpen(false);
      setSelectedCourse(null);
      resetForm();
      toast({
        title: "Cours mis à jour",
        description: "Le cours a été mis à jour avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la mise à jour.",
        variant: "destructive",
      });
    }
  });

  // Mutation pour supprimer un cours
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/courses/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la suppression');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/courses'] });
      toast({
        title: "Cours supprimé",
        description: "Le cours a été supprimé avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la suppression.",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      description: '',
      category: 'quality',
      duration: 60,
      price: 0,
      isPublished: false,
      objectives: [],
      prerequisites: [],
      targetAudience: []
    });
    setObjectiveInput('');
    setPrerequisiteInput('');
    setAudienceInput('');
  };

  const handleCreateCourse = () => {
    setIsCreateDialogOpen(true);
    resetForm();
  };

  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setFormData({
      title: course.title,
      slug: course.slug,
      description: course.description,
      category: course.category,
      duration: course.duration,
      price: course.price,
      isPublished: course.isPublished,
      objectives: course.objectives || [],
      prerequisites: course.prerequisites || [],
      targetAudience: course.targetAudience || []
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteCourse = (courseId: string) => {
    deleteMutation.mutate(courseId);
  };

  const handleSubmit = () => {
    if (selectedCourse) {
      updateMutation.mutate({ id: selectedCourse.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const addObjective = () => {
    if (objectiveInput.trim()) {
      setFormData(prev => ({
        ...prev,
        objectives: [...prev.objectives, objectiveInput.trim()]
      }));
      setObjectiveInput('');
    }
  };

  const removeObjective = (index: number) => {
    setFormData(prev => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== index)
    }));
  };

  const addPrerequisite = () => {
    if (prerequisiteInput.trim()) {
      setFormData(prev => ({
        ...prev,
        prerequisites: [...prev.prerequisites, prerequisiteInput.trim()]
      }));
      setPrerequisiteInput('');
    }
  };

  const removePrerequisite = (index: number) => {
    setFormData(prev => ({
      ...prev,
      prerequisites: prev.prerequisites.filter((_, i) => i !== index)
    }));
  };

  const addAudience = () => {
    if (audienceInput.trim()) {
      setFormData(prev => ({
        ...prev,
        targetAudience: [...prev.targetAudience, audienceInput.trim()]
      }));
      setAudienceInput('');
    }
  };

  const removeAudience = (index: number) => {
    setFormData(prev => ({
      ...prev,
      targetAudience: prev.targetAudience.filter((_, i) => i !== index)
    }));
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[àáâäã]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i')
      .replace(/[òóôöõ]/g, 'o')
      .replace(/[ùúûü]/g, 'u')
      .replace(/[ç]/g, 'c')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      quality: "Qualité",
      finance: "Finance", 
      stock: "Stock",
      hr: "Management",
      auxiliaires: "Auxiliaires"
    };
    return labels[category] || category;
  };

  // Utiliser la fonction centralisée de formatage CFA
  const formatPrice = (price: number) => {
    return price === 0 ? 'Gratuit' : formatPriceCFA(price);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h${mins > 0 ? ` ${mins}min` : ''}`;
    }
    return `${mins}min`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Chargement des cours...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="py-12 text-center">
            <h3 className="font-medium mb-2">Erreur de chargement</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Impossible de charger les cours.
            </p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const courses = data?.courses || [];
  const pagination = data?.pagination;

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" data-testid="heading-courses">Gestion des Formations</h1>
            <p className="text-muted-foreground">
              Gérez le contenu pédagogique de Kemet Services
            </p>
          </div>
          <Button 
            onClick={handleCreateCourse}
            data-testid="button-create-course"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau Cours
          </Button>
        </div>

        {/* Filtres et recherche */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par titre ou description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-courses"
                  />
                </div>
              </div>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48" data-testid="select-category-filter">
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes catégories</SelectItem>
                  <SelectItem value="quality">Qualité</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="stock">Stock</SelectItem>
                  <SelectItem value="hr">Management</SelectItem>
                  <SelectItem value="auxiliaires">Auxiliaires</SelectItem>
                </SelectContent>
              </Select>

              <Select value={publishedFilter} onValueChange={setPublishedFilter}>
                <SelectTrigger className="w-40" data-testid="select-published-filter">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous statuts</SelectItem>
                  <SelectItem value="true">Publié</SelectItem>
                  <SelectItem value="false">Brouillon</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tableau des cours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Cours ({pagination?.total || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {courses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucun cours trouvé</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || categoryFilter !== 'all' || publishedFilter !== 'all' 
                  ? "Aucun cours ne correspond à vos critères de recherche."
                  : "Commencez par créer votre premier cours."}
              </p>
              {!searchQuery && categoryFilter === 'all' && publishedFilter === 'all' && (
                <Button onClick={handleCreateCourse}>
                  <Plus className="w-4 h-4 mr-2" />
                  Créer le premier cours
                </Button>
              )}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Durée</TableHead>
                    <TableHead>Prix</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Créé le</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course) => (
                    <TableRow key={course.id} data-testid={`row-course-${course.id}`}>
                      <TableCell>
                        <div className="max-w-xs">
                          <div className="font-medium truncate" title={course.title}>
                            {course.title}
                          </div>
                          <div className="text-sm text-muted-foreground truncate" title={course.description}>
                            {course.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {getCategoryLabel(course.category)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span className="text-sm">{formatDuration(course.duration)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Banknote className="w-3 h-3" />
                          <span className="text-sm">{formatPrice(course.price)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {course.isPublished ? (
                            <Eye className="w-4 h-4 text-green-600" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-muted-foreground" />
                          )}
                          <Badge variant={course.isPublished ? "default" : "secondary"}>
                            {course.isPublished ? "Publié" : "Brouillon"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span className="text-sm">
                            {new Date(course.createdAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setLocation(`/admin/courses/${course.id}/content`)}
                            data-testid={`button-manage-content-${course.id}`}
                          >
                            <BookOpen className="w-4 h-4 mr-1" />
                            Contenu
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditCourse(course)}
                            data-testid={`button-edit-course-${course.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                data-testid={`button-delete-course-${course.id}`}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Supprimer le cours</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Êtes-vous sûr de vouloir supprimer "{course.title}" ? 
                                  Cette action est irréversible et supprimera également 
                                  tous les modules et leçons associés.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteCourse(course.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Supprimer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-muted-foreground">
                    Affichage {((pagination.page - 1) * pagination.limit) + 1} à {Math.min(pagination.page * pagination.limit, pagination.total)} 
                    de {pagination.total} cours
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={pagination.page <= 1}
                      data-testid="button-prev-page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Précédent
                    </Button>
                    <span className="text-sm">
                      Page {pagination.page} sur {pagination.pages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(pagination.pages, prev + 1))}
                      disabled={pagination.page >= pagination.pages}
                      data-testid="button-next-page"
                    >
                      Suivant
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialog de création/édition */}
      <Dialog 
        open={isCreateDialogOpen || isEditDialogOpen} 
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setIsEditDialogOpen(false);
            setSelectedCourse(null);
            resetForm();
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedCourse ? 'Modifier le cours' : 'Nouveau cours'}
            </DialogTitle>
            <DialogDescription>
              {selectedCourse 
                ? 'Modifiez les informations du cours.'
                : 'Créez un nouveau cours de formation pour Kemet Services.'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Informations de base */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      title,
                      slug: !selectedCourse ? generateSlug(title) : prev.slug
                    }));
                  }}
                  placeholder="Ex: Gestion de la qualité en pharmacie"
                  data-testid="input-course-title"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="gestion-qualite-pharmacie"
                  data-testid="input-course-slug"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="category">Catégorie *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger data-testid="select-course-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quality">Qualité</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="stock">Stock</SelectItem>
                    <SelectItem value="hr">Management</SelectItem>
                    <SelectItem value="auxiliaires">Auxiliaires</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="duration">Durée (minutes) *</Label>
                <Input
                  id="duration"
                  type="number"
                  min="15"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                  data-testid="input-course-duration"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="price">Prix (centimes) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                  placeholder="En centimes : 5000000 pour 50 000 F"
                  data-testid="input-course-price"
                />
              </div>
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description détaillée du cours..."
                rows={4}
                data-testid="textarea-course-description"
              />
            </div>

            {/* Objectifs */}
            <div className="grid gap-2">
              <Label>Objectifs pédagogiques</Label>
              <div className="flex gap-2">
                <Input
                  value={objectiveInput}
                  onChange={(e) => setObjectiveInput(e.target.value)}
                  placeholder="Ajouter un objectif..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addObjective())}
                  data-testid="input-add-objective"
                />
                <Button type="button" onClick={addObjective} data-testid="button-add-objective">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {formData.objectives.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.objectives.map((objective, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {objective}
                      <button
                        type="button"
                        onClick={() => removeObjective(index)}
                        className="ml-2 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Prérequis */}
            <div className="grid gap-2">
              <Label>Prérequis</Label>
              <div className="flex gap-2">
                <Input
                  value={prerequisiteInput}
                  onChange={(e) => setPrerequisiteInput(e.target.value)}
                  placeholder="Ajouter un prérequis..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPrerequisite())}
                  data-testid="input-add-prerequisite"
                />
                <Button type="button" onClick={addPrerequisite} data-testid="button-add-prerequisite">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {formData.prerequisites.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.prerequisites.map((prerequisite, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {prerequisite}
                      <button
                        type="button"
                        onClick={() => removePrerequisite(index)}
                        className="ml-2 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Public cible */}
            <div className="grid gap-2">
              <Label>Public cible</Label>
              <div className="flex gap-2">
                <Input
                  value={audienceInput}
                  onChange={(e) => setAudienceInput(e.target.value)}
                  placeholder="Ajouter un public cible..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAudience())}
                  data-testid="input-add-audience"
                />
                <Button type="button" onClick={addAudience} data-testid="button-add-audience">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {formData.targetAudience.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.targetAudience.map((audience, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {audience}
                      <button
                        type="button"
                        onClick={() => removeAudience(index)}
                        className="ml-2 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Publication */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPublished"
                checked={formData.isPublished}
                onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
                className="rounded border border-input"
                data-testid="checkbox-course-published"
              />
              <Label htmlFor="isPublished" className="text-sm font-medium">
                Publier ce cours immédiatement
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsCreateDialogOpen(false);
                setIsEditDialogOpen(false);
                setSelectedCourse(null);
                resetForm();
              }}
            >
              Annuler
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
              data-testid="button-submit-course"
            >
              {createMutation.isPending || updateMutation.isPending ? 'Sauvegarde...' : 
               (selectedCourse ? 'Mettre à jour' : 'Créer le cours')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}