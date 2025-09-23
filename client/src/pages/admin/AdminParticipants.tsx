// Page d'administration des participants - Génération d'identifiants et envoi par email
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  UserPlus, 
  Mail, 
  Search, 
  RotateCcw, 
  Eye,
  EyeOff,
  Trash2,
  Send,
  Users,
  Shield,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface Participant {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  authType: string;
  isTemporaryPassword: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

interface CreateParticipantData {
  email: string;
  firstName: string;
  lastName: string;
  sendEmail: boolean;
}

export default function AdminParticipants() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CreateParticipantData>({
    email: '',
    firstName: '',
    lastName: '',
    sendEmail: true,
  });

  // Query pour récupérer les participants
  const { data: participantsResponse, isLoading } = useQuery({
    queryKey: ['/api/admin/participants', { page: currentPage, search: searchQuery }],
    queryFn: async () => {
      const token = localStorage.getItem('admin_token');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        search: searchQuery,
      });

      const response = await fetch(`/api/admin/participants?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la récupération');
      }

      return response.json();
    },
  });

  // Mutation pour créer un participant
  const createMutation = useMutation({
    mutationFn: async (data: CreateParticipantData) => {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/participants', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la création');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/participants'] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: "Participant créé",
        description: "Le participant a été créé avec succès et ses identifiants ont été envoyés par email.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation pour renvoyer les identifiants
  const resendMutation = useMutation({
    mutationFn: async (participantId: string) => {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/participants/${participantId}/resend-credentials`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors du renvoi');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Identifiants renvoyés",
        description: "Les nouveaux identifiants ont été envoyés par email avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation pour supprimer un participant
  const deleteMutation = useMutation({
    mutationFn: async (participantId: string) => {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/participants/${participantId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la suppression');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/participants'] });
      toast({
        title: "Participant supprimé",
        description: "Le participant a été supprimé avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      email: '',
      firstName: '',
      lastName: '',
      sendEmail: true,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.firstName || !formData.lastName) {
      toast({
        title: "Erreur",
        description: "Tous les champs sont requis.",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate(formData);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const participants = participantsResponse?.participants || [];
  const pagination = participantsResponse?.pagination || { page: 1, pages: 1, total: 0 };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Actif
        </Badge>;
      case 'inactive':
        return <Badge variant="secondary">
          <AlertCircle className="w-3 h-3 mr-1" />
          Inactif
        </Badge>;
      case 'suspended':
        return <Badge variant="destructive">
          <Shield className="w-3 h-3 mr-1" />
          Suspendu
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getAuthTypeBadge = (authType: string) => {
    switch (authType) {
      case 'local':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
          <Mail className="w-3 h-3 mr-1" />
          Email
        </Badge>;
      case 'replit':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 dark:bg-purple-900 dark:text-purple-200">
          <Shield className="w-3 h-3 mr-1" />
          Replit
        </Badge>;
      default:
        return <Badge variant="outline">{authType}</Badge>;
    }
  };

  return (
    <div className="space-y-6" data-testid="admin-participants-page">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground" data-testid="page-title">
            Gestion des Participants
          </h1>
          <p className="text-muted-foreground mt-2">
            Créez des comptes participants et envoyez automatiquement leurs identifiants par email
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-participant">
              <UserPlus className="w-4 h-4 mr-2" />
              Nouveau Participant
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Créer un Participant</DialogTitle>
              <DialogDescription>
                Un mot de passe temporaire sera généré automatiquement et envoyé par email.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Adresse Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="participant@exemple.com"
                  data-testid="input-email"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="Jean"
                  data-testid="input-first-name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Dupont"
                  data-testid="input-last-name"
                  required
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="sendEmail"
                  checked={formData.sendEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, sendEmail: e.target.checked }))}
                  data-testid="checkbox-send-email"
                />
                <Label htmlFor="sendEmail" className="text-sm">
                  Envoyer les identifiants par email immédiatement
                </Label>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  data-testid="button-cancel"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  data-testid="button-submit"
                >
                  {createMutation.isPending ? (
                    <>
                      <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                      Création...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Créer le Participant
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-participants">
              {pagination.total}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recherche */}
      <Card>
        <CardHeader>
          <CardTitle>Participants</CardTitle>
          <CardDescription>
            Gérez les comptes participants et leurs accès à la plateforme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Rechercher par email, prénom ou nom..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search"
                />
              </div>
              <Button type="submit" variant="outline" data-testid="button-search">
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </form>

          {/* Liste des participants */}
          {isLoading ? (
            <div className="text-center py-8">
              <RotateCcw className="w-6 h-6 animate-spin mx-auto mb-2" />
              <p>Chargement des participants...</p>
            </div>
          ) : participants.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucun participant trouvé</p>
              {searchQuery && (
                <p className="text-sm mt-2">
                  Essayez de modifier vos critères de recherche
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {participants.map((participant: Participant) => (
                <Card key={participant.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-foreground">
                          {participant.firstName} {participant.lastName}
                        </h3>
                        {getStatusBadge(participant.status)}
                        {getAuthTypeBadge(participant.authType)}
                        {participant.isTemporaryPassword && (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Mot de passe temporaire
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        📧 {participant.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Créé le {new Date(participant.createdAt).toLocaleDateString('fr-FR')}
                        {participant.lastLoginAt && (
                          <> • Dernière connexion: {new Date(participant.lastLoginAt).toLocaleDateString('fr-FR')}</>
                        )}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => resendMutation.mutate(participant.id)}
                        disabled={resendMutation.isPending}
                        data-testid={`button-resend-${participant.id}`}
                      >
                        <Send className="w-4 h-4 mr-1" />
                        Renvoyer identifiants
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteMutation.mutate(participant.id)}
                        disabled={deleteMutation.isPending}
                        data-testid={`button-delete-${participant.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    data-testid="button-prev-page"
                  >
                    Précédent
                  </Button>
                  <span className="flex items-center px-4 text-sm text-muted-foreground">
                    Page {pagination.page} sur {pagination.pages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.pages))}
                    disabled={currentPage === pagination.pages}
                    data-testid="button-next-page"
                  >
                    Suivant
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}