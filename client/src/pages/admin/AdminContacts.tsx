import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
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
  MessageSquare,
  Search,
  Download,
  Filter,
  Mail,
  Phone,
  Building,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  Pause
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';

interface ContactRequest {
  id: string;
  type: 'contact' | 'consulting' | 'diagnostic';
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject?: string;
  message: string;
  consultingService?: string;
  status: 'nouveau' | 'en-cours' | 'traite' | 'ferme';
  priority: 'basse' | 'normale' | 'haute' | 'urgente';
  assignedTo?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedResponse {
  contacts: ContactRequest[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function AdminContacts() {
  const [, setLocation] = useLocation();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    // Vérifier l'authentification
    const token = localStorage.getItem('admin_token');
    if (!token) {
      setLocation('/admin/login');
      return;
    }
  }, [setLocation]);

  const { data, isLoading, error, refetch } = useQuery<PaginatedResponse>({
    queryKey: ['/api/admin/contacts', currentPage, searchQuery, typeFilter, statusFilter, priorityFilter],
    queryFn: async () => {
      const token = localStorage.getItem('admin_token');
      if (!token) throw new Error('No token');

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(searchQuery && { search: searchQuery }),
        ...(typeFilter !== 'all' && { type: typeFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(priorityFilter !== 'all' && { priority: priorityFilter }),
      });

      const response = await fetch(`/api/admin/contacts?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('admin_token');
          setLocation('/admin/login');
          throw new Error('Unauthorized');
        }
        throw new Error(`Erreur ${response.status}`);
      }

      return response.json();
    },
    retry: false,
  });

  const handleExportCSV = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) return;

      const params = new URLSearchParams({
        ...(searchQuery && { search: searchQuery }),
        ...(typeFilter !== 'all' && { type: typeFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(priorityFilter !== 'all' && { priority: priorityFilter }),
      });

      const response = await fetch(`/api/admin/contacts/export?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'export');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contacts-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur export CSV:', error);
    }
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      'contact': 'Contact',
      'consulting': 'Consulting',
      'diagnostic': 'Diagnostic'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'nouveau': { label: 'Nouveau', variant: 'default' as const, icon: AlertCircle },
      'en-cours': { label: 'En cours', variant: 'secondary' as const, icon: Clock },
      'traite': { label: 'Traité', variant: 'outline' as const, icon: CheckCircle },
      'ferme': { label: 'Fermé', variant: 'destructive' as const, icon: XCircle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['nouveau'];
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      'basse': { label: 'Basse', className: 'bg-gray-100 text-gray-800' },
      'normale': { label: 'Normale', className: 'bg-blue-100 text-blue-800' },
      'haute': { label: 'Haute', className: 'bg-orange-100 text-orange-800' },
      'urgente': { label: 'Urgente', className: 'bg-red-100 text-red-800' }
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig['normale'];
    
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              Erreur de chargement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Impossible de charger les demandes de contact.</p>
            <Button onClick={() => refetch()} className="mt-4">
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Demandes de Contact</h1>
          <p className="text-gray-600">
            {data ? `${data.pagination.total} demande${data.pagination.total > 1 ? 's' : ''}` : 'Chargement...'}
          </p>
        </div>
        <Button 
          onClick={handleExportCSV}
          disabled={!data || data.contacts.length === 0}
          className="flex items-center gap-2"
          data-testid="button-export-csv"
        >
          <Download className="h-4 w-4" />
          Exporter CSV
        </Button>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Recherche</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Nom, email, entreprise..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger data-testid="select-type">
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="contact">Contact</SelectItem>
                  <SelectItem value="consulting">Consulting</SelectItem>
                  <SelectItem value="diagnostic">Diagnostic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Statut</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger data-testid="select-status">
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="nouveau">Nouveau</SelectItem>
                  <SelectItem value="en-cours">En cours</SelectItem>
                  <SelectItem value="traite">Traité</SelectItem>
                  <SelectItem value="ferme">Fermé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priorité</Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger data-testid="select-priority">
                  <SelectValue placeholder="Toutes les priorités" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les priorités</SelectItem>
                  <SelectItem value="basse">Basse</SelectItem>
                  <SelectItem value="normale">Normale</SelectItem>
                  <SelectItem value="haute">Haute</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery('');
                  setTypeFilter('all');
                  setStatusFilter('all');
                  setPriorityFilter('all');
                  setCurrentPage(1);
                }}
                className="w-full"
                data-testid="button-reset-filters"
              >
                Réinitialiser
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table des contacts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Liste des demandes
          </CardTitle>
          {isLoading && (
            <CardDescription>Chargement des demandes...</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {data && data.contacts.length > 0 ? (
            <div className="space-y-4">
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Type</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Entreprise</TableHead>
                      <TableHead>Sujet</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Priorité</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.contacts.map((contact) => (
                      <TableRow key={contact.id} data-testid={`row-contact-${contact.id}`}>
                        <TableCell>
                          <Badge variant="outline">
                            {getTypeLabel(contact.type)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{contact.name}</div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="h-3 w-3" />
                              {contact.email}
                            </div>
                            {contact.phone && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone className="h-3 w-3" />
                                {contact.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {contact.company && (
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4 text-gray-400" />
                              {contact.company}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            {contact.subject && (
                              <div className="font-medium mb-1">{contact.subject}</div>
                            )}
                            <div className="text-sm text-gray-600 truncate">
                              {contact.message}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(contact.status)}
                        </TableCell>
                        <TableCell>
                          {getPriorityBadge(contact.priority)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-3 w-3" />
                            {formatDate(contact.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // TODO: Ouvrir modal de détails/édition
                              console.log('Voir détails:', contact.id);
                            }}
                            data-testid={`button-view-${contact.id}`}
                          >
                            Voir
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {data.pagination.pages > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Page {data.pagination.page} sur {data.pagination.pages}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      data-testid="button-prev-page"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Précédent
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage >= data.pagination.pages}
                      data-testid="button-next-page"
                    >
                      Suivant
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune demande trouvée
              </h3>
              <p className="text-gray-600">
                Aucune demande de contact ne correspond à vos critères de recherche.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}