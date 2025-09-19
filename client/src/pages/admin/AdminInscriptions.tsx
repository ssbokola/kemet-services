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
  BookOpen,
  Search,
  Download,
  Filter,
  Mail,
  Phone,
  Calendar,
  Users,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';

interface Registration {
  id: string;
  trainingId: string;
  trainingTitle: string;
  participantName: string;
  role: string;
  officine: string;
  email: string;
  phone: string;
  experienceLevel: string;
  companySize: string;
  participantsCount: number;
  sessionType: string;
  preferredDate?: string;
  message?: string;
  dataConsent: boolean;
  marketingConsent: boolean;
  createdAt: string;
}

interface PaginatedResponse {
  registrations: Registration[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function AdminInscriptions() {
  const [, setLocation] = useLocation();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sessionTypeFilter, setSessionTypeFilter] = useState('all');

  useEffect(() => {
    // Vérifier l'authentification
    const token = localStorage.getItem('admin_token');
    if (!token) {
      setLocation('/admin/login');
      return;
    }
  }, [setLocation]);

  // Récupérer les inscriptions avec pagination et filtres
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/admin/registrations', currentPage, searchQuery, roleFilter, sessionTypeFilter],
    queryFn: async () => {
      const token = localStorage.getItem('admin_token');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(searchQuery && { search: searchQuery }),
        ...(roleFilter !== 'all' && { role: roleFilter }),
        ...(sessionTypeFilter !== 'all' && { sessionType: sessionTypeFilter }),
      });
      
      const response = await fetch(`/api/admin/registrations?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des inscriptions');
      }
      
      return response.json() as Promise<PaginatedResponse>;
    }
  });

  const handleExportCSV = () => {
    if (!data?.registrations) return;
    
    const headers = [
      'Date', 'Nom', 'Email', 'Téléphone', 'Rôle', 'Officine', 
      'Formation', 'Type de session', 'Participants', 'Expérience'
    ];
    
    const csvContent = [
      headers.join(','),
      ...data.registrations.map(reg => [
        new Date(reg.createdAt).toLocaleDateString('fr-FR'),
        reg.participantName,
        reg.email,
        reg.phone,
        reg.role,
        reg.officine,
        reg.trainingTitle,
        reg.sessionType,
        reg.participantsCount,
        reg.experienceLevel
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `inscriptions-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'pharmacien-titulaire': return 'default';
      case 'pharmacien-adjoint': return 'secondary';
      case 'auxiliaire': return 'outline';
      default: return 'secondary';
    }
  };

  const getSessionTypeBadgeVariant = (sessionType: string) => {
    switch (sessionType) {
      case 'inter-entreprise': return 'default';
      case 'intra-entreprise': return 'secondary';
      case 'en-ligne': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Gestion des inscriptions</h1>
        <p className="text-muted-foreground">Suivez et gérez toutes les inscriptions aux formations</p>
      </div>

      {/* Filtres et actions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtres et actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <Label htmlFor="search">Rechercher</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Nom, email, officine..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-registrations"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="role-filter">Rôle</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger data-testid="select-role-filter">
                  <SelectValue placeholder="Tous les rôles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les rôles</SelectItem>
                  <SelectItem value="pharmacien-titulaire">Pharmacien titulaire</SelectItem>
                  <SelectItem value="pharmacien-adjoint">Pharmacien adjoint</SelectItem>
                  <SelectItem value="auxiliaire">Auxiliaire</SelectItem>
                  <SelectItem value="etudiant">Étudiant</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="session-filter">Type de session</Label>
              <Select value={sessionTypeFilter} onValueChange={setSessionTypeFilter}>
                <SelectTrigger data-testid="select-session-filter">
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="inter-entreprise">Inter-entreprise</SelectItem>
                  <SelectItem value="intra-entreprise">Intra-entreprise</SelectItem>
                  <SelectItem value="en-ligne">En ligne</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={handleExportCSV}
                disabled={!data?.registrations?.length}
                className="w-full"
                data-testid="button-export-csv"
              >
                <Download className="w-4 h-4 mr-2" />
                Exporter CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques rapides */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total inscriptions</p>
                  <p className="text-2xl font-bold">{data.pagination.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Cette page</p>
                  <p className="text-2xl font-bold">{data.registrations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Pages</p>
                  <p className="text-2xl font-bold">{data.pagination.pages}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tableau des inscriptions */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des inscriptions</CardTitle>
          <CardDescription>
            {data && `${data.pagination.total} inscription(s) au total`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Chargement des inscriptions...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-destructive">Erreur lors du chargement des inscriptions</p>
            </div>
          ) : !data?.registrations?.length ? (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucune inscription trouvée</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Participant</TableHead>
                      <TableHead>Formation</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Rôle</TableHead>
                      <TableHead>Session</TableHead>
                      <TableHead>Participants</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.registrations.map((registration) => (
                      <TableRow key={registration.id}>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">
                              {new Date(registration.createdAt).toLocaleDateString('fr-FR')}
                            </div>
                            <div className="text-muted-foreground">
                              {new Date(registration.createdAt).toLocaleTimeString('fr-FR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div>
                            <div className="font-medium">{registration.participantName}</div>
                            <div className="text-sm text-muted-foreground">{registration.officine}</div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="max-w-xs">
                            <div className="font-medium text-sm truncate" title={registration.trainingTitle}>
                              {registration.trainingTitle}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Niveau: {registration.experienceLevel}
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="w-3 h-3" />
                              <span className="truncate max-w-32" title={registration.email}>
                                {registration.email}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="w-3 h-3" />
                              <span>{registration.phone}</span>
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(registration.role)}>
                            {registration.role.replace('-', ' ')}
                          </Badge>
                        </TableCell>
                        
                        <TableCell>
                          <Badge variant={getSessionTypeBadgeVariant(registration.sessionType)}>
                            {registration.sessionType}
                          </Badge>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{registration.participantsCount}</span>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => window.open(`mailto:${registration.email}`)}
                              data-testid={`button-email-${registration.id}`}
                            >
                              <Mail className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => window.open(`tel:${registration.phone}`)}
                              data-testid={`button-phone-${registration.id}`}
                            >
                              <Phone className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {data.pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {data.pagination.page} sur {data.pagination.pages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      data-testid="button-prev-page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Précédent
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === data.pagination.pages}
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
    </div>
  );
}