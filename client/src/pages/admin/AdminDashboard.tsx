import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard,
  Users,
  MessageSquare,
  BookOpen,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  TrendingUp,
  Mail,
  Calendar
} from 'lucide-react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';

interface DashboardStats {
  totalRegistrations: number;
  totalContacts: number;
  recentRegistrations: any[];
  recentContacts: any[];
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminUser, setAdminUser] = useState<any>(null);

  useEffect(() => {
    // Vérifier l'authentification
    const token = localStorage.getItem('admin_token');
    const user = localStorage.getItem('admin_user');
    
    if (!token || !user) {
      setLocation('/admin/login');
      return;
    }

    setAdminUser(JSON.parse(user));
  }, [setLocation]);

  // Récupérer les statistiques du dashboard
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/admin/dashboard/stats'],
    queryFn: async () => {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Erreur de récupération des stats');
      }
      return response.json() as Promise<DashboardStats>;
    },
    enabled: !!adminUser
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('admin_token');
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    },
    onSettled: () => {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      setLocation('/admin/login');
    }
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard, active: true },
    { id: 'registrations', label: 'Inscriptions', icon: BookOpen, badge: stats?.totalRegistrations },
    { id: 'contacts', label: 'Contacts', icon: MessageSquare, badge: stats?.totalContacts },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ];

  if (!adminUser) {
    return null; // Redirect en cours
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className={`bg-card border-r transition-all duration-300 ${
        sidebarOpen ? 'w-64' : 'w-16'
      }`}>
        <div className="p-4">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <h2 className="text-lg font-semibold text-foreground">Admin Kemet</h2>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              data-testid="button-toggle-sidebar"
            >
              {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <nav className="px-4 space-y-2">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant={item.active ? "secondary" : "ghost"}
              className={`w-full justify-start ${!sidebarOpen && 'px-2'}`}
              data-testid={`button-nav-${item.id}`}
            >
              <item.icon className={`w-4 h-4 ${sidebarOpen && 'mr-2'}`} />
              {sidebarOpen && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="ml-auto">
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
            </Button>
          ))}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          {sidebarOpen && (
            <div className="mb-4 p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium text-foreground">{adminUser.username}</p>
              <p className="text-xs text-muted-foreground">Administrateur</p>
            </div>
          )}
          <Button
            variant="ghost"
            className={`w-full justify-start text-muted-foreground hover:text-destructive ${!sidebarOpen && 'px-2'}`}
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            data-testid="button-logout"
          >
            <LogOut className={`w-4 h-4 ${sidebarOpen && 'mr-2'}`} />
            {sidebarOpen && 'Déconnexion'}
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground">Tableau de bord</h1>
            <p className="text-muted-foreground">Vue d'ensemble de votre plateforme Kemet Services</p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-8 bg-muted rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Inscriptions totales</p>
                      <p className="text-2xl font-bold text-foreground">{stats?.totalRegistrations || 0}</p>
                    </div>
                    <BookOpen className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Contacts totaux</p>
                      <p className="text-2xl font-bold text-foreground">{stats?.totalContacts || 0}</p>
                    </div>
                    <MessageSquare className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Taux de conversion</p>
                      <p className="text-2xl font-bold text-foreground">12.5%</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Ce mois</p>
                      <p className="text-2xl font-bold text-foreground">+23%</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Inscriptions récentes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Inscriptions récentes
                </CardTitle>
                <CardDescription>Les 5 dernières inscriptions aux formations</CardDescription>
              </CardHeader>
              <CardContent>
                {stats?.recentRegistrations?.length ? (
                  <div className="space-y-4">
                    {stats.recentRegistrations.map((registration, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium text-foreground">{registration.participantName}</p>
                          <p className="text-sm text-muted-foreground">{registration.trainingTitle}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            {new Date(registration.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">Aucune inscription récente</p>
                )}
              </CardContent>
            </Card>

            {/* Contacts récents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Contacts récents
                </CardTitle>
                <CardDescription>Les 5 dernières demandes de contact</CardDescription>
              </CardHeader>
              <CardContent>
                {stats?.recentContacts?.length ? (
                  <div className="space-y-4">
                    {stats.recentContacts.map((contact, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium text-foreground">{contact.name}</p>
                          <p className="text-sm text-muted-foreground">{contact.type}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={contact.status === 'nouveau' ? 'default' : 'secondary'}>
                            {contact.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">Aucun contact récent</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}