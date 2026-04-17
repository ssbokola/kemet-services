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
  TrendingDown,
  Mail,
  Calendar,
  ArrowUp,
  ArrowDown,
  Target,
  Activity,
  Shield,
  Receipt
} from 'lucide-react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

interface DashboardStats {
  totalRegistrations: number;
  totalContacts: number;
  conversionRate: number;
  totalLeads: number;
  registrationsGrowthDaily: number;
  registrationsGrowthMonthly: number;
  contactsGrowthDaily: number;
  contactsGrowthMonthly: number;
  periods: {
    today: { registrations: number; contacts: number };
    yesterday: { registrations: number; contacts: number };
    last7Days: { registrations: number; contacts: number };
    last30Days: { registrations: number; contacts: number };
    thisMonth: { registrations: number; contacts: number };
    lastMonth: { registrations: number; contacts: number };
  };
  breakdown: {
    registrationsByRole: Array<{ label: string; value: number }>;
    registrationsBySessionType: Array<{ label: string; value: number }>;
    contactsByType: Array<{ label: string; value: number }>;
    contactsByStatus: Array<{ label: string; value: number }>;
    contactsByPriority: Array<{ label: string; value: number }>;
  };
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

  const handleNavigation = (itemId: string) => {
    switch (itemId) {
      case 'dashboard':
        // Déjà sur le dashboard
        break;
      case 'registrations':
        setLocation('/admin/registrations');
        break;
      case 'contacts':
        setLocation('/admin/contacts');
        break;
      case 'courses':
        setLocation('/admin/courses');
        break;
      case 'participants':
        setLocation('/admin/participants');
        break;
      case 'orders':
        setLocation('/admin/commandes');
        break;
      case 'analytics':
        // TODO: implémenter analytics
        break;
      case 'email-auth':
        setLocation('/admin/email-auth');
        break;
      case 'spf':
        setLocation('/admin/spf');
        break;
      case 'dkim':
        setLocation('/admin/dkim');
        break;
      case 'settings':
        // TODO: implémenter settings
        break;
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard, active: true },
    { id: 'registrations', label: 'Inscriptions', icon: BookOpen, badge: stats?.totalRegistrations },
    { id: 'contacts', label: 'Contacts', icon: MessageSquare, badge: stats?.totalContacts },
    { id: 'courses', label: 'Formations', icon: BookOpen },
    { id: 'participants', label: 'Participants', icon: Users },
    { id: 'orders', label: 'Commandes', icon: Receipt },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'email-auth', label: 'Authentification Email', icon: Shield },
    { id: 'spf', label: 'Config SPF', icon: Shield },
    { id: 'dkim', label: 'Config DKIM', icon: Shield },
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
              onClick={() => handleNavigation(item.id)}
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
              {/* Inscriptions totales */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Inscriptions totales</p>
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold text-foreground">{stats?.totalRegistrations || 0}</p>
                        {stats?.registrationsGrowthMonthly !== undefined && (
                          <div className={`flex items-center text-xs px-2 py-1 rounded-full ${
                            stats.registrationsGrowthMonthly >= 0 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {stats.registrationsGrowthMonthly >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                            {Math.abs(stats.registrationsGrowthMonthly)}%
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stats?.periods.thisMonth.registrations || 0} ce mois
                      </p>
                    </div>
                    <BookOpen className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              {/* Contacts totaux */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Contacts totaux</p>
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold text-foreground">{stats?.totalContacts || 0}</p>
                        {stats?.contactsGrowthMonthly !== undefined && (
                          <div className={`flex items-center text-xs px-2 py-1 rounded-full ${
                            stats.contactsGrowthMonthly >= 0 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {stats.contactsGrowthMonthly >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                            {Math.abs(stats.contactsGrowthMonthly)}%
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stats?.periods.thisMonth.contacts || 0} ce mois
                      </p>
                    </div>
                    <MessageSquare className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              {/* Taux de conversion */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Taux de conversion</p>
                      <p className="text-2xl font-bold text-foreground">{stats?.conversionRate || 0}%</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stats?.totalLeads || 0} prospects total
                      </p>
                    </div>
                    <Target className="w-8 h-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>

              {/* Activité aujourd'hui */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Aujourd'hui</p>
                      <p className="text-2xl font-bold text-foreground">
                        {(stats?.periods.today.registrations || 0) + (stats?.periods.today.contacts || 0)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stats?.periods.today.registrations || 0} inscriptions, {stats?.periods.today.contacts || 0} contacts
                      </p>
                    </div>
                    <Activity className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Section de graphiques */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
            {/* Répartition des contacts par type */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contacts par type</CardTitle>
                <CardDescription>Répartition des demandes</CardDescription>
              </CardHeader>
              <CardContent>
                {stats?.breakdown.contactsByType?.length ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={stats.breakdown.contactsByType}
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                        label={(entry) => `${entry.label}: ${entry.value}`}
                      >
                        {stats.breakdown.contactsByType.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042'][index % 4]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                    Aucune donnée disponible
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Répartition des inscriptions par rôle */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Inscriptions par rôle</CardTitle>
                <CardDescription>Types de participants</CardDescription>
              </CardHeader>
              <CardContent>
                {stats?.breakdown.registrationsByRole?.length ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={stats.breakdown.registrationsByRole}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                    Aucune donnée disponible
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Statut des contacts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Statut des contacts</CardTitle>
                <CardDescription>Suivi des demandes</CardDescription>
              </CardHeader>
              <CardContent>
                {stats?.breakdown.contactsByStatus?.length ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={stats.breakdown.contactsByStatus}
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                        label={(entry) => `${entry.label}: ${entry.value}`}
                      >
                        {stats.breakdown.contactsByStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][index % 4]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                    Aucune donnée disponible
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Métriques de période */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Activité par période</CardTitle>
                <CardDescription>Comparaison des périodes récentes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">Aujourd'hui</p>
                      <p className="text-sm text-muted-foreground">
                        {(stats?.periods.today.registrations || 0) + (stats?.periods.today.contacts || 0)} total
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">
                        {stats?.periods.today.registrations || 0} inscr. | {stats?.periods.today.contacts || 0} cont.
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">7 derniers jours</p>
                      <p className="text-sm text-muted-foreground">
                        {(stats?.periods.last7Days.registrations || 0) + (stats?.periods.last7Days.contacts || 0)} total
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">
                        {stats?.periods.last7Days.registrations || 0} inscr. | {stats?.periods.last7Days.contacts || 0} cont.
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                    <div>
                      <p className="font-medium">30 derniers jours</p>
                      <p className="text-sm text-muted-foreground">
                        {(stats?.periods.last30Days.registrations || 0) + (stats?.periods.last30Days.contacts || 0)} total
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge>
                        {stats?.periods.last30Days.registrations || 0} inscr. | {stats?.periods.last30Days.contacts || 0} cont.
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance mensuelle</CardTitle>
                <CardDescription>Évolution ce mois vs mois dernier</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Inscriptions</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {stats?.periods.thisMonth.registrations || 0} vs {stats?.periods.lastMonth.registrations || 0}
                        </span>
                        {stats?.registrationsGrowthMonthly !== undefined && (
                          <Badge variant={stats.registrationsGrowthMonthly >= 0 ? "default" : "destructive"}>
                            {stats.registrationsGrowthMonthly >= 0 ? "+" : ""}{stats.registrationsGrowthMonthly}%
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(((stats?.periods.thisMonth.registrations || 0) / Math.max((stats?.periods.lastMonth.registrations || 1), 1)) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Contacts</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {stats?.periods.thisMonth.contacts || 0} vs {stats?.periods.lastMonth.contacts || 0}
                        </span>
                        {stats?.contactsGrowthMonthly !== undefined && (
                          <Badge variant={stats.contactsGrowthMonthly >= 0 ? "default" : "destructive"}>
                            {stats.contactsGrowthMonthly >= 0 ? "+" : ""}{stats.contactsGrowthMonthly}%
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(((stats?.periods.thisMonth.contacts || 0) / Math.max((stats?.periods.lastMonth.contacts || 1), 1)) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-foreground">{stats?.conversionRate || 0}%</p>
                      <p className="text-sm text-muted-foreground">Taux de conversion global</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

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