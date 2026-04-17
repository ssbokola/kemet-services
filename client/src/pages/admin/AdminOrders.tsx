/**
 * Dashboard admin des commandes — Chantier 4 Lot 2.
 *
 * Route : /admin/commandes (protégée par admin_token en localStorage)
 *
 * Fonctionnalités :
 *   - Tuiles stats par statut (en attente, payées, annulées, échouées) + CA cumulé payé
 *   - Table paginée des commandes (20 par page)
 *   - Filtre par statut (all | pending | completed | failed | cancelled)
 *   - Recherche libre (nom/email client, titre formation, ID commande)
 *   - Export CSV
 *
 * L'action "voir le reçu" n'est pas incluse côté admin : le PDF est strictement
 * owner-only. Si l'admin veut aider un client, il peut régénérer manuellement
 * ou demander au client de se connecter. (Pourra être ajouté en Lot 3 si besoin,
 * en élargissant la route /receipt avec un role-check.)
 */
import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  Receipt,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  TrendingUp,
  ArrowLeft,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AdminOrder {
  id: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | string;
  amount: number;
  currency: string;
  paymentMethod: string | null;
  waveTransactionId: string | null;
  createdAt: string;
  paidAt: string | null;
  user: { id: string; firstName: string | null; lastName: string | null; email: string | null } | null;
  course: { id: string; title: string; slug: string } | null;
}

interface StatRow {
  status: string;
  count: number;
  amountSum: number;
}

interface OrdersResponse {
  orders: AdminOrder[];
  pagination: { page: number; limit: number; total: number; pages: number };
  stats: StatRow[];
}

// ---------------------------------------------------------------------------
// Composant
// ---------------------------------------------------------------------------

export default function AdminOrders() {
  const [, setLocation] = useLocation();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) setLocation('/admin/login');
  }, [setLocation]);

  const { data, isLoading, error } = useQuery<OrdersResponse>({
    queryKey: ['/api/admin/orders', currentPage, searchQuery, statusFilter],
    queryFn: async () => {
      const token = localStorage.getItem('admin_token');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(searchQuery && { search: searchQuery }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
      });
      const res = await fetch(`/api/admin/orders?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
  });

  const orders = data?.orders || [];
  const stats = data?.stats || [];
  const totalPages = data?.pagination.pages || 1;

  // Agrégats pour les tuiles
  const countByStatus = (s: string) => stats.find((x) => x.status === s)?.count || 0;
  const amountByStatus = (s: string) => stats.find((x) => x.status === s)?.amountSum || 0;

  const countPending = countByStatus('pending');
  const countCompleted = countByStatus('completed');
  const countFailed = countByStatus('failed');
  const countCancelled = countByStatus('cancelled');
  const revenueTotal = amountByStatus('completed');

  // --- Search submit ---
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput.trim());
    setCurrentPage(1);
  };

  // --- CSV export (current page seulement pour rester simple) ---
  const handleExportCSV = () => {
    if (orders.length === 0) return;
    const headers = ['Date', 'Commande', 'Statut', 'Client', 'Email', 'Formation', 'Méthode', 'Référence Wave', 'Montant'];
    const csv = [
      headers.join(','),
      ...orders.map((o) => {
        const fullName = o.user ? `${o.user.firstName || ''} ${o.user.lastName || ''}`.trim() : '';
        return [
          new Date(o.paidAt || o.createdAt).toLocaleDateString('fr-FR'),
          o.id.slice(0, 8).toUpperCase(),
          o.status,
          csvEscape(fullName),
          csvEscape(o.user?.email || ''),
          csvEscape(o.course?.title || ''),
          o.paymentMethod || '',
          o.waveTransactionId || '',
          `${o.amount} ${o.currency || 'XOF'}`,
        ].join(',');
      }),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `commandes-kemet-${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
    URL.revokeObjectURL(url);
  };

  // --- Render ---

  const statusBadge = (s: string) => {
    if (s === 'completed')
      return <Badge className="bg-emerald-600 hover:bg-emerald-700 gap-1"><CheckCircle2 className="w-3 h-3" />Payée</Badge>;
    if (s === 'pending')
      return <Badge className="bg-blue-500 text-white hover:bg-blue-600 gap-1"><Clock className="w-3 h-3" />En attente</Badge>;
    if (s === 'cancelled')
      return <Badge className="bg-amber-500 text-white hover:bg-amber-600 gap-1"><AlertTriangle className="w-3 h-3" />Annulée</Badge>;
    if (s === 'failed')
      return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" />Échouée</Badge>;
    return <Badge variant="outline">{s}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <Button variant="ghost" size="sm" asChild className="mb-2" data-testid="button-back-admin">
              <Link href="/admin/dashboard"><ArrowLeft className="w-4 h-4 mr-1" />Retour dashboard</Link>
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <Receipt className="w-7 h-7 text-primary" />
              Commandes et paiements
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Toutes les transactions de la plateforme (Wave, inscriptions payantes).
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleExportCSV}
            disabled={orders.length === 0}
            data-testid="button-export-csv"
          >
            <Download className="w-4 h-4 mr-2" />
            Exporter CSV (page)
          </Button>
        </div>

        {/* Tuiles stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatTile icon={<TrendingUp className="w-4 h-4 text-emerald-700" />} label="Encaissé" value={formatAmount(revenueTotal)} tone="emerald" testId="stat-revenue" />
          <StatTile icon={<CheckCircle2 className="w-4 h-4 text-emerald-700" />} label="Payées" value={String(countCompleted)} tone="emerald" testId="stat-completed" />
          <StatTile icon={<Clock className="w-4 h-4 text-blue-700" />} label="En attente" value={String(countPending)} tone="blue" testId="stat-pending" />
          <StatTile icon={<AlertTriangle className="w-4 h-4 text-amber-700" />} label="Annulées" value={String(countCancelled)} tone="amber" testId="stat-cancelled" />
          <StatTile icon={<XCircle className="w-4 h-4 text-red-700" />} label="Échouées" value={String(countFailed)} tone="red" testId="stat-failed" />
        </div>

        {/* Filtres + recherche */}
        <Card>
          <CardContent className="py-4">
            <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Rechercher par nom, email, formation ou n° de commande…"
                    className="pl-9"
                    data-testid="input-search-orders"
                  />
                </div>
              </div>
              <Select
                value={statusFilter}
                onValueChange={(v) => {
                  setStatusFilter(v);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full md:w-48" data-testid="select-status-filter">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="completed">Payées</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="cancelled">Annulées</SelectItem>
                  <SelectItem value="failed">Échouées</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" data-testid="button-search-orders">Rechercher</Button>
            </form>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>Commandes ({data?.pagination.total ?? '…'})</span>
              <span className="text-xs font-normal text-muted-foreground">
                Page {currentPage} / {totalPages}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="py-12 text-center text-muted-foreground">Chargement…</div>
            ) : error ? (
              <div className="py-12 text-center text-red-600">Erreur lors du chargement des commandes.</div>
            ) : orders.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground" data-testid="text-no-orders">
                Aucune commande ne correspond aux critères.
              </div>
            ) : (
              <Table data-testid="table-orders">
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Commande</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Formation</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((o) => (
                    <TableRow key={o.id} data-testid={`row-order-${o.id}`}>
                      <TableCell className="whitespace-nowrap text-sm">
                        {new Date(o.paidAt || o.createdAt).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{o.id.slice(0, 8).toUpperCase()}</TableCell>
                      <TableCell>
                        {o.user ? (
                          <div>
                            <div className="font-medium text-sm">
                              {`${o.user.firstName || ''} ${o.user.lastName || ''}`.trim() || '—'}
                            </div>
                            <div className="text-xs text-muted-foreground">{o.user.email || '—'}</div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">Utilisateur supprimé</span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        {o.course ? (
                          <Link
                            href={`/formation/${o.course.slug}`}
                            className="text-sm text-primary hover:underline line-clamp-2"
                          >
                            {o.course.title}
                          </Link>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell>{statusBadge(o.status)}</TableCell>
                      <TableCell className="text-right font-semibold whitespace-nowrap">
                        {o.amount.toLocaleString('fr-FR')} {o.currency || 'XOF'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              data-testid="button-prev-page"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              data-testid="button-next-page"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sous-composants / helpers
// ---------------------------------------------------------------------------

function StatTile({
  icon,
  label,
  value,
  tone,
  testId,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: 'emerald' | 'blue' | 'amber' | 'red';
  testId: string;
}) {
  const toneClass =
    tone === 'emerald'
      ? 'bg-emerald-50 border-emerald-200'
      : tone === 'blue'
      ? 'bg-blue-50 border-blue-200'
      : tone === 'amber'
      ? 'bg-amber-50 border-amber-200'
      : 'bg-red-50 border-red-200';

  return (
    <div
      className={`rounded-lg border ${toneClass} p-3 flex flex-col gap-1.5`}
      data-testid={testId}
    >
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="text-lg font-bold">{value}</div>
    </div>
  );
}

function formatAmount(n: number): string {
  return `${n.toLocaleString('fr-FR')} F`;
}

function csvEscape(s: string): string {
  if (s.includes(',') || s.includes('"')) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
