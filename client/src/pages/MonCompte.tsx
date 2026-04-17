import { useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import {
  BookOpen,
  Mail,
  User as UserIcon,
  CheckCircle2,
  Clock,
  Award,
  Receipt,
  FileText,
  XCircle,
  LogOut,
} from 'lucide-react';

interface UserData {
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
}

interface Course {
  id: number;
  title: string;
  slug: string;
  description: string;
  category: string;
  duration: number;
  thumbnailUrl?: string;
}

interface Enrollment {
  id: number;
  userId: string;
  courseId: number;
  status: string;
  enrolledAt: string;
  completedAt?: string;
  progressPercent: number;
}

interface QuizResultWithDetails {
  result: {
    id: string;
    userId: string;
    quizId: string;
    score: number;
    totalPoints: number;
    earnedPoints: number;
    passed: boolean;
    attemptNumber: number;
    timeSpent: number | null;
    startedAt: Date;
    completedAt: Date;
  };
  quiz: {
    id: string;
    title: string;
    lessonId: string | null;
    courseId: string | null;
  };
  lesson: any;
  module: any;
}

interface EnrolledFormation {
  course: Course;
  enrollment: Enrollment;
  quizResults?: QuizResultWithDetails[];
}

// Retourné par GET /api/payments/my-orders
interface MyOrder {
  id: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  amount: number;
  currency: string;
  paymentMethod: string | null;
  waveTransactionId: string | null;
  createdAt: string;
  paidAt: string | null;
  course: { id: string; title: string; slug: string } | null;
}

export default function MonCompte() {
  const { user: authUser, isLoading, isAuthenticated } = useAuth();
  const user = authUser as UserData;
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation('/login');
    }
  }, [isLoading, isAuthenticated, setLocation]);

  const { data: enrollmentsData, isLoading: enrollmentsLoading } = useQuery<{
    success: boolean;
    enrollments: EnrolledFormation[];
  }>({
    queryKey: ['/api/formations/my-enrollments'],
    enabled: isAuthenticated
  });

  const enrollments = enrollmentsData?.enrollments || [];

  // Liste des commandes de l'utilisateur (payantes ou gratuites) pour la
  // section "Mes commandes et reçus"
  const { data: ordersData, isLoading: ordersLoading } = useQuery<{
    success: boolean;
    orders: MyOrder[];
  }>({
    queryKey: ['/api/payments/my-orders'],
    enabled: isAuthenticated,
  });
  const orders = ordersData?.orders || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="py-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center">
              <p className="text-muted-foreground">Chargement...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return `${first}${last}`.toUpperCase() || 'U';
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Mon compte - Kemet Services</title>
        <meta name="description" content="Gérez vos formations et suivez votre progression" />
      </Helmet>

      <Header />

      <main className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <Card>
            <CardHeader className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20" data-testid="avatar-user">
                  <AvatarImage src={user.profileImageUrl} alt={`${user.firstName} ${user.lastName}`} />
                  <AvatarFallback className="text-2xl">
                    {getInitials(user.firstName, user.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold font-serif text-foreground" data-testid="text-username">
                    {user.firstName} {user.lastName}
                  </h1>
                  <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span data-testid="text-email">{user.email}</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="shrink-0"
                  data-testid="button-logout"
                  onClick={async () => {
                    try {
                      await fetch('/api/auth/logout', {
                        method: 'POST',
                        credentials: 'include',
                      });
                    } catch {
                      // On redirige quand même en cas d'erreur réseau — pire
                      // cas : cookie non effacé côté serveur, le user devra
                      // fermer son navigateur pour finaliser.
                    } finally {
                      window.location.href = '/';
                    }
                  }}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Se déconnecter
                </Button>
              </div>
            </CardHeader>
          </Card>

          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold font-serif text-foreground">Mes Formations</h2>
              <Button asChild data-testid="button-explorer">
                <Link href="/formations">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Explorer les formations
                </Link>
              </Button>
            </div>

            {enrollmentsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[0, 1, 2].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="w-full aspect-video" />
                    <CardContent className="p-6 space-y-4">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-2 w-full" />
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-6 w-24" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : !enrollments || enrollments.length === 0 ? (
              <Card>
                <CardContent className="py-16">
                  <div className="text-center max-w-md mx-auto">
                    <div className="bg-muted/50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                      <BookOpen className="w-12 h-12 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-3" data-testid="text-no-formations">
                      Vous n'êtes inscrit à aucune formation
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Commencez votre parcours d'apprentissage en explorant notre catalogue de formations
                    </p>
                    <Button asChild size="lg" data-testid="button-explorer-formations">
                      <Link href="/formations">
                        Explorer les formations
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {enrollments.map(({ course, enrollment, quizResults }, index) => {
                  const isCompleted = enrollment.progressPercent >= 100;
                  const truncatedDescription = course.description?.length > 100 
                    ? `${course.description.substring(0, 100)}...` 
                    : course.description;

                  // Calculate quiz stats
                  const quizCount = quizResults?.length || 0;
                  const bestScore = quizCount > 0 
                    ? Math.max(...quizResults!.map(qr => qr.result.score)) 
                    : null;
                  const hasPassedQuiz = quizResults?.some(qr => qr.result.passed) || false;

                  return (
                    <Card 
                      key={enrollment.id} 
                      className="overflow-hidden hover-elevate"
                      data-testid={`card-enrolled-formation-${index}`}
                    >
                      {course.thumbnailUrl && (
                        <div className="aspect-video w-full overflow-hidden">
                          <img 
                            src={course.thumbnailUrl} 
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <CardContent className="p-6 space-y-4">
                        <div>
                          <h3 className="text-xl font-semibold text-foreground mb-2">{course.title}</h3>
                          <p className="text-sm text-muted-foreground">{truncatedDescription}</p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Progression</span>
                            <span 
                              className="text-sm font-medium text-foreground"
                              data-testid={`text-progress-percent-${index}`}
                            >
                              {enrollment.progressPercent}% complété
                            </span>
                          </div>
                          <Progress 
                            value={enrollment.progressPercent} 
                            className={isCompleted ? "bg-green-100" : ""}
                            data-testid={`progress-${index}`}
                          />
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Badge 
                            variant={isCompleted ? "outline" : "default"}
                            data-testid={`badge-status-${index}`}
                          >
                            {isCompleted ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Complété
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3 mr-1" />
                                En cours
                              </>
                            )}
                          </Badge>
                          <Badge variant="outline">
                            {course.duration}h
                          </Badge>
                        </div>

                        {quizCount > 0 && (
                          <div className="bg-muted/50 rounded-lg p-3 space-y-2" data-testid={`quiz-results-${index}`}>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-foreground">Résultats Quiz</span>
                              <Badge 
                                variant={hasPassedQuiz ? "default" : "outline"}
                                className={hasPassedQuiz ? "bg-green-600" : ""}
                              >
                                {hasPassedQuiz ? "Réussi" : "À améliorer"}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">
                                {quizCount} tentative{quizCount > 1 ? 's' : ''}
                              </span>
                              {bestScore !== null && (
                                <span className="font-medium text-foreground" data-testid={`text-best-score-${index}`}>
                                  Meilleur score: {bestScore}%
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="text-xs text-muted-foreground">
                          Inscrit le {format(new Date(enrollment.enrolledAt), 'dd MMMM yyyy', { locale: fr })}
                        </div>

                        <Button
                          asChild
                          className="w-full"
                          data-testid={`button-continue-${index}`}
                        >
                          <Link href={`/formation/${course.slug}`}>
                            {isCompleted ? 'Revoir la formation' : 'Continuer la formation'}
                          </Link>
                        </Button>

                        {/* Quiz de certification — accessible en permanence ; le
                            serveur contrôle l'éligibilité (inscription + cooldown). */}
                        <Button
                          asChild
                          variant="outline"
                          className="w-full"
                          data-testid={`button-final-quiz-${index}`}
                        >
                          <Link href={`/formation-quiz/${course.id}`}>
                            <Award className="w-4 h-4 mr-2" />
                            Quiz de certification
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Mes commandes et reçus — n'affiche que si le user a au moins une commande */}
          {orders.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold font-serif text-foreground flex items-center gap-2">
                  <Receipt className="w-6 h-6 text-primary" />
                  Mes commandes et reçus
                </h2>
              </div>

              <Card>
                <CardContent className="p-0 divide-y" data-testid="list-orders">
                  {orders.map((order) => {
                    const isPaid = order.status === 'completed';
                    const isPending = order.status === 'pending';
                    const isCancelled = order.status === 'cancelled';
                    const isFailed = order.status === 'failed';

                    const statusBadge = isPaid ? (
                      <Badge className="bg-emerald-600 hover:bg-emerald-700 gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Payée
                      </Badge>
                    ) : isPending ? (
                      <Badge variant="secondary" className="bg-blue-500 text-white hover:bg-blue-600 gap-1">
                        <Clock className="w-3 h-3" />
                        En attente
                      </Badge>
                    ) : isCancelled ? (
                      <Badge variant="secondary" className="bg-amber-500 text-white hover:bg-amber-600 gap-1">
                        Annulée
                      </Badge>
                    ) : isFailed ? (
                      <Badge variant="destructive" className="gap-1">
                        <XCircle className="w-3 h-3" />
                        Échouée
                      </Badge>
                    ) : (
                      <Badge variant="outline">{order.status}</Badge>
                    );

                    const dateToShow = order.paidAt || order.createdAt;
                    const formattedDate = format(new Date(dateToShow), 'dd MMMM yyyy', { locale: fr });
                    const formattedAmount = `${order.amount.toLocaleString('fr-FR')} ${order.currency || 'XOF'}`;

                    return (
                      <div
                        key={order.id}
                        className="p-5 flex flex-col md:flex-row md:items-center gap-4"
                        data-testid={`order-row-${order.id}`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            {statusBadge}
                            <span className="text-xs text-muted-foreground font-mono">
                              #{order.id.slice(0, 8).toUpperCase()}
                            </span>
                          </div>
                          <p className="font-medium text-foreground truncate" data-testid={`order-course-${order.id}`}>
                            {order.course?.title || 'Formation indisponible'}
                          </p>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {isPaid ? 'Payée le' : 'Créée le'} {formattedDate}
                            {order.paymentMethod && ` • ${order.paymentMethod === 'wave' ? 'Wave' : order.paymentMethod}`}
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-lg font-bold text-foreground" data-testid={`order-amount-${order.id}`}>
                              {formattedAmount}
                            </p>
                          </div>

                          {isPaid && (
                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="border-amber-600 text-amber-700 hover:bg-amber-50"
                              data-testid={`button-download-receipt-${order.id}`}
                            >
                              <a
                                href={`/api/payments/receipt/${order.id}/pdf`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <FileText className="w-4 h-4 mr-2" />
                                Reçu PDF
                              </a>
                            </Button>
                          )}

                          {(isPending || isCancelled || isFailed) && order.course && (
                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              data-testid={`button-retry-order-${order.id}`}
                            >
                              <Link href={`/formation/${order.course.slug}`}>
                                Réessayer
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          )}

          <Card>
            <CardHeader>
              <h2 className="text-2xl font-semibold font-serif text-foreground flex items-center gap-2">
                <UserIcon className="w-6 h-6 text-primary" />
                Informations du compte
              </h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Prénom</label>
                  <p className="text-foreground mt-1" data-testid="text-firstname">{user.firstName || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nom</label>
                  <p className="text-foreground mt-1" data-testid="text-lastname">{user.lastName || '-'}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-foreground mt-1" data-testid="text-user-email">{user.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
