import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Users, BookOpen, Building2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface TrainingRegistration {
  id: string;
  trainingTitle: string;
  participantsCount: number;
  sessionType: string;
  createdAt: string;
}

interface RegistrationsResponse {
  success: boolean;
  data: TrainingRegistration[];
}

export default function Inscriptions() {
  const { data: registrationsData, isLoading, error } = useQuery<RegistrationsResponse>({
    queryKey: ['/api/training-registrations'],
  });

  const registrations = registrationsData?.data || [];

  const totalRegistrations = registrations.length;
  const totalParticipants = registrations.reduce((sum, reg) => sum + reg.participantsCount, 0);
  const interEntreprise = registrations.filter(reg => reg.sessionType === 'inter-entreprise').length;
  const intraEntreprise = registrations.filter(reg => reg.sessionType === 'intra-entreprise').length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold font-serif text-foreground mb-4">
                Inscriptions aux Formations
              </h1>
              <p className="text-xl text-muted-foreground">
                Consultez toutes les demandes d'inscription reçues
              </p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Inscriptions
                  </CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalRegistrations}</div>
                  <p className="text-xs text-muted-foreground">
                    Demandes reçues
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Participants
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalParticipants}</div>
                  <p className="text-xs text-muted-foreground">
                    Personnes à former
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Inter-entreprise
                  </CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{interEntreprise}</div>
                  <p className="text-xs text-muted-foreground">
                    Sessions ouvertes
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Intra-entreprise
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{intraEntreprise}</div>
                  <p className="text-xs text-muted-foreground">
                    Sessions dédiées
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Registrations Table */}
            <Card>
              <CardHeader>
                <CardTitle>Liste des Inscriptions</CardTitle>
                <CardDescription>
                  Toutes les demandes d'inscription aux formations (données non personnelles)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-muted-foreground">Chargement des inscriptions...</div>
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-destructive">Erreur lors du chargement des données</div>
                  </div>
                ) : registrations.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-muted-foreground">Aucune inscription pour le moment</div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Formation</TableHead>
                        <TableHead>Type de Session</TableHead>
                        <TableHead>Participants</TableHead>
                        <TableHead>Date d'inscription</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {registrations.map((registration) => (
                        <TableRow key={registration.id} data-testid={`row-registration-${registration.id}`}>
                          <TableCell className="font-medium">
                            {registration.trainingTitle}
                          </TableCell>
                          <TableCell>
                            <Badge variant={registration.sessionType === 'inter-entreprise' ? 'default' : 'secondary'}>
                              {registration.sessionType === 'inter-entreprise' ? 'Inter-entreprise' : 'Intra-entreprise'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-1 text-muted-foreground" />
                              {registration.participantsCount}
                            </div>
                          </TableCell>
                          <TableCell>
                            {format(new Date(registration.createdAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Information Note */}
            <Card className="mt-8 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      Protection des données personnelles
                    </h3>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Cette page affiche uniquement des données non personnelles (titre de formation, nombre de participants, type de session, date). 
                      Les informations personnelles (noms, emails, téléphones) ne sont pas visibles ici pour respecter la confidentialité des clients.
                      Pour accéder aux détails complets d'une inscription, contactez l'administrateur système.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}