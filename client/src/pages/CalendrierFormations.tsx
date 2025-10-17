import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Download, MapPin, Users, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { formatCFA } from "@/lib/utils";
import jsPDF from "jspdf";

export default function CalendrierFormations() {
  // Fetch all onsite trainings with sessions
  const { data: trainingsData = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/onsite-trainings']
  });

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

  const downloadCalendar = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text("Calendrier des Formations", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text("KEMET Services - Formations Professionnelles en Pharmacie", 105, 28, { align: "center" });
    
    let yPosition = 45;
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginBottom = 20;
    
    // Group sessions by date
    const allSessions: any[] = [];
    trainingsData.forEach((training: any) => {
      if (training.sessions && training.sessions.length > 0) {
        training.sessions.forEach((session: any) => {
          allSessions.push({
            ...session,
            trainingTitle: training.title,
            trainingCategory: training.category
          });
        });
      }
    });

    // Sort sessions by date
    allSessions.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    allSessions.forEach((session, index) => {
      // Check if we need a new page
      if (yPosition > pageHeight - marginBottom - 40) {
        doc.addPage();
        yPosition = 20;
      }

      // Date header
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      const dateStr = new Date(session.startDate).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      doc.text(dateStr, 15, yPosition);
      yPosition += 8;

      // Training info
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`Formation: ${session.trainingTitle}`, 15, yPosition);
      yPosition += 6;
      
      doc.setFontSize(10);
      doc.text(`Catégorie: ${getCategoryLabel(session.trainingCategory)}`, 15, yPosition);
      yPosition += 6;
      
      doc.text(`Lieu: ${session.venue || session.address || 'Abidjan'}`, 15, yPosition);
      yPosition += 6;
      
      const remainingPlaces = session.maxCapacity - (session.currentRegistrations || 0);
      doc.text(`Places disponibles: ${remainingPlaces}/${session.maxCapacity}`, 15, yPosition);
      yPosition += 6;
      
      doc.text(`Prix: ${formatCFA(session.pricePerPerson)}`, 15, yPosition);
      yPosition += 12;

      // Separator line
      doc.setDrawColor(200, 200, 200);
      doc.line(15, yPosition - 5, 195, yPosition - 5);
    });

    // Footer on last page
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `KEMET Services | +225 05 06 87 44 59 | infos@kemetservices.com`,
        105,
        pageHeight - 10,
        { align: "center" }
      );
      doc.text(`Page ${i} sur ${totalPages}`, 195, pageHeight - 10, { align: "right" });
    }

    // Save the PDF
    const filename = `calendrier-formations-kemet-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Count total sessions
  const totalSessions = trainingsData.reduce((sum: number, training: any) => {
    return sum + (training.sessions?.length || 0);
  }, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/formations-presentiel">
              <Button variant="ghost" size="sm" data-testid="button-back-catalog">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour au catalogue
              </Button>
            </Link>
            
            <h1 className="text-xl font-bold text-primary" data-testid="text-page-title">
              Calendrier des Formations
            </h1>
            
            <Button
              onClick={downloadCalendar}
              variant="default"
              size="sm"
              data-testid="button-download-pdf"
            >
              <Download className="h-4 w-4 mr-2" />
              Télécharger PDF
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Summary Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Aperçu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalSessions}</p>
                  <p className="text-sm text-muted-foreground">Sessions programmées</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{trainingsData.length}</p>
                  <p className="text-sm text-muted-foreground">Formations disponibles</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">Abidjan</p>
                  <p className="text-sm text-muted-foreground">Ville principale</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sessions by Training */}
        <div className="space-y-6">
          {trainingsData.map((training: any) => {
            if (!training.sessions || training.sessions.length === 0) return null;

            return (
              <Card key={training.id} data-testid={`card-training-${training.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge>{getCategoryLabel(training.category)}</Badge>
                      </div>
                      <CardTitle className="text-xl">{training.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{training.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {training.sessions.map((session: any) => {
                      const remainingPlaces = session.maxCapacity - (session.currentRegistrations || 0);
                      const isAvailable = remainingPlaces > 0 && session.status === 'open';

                      return (
                        <div
                          key={session.id}
                          className={`p-4 rounded-lg border ${
                            isAvailable ? 'border-border hover-elevate' : 'border-border opacity-60'
                          }`}
                          data-testid={`session-${session.id}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">
                                  {new Date(session.startDate).toLocaleDateString('fr-FR', { 
                                    weekday: 'long',
                                    day: 'numeric', 
                                    month: 'long', 
                                    year: 'numeric' 
                                  })}
                                </span>
                              </div>
                              
                              {session.venue && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  <span>{session.venue}{session.address ? `, ${session.address}` : ''}</span>
                                </div>
                              )}

                              <div className="flex items-center gap-2 text-sm">
                                <Users className="h-3 w-3" />
                                <span className={remainingPlaces < 5 && remainingPlaces > 0 ? 'text-orange-600 dark:text-orange-400 font-medium' : ''}>
                                  {remainingPlaces} place{remainingPlaces > 1 ? 's' : ''} restante{remainingPlaces > 1 ? 's' : ''}
                                </span>
                              </div>
                            </div>

                            <div className="text-right flex flex-col items-end gap-2">
                              <div className="text-lg font-bold text-primary">
                                {formatCFA(session.pricePerPerson)}
                              </div>
                              {isAvailable ? (
                                <Link href={`/formation-presentiel/${training.slug}`}>
                                  <Button size="sm" data-testid={`button-register-${session.id}`}>
                                    S'inscrire
                                  </Button>
                                </Link>
                              ) : (
                                <Badge variant="secondary">Complet</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {totalSessions === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-medium mb-2">Aucune session programmée</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Il n'y a actuellement aucune session programmée. Revenez bientôt !
              </p>
              <Link href="/formations-presentiel">
                <Button variant="outline" data-testid="button-view-catalog">
                  Voir le catalogue
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
