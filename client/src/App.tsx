import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { KemetWhatsAppCallout } from "@/components/ui/whatsapp-callout";
import CookieManager from "@/components/CookieManager";
import CookieBanner from "@/components/CookieBanner";
import CookiePreferences from "@/components/CookiePreferences";
import { HelmetProvider } from "react-helmet-async";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import Home from "@/pages/Home";
import Formations from "@/pages/Formations";
import FormationsCatalogue from "@/pages/FormationsCatalogue";
import FormationDetail from "@/pages/FormationDetail";
import MonCompte from "@/pages/MonCompte";
import Galerie from "@/pages/Galerie";
import Diagnostic from "@/pages/Diagnostic";
import Consulting from "@/pages/Consulting";
import APropos from "@/pages/APropos";
import Ressources from "@/pages/Ressources";
import Article from "@/pages/Article";
import Contact from "@/pages/Contact";
import KemetEcho from "@/pages/KemetEcho";
import ChecklistGestion from "@/pages/ChecklistGestion";
import InscriptionFormation from "@/pages/InscriptionFormation";
import Inscriptions from "@/pages/Inscriptions";
import NotFound from "@/pages/not-found";
import MentionsLegales from "@/pages/MentionsLegales";
import Confidentialite from "@/pages/Confidentialite";
import PolitiqueCookies from "@/pages/PolitiqueCookies";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminInscriptions from "@/pages/admin/AdminInscriptions";
import AdminContacts from "@/pages/admin/AdminContacts";
import AdminCourses from "@/pages/admin/AdminCourses";
import AdminCourseContent from "@/pages/admin/AdminCourseContent";
import AdminQuizManager from "@/pages/admin/AdminQuizManager";
import AdminParticipants from "@/pages/admin/AdminParticipants";
import SPFConfig from "@/pages/admin/SPFConfig";
import DKIMConfig from "@/pages/admin/DKIMConfig";
import EmailAuthOverview from "@/pages/admin/EmailAuthOverview";
// Pages participantes sécurisées - blueprint:javascript_log_in_with_replit
import ParticipantDashboard from "@/pages/ParticipantDashboard";
import ParticipantFormations from "@/pages/ParticipantFormations";
import ParticipantCatalogue from "@/pages/ParticipantCatalogue";
import Login from "@/pages/Login";
import LessonViewer from "@/pages/LessonViewer";
import QuizViewer from "@/pages/QuizViewer";
import { useAuth } from "@/hooks/useAuth";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/formations-presentiel" component={Formations} />
      <Route path="/formations" component={FormationsCatalogue} />
      <Route path="/formation/:slug" component={FormationDetail} />
      <Route path="/mon-compte" component={MonCompte} />
      <Route path="/lecon/:lessonId" component={LessonViewer} />
      <Route path="/quiz/:quizId" component={QuizViewer} />
      <Route path="/galerie" component={Galerie} />
      <Route path="/kemet-echo" component={KemetEcho} />
      <Route path="/diagnostic" component={Diagnostic} />
      <Route path="/consulting" component={Consulting} />
      <Route path="/a-propos" component={APropos} />
      <Route path="/ressources" component={Ressources} />
      <Route path="/article/:id" component={Article} />
      <Route path="/ressources/checklist-gestion" component={ChecklistGestion} />
      <Route path="/contact" component={Contact} />
      <Route path="/inscription-formation" component={InscriptionFormation} />
      <Route path="/inscriptions" component={Inscriptions} />
      <Route path="/mentions-legales" component={MentionsLegales} />
      <Route path="/confidentialite" component={Confidentialite} />
      <Route path="/politique-cookies" component={PolitiqueCookies} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/registrations" component={AdminInscriptions} />
      <Route path="/admin/contacts" component={AdminContacts} />
      <Route path="/admin/lessons/:lessonId/quiz" component={AdminQuizManager} />
      <Route path="/admin/courses/:id/content" component={AdminCourseContent} />
      <Route path="/admin/courses" component={AdminCourses} />
      <Route path="/admin/participants" component={AdminParticipants} />
      <Route path="/admin/spf" component={SPFConfig} />
      <Route path="/admin/dkim" component={DKIMConfig} />
      <Route path="/admin/email-auth" component={EmailAuthOverview} />
      {/* Route de connexion - blueprint:javascript_log_in_with_replit */}
      <Route path="/login" component={Login} />
      {/* Routes participants sécurisées - blueprint:javascript_log_in_with_replit */}
      <Route path="/participant/dashboard" component={ParticipantDashboard} />
      <Route path="/participant/formations" component={ParticipantFormations} />
      <Route path="/participant/catalogue" component={ParticipantCatalogue} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const GA4_TRACKING_ID = import.meta.env.VITE_GA4_TRACKING_ID;

  return (
    <HelmetProvider>
      <GoogleAnalytics trackingId={GA4_TRACKING_ID} />
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light">
          <CookieManager>
            <TooltipProvider>
              <Toaster />
              <Router />
              <CookieBanner />
              <CookiePreferences />
              <KemetWhatsAppCallout.Default autoShow={true} showDelay={5000} />
            </TooltipProvider>
          </CookieManager>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
