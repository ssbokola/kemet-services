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
import Diagnostic from "@/pages/Diagnostic";
import Consulting from "@/pages/Consulting";
import APropos from "@/pages/APropos";
import Ressources from "@/pages/Ressources";
import Contact from "@/pages/Contact";
import InscriptionFormation from "@/pages/InscriptionFormation";
import Inscriptions from "@/pages/Inscriptions";
import NotFound from "@/pages/not-found";
import MentionsLegales from "@/pages/MentionsLegales";
import Confidentialite from "@/pages/Confidentialite";
import PolitiqueCookies from "@/pages/PolitiqueCookies";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/formations" component={Formations} />
      <Route path="/diagnostic" component={Diagnostic} />
      <Route path="/consulting" component={Consulting} />
      <Route path="/a-propos" component={APropos} />
      <Route path="/ressources" component={Ressources} />
      <Route path="/contact" component={Contact} />
      <Route path="/inscription-formation" component={InscriptionFormation} />
      <Route path="/inscriptions" component={Inscriptions} />
      <Route path="/mentions-legales" component={MentionsLegales} />
      <Route path="/confidentialite" component={Confidentialite} />
      <Route path="/politique-cookies" component={PolitiqueCookies} />
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
