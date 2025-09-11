import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import Home from "@/pages/Home";
import Formations from "@/pages/Formations";
import Diagnostic from "@/pages/Diagnostic";
import Consulting from "@/pages/Consulting";
import Resultats from "@/pages/Resultats";
import APropos from "@/pages/APropos";
import Ressources from "@/pages/Ressources";
import Contact from "@/pages/Contact";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/formations" component={Formations} />
      <Route path="/diagnostic" component={Diagnostic} />
      <Route path="/consulting" component={Consulting} />
      <Route path="/resultats" component={Resultats} />
      <Route path="/a-propos" component={APropos} />
      <Route path="/ressources" component={Ressources} />
      <Route path="/contact" component={Contact} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
