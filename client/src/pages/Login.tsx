import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function Login() {
  useEffect(() => {
    // Redirection automatique vers l'authentification Replit
    window.location.href = "/api/login";
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="py-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <h3 className="font-medium mb-2">Redirection vers la connexion...</h3>
          <p className="text-sm text-muted-foreground">
            Vous allez être redirigé vers la page de connexion sécurisée.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}