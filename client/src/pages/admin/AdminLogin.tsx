import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { useLocation } from 'wouter';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

interface LoginResponse {
  message: string;
  token: string;
  admin: {
    id: string;
    username: string;
    role: string;
  };
}

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSetup, setIsSetup] = useState(false);

  // Vérifier si le setup initial est nécessaire
  const { data: setupData } = useQuery({
    queryKey: ['/api/admin/check-setup']
  });

  // Effect pour gérer le setup
  useEffect(() => {
    if (setupData && typeof setupData === 'object' && 'hasAdmin' in setupData) {
      setIsSetup(!(setupData as any).hasAdmin);
    }
  }, [setupData]);

  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const endpoint = isSetup ? '/api/admin/setup' : '/api/admin/login';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      if (!response.ok) {
        throw new Error('Erreur de connexion');
      }
      return response.json() as Promise<LoginResponse>;
    },
    onSuccess: (data) => {
      // Stocker le token dans localStorage
      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_user', JSON.stringify(data.admin));
      
      // Rediriger vers le dashboard
      setLocation('/admin/dashboard');
    },
    onError: (error: any) => {
      console.error('Erreur de connexion:', error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && password) {
      loginMutation.mutate({ username: username.trim(), password });
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">
            {isSetup ? 'Configuration initiale' : 'Administration Kemet'}
          </CardTitle>
          <CardDescription>
            {isSetup 
              ? 'Créez votre compte administrateur'
              : 'Connectez-vous à votre espace administrateur'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nom d'utilisateur</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Votre nom d'utilisateur"
                required
                data-testid="input-username"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Votre mot de passe"
                  required
                  data-testid="input-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setShowPassword(!showPassword)}
                  data-testid="button-toggle-password"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {loginMutation.error && (
              <Alert variant="destructive">
                <AlertDescription>
                  {(loginMutation.error as any)?.message || 'Erreur de connexion'}
                </AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loginMutation.isPending}
              data-testid="button-login"
            >
              {loginMutation.isPending 
                ? 'Connexion...' 
                : isSetup 
                  ? 'Créer le compte admin' 
                  : 'Se connecter'
              }
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}