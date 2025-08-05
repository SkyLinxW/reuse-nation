import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { authenticateUser, setCurrentUser, getUserById } from '@/lib/localStorage';
import { Eye, EyeOff } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

export const LoginPage = ({ onNavigate }: LoginPageProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulação de autenticação
      const user = authenticateUser(email, password);
      if (user) {
        setCurrentUser(user);
        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo(a), ${user.name}!`,
        });
        onNavigate('home');
      } else {
        toast({
          title: "Erro no login",
          description: "Email ou senha incorretos.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro no login",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail('contato@ecoindustria.com');
    setPassword('demo123');
  };

  return (
    <div className="min-h-screen bg-gradient-eco flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-eco">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-eco-green">Entrar no EcoMarket</CardTitle>
          <CardDescription>
            Acesse sua conta para comprar e vender resíduos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-eco hover:opacity-90"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>

            <Button 
              type="button" 
              variant="outline" 
              className="w-full"
              onClick={handleDemoLogin}
            >
              Login Demo (EcoIndústria)
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Não tem uma conta?{' '}
              <Button
                variant="link"
                className="p-0 text-eco-green"
                onClick={() => onNavigate('register')}
              >
                Cadastre-se
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};