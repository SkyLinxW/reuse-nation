import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Eye, EyeOff, Mail, Lock, Chrome, ArrowLeft } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

export const LoginPage = ({ onNavigate }: LoginPageProps) => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        toast({
          title: "Erro ao fazer login",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo(a)!`,
        });
        onNavigate('home');
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
    <div className="min-h-screen bg-gradient-to-br from-eco-light/20 to-eco-cream/30 relative overflow-hidden">
      <div className="absolute inset-0 opacity-40">
        <div className="w-full h-full bg-eco-green/5 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-eco-green/10 via-transparent to-transparent"></div>
      </div>
      
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-6xl flex">
          <div className="hidden lg:flex flex-1 bg-gradient-to-br from-eco-green to-eco-dark rounded-l-2xl p-12 items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-white/5 opacity-20"></div>
            <div className="text-center text-white z-10">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                <span className="text-4xl font-bold">E</span>
              </div>
              <h1 className="text-4xl font-bold mb-4">EcoChain</h1>
              <p className="text-xl opacity-90 mb-8">Marketplace sustentável para resíduos e materiais</p>
              <div className="space-y-4 text-left max-w-md">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>Transforme resíduos em recursos</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>Conecte-se com compradores e vendedores</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>Contribua para um futuro sustentável</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 lg:max-w-md">
            <Card className="h-full lg:rounded-l-none shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
              <CardHeader className="text-center space-y-2 pb-8">
                <Button
                  variant="ghost"
                  onClick={() => onNavigate('home')}
                  className="absolute top-4 left-4 p-2"
                  aria-label="Voltar"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                
                <div className="lg:hidden w-16 h-16 bg-eco-green rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">E</span>
                </div>
                
                <CardTitle className="text-3xl font-bold text-eco-dark">Bem-vindo de volta</CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  Acesse sua conta na EcoChain
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-12 bg-background/50 border-border/50 focus:bg-background focus:border-eco-green"
                        required
                        aria-describedby="email-error"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Sua senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-12 h-12 bg-background/50 border-border/50 focus:bg-background focus:border-eco-green"
                        required
                        aria-describedby="password-error"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-10 w-10 p-0 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="remember" 
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked === true)}
                        className="data-[state=checked]:bg-eco-green data-[state=checked]:border-eco-green"
                      />
                      <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                        Lembrar de mim
                      </Label>
                    </div>
                    <Button variant="link" className="text-sm text-eco-green p-0 h-auto">
                      Esqueceu a senha?
                    </Button>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-eco-green hover:bg-eco-green/90 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={loading}
                  >
                    {loading ? 'Entrando...' : 'Entrar'}
                  </Button>
                </form>

                <div className="relative">
                  <Separator className="my-6" />
                  <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-sm text-muted-foreground">
                    ou continue com
                  </span>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full h-12 border-border/50 hover:bg-background/80"
                  onClick={handleDemoLogin}
                >
                  <Chrome className="w-5 h-5 mr-2" />
                  Google
                </Button>

                <div className="text-center pt-4">
                  <p className="text-sm text-muted-foreground">
                    Não tem uma conta?{' '}
                    <Button
                      variant="link"
                      className="p-0 text-eco-green font-medium h-auto"
                      onClick={() => onNavigate('register')}
                    >
                      Cadastre-se aqui
                    </Button>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};