import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { User } from '@/types';
import { Eye, EyeOff, User as UserIcon, Mail, Lock, Phone, MapPin, Chrome, ArrowLeft, Check } from 'lucide-react';

interface RegisterPageProps {
  onNavigate: (page: string) => void;
}

export const RegisterPage = ({ onNavigate }: RegisterPageProps) => {
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    userType: 'pessoa_fisica' as 'pessoa_fisica' | 'pessoa_juridica',
    cnpj: '',
    cpf: '',
    password: '',
    confirmPassword: '',
    street: '',
    city: '',
    state: '',
    zipCode: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Erro no cadastro",
          description: "As senhas não coincidem.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (!acceptTerms) {
        toast({
          title: "Erro no cadastro",
          description: "Você deve aceitar os Termos e Política de Privacidade.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const newUser: User = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        userType: formData.userType,
        cnpj: formData.userType === 'pessoa_juridica' ? formData.cnpj : undefined,
        cpf: formData.userType === 'pessoa_fisica' ? formData.cpf : undefined,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode
        },
        rating: 5.0,
        reviewCount: 0,
        createdAt: new Date().toISOString(),
        isVerified: false
      };

      const { error } = await signUp(formData.email, formData.password, formData.name);
      
      if (error) {
        toast({
          title: "Erro ao criar conta",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Conta criada com sucesso!",
          description: "Bem-vindo ao EcoMarket!",
        });
        onNavigate('home');
      }

      toast({
        title: "Cadastro realizado com sucesso!",
        description: `Bem-vindo(a) ao EcoMarket, ${newUser.name}!`,
      });

      onNavigate('home');
    } catch (error) {
      toast({
        title: "Erro no cadastro",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);

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
              <p className="text-xl opacity-90 mb-8">Junte-se ao marketplace sustentável e transforme resíduos em recursos</p>
              <div className="space-y-4 text-left max-w-md">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>Marketplace verificado e seguro</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>Comunidade de +10.000 usuários</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>Impacto ambiental mensurável</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 lg:max-w-2xl">
            <Card className="h-full lg:rounded-l-none shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
              <CardHeader className="text-center space-y-2 pb-6">
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
                
                <CardTitle className="text-3xl font-bold text-eco-dark">Crie sua conta EcoChain</CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  Junte-se ao marketplace sustentável e transforme resíduos em recursos
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <form onSubmit={handleRegister} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">Nome Completo</Label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="name"
                          placeholder="Seu nome completo"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className="pl-10 h-12 bg-background/50 border-border/50 focus:bg-background focus:border-eco-green"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="seu@email.com"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="pl-10 h-12 bg-background/50 border-border/50 focus:bg-background focus:border-eco-green"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium">Telefone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          placeholder="(11) 99999-9999"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="pl-10 h-12 bg-background/50 border-border/50 focus:bg-background focus:border-eco-green"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="userType" className="text-sm font-medium">Tipo de Pessoa</Label>
                      <Select value={formData.userType} onValueChange={(value) => handleInputChange('userType', value)}>
                        <SelectTrigger className="h-12 bg-background/50 border-border/50 focus:bg-background focus:border-eco-green">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pessoa_fisica">Pessoa Física</SelectItem>
                          <SelectItem value="pessoa_juridica">Pessoa Jurídica</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.userType === 'pessoa_fisica' ? (
                      <div className="space-y-2">
                        <Label htmlFor="cpf" className="text-sm font-medium">CPF</Label>
                        <Input
                          id="cpf"
                          value={formData.cpf}
                          onChange={(e) => handleInputChange('cpf', e.target.value)}
                          placeholder="000.000.000-00"
                          className="h-12 bg-background/50 border-border/50 focus:bg-background focus:border-eco-green"
                          required
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label htmlFor="cnpj" className="text-sm font-medium">CNPJ</Label>
                        <Input
                          id="cnpj"
                          value={formData.cnpj}
                          onChange={(e) => handleInputChange('cnpj', e.target.value)}
                          placeholder="00.000.000/0000-00"
                          className="h-12 bg-background/50 border-border/50 focus:bg-background focus:border-eco-green"
                          required
                        />
                      </div>
                    )}

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="street" className="text-sm font-medium">Endereço Completo</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="street"
                          placeholder="Rua, número, bairro"
                          value={formData.street}
                          onChange={(e) => handleInputChange('street', e.target.value)}
                          className="pl-10 h-12 bg-background/50 border-border/50 focus:bg-background focus:border-eco-green"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-sm font-medium">Cidade</Label>
                      <Input
                        id="city"
                        placeholder="Sua cidade"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className="h-12 bg-background/50 border-border/50 focus:bg-background focus:border-eco-green"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="zipCode" className="text-sm font-medium">CEP</Label>
                      <Input
                        id="zipCode"
                        placeholder="00000-000"
                        value={formData.zipCode}
                        onChange={(e) => handleInputChange('zipCode', e.target.value)}
                        className="h-12 bg-background/50 border-border/50 focus:bg-background focus:border-eco-green"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Crie uma senha forte"
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          className="pl-10 pr-12 h-12 bg-background/50 border-border/50 focus:bg-background focus:border-eco-green"
                          required
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
                      {formData.password && (
                        <div className="space-y-2">
                          <div className="flex space-x-1">
                            {[...Array(4)].map((_, i) => (
                              <div
                                key={i}
                                className={`h-1 flex-1 rounded-full ${
                                  i < passwordStrength
                                    ? passwordStrength < 2
                                      ? 'bg-red-500'
                                      : passwordStrength < 3
                                      ? 'bg-yellow-500'
                                      : 'bg-eco-green'
                                    : 'bg-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                          <div className="space-y-1 text-xs">
                            <div className={`flex items-center space-x-1 ${formData.password.length >= 8 ? 'text-eco-green' : 'text-muted-foreground'}`}>
                              <Check className={`h-3 w-3 ${formData.password.length >= 8 ? 'opacity-100' : 'opacity-30'}`} />
                              <span>Mínimo 8 caracteres</span>
                            </div>
                            <div className={`flex items-center space-x-1 ${/[A-Z]/.test(formData.password) ? 'text-eco-green' : 'text-muted-foreground'}`}>
                              <Check className={`h-3 w-3 ${/[A-Z]/.test(formData.password) ? 'opacity-100' : 'opacity-30'}`} />
                              <span>Uma letra maiúscula</span>
                            </div>
                            <div className={`flex items-center space-x-1 ${/[0-9]/.test(formData.password) ? 'text-eco-green' : 'text-muted-foreground'}`}>
                              <Check className={`h-3 w-3 ${/[0-9]/.test(formData.password) ? 'opacity-100' : 'opacity-30'}`} />
                              <span>Um número</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirmar Senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Confirme sua senha"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          className="pl-10 h-12 bg-background/50 border-border/50 focus:bg-background focus:border-eco-green"
                          required
                        />
                      </div>
                      {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                        <p className="text-xs text-red-500">As senhas não coincidem</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox 
                      id="terms" 
                      checked={acceptTerms}
                      onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                      className="data-[state=checked]:bg-eco-green data-[state=checked]:border-eco-green mt-1"
                    />
                    <Label htmlFor="terms" className="text-sm text-muted-foreground leading-5 cursor-pointer">
                      Aceito os{' '}
                      <Button variant="link" className="text-eco-green p-0 h-auto font-medium">
                        Termos de Uso
                      </Button>
                      {' '}e{' '}
                      <Button variant="link" className="text-eco-green p-0 h-auto font-medium">
                        Política de Privacidade
                      </Button>
                    </Label>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-eco-green hover:bg-eco-green/90 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={loading || !acceptTerms}
                  >
                    {loading ? 'Criando conta...' : 'Criar conta'}
                  </Button>
                </form>

                <div className="relative">
                  <Separator className="my-6" />
                  <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-sm text-muted-foreground">
                    ou cadastre-se com
                  </span>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full h-12 border-border/50 hover:bg-background/80"
                >
                  <Chrome className="w-5 h-5 mr-2" />
                  Google
                </Button>

                <div className="text-center pt-4">
                  <p className="text-sm text-muted-foreground">
                    Já tem uma conta?{' '}
                    <Button
                      variant="link"
                      className="p-0 text-eco-green font-medium h-auto"
                      onClick={() => onNavigate('login')}
                    >
                      Faça login aqui
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