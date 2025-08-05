import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { saveUser, setCurrentUser } from '@/lib/localStorage';
import { User } from '@/types';
import { Eye, EyeOff } from 'lucide-react';

interface RegisterPageProps {
  onNavigate: (page: string) => void;
}

export const RegisterPage = ({ onNavigate }: RegisterPageProps) => {
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

      saveUser(newUser);
      setCurrentUser(newUser);

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

  return (
    <div className="min-h-screen bg-gradient-eco flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-eco">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-eco-green">Cadastrar no EcoMarket</CardTitle>
          <CardDescription>
            Crie sua conta para começar a negociar resíduos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome/Razão Social</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="userType">Tipo de Pessoa</Label>
                <Select value={formData.userType} onValueChange={(value) => handleInputChange('userType', value)}>
                  <SelectTrigger>
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
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => handleInputChange('cpf', e.target.value)}
                    placeholder="000.000.000-00"
                    required
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    value={formData.cnpj}
                    onChange={(e) => handleInputChange('cnpj', e.target.value)}
                    placeholder="00.000.000/0000-00"
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="street">Endereço</Label>
                <Input
                  id="street"
                  value={formData.street}
                  onChange={(e) => handleInputChange('street', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="zipCode">CEP</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-eco hover:opacity-90"
              disabled={loading}
            >
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Já tem uma conta?{' '}
              <Button
                variant="link"
                className="p-0 text-eco-green"
                onClick={() => onNavigate('login')}
              >
                Faça login
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};