import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { updateProfile, getTransactions } from '@/lib/supabase';
import { ArrowLeft, User as UserIcon, Star, Package, MessageCircle, Award, Mail, Phone, MapPin, Edit3, Camera, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProfilePageProps {
  onNavigate: (page: string) => void;
}

export const ProfilePage = ({ onNavigate }: ProfilePageProps) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [transactionCount, setTransactionCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    userType: 'pessoa_fisica' as 'pessoa_fisica' | 'pessoa_juridica',
    cnpj: '',
    cpf: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        setFormData({
          name: user.email || '',
          email: user.email || '',
          phone: '',
          bio: '',
          street: '',
          city: '',
          state: '',
          zipCode: '',
          userType: 'pessoa_fisica',
          cnpj: '',
          cpf: '',
        });

        try {
          const userTransactions = await getTransactions(user.id);
          setTransactionCount(userTransactions?.length || 0);
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      }
    };
    loadUserData();
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      await updateProfile(user.id, formData);
      setIsEditing(false);

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar perfil",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.email || '',
        email: user.email || '',
        phone: '',
        bio: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        userType: 'pessoa_fisica',
        cnpj: '',
        cpf: '',
      });
    }
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-eco-light/20 to-eco-cream/30 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-xl bg-white/95 backdrop-blur-sm">
          <CardContent className="text-center py-8">
            <UserIcon className="w-16 h-16 mx-auto mb-4 text-eco-green" />
            <p className="text-muted-foreground mb-4">
              Você precisa estar logado para ver seu perfil.
            </p>
            <Button onClick={() => onNavigate('login')} className="bg-eco-green hover:bg-eco-green/90">
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-eco-light/20 to-eco-cream/30 relative overflow-hidden">
      <div className="absolute inset-0 opacity-40">
        <div className="w-full h-full bg-eco-green/5 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-eco-green/10 via-transparent to-transparent"></div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => onNavigate('home')}
          className="mb-6 hover:bg-white/20 backdrop-blur-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main Profile Card */}
          <div className="xl:col-span-3 space-y-6">
            <Card className="shadow-xl bg-white/95 backdrop-blur-sm border-0">
              <CardHeader className="bg-gradient-to-r from-eco-green to-eco-blue text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar className="w-24 h-24 border-4 border-white/20">
                        <AvatarImage src="" alt={user.email} />
                        <AvatarFallback className="bg-white/20 text-white text-2xl font-bold">
                          {user.email?.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {isEditing && (
                        <Button
                          size="sm"
                          className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-white text-eco-green hover:bg-white/90"
                        >
                          <Camera className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold">{user.email}</h1>
                      <div className="flex items-center gap-2 mt-2">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <span className="text-lg font-semibold">5.0</span>
                        <span className="text-white/80">(0 avaliações)</span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/20">
                          ✓ Verificado
                        </Badge>
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/20">
                          EcoChain Member
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant={isEditing ? "secondary" : "secondary"}
                    onClick={() => setIsEditing(!isEditing)}
                    className="bg-white/20 border-white/20 text-white hover:bg-white/30"
                    disabled={loading}
                  >
                    {isEditing ? <X className="w-4 h-4 mr-2" /> : <Edit3 className="w-4 h-4 mr-2" />}
                    {isEditing ? 'Cancelar' : 'Editar Perfil'}
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-eco-dark flex items-center gap-2">
                      <UserIcon className="w-5 h-5" />
                      Informações Básicas
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium">Nome Completo</Label>
                        <div className="relative">
                          <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="name"
                            placeholder="Seu nome completo"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            disabled={!isEditing}
                            className="pl-10 h-12 bg-background/50 border-border/50 focus:bg-background focus:border-eco-green"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email"
                            placeholder="seu@email.com"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            disabled={!isEditing}
                            className="pl-10 h-12 bg-background/50 border-border/50 focus:bg-background focus:border-eco-green"
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
                            disabled={!isEditing}
                            className="pl-10 h-12 bg-background/50 border-border/50 focus:bg-background focus:border-eco-green"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="userType" className="text-sm font-medium">Tipo de Pessoa</Label>
                        <Select 
                          value={formData.userType} 
                          onValueChange={(value) => handleInputChange('userType', value)}
                          disabled={!isEditing}
                        >
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
                            disabled={!isEditing}
                            className="h-12 bg-background/50 border-border/50 focus:bg-background focus:border-eco-green"
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
                            disabled={!isEditing}
                            className="h-12 bg-background/50 border-border/50 focus:bg-background focus:border-eco-green"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Address Information */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-eco-dark flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Endereço
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="street" className="text-sm font-medium">Endereço Completo</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="street"
                            placeholder="Rua, número, bairro"
                            value={formData.street}
                            onChange={(e) => handleInputChange('street', e.target.value)}
                            disabled={!isEditing}
                            className="pl-10 h-12 bg-background/50 border-border/50 focus:bg-background focus:border-eco-green"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city" className="text-sm font-medium">Cidade</Label>
                          <Input
                            id="city"
                            placeholder="Sua cidade"
                            value={formData.city}
                            onChange={(e) => handleInputChange('city', e.target.value)}
                            disabled={!isEditing}
                            className="h-12 bg-background/50 border-border/50 focus:bg-background focus:border-eco-green"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="zipCode" className="text-sm font-medium">CEP</Label>
                          <Input
                            id="zipCode"
                            placeholder="00000-000"
                            value={formData.zipCode}
                            onChange={(e) => handleInputChange('zipCode', e.target.value)}
                            disabled={!isEditing}
                            className="h-12 bg-background/50 border-border/50 focus:bg-background focus:border-eco-green"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="state" className="text-sm font-medium">Estado</Label>
                        <Input
                          id="state"
                          placeholder="Estado"
                          value={formData.state}
                          onChange={(e) => handleInputChange('state', e.target.value)}
                          disabled={!isEditing}
                          className="h-12 bg-background/50 border-border/50 focus:bg-background focus:border-eco-green"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bio Section */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-eco-dark">Sobre Mim</h3>
                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-sm font-medium">Biografia</Label>
                    <Textarea
                      id="bio"
                      placeholder="Conte um pouco sobre você e sua experiência com sustentabilidade..."
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      disabled={!isEditing}
                      className="min-h-[100px] bg-background/50 border-border/50 focus:bg-background focus:border-eco-green resize-none"
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="flex gap-3 pt-4 border-t">
                    <Button 
                      onClick={handleSave} 
                      className="bg-eco-green hover:bg-eco-green/90 text-white flex-1"
                      disabled={loading}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {loading ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleCancel}
                      className="flex-1"
                      disabled={loading}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            <Card className="shadow-xl bg-white/95 backdrop-blur-sm border-0">
              <CardHeader className="bg-gradient-to-r from-eco-green to-eco-blue text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-white">
                  <Award className="w-5 h-5" />
                  Estatísticas
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="text-center p-4 bg-gradient-to-br from-eco-green/10 to-eco-green/5 rounded-xl border border-eco-green/20">
                  <Package className="w-10 h-10 mx-auto mb-3 text-eco-green" />
                  <p className="text-3xl font-bold text-eco-dark">{transactionCount}</p>
                  <p className="text-sm text-muted-foreground font-medium">Transações</p>
                </div>

                <div className="text-center p-4 bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-xl border border-yellow-200">
                  <Star className="w-10 h-10 mx-auto mb-3 text-yellow-500" />
                  <p className="text-3xl font-bold text-eco-dark">5.0</p>
                  <p className="text-sm text-muted-foreground font-medium">Avaliação Média</p>
                </div>

                <div className="text-center p-4 bg-gradient-to-br from-eco-blue/10 to-eco-blue/5 rounded-xl border border-eco-blue/20">
                  <MessageCircle className="w-10 h-10 mx-auto mb-3 text-eco-blue" />
                  <p className="text-3xl font-bold text-eco-dark">{reviews.length}</p>
                  <p className="text-sm text-muted-foreground font-medium">Avaliações</p>
                </div>
              </CardContent>
            </Card>

            {/* Achievements Card */}
            <Card className="shadow-xl bg-white/95 backdrop-blur-sm border-0">
              <CardHeader>
                <CardTitle className="text-eco-dark">Conquistas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-eco-green/10 rounded-lg">
                  <div className="w-8 h-8 bg-eco-green rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">🌱</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Eco Iniciante</p>
                    <p className="text-xs text-muted-foreground">Primeira transação concluída</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg opacity-60">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                    <span className="text-muted-foreground font-bold text-sm">♻️</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Reciclador</p>
                    <p className="text-xs text-muted-foreground">Complete 10 transações</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};