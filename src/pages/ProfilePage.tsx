import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { updateProfile, getTransactions } from '@/lib/supabase';
import { User, Review } from '@/types';
import { ArrowLeft, User as UserIcon, Star, Package, MessageCircle, Award } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProfilePageProps {
  onNavigate: (page: string) => void;
}

export const ProfilePage = ({ onNavigate }: ProfilePageProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [transactionCount, setTransactionCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setFormData({
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone,
        street: currentUser.address.street,
        city: currentUser.address.city,
        state: currentUser.address.state,
        zipCode: currentUser.address.zipCode
      });

      const userReviews = getUserReviews(currentUser.id);
      setReviews(userReviews);

      const userTransactions = getUserTransactions(currentUser.id);
      setTransactionCount(userTransactions.length);
    }
  }, []);

  const handleSave = () => {
    if (!user) return;

    const updatedUser: User = {
      ...user,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode
      }
    };

    saveUser(updatedUser);
    setUser(updatedUser);
    setIsEditing(false);

    toast({
      title: "Perfil atualizado",
      description: "Suas informações foram salvas com sucesso.",
    });
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone,
        street: user.address.street,
        city: user.address.city,
        state: user.address.state,
        zipCode: user.address.zipCode
      });
    }
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Você precisa estar logado para ver seu perfil.
            </p>
            <Button onClick={() => onNavigate('login')}>
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => onNavigate('home')}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações principais */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="w-5 h-5" />
                Meu Perfil
              </CardTitle>
              <Button
                variant={isEditing ? "outline" : "default"}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancelar' : 'Editar'}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="w-20 h-20">
                  <AvatarImage src="" alt={user.name} />
                  <AvatarFallback className="bg-eco-green text-white text-xl">
                    {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold">{user.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{user.rating.toFixed(1)}</span>
                    <span className="text-muted-foreground">
                      ({user.reviewCount} avaliações)
                    </span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Badge variant={user.isVerified ? 'default' : 'secondary'}>
                      {user.isVerified ? '✓ Verificado' : 'Não Verificado'}
                    </Badge>
                    <Badge variant="outline">
                      {user.userType === 'pessoa_fisica' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome/Razão Social</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{user.userType === 'pessoa_fisica' ? 'CPF' : 'CNPJ'}</Label>
                  <Input
                    value={user.userType === 'pessoa_fisica' ? user.cpf || '' : user.cnpj || ''}
                    disabled
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="street">Endereço</Label>
                  <Input
                    id="street"
                    value={formData.street}
                    onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipCode">CEP</Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-2">
                  <Button onClick={handleSave} className="bg-eco-green hover:bg-eco-green/90">
                    Salvar Alterações
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    Cancelar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Estatísticas */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Estatísticas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-eco-green/10 rounded-lg">
                <Package className="w-8 h-8 mx-auto mb-2 text-eco-green" />
                <p className="text-2xl font-bold">{transactionCount}</p>
                <p className="text-sm text-muted-foreground">Transações</p>
              </div>

              <div className="text-center p-4 bg-eco-green/10 rounded-lg">
                <Star className="w-8 h-8 mx-auto mb-2 text-eco-green" />
                <p className="text-2xl font-bold">{user.rating.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">Avaliação Média</p>
              </div>

              <div className="text-center p-4 bg-eco-green/10 rounded-lg">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 text-eco-green" />
                <p className="text-2xl font-bold">{reviews.length}</p>
                <p className="text-sm text-muted-foreground">Avaliações</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Membro desde</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {new Date(user.createdAt).toLocaleDateString('pt-BR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};