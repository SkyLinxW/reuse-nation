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
import { ArrowLeft, User as UserIcon, Star, Package, MessageCircle, Award } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProfilePageProps {
  onNavigate: (page: string) => void;
}

export const ProfilePage = ({ onNavigate }: ProfilePageProps) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [transactionCount, setTransactionCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        setFormData({
          name: user.email || '',
          email: user.email || '',
          phone: '',
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

  const handleSave = async () => {
    if (!user) return;

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
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.email || '',
        email: user.email || '',
        phone: '',
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
                  <AvatarImage src="" alt={user.email} />
                  <AvatarFallback className="bg-eco-green text-white text-xl">
                    {user.email?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold">{user.email}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>5.0</span>
                    <span className="text-muted-foreground">(0 avaliações)</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="default">✓ Verificado</Badge>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
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
                <p className="text-2xl font-bold">5.0</p>
                <p className="text-sm text-muted-foreground">Avaliação Média</p>
              </div>

              <div className="text-center p-4 bg-eco-green/10 rounded-lg">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 text-eco-green" />
                <p className="text-2xl font-bold">{reviews.length}</p>
                <p className="text-sm text-muted-foreground">Avaliações</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};