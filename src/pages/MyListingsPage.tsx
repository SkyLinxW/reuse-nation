import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WasteCard } from '@/components/WasteCard';
import { useAuth } from '@/hooks/useAuth';
import { getWasteItems, deleteWasteItem } from '@/lib/supabase';
import { ArrowLeft, Plus, Edit, Trash2, Eye, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MyListingsPageProps {
  onNavigate: (page: string) => void;
}

export const MyListingsPage = ({ onNavigate }: MyListingsPageProps) => {
  const { user } = useAuth();
  const [listings, setListings] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const loadListings = async () => {
      if (user) {
        try {
          const allItems = await getWasteItems();
          const userListings = allItems.filter(item => item.user_id === user.id);
          setListings(userListings);
        } catch (error) {
          console.error('Error loading listings:', error);
        }
      }
    };
    loadListings();
  }, [user?.id]);

  const handleDeleteListing = async (listingId: string) => {
    try {
      await deleteWasteItem(listingId);
      setListings(prev => prev.filter(item => item.id !== listingId));
      toast({
        title: "Anúncio excluído",
        description: "O anúncio foi removido com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir anúncio",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Você precisa estar logado para ver seus anúncios.
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

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Meus Anúncios</h1>
        <Button
          onClick={() => onNavigate('create-listing')}
          className="bg-gradient-eco hover:opacity-90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Anúncio
        </Button>
      </div>

      {listings.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Plus className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">
              Você ainda não criou nenhum anúncio.
            </p>
            <Button 
              onClick={() => onNavigate('create-listing')}
              className="bg-gradient-eco hover:opacity-90"
            >
              Criar Primeiro Anúncio
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((item) => (
              <Card key={item.id} className="relative">
                <div className="absolute top-2 right-2 z-10 flex gap-1">
                  <Badge variant={item.availability ? 'default' : 'secondary'}>
                    {item.availability ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                
                <WasteCard
                  waste={item}
                  onNavigate={onNavigate}
                  showActions={false}
                />
                
                <CardContent className="pt-2">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => onNavigate(`product?id=${item.id}`)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Ver
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => onNavigate(`edit-listing?id=${item.id}`)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteListing(item.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};