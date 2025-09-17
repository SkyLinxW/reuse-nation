import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WasteCard } from '@/components/WasteCard';
import { useAuth } from '@/hooks/useAuth';
import { getFavorites, getWasteItems } from '@/lib/supabase';
import { useFavorites } from '@/hooks/useFavorites';
import { WasteItem } from '@/types';
import { ArrowLeft, Heart } from 'lucide-react';

interface FavoritesPageProps {
  onNavigate: (page: string) => void;
}

export const FavoritesPage = ({ onNavigate }: FavoritesPageProps) => {
  const [favoriteItems, setFavoriteItems] = useState<any[]>([]);
  const { user } = useAuth();
  const { favorites } = useFavorites();

  useEffect(() => {
    const loadFavorites = async () => {
      if (user && favorites.length > 0) {
        try {
          const allItems = await getWasteItems();
          const favoriteWasteItems = allItems.filter(item => 
            favorites.some(fav => fav.waste_item_id === item.id)
          );
          setFavoriteItems(favoriteWasteItems);
        } catch (error) {
          console.error('Error loading favorites:', error);
        }
      } else {
        setFavoriteItems([]);
      }
    };
    loadFavorites();
  }, [user?.id, favorites]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-eco-light/20 to-eco-cream/30 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-xl bg-white/95 backdrop-blur-sm border-0">
          <CardContent className="text-center py-8">
            <Heart className="w-16 h-16 mx-auto mb-4 text-eco-green" />
            <p className="text-muted-foreground mb-4">
              Você precisa estar logado para ver seus favoritos.
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

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-eco-dark mb-4 flex items-center justify-center gap-3">
              <Heart className="w-12 h-12 text-red-500" />
              Meus Favoritos
            </h1>
            <p className="text-xl text-muted-foreground">
              Seus materiais salvos para consulta rápida
            </p>
          </div>

          <Card className="shadow-xl bg-white/95 backdrop-blur-sm border-0">
            <CardContent className="p-8">
              {favoriteItems.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Heart className="w-12 h-12 text-red-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-eco-dark mb-4">
                    Nenhum favorito ainda
                  </h3>
                  <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
                    Explore nossa plataforma e favorite os materiais que mais interessam você!
                  </p>
                  <Button 
                    onClick={() => onNavigate('home')}
                    className="bg-eco-green hover:bg-eco-green/90 text-white px-8 py-3 rounded-xl"
                  >
                    Explorar Materiais
                  </Button>
                </div>
              ) : (
                <div>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-eco-dark mb-2">
                      {favoriteItems.length} {favoriteItems.length === 1 ? 'material favoritado' : 'materiais favoritados'}
                    </h2>
                    <p className="text-muted-foreground">
                      Clique nos itens para ver mais detalhes
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favoriteItems.map((item) => (
                      <WasteCard
                        key={item.id}
                        waste={item}
                        onNavigate={onNavigate}
                      />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};