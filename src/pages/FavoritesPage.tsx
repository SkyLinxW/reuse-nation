import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WasteCard } from '@/components/WasteCard';
import { getCurrentUser, getWasteItems } from '@/lib/localStorage';
import { useFavorites } from '@/hooks/useFavorites';
import { WasteItem } from '@/types';
import { ArrowLeft, Heart } from 'lucide-react';

interface FavoritesPageProps {
  onNavigate: (page: string) => void;
}

export const FavoritesPage = ({ onNavigate }: FavoritesPageProps) => {
  const [favoriteItems, setFavoriteItems] = useState<WasteItem[]>([]);
  const currentUser = getCurrentUser();
  const { favorites } = useFavorites();

  useEffect(() => {
    if (currentUser && favorites.length > 0) {
      const allItems = getWasteItems();
      const favoriteWasteItems = allItems.filter(item => 
        favorites.some(fav => fav.wasteItemId === item.id)
      );
      setFavoriteItems(favoriteWasteItems);
    } else {
      setFavoriteItems([]);
    }
  }, [currentUser?.id, favorites]);

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Você precisa estar logado para ver seus favoritos.
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            Meus Favoritos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {favoriteItems.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                Você ainda não favoritou nenhum produto.
              </p>
              <Button onClick={() => onNavigate('home')}>
                Explorar Produtos
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteItems.map((item) => (
                <WasteCard
                  key={item.id}
                  waste={item}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};