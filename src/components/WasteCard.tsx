import { Heart, MapPin, Eye, Clock, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WasteItem } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { addToCart } from '@/lib/supabase';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useFavorites } from '@/hooks/useFavorites';

interface WasteCardProps {
  waste: WasteItem;
  onNavigate: (page: string) => void;
  onItemClick?: (id: string) => void;
  onContactSeller?: (sellerId: string, itemId: string) => void;
  showActions?: boolean;
}

const categoryLabels = {
  plasticos: 'Plásticos',
  metais: 'Metais',
  papel: 'Papel',
  madeira: 'Madeira',
  tecidos: 'Tecidos',
  eletronicos: 'Eletrônicos',
  organicos: 'Orgânicos',
  outros: 'Outros'
};

const conditionLabels = {
  novo: 'Novo',
  usado: 'Usado',
  sobras_limpas: 'Sobras Limpas',
  contaminado: 'Contaminado'
};

const conditionColors = {
  novo: 'bg-eco-green text-white',
  usado: 'bg-eco-brown text-white',
  sobras_limpas: 'bg-eco-blue text-white',
  contaminado: 'bg-destructive text-destructive-foreground'
};

export const WasteCard = ({ waste, onNavigate, onItemClick, onContactSeller, showActions = true }: WasteCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isFavorite, toggleFavorite } = useFavorites();

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para favoritar itens",
        variant: "destructive",
      });
      return;
    }
    
    const wasFavorite = isFavorite(waste.id);
    
    try {
      await toggleFavorite(waste.id);
      toast({
        title: wasFavorite ? "Removido dos favoritos" : "Adicionado aos favoritos",
        description: `${waste.title} foi ${wasFavorite ? 'removido dos' : 'adicionado aos'} favoritos.`,
      });
    } catch (error) {
      console.error('Favorite error:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar favoritos",
        variant: "destructive",
      });
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para adicionar itens ao carrinho",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await addToCart(user.id, waste.id, 1);
      toast({
        title: "Adicionado ao carrinho",
        description: `${waste.title} foi adicionado ao seu carrinho.`,
      });
    } catch (error) {
      console.error('Cart error:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar item ao carrinho",
        variant: "destructive",
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Card 
      className="hover:shadow-eco transition-all duration-300 cursor-pointer group border-border"
      onClick={() => onItemClick?.(waste.id)}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex gap-2">
            <Badge variant="secondary" className="text-xs">
              {categoryLabels[waste.category]}
            </Badge>
            <Badge 
              className={`text-xs ${conditionColors[waste.condition]}`}
            >
              {conditionLabels[waste.condition]}
            </Badge>
          </div>
          
          {user && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFavoriteToggle}
              className="p-1 h-auto hover:bg-eco-green-light"
            >
              <Heart 
                className={`w-4 h-4 ${isFavorite(waste.id) ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} 
              />
            </Button>
          )}
        </div>

        <h3 className="font-semibold text-lg mb-2 group-hover:text-eco-green transition-colors line-clamp-2">
          {waste.title}
        </h3>

        <p className="text-muted-foreground text-sm mb-3 line-clamp-3">
          {waste.description}
        </p>

        <div className="space-y-2 mb-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Quantidade:</span>
            <span className="text-sm font-medium">
              {typeof waste.quantity === 'string' 
                ? JSON.parse(waste.quantity).value + ' ' + JSON.parse(waste.quantity).unit
                : `${waste.quantity.value} ${waste.quantity.unit}`
              }
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Preço por {
              typeof waste.quantity === 'string' 
                ? JSON.parse(waste.quantity).unit
                : waste.quantity.unit
            }:</span>
            <span className="text-lg font-bold text-eco-green">
              {formatPrice(waste.price)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span>
              {typeof waste.location === 'string' 
                ? waste.location 
                : waste.location 
                  ? `${waste.location.city}, ${waste.location.state}` 
                  : 'Localização não informada'
              }
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            <span>{waste.views || 0} visualizações</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{formatDate(waste.createdAt)}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        {user && user.id !== waste.sellerId ? (
          <div className="flex flex-col gap-2 w-full">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                onNavigate(`product?id=${waste.id}`);
              }}
            >
              Ver Detalhes
            </Button>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                className="flex-1"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Carrinho
              </Button>
              <Button 
                className="flex-1 bg-gradient-eco hover:opacity-90"
                onClick={(e) => {
                  e.stopPropagation();
                  onContactSeller?.(waste.sellerId, waste.id);
                }}
              >
                Contatar
              </Button>
            </div>
          </div>
        ) : (
          <Button 
            variant="outline" 
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(`product?id=${waste.id}`);
            }}
          >
            Ver Detalhes
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};