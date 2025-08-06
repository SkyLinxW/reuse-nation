import { Heart, MapPin, Eye, Clock, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WasteItem } from '@/types';
import { getCurrentUser, toggleFavorite, getFavorites, addToCart } from '@/lib/localStorage';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

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
  const currentUser = getCurrentUser();
  const { toast } = useToast();
  const [isFavorited, setIsFavorited] = useState(
    currentUser ? getFavorites(currentUser.id).includes(waste.id) : false
  );

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) return;
    
    toggleFavorite(currentUser.id, waste.id);
    setIsFavorited(!isFavorited);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) return;
    
    addToCart(currentUser.id, waste.id, 1);
    toast({
      title: "Adicionado ao carrinho",
      description: `${waste.title} foi adicionado ao seu carrinho.`,
    });
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
          
          {currentUser && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFavoriteToggle}
              className="p-1 h-auto hover:bg-eco-green-light"
            >
              <Heart 
                className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} 
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
              {waste.quantity.value} {waste.quantity.unit}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Preço por {waste.quantity.unit}:</span>
            <span className="text-lg font-bold text-eco-green">
              {formatPrice(waste.price)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span>{waste.location.city}, {waste.location.state}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            <span>{waste.views} visualizações</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{formatDate(waste.createdAt)}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <div className="flex gap-2 w-full">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onItemClick?.(waste.id);
            }}
          >
            Ver Detalhes
          </Button>
          
          {currentUser && currentUser.id !== waste.sellerId && (
            <>
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
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};