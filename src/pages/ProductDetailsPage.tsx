import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  getWasteItemById, 
  getUserById, 
  getCurrentUser, 
  toggleFavorite, 
  getFavorites,
  saveTransaction,
  saveChat,
  getUserChats
} from '@/lib/localStorage';
import { WasteItem, User, Transaction, Chat } from '@/types';
import { 
  ArrowLeft, 
  Heart, 
  MessageCircle, 
  MapPin, 
  Eye, 
  Star,
  Package,
  Calendar,
  ShoppingCart
} from 'lucide-react';

interface ProductDetailsPageProps {
  onNavigate: (page: string) => void;
  productId: string;
}

export const ProductDetailsPage = ({ onNavigate, productId }: ProductDetailsPageProps) => {
  const [product, setProduct] = useState<WasteItem | null>(null);
  const [seller, setSeller] = useState<User | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const currentUser = getCurrentUser();

  useEffect(() => {
    const item = getWasteItemById(productId);
    if (item) {
      setProduct(item);
      const sellerData = getUserById(item.sellerId);
      setSeller(sellerData);
      
      if (currentUser) {
        const favorites = getFavorites(currentUser.id);
        setIsFavorited(favorites.includes(productId));
      }
    }
  }, [productId, currentUser]);

  const handleToggleFavorite = () => {
    if (!currentUser) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para favoritar produtos.",
        variant: "destructive",
      });
      return;
    }

    toggleFavorite(currentUser.id, productId);
    setIsFavorited(!isFavorited);
    
    toast({
      title: isFavorited ? "Removido dos favoritos" : "Adicionado aos favoritos",
      description: isFavorited ? 
        "Produto removido da sua lista de favoritos." : 
        "Produto adicionado à sua lista de favoritos.",
    });
  };

  const handleStartChat = () => {
    if (!currentUser || !product || !seller) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para conversar com o vendedor.",
        variant: "destructive",
      });
      return;
    }

    // Verificar se já existe um chat
    const existingChats = getUserChats(currentUser.id);
    const existingChat = existingChats.find(
      chat => chat.wasteItemId === product.id && 
              ((chat.buyerId === currentUser.id && chat.sellerId === seller.id) ||
               (chat.buyerId === seller.id && chat.sellerId === currentUser.id))
    );

    if (existingChat) {
      onNavigate(`messages?chatId=${existingChat.id}`);
      return;
    }

    // Criar novo chat
    const newChat: Chat = {
      id: Date.now().toString(),
      buyerId: currentUser.id,
      sellerId: seller.id,
      wasteItemId: product.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    saveChat(newChat);
    onNavigate(`messages?chatId=${newChat.id}`);
  };

  const handleBuyNow = () => {
    if (!currentUser || !product || !seller) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para fazer uma compra.",
        variant: "destructive",
      });
      return;
    }

    if (currentUser.id === seller.id) {
      toast({
        title: "Erro",
        description: "Você não pode comprar seu próprio produto.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const transaction: Transaction = {
        id: Date.now().toString(),
        buyerId: currentUser.id,
        sellerId: seller.id,
        wasteItemId: product.id,
        quantity: quantity,
        totalPrice: product.price * quantity,
        status: 'pendente',
        paymentMethod: 'pix',
        deliveryMethod: 'retirada_local',
        createdAt: new Date().toISOString()
      };

      saveTransaction(transaction);

      toast({
        title: "Pedido realizado!",
        description: "Seu pedido foi enviado para o vendedor. Acompanhe na aba de transações.",
      });

      onNavigate('transactions');
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar sua compra.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!product || !seller) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Produto não encontrado.</p>
            <Button onClick={() => onNavigate('home')} className="mt-4">
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const conditionLabels = {
    novo: 'Novo',
    usado: 'Usado',
    sobras_limpas: 'Sobras Limpas',
    contaminado: 'Contaminado'
  };

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Imagem do produto */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              <div className="aspect-video bg-gradient-eco rounded-lg flex items-center justify-center">
                <Package className="w-24 h-24 text-white/50" />
              </div>
            </CardContent>
          </Card>

          {/* Detalhes do produto */}
          <Card className="mt-6">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{product.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-2">
                    <MapPin className="w-4 h-4" />
                    {product.location.city}, {product.location.state}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToggleFavorite}
                    className={isFavorited ? 'text-red-500' : ''}
                  >
                    <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  {categoryLabels[product.category]}
                </Badge>
                <Badge variant="outline">
                  {product.subcategory}
                </Badge>
                <Badge variant="outline">
                  {conditionLabels[product.condition]}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {product.views} visualizações
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  {product.favorites} favoritos
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(product.createdAt).toLocaleDateString('pt-BR')}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-2">Descrição</h3>
                <p className="text-muted-foreground">{product.description}</p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium">Quantidade</h4>
                  <p className="text-muted-foreground">
                    {product.quantity.value} {product.quantity.unit}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Preço unitário</h4>
                  <p className="text-muted-foreground">
                    R$ {product.price.toFixed(2)} por {product.quantity.unit}
                  </p>
                </div>
              </div>

              {product.technicalDetails && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-2">Detalhes Técnicos</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {product.technicalDetails.plasticType && (
                        <div>
                          <h4 className="font-medium">Tipo</h4>
                          <p className="text-muted-foreground">{product.technicalDetails.plasticType}</p>
                        </div>
                      )}
                      {product.technicalDetails.purity && (
                        <div>
                          <h4 className="font-medium">Pureza</h4>
                          <p className="text-muted-foreground">{product.technicalDetails.purity}</p>
                        </div>
                      )}
                      {product.technicalDetails.composition && (
                        <div>
                          <h4 className="font-medium">Composição</h4>
                          <p className="text-muted-foreground">{product.technicalDetails.composition}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar de compra */}
        <div className="space-y-6">
          {/* Informações do vendedor */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Vendedor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src="" alt={seller.name} />
                  <AvatarFallback className="bg-eco-green text-white">
                    {seller.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{seller.name}</p>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">{seller.rating}</span>
                    <span className="text-sm text-muted-foreground">
                      ({seller.reviewCount} avaliações)
                    </span>
                  </div>
                </div>
              </div>

              {seller.isVerified && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  ✓ Verificado
                </Badge>
              )}

              <Button
                variant="outline"
                className="w-full"
                onClick={handleStartChat}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Conversar
              </Button>
            </CardContent>
          </Card>

          {/* Área de compra */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Comprar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="quantity">Quantidade ({product.quantity.unit})</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max={product.quantity.value}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Máximo disponível: {product.quantity.value} {product.quantity.unit}
                </p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span>Subtotal:</span>
                  <span className="font-semibold">
                    R$ {(product.price * quantity).toFixed(2)}
                  </span>
                </div>
              </div>

              <Button
                className="w-full bg-gradient-eco hover:opacity-90"
                onClick={handleBuyNow}
                disabled={loading || !currentUser || currentUser.id === seller.id}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {loading ? 'Processando...' : 'Comprar Agora'}
              </Button>

              {!currentUser && (
                <p className="text-xs text-muted-foreground text-center">
                  <Button
                    variant="link"
                    className="p-0 text-eco-green"
                    onClick={() => onNavigate('login')}
                  >
                    Faça login
                  </Button>
                  {' '}para comprar
                </p>
              )}

              {currentUser && currentUser.id === seller.id && (
                <p className="text-xs text-muted-foreground text-center">
                  Este é seu próprio anúncio
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};