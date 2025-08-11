import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Star, Calendar, Package, MessageCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { WasteCard } from '@/components/WasteCard';
import { User, WasteItem, Review } from '@/types';
import { getProfile, getWasteItems } from '@/lib/supabase';

interface SellerProfilePageProps {
  onNavigate: (page: string) => void;
  sellerId: string;
}

export const SellerProfilePage = ({ onNavigate, sellerId }: SellerProfilePageProps) => {
  const [seller, setSeller] = useState<User | null>(null);
  const [sellerItems, setSellerItems] = useState<WasteItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const loadSellerData = async () => {
      const sellerData = getUserById(sellerId);
      if (sellerData) {
        setSeller(sellerData);
        setSellerItems(getWasteItemsBySeller(sellerId));
        setReviews(getReviewsByUser(sellerId));
      }
    };

    loadSellerData();
  }, [sellerId]);

  if (!seller) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Vendedor não encontrado</h2>
            <p className="text-muted-foreground mb-4">
              O perfil solicitado não está disponível.
            </p>
            <Button onClick={() => onNavigate('home')}>
              Voltar ao início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric'
    });
  };

  const activeItems = sellerItems.filter(item => item.isActive);
  const totalViews = sellerItems.reduce((sum, item) => sum + item.views, 0);
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : seller.rating;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onNavigate('home')}
            className="p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold">Perfil do Vendedor</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Seller Profile Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="w-24 h-24 bg-gradient-eco rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {seller.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <CardTitle className="text-xl">{seller.name}</CardTitle>
                
                <div className="flex items-center justify-center gap-2 mt-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{averageRating.toFixed(1)}</span>
                  </div>
                  <span className="text-muted-foreground">
                    ({seller.reviewCount} avaliações)
                  </span>
                </div>

                {seller.isVerified && (
                  <Badge variant="secondary" className="mt-2">
                    <Shield className="w-3 h-3 mr-1" />
                    Verificado
                  </Badge>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{seller.address.city}, {seller.address.state}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>Membro desde {formatDate(seller.createdAt)}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <span>{activeItems.length} anúncios ativos</span>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-eco-green">{totalViews}</div>
                    <div className="text-xs text-muted-foreground">Visualizações</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-eco-green">{seller.reviewCount}</div>
                    <div className="text-xs text-muted-foreground">Avaliações</div>
                  </div>
                </div>

                <Button 
                  className="w-full bg-gradient-eco hover:opacity-90"
                  onClick={() => onNavigate(`messages?sellerId=${seller.id}`)}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Entrar em Contato
                </Button>
              </CardContent>
            </Card>

            {/* Type Badge */}
            <Card className="mt-4">
              <CardContent className="p-4">
                <div className="text-center">
                  <Badge 
                    variant={seller.userType === 'pessoa_juridica' ? 'default' : 'secondary'}
                    className="text-sm"
                  >
                    {seller.userType === 'pessoa_juridica' ? 'Pessoa Jurídica' : 'Pessoa Física'}
                  </Badge>
                  {seller.userType === 'pessoa_juridica' && seller.cnpj && (
                    <p className="text-xs text-muted-foreground mt-2">
                      CNPJ: {seller.cnpj}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Seller's Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Anúncios Ativos ({activeItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeItems.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeItems.map((item) => (
                      <WasteCard
                        key={item.id}
                        waste={item}
                        onNavigate={onNavigate}
                        onContactSeller={(sellerId, itemId) => 
                          onNavigate(`messages?sellerId=${sellerId}&itemId=${itemId}`)
                        }
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Nenhum anúncio ativo</h3>
                    <p className="text-muted-foreground">
                      Este vendedor não possui anúncios ativos no momento.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Reviews */}
            {reviews.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Avaliações Recentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reviews.slice(0, 3).map((review) => (
                      <div key={review.id} className="border-b pb-4 last:border-b-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <p className="text-sm">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};