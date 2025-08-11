import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { WasteCard } from '@/components/WasteCard';
import { ReviewCard } from '@/components/ReviewCard';
import { getProfile, getWasteItems } from '@/lib/supabase';
import { ArrowLeft, Star, MapPin, Calendar, MessageCircle } from 'lucide-react';

interface SellerProfilePageProps {
  onNavigate: (page: string) => void;
}

export const SellerProfilePage = ({ onNavigate }: SellerProfilePageProps) => {
  const [seller, setSeller] = useState<any>(null);
  const [sellerItems, setSellerItems] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);

  // Get seller ID from URL params (simulated)
  const urlParams = new URLSearchParams(window.location.search);
  const sellerId = urlParams.get('id');

  useEffect(() => {
    const loadSellerData = async () => {
      if (sellerId) {
        try {
          const profile = await getProfile(sellerId);
          setSeller(profile);
          
          const items = await getWasteItems();
          const sellerItems = items.filter(item => item.user_id === sellerId);
          setSellerItems(sellerItems);
          
          setReviews([]); // TODO: Implement reviews in Supabase
        } catch (error) {
          console.error('Error loading seller data:', error);
        }
      }
    };
    loadSellerData();
  }, [sellerId]);

  if (!seller) {
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
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Carregando perfil do vendedor...</p>
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
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Perfil do Vendedor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src="" alt={seller.name || seller.email} />
                  <AvatarFallback className="bg-eco-green text-white">
                    {(seller.name || seller.email)?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold">{seller.name || seller.email}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>5.0</span>
                    <span className="text-muted-foreground">(0 avaliações)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex gap-2">
                  <Badge variant="default">✓ Verificado</Badge>
                </div>
                
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Membro desde {new Date(seller.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
                
                {seller.bio && (
                  <p className="text-muted-foreground">{seller.bio}</p>
                )}
              </div>

              <Button className="w-full bg-eco-green hover:bg-eco-green/90">
                <MessageCircle className="w-4 h-4 mr-2" />
                Entrar em Contato
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estatísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{sellerItems.length}</p>
                <p className="text-sm text-muted-foreground">Anúncios Ativos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Vendas Realizadas</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">5.0</p>
                <p className="text-sm text-muted-foreground">Avaliação Média</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Anúncios ({sellerItems.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {sellerItems.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Este vendedor ainda não possui anúncios ativos.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sellerItems.map((item) => (
                    <WasteCard
                      key={item.id}
                      waste={item}
                      onNavigate={onNavigate}
                      onItemClick={(id) => onNavigate(`product?id=${id}`)}
                      onContactSeller={() => {}}
                      showActions={false}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Avaliações ({reviews.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {reviews.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Este vendedor ainda não possui avaliações.
                </p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};