import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Minus, Trash2, ShoppingCart, CreditCard, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  getCurrentUser, 
  getCartItems, 
  getWasteItemById, 
  updateCartQuantity, 
  removeFromCart, 
  getCartTotal,
  createPurchaseTransaction,
  clearCart,
  CartItem 
} from '@/lib/localStorage';
import { WasteItem } from '@/types';

interface CartPageProps {
  onNavigate: (page: string) => void;
}

export const CartPage = ({ onNavigate }: CartPageProps) => {
  const [cartItems, setCartItems] = useState<Array<CartItem & { wasteItem: WasteItem }>>([]);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'boleto' | 'cartao' | 'dinheiro'>('pix');
  const [deliveryMethod, setDeliveryMethod] = useState<'retirada_local' | 'entrega' | 'transportadora'>('retirada_local');
  const [isProcessing, setIsProcessing] = useState(false);
  const currentUser = getCurrentUser();
  const { toast } = useToast();

  useEffect(() => {
    if (currentUser) {
      const items = getCartItems(currentUser.id);
      const itemsWithDetails = items.map(cartItem => {
        const wasteItem = getWasteItemById(cartItem.wasteItemId);
        return { ...cartItem, wasteItem: wasteItem! };
      }).filter(item => item.wasteItem);
      setCartItems(itemsWithDetails);
    }
  }, [currentUser]);

  const handleQuantityChange = (wasteItemId: string, newQuantity: number) => {
    if (!currentUser || newQuantity < 1) return;
    
    updateCartQuantity(currentUser.id, wasteItemId, newQuantity);
    setCartItems(prev => prev.map(item => 
      item.wasteItemId === wasteItemId 
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const handleRemoveItem = (wasteItemId: string) => {
    if (!currentUser) return;
    
    removeFromCart(currentUser.id, wasteItemId);
    setCartItems(prev => prev.filter(item => item.wasteItemId !== wasteItemId));
    
    toast({
      title: "Item removido",
      description: "O item foi removido do seu carrinho.",
    });
  };

  const handlePurchase = async () => {
    if (!currentUser || cartItems.length === 0) return;
    
    setIsProcessing(true);
    
    try {
      const transactions = createPurchaseTransaction(
        currentUser.id,
        cartItems,
        paymentMethod,
        deliveryMethod
      );
      
      clearCart(currentUser.id);
      setCartItems([]);
      
      toast({
        title: "Compra realizada com sucesso!",
        description: `${transactions.length} transação(ões) foram criadas.`,
      });
      
      onNavigate('transactions');
    } catch (error) {
      toast({
        title: "Erro na compra",
        description: "Ocorreu um erro ao processar sua compra. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const total = currentUser ? getCartTotal(currentUser.id) : 0;

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">
              Você precisa estar logado para acessar o carrinho.
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button
        variant="ghost"
        onClick={() => onNavigate('home')}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar às Compras
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Seu Carrinho ({cartItems.length} {cartItems.length === 1 ? 'item' : 'itens'})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cartItems.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">
                    Seu carrinho está vazio.
                  </p>
                  <Button onClick={() => onNavigate('home')}>
                    Continuar Comprando
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">
                          {item.wasteItem.title}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-2">
                          {item.wasteItem.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Preço: {formatPrice(item.wasteItem.price)}/{item.wasteItem.quantity.unit}</span>
                          <span>Disponível: {item.wasteItem.quantity.value} {item.wasteItem.quantity.unit}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item.wasteItemId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <Input
                            value={item.quantity}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 1;
                              handleQuantityChange(item.wasteItemId, value);
                            }}
                            className="w-16 text-center"
                            min="1"
                            max={item.wasteItem.quantity.value}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item.wasteItemId, item.quantity + 1)}
                            disabled={item.quantity >= item.wasteItem.quantity.value}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        
                        <div className="text-lg font-bold text-eco-green">
                          {formatPrice(item.wasteItem.price * item.quantity)}
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.wasteItemId)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Checkout Summary */}
        {cartItems.length > 0 && (
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center text-2xl font-bold">
                  <span>Total:</span>
                  <span className="text-eco-green">{formatPrice(total)}</span>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <div>
                    <Label htmlFor="payment" className="flex items-center gap-2 mb-2">
                      <CreditCard className="w-4 h-4" />
                      Método de Pagamento
                    </Label>
                    <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pix">PIX</SelectItem>
                        <SelectItem value="boleto">Boleto</SelectItem>
                        <SelectItem value="cartao">Cartão</SelectItem>
                        <SelectItem value="dinheiro">Dinheiro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="delivery" className="flex items-center gap-2 mb-2">
                      <Truck className="w-4 h-4" />
                      Método de Entrega
                    </Label>
                    <Select value={deliveryMethod} onValueChange={(value: any) => setDeliveryMethod(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="retirada_local">Retirada Local</SelectItem>
                        <SelectItem value="entrega">Entrega</SelectItem>
                        <SelectItem value="transportadora">Transportadora</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button 
                  className="w-full bg-gradient-eco hover:opacity-90"
                  onClick={handlePurchase}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processando...' : 'Finalizar Compra'}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};