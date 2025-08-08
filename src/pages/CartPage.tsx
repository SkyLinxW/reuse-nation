import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Minus, Trash2, ShoppingCart, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { PaymentForm } from '@/components/PaymentForm';
import { DeliveryForm } from '@/components/DeliveryForm';
import { OrderSummary } from '@/components/OrderSummary';
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
  const [deliveryData, setDeliveryData] = useState<any>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'cart' | 'delivery' | 'payment' | 'summary'>('cart');
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
  }, [currentUser?.id]);

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

  const handlePaymentProcess = async (paymentData: any) => {
    if (!currentUser || cartItems.length === 0) return;
    
    setIsProcessing(true);
    
    try {
      // Simular processamento de pagamento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
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
        description: `Pagamento processado. ${transactions.length} transação(ões) foram criadas.`,
      });
      
      onNavigate('transactions');
    } catch (error) {
      toast({
        title: "Erro no pagamento",
        description: "Ocorreu um erro ao processar seu pagamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getDeliveryCost = () => {
    const costs = {
      retirada_local: 0,
      entrega: 25.90,
      transportadora: 45.00
    };
    return costs[deliveryMethod];
  };

  const getSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.wasteItem.price * item.quantity), 0);
  };

  const getPixDiscount = () => {
    return paymentMethod === 'pix' ? getSubtotal() * 0.05 : 0;
  };

  const getTotal = () => {
    const subtotal = getSubtotal();
    const deliveryCost = getDeliveryCost();
    const pixDiscount = getPixDiscount();
    return subtotal + deliveryCost - pixDiscount;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const sellerAddress = cartItems.length > 0 ? "Rua das Empresas, 123 - São Paulo, SP" : "";

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

  // Renderização condicional baseada no step atual
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'cart':
        return (
          <div className="space-y-6">
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
                    
                    {paymentMethod === 'pix' && (
                      <div className="bg-eco-green-light p-3 rounded-lg">
                        <div className="flex items-center gap-2 text-eco-green font-medium">
                          <Percent className="w-4 h-4" />
                          Desconto PIX: 5% ({formatPrice(getPixDiscount())})
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center text-xl font-bold pt-4 border-t">
                      <span>Total:</span>
                      <span className="text-eco-green">{formatPrice(getTotal())}</span>
                    </div>
                    
                    <Button 
                      className="w-full bg-gradient-eco hover:opacity-90"
                      onClick={() => setCurrentStep('delivery')}
                    >
                      Continuar para Entrega
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 'delivery':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <DeliveryForm
                deliveryMethod={deliveryMethod}
                onDeliveryMethodChange={setDeliveryMethod}
                onDeliveryDataChange={setDeliveryData}
                sellerAddress={sellerAddress}
              />
            </div>
            <div className="lg:col-span-1">
              <OrderSummary
                cartItems={cartItems}
                deliveryMethod={deliveryMethod}
                paymentMethod={paymentMethod}
                subtotal={getSubtotal()}
                deliveryCost={getDeliveryCost()}
                discount={getPixDiscount()}
                total={getTotal()}
              />
            </div>
          </div>
        );

      case 'payment':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PaymentForm
                paymentMethod={paymentMethod}
                onPaymentMethodChange={setPaymentMethod}
                total={getTotal()}
                onPaymentProcess={handlePaymentProcess}
                isProcessing={isProcessing}
              />
            </div>
            <div className="lg:col-span-1">
              <OrderSummary
                cartItems={cartItems}
                deliveryMethod={deliveryMethod}
                paymentMethod={paymentMethod}
                subtotal={getSubtotal()}
                deliveryCost={getDeliveryCost()}
                discount={getPixDiscount()}
                total={getTotal()}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Button
        variant="ghost"
        onClick={() => {
          if (currentStep === 'cart') {
            onNavigate('home');
          } else if (currentStep === 'delivery') {
            setCurrentStep('cart');
          } else if (currentStep === 'payment') {
            setCurrentStep('delivery');
          }
        }}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        {currentStep === 'cart' ? 'Voltar às Compras' : 'Voltar'}
      </Button>

      {/* Steps Navigation */}
      {cartItems.length > 0 && (
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${currentStep === 'cart' ? 'text-eco-green font-bold' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'cart' ? 'bg-eco-green text-white' : 'bg-muted'}`}>
                1
              </div>
              <span>Carrinho</span>
            </div>
            
            <div className="w-12 h-0.5 bg-border"></div>
            
            <div className={`flex items-center gap-2 ${currentStep === 'delivery' ? 'text-eco-green font-bold' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'delivery' ? 'bg-eco-green text-white' : 'bg-muted'}`}>
                2
              </div>
              <span>Entrega</span>
            </div>
            
            <div className="w-12 h-0.5 bg-border"></div>
            
            <div className={`flex items-center gap-2 ${currentStep === 'payment' ? 'text-eco-green font-bold' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'payment' ? 'bg-eco-green text-white' : 'bg-muted'}`}>
                3
              </div>
              <span>Pagamento</span>
            </div>
          </div>
        </div>
      )}

      {renderCurrentStep()}

      {/* Navigation Buttons */}
      {cartItems.length > 0 && currentStep !== 'cart' && (
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => {
              if (currentStep === 'delivery') setCurrentStep('cart');
              if (currentStep === 'payment') setCurrentStep('delivery');
            }}
          >
            Voltar
          </Button>
          
          {currentStep === 'delivery' && (
            <Button
              onClick={() => setCurrentStep('payment')}
              className="bg-gradient-eco hover:opacity-90"
            >
              Continuar para Pagamento
            </Button>
          )}
        </div>
      )}
    </div>
  );
};