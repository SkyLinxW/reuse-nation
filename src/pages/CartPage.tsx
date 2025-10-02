import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Minus, Trash2, ShoppingCart, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { PaymentForm } from '@/components/PaymentForm';
import { DeliveryForm } from '@/components/DeliveryForm';
import { OrderSummary } from '@/components/OrderSummary';
import { useAuth } from '@/hooks/useAuth';
import {
  getCartItems,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  createTransaction
} from '@/lib/supabase';
import { WasteItem } from '@/types';

interface CartPageProps {
  onNavigate: (page: string) => void;
}

export const CartPage = ({ onNavigate }: CartPageProps) => {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'boleto' | 'cartao'>('pix');
  const [deliveryMethod, setDeliveryMethod] = useState<'retirada_local' | 'entrega' | 'transportadora'>('retirada_local');
  const [deliveryData, setDeliveryData] = useState<any>({});
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'cart' | 'delivery' | 'payment' | 'summary'>('cart');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadCartItems();
    }
  }, [user?.id]);

  const loadCartItems = async () => {
    if (!user) return;
    try {
      const items = await getCartItems(user.id);
      setCartItems(items || []);
    } catch (error) {
      console.error('Error loading cart items:', error);
    }
  };

  const handleQuantityChange = async (wasteItemId: string, newQuantity: number) => {
    if (!user || newQuantity < 1) return;
    
    try {
      await updateCartItemQuantity(user.id, wasteItemId, newQuantity);
      loadCartItems();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleRemoveItem = async (wasteItemId: string) => {
    if (!user) return;
    
    try {
      await removeFromCart(user.id, wasteItemId);
      loadCartItems();
      
      toast({
        title: "Item removido",
        description: "O item foi removido do seu carrinho.",
      });
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handlePaymentProcess = async (paymentData: any) => {
    if (!user || cartItems.length === 0) return;
    
    setIsProcessing(true);
    
    console.log('handlePaymentProcess - Starting with method and data:', {
      deliveryMethod,
      selectedAddress,
      deliveryData,
      cartItems: cartItems.length
    });
    
    // If delivery method is 'entrega' but no address selected, show error
    if (deliveryMethod === 'entrega') {
      console.log('Checking address for delivery:', {
        selectedAddress,
        deliveryDataFullAddress: deliveryData.fullAddress,
        deliveryDataAddress: deliveryData.address,
        deliveryData
      });
      
      const hasCompleteAddress = selectedAddress || 
                                deliveryData.fullAddress || 
                                deliveryData.address;
      
      if (!hasCompleteAddress) {
        toast({
          title: "Endereço necessário",
          description: "Para entrega, é necessário preencher o endereço completo (CEP, estado, cidade e rua).",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }
    }
    
    try {
      // Simular processamento de pagamento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create transactions for each item
      console.log('Creating transaction with delivery data:', {
        selectedAddress,
        deliveryData,
        finalAddress: selectedAddress || deliveryData.fullAddress || deliveryData.address
      });
      
      for (const cartItem of cartItems) {
        // Ensure delivery address is properly saved
        const finalDeliveryAddress = selectedAddress || 
                                    deliveryData.fullAddress || 
                                    deliveryData.address || 
                                    '';
        
        console.log('Creating transaction with delivery address:', {
          selectedAddress,
          deliveryDataFullAddress: deliveryData.fullAddress,
          deliveryDataAddress: deliveryData.address,
          finalDeliveryAddress,
          allDeliveryData: deliveryData
        });

        await createTransaction({
          buyer_id: user.id,
          seller_id: cartItem.waste_items?.user_id,
          waste_item_id: cartItem.waste_item_id,
          quantity: cartItem.quantity,
          total_price: (cartItem.waste_items?.price || 0) * cartItem.quantity,
          payment_method: paymentMethod,
          delivery_method: deliveryMethod,
          delivery_address: finalDeliveryAddress,
          status: 'pendente'
        });
      }
      
      await clearCart(user.id);
      setCartItems([]);
      
      toast({
        title: "Compra realizada com sucesso!",
        description: `Pagamento processado. ${cartItems.length} transação(ões) foram criadas.`,
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
    // This will be calculated dynamically by the DeliveryForm component
    // For now, keeping the base costs for order summary
    const costs = {
      retirada_local: 0,
      entrega: 25.90,
      transportadora: 45.00
    };
    return costs[deliveryMethod];
  };

  const getSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + ((item.waste_items?.price || 0) * item.quantity), 0);
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-eco-light/20 to-eco-cream/30 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-xl bg-white/95 backdrop-blur-sm border-0">
          <CardContent className="text-center py-8">
            <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-eco-green" />
            <p className="text-muted-foreground mb-4">
              Você precisa estar logado para acessar o carrinho.
            </p>
            <Button onClick={() => onNavigate('login')} className="bg-eco-green hover:bg-eco-green/90">
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
                             {item.waste_items?.title}
                           </h3>
                           <p className="text-muted-foreground text-sm mb-2">
                             {item.waste_items?.description}
                           </p>
                           <div className="flex items-center gap-4 text-sm text-muted-foreground">
                             <span>Preço: {formatPrice(item.waste_items?.price || 0)}</span>
                             <span>Disponível: {JSON.parse(item.waste_items?.quantity || '{}').value} {JSON.parse(item.waste_items?.quantity || '{}').unit}</span>
                           </div>
                         </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-2">
                             <Button
                               variant="outline"
                               size="sm"
                               onClick={() => handleQuantityChange(item.waste_item_id, item.quantity - 1)}
                               disabled={item.quantity <= 1}
                             >
                               <Minus className="w-3 h-3" />
                             </Button>
                             <Input
                               value={item.quantity}
                               onChange={(e) => {
                                 const value = parseInt(e.target.value) || 1;
                                 handleQuantityChange(item.waste_item_id, value);
                               }}
                               className="w-16 text-center"
                               min="1"
                               max={JSON.parse(item.waste_items?.quantity || '{}').value || 999}
                             />
                             <Button
                               variant="outline"
                               size="sm"
                               onClick={() => handleQuantityChange(item.waste_item_id, item.quantity + 1)}
                               disabled={item.quantity >= (JSON.parse(item.waste_items?.quantity || '{}').value || 999)}
                             >
                               <Plus className="w-3 h-3" />
                             </Button>
                          </div>
                          
                           <div className="text-lg font-bold text-eco-green">
                             {formatPrice((item.waste_items?.price || 0) * item.quantity)}
                           </div>
                           
                           <Button
                             variant="ghost"
                             size="sm"
                             onClick={() => handleRemoveItem(item.waste_item_id)}
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
                onDeliveryDataChange={(data) => {
                  console.log('CartPage - Delivery data changed:', data);
                  setDeliveryData(data);
                  // Update selected address from delivery data
                  if (data.fullAddress || data.address) {
                    setSelectedAddress(data.fullAddress || data.address);
                  }
                }}
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
    <div className="min-h-screen bg-gradient-to-br from-eco-light/20 to-eco-cream/30 relative overflow-hidden">
      <div className="absolute inset-0 opacity-40">
        <div className="w-full h-full bg-eco-green/5 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-eco-green/10 via-transparent to-transparent"></div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
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
          className="mb-6 hover:bg-white/20 backdrop-blur-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {currentStep === 'cart' ? 'Voltar às Compras' : 'Voltar'}
        </Button>

        {/* Steps Navigation */}
        {cartItems.length > 0 && (
          <Card className="mb-8 bg-white/95 backdrop-blur-sm shadow-soft border-0">
            <CardContent className="py-6">
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-4">
                  <div className={`flex items-center gap-3 ${currentStep === 'cart' ? 'text-eco-green font-bold' : 'text-muted-foreground'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${currentStep === 'cart' ? 'bg-eco-green text-white shadow-eco' : 'bg-muted'}`}>
                      1
                    </div>
                    <span className="text-sm font-medium">Carrinho</span>
                  </div>
                  
                  <div className="w-16 h-0.5 bg-border rounded-full"></div>
                  
                  <div className={`flex items-center gap-3 ${currentStep === 'delivery' ? 'text-eco-green font-bold' : 'text-muted-foreground'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${currentStep === 'delivery' ? 'bg-eco-green text-white shadow-eco' : 'bg-muted'}`}>
                      2
                    </div>
                    <span className="text-sm font-medium">Entrega</span>
                  </div>
                  
                  <div className="w-16 h-0.5 bg-border rounded-full"></div>
                  
                  <div className={`flex items-center gap-3 ${currentStep === 'payment' ? 'text-eco-green font-bold' : 'text-muted-foreground'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${currentStep === 'payment' ? 'bg-eco-green text-white shadow-eco' : 'bg-muted'}`}>
                      3
                    </div>
                    <span className="text-sm font-medium">Pagamento</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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
              className="border-eco-green/30 text-eco-green hover:bg-eco-green-light"
            >
              Voltar
            </Button>
            
            {currentStep === 'delivery' && (
              <Button
                onClick={() => {
                  // Validate delivery data before proceeding
                  if (deliveryMethod === 'entrega') {
                    const hasAddress = selectedAddress || deliveryData.fullAddress || deliveryData.address;
                    if (!hasAddress) {
                      toast({
                        title: "Endereço necessário",
                        description: "Por favor, preencha o endereço de entrega antes de continuar.",
                        variant: "destructive",
                      });
                      return;
                    }
                  }
                  setCurrentStep('payment');
                }}
                className="bg-gradient-eco hover:opacity-90 shadow-eco"
              >
                Continuar para Pagamento
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};