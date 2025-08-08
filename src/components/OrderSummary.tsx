import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Receipt, Package, Truck, CreditCard, Shield, Percent } from 'lucide-react';
import { CartItem } from '@/lib/localStorage';
import { WasteItem } from '@/types';

interface OrderSummaryProps {
  cartItems: Array<CartItem & { wasteItem: WasteItem }>;
  deliveryMethod: 'retirada_local' | 'entrega' | 'transportadora';
  paymentMethod: 'pix' | 'boleto' | 'cartao' | 'dinheiro';
  subtotal: number;
  deliveryCost: number;
  discount?: number;
  total: number;
}

export const OrderSummary = ({
  cartItems,
  deliveryMethod,
  paymentMethod,
  subtotal,
  deliveryCost,
  discount = 0,
  total
}: OrderSummaryProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getDeliveryMethodLabel = (method: string) => {
    const methods = {
      retirada_local: { label: 'Retirada Local', icon: Package },
      entrega: { label: 'Entrega Expressa', icon: Truck },
      transportadora: { label: 'Transportadora', icon: Truck }
    };
    return methods[method as keyof typeof methods];
  };

  const getPaymentMethodLabel = (method: string) => {
    const methods = {
      pix: { label: 'PIX', badge: 'Instantâneo' },
      boleto: { label: 'Boleto', badge: '3 dias' },
      cartao: { label: 'Cartão de Crédito', badge: 'Seguro' },
      dinheiro: { label: 'Dinheiro', badge: 'Na entrega' }
    };
    return methods[method as keyof typeof methods];
  };

  const deliveryInfo = getDeliveryMethodLabel(deliveryMethod);
  const paymentInfo = getPaymentMethodLabel(paymentMethod);
  const DeliveryIcon = deliveryInfo.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="w-5 h-5 text-eco-green" />
          Resumo do Pedido
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Itens do Carrinho */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Package className="w-4 h-4" />
            Itens ({cartItems.length})
          </h4>
          <div className="space-y-2">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center p-2 bg-muted rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.wasteItem.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.quantity} {item.wasteItem.quantity.unit} × {formatPrice(item.wasteItem.price)}
                  </p>
                </div>
                <span className="font-bold text-sm">
                  {formatPrice(item.wasteItem.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Método de Entrega */}
        <div>
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <DeliveryIcon className="w-4 h-4" />
            Entrega
          </h4>
          <div className="flex justify-between items-center">
            <span className="text-sm">{deliveryInfo.label}</span>
            <span className="font-medium">
              {deliveryCost === 0 ? 'Grátis' : formatPrice(deliveryCost)}
            </span>
          </div>
        </div>

        {/* Método de Pagamento */}
        <div>
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Pagamento
          </h4>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm">{paymentInfo.label}</span>
              <Badge variant="secondary" className="text-xs">
                {paymentInfo.badge}
              </Badge>
            </div>
            <Shield className="w-4 h-4 text-eco-green" />
          </div>
        </div>

        <Separator />

        {/* Cálculo do Total */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm">Subtotal:</span>
            <span className="font-medium">{formatPrice(subtotal)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm">Entrega:</span>
            <span className="font-medium">
              {deliveryCost === 0 ? 'Grátis' : formatPrice(deliveryCost)}
            </span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between items-center text-eco-green">
              <span className="text-sm flex items-center gap-1">
                <Percent className="w-3 h-3" />
                Desconto:
              </span>
              <span className="font-medium">-{formatPrice(discount)}</span>
            </div>
          )}

          {paymentMethod === 'pix' && (
            <div className="flex justify-between items-center text-eco-green">
              <span className="text-sm flex items-center gap-1">
                <Percent className="w-3 h-3" />
                Desconto PIX (5%):
              </span>
              <span className="font-medium">-{formatPrice(subtotal * 0.05)}</span>
            </div>
          )}
        </div>

        <Separator className="border-eco-green" />

        {/* Total Final */}
        <div className="flex justify-between items-center p-3 bg-eco-green-light rounded-lg">
          <span className="text-lg font-bold">Total:</span>
          <span className="text-xl font-bold text-eco-green">
            {formatPrice(total)}
          </span>
        </div>

        {/* Informações de Segurança */}
        <div className="text-center p-3 bg-muted rounded-lg">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-eco-green" />
            <span className="text-sm font-medium">Compra 100% Segura</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Seus dados estão protegidos e a transação é segura
          </p>
        </div>

        {/* Estimativa de Prazo */}
        <div className="text-center text-xs text-muted-foreground">
          {deliveryMethod === 'retirada_local' && 'Disponível para retirada imediatamente'}
          {deliveryMethod === 'entrega' && 'Entrega em até 24 horas'}
          {deliveryMethod === 'transportadora' && 'Entrega em 3-7 dias úteis'}
        </div>
      </CardContent>
    </Card>
  );
};