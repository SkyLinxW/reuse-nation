import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, Smartphone, FileText, DollarSign, Shield, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PaymentFormProps {
  paymentMethod: 'pix' | 'boleto' | 'cartao';
  onPaymentMethodChange: (method: 'pix' | 'boleto' | 'cartao') => void;
  total: number;
  onPaymentProcess: (paymentData: any) => Promise<void>;
  isProcessing: boolean;
}

export const PaymentForm = ({ 
  paymentMethod, 
  onPaymentMethodChange, 
  total, 
  onPaymentProcess,
  isProcessing 
}: PaymentFormProps) => {
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
    installments: '1'
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const handleCardPayment = async () => {
    if (!cardData.number || !cardData.name || !cardData.expiry || !cardData.cvv) {
      return;
    }
    await onPaymentProcess({ 
      type: 'cartao', 
      cardData,
      installments: parseInt(cardData.installments)
    });
  };

  const handlePixPayment = async () => {
    await onPaymentProcess({ 
      type: 'pix',
      pixCode: `${Date.now()}-eco-marketplace`,
      qrCode: `data:image/svg+xml;base64,${btoa('<svg><!-- Mock QR Code --></svg>')}`
    });
  };

  const handleBoletoPayment = async () => {
    await onPaymentProcess({ 
      type: 'boleto',
      boletoNumber: `34191.79001 01043.510047 91020.150008 1 ${Date.now()}`,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
    });
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-eco-green" />
          Pagamento Seguro
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-eco-green-light rounded-lg">
            <span className="font-medium">Total a pagar:</span>
            <span className="text-xl font-bold text-eco-green">{formatPrice(total)}</span>
          </div>

          <Tabs value={paymentMethod} onValueChange={(value: any) => onPaymentMethodChange(value)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pix" className="flex items-center gap-1">
                <Smartphone className="w-4 h-4" />
                PIX
              </TabsTrigger>
              <TabsTrigger value="cartao" className="flex items-center gap-1">
                <CreditCard className="w-4 h-4" />
                Cartão
              </TabsTrigger>
              <TabsTrigger value="boleto" className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                Boleto
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pix" className="space-y-4">
              <div className="text-center space-y-3">
                <div className="bg-card p-4 rounded-lg border">
                  <h4 className="font-medium mb-2">Pagamento via PIX</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Aprovação instantânea. Escaneie o QR Code ou copie o código PIX.
                  </p>
                  <Badge variant="secondary" className="bg-eco-green text-white">
                    <Lock className="w-3 h-3 mr-1" />
                    100% Seguro
                  </Badge>
                </div>
                <Button 
                  onClick={handlePixPayment}
                  disabled={isProcessing}
                  className="w-full bg-gradient-eco hover:opacity-90"
                >
                  {isProcessing ? 'Gerando PIX...' : 'Gerar PIX'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="cartao" className="space-y-4">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="cardNumber">Número do Cartão</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={cardData.number}
                    onChange={(e) => setCardData({...cardData, number: e.target.value})}
                    maxLength={19}
                  />
                </div>
                
                <div>
                  <Label htmlFor="cardName">Nome no Cartão</Label>
                  <Input
                    id="cardName"
                    placeholder="Nome como no cartão"
                    value={cardData.name}
                    onChange={(e) => setCardData({...cardData, name: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="expiry">Validade</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/AA"
                      value={cardData.expiry}
                      onChange={(e) => setCardData({...cardData, expiry: e.target.value})}
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      value={cardData.cvv}
                      onChange={(e) => setCardData({...cardData, cvv: e.target.value})}
                      maxLength={4}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="installments">Parcelas</Label>
                  <Select value={cardData.installments} onValueChange={(value) => setCardData({...cardData, installments: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
                        <SelectItem key={i} value={i.toString()}>
                          {i}x de {formatPrice(total / i)} {i > 1 && 'com juros'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleCardPayment}
                  disabled={isProcessing || !cardData.number || !cardData.name}
                  className="w-full bg-gradient-eco hover:opacity-90"
                >
                  {isProcessing ? 'Processando...' : 'Pagar com Cartão'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="boleto" className="space-y-4">
              <div className="text-center space-y-3">
                <div className="bg-card p-4 rounded-lg border">
                  <h4 className="font-medium mb-2">Boleto Bancário</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Vencimento em 3 dias úteis. Pode ser pago em qualquer banco, lotérica ou internet banking.
                  </p>
                  <Badge variant="outline">Prazo: 3 dias</Badge>
                </div>
                <Button 
                  onClick={handleBoletoPayment}
                  disabled={isProcessing}
                  className="w-full bg-gradient-eco hover:opacity-90"
                >
                  {isProcessing ? 'Gerando Boleto...' : 'Gerar Boleto'}
                </Button>
              </div>
            </TabsContent>

          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
};