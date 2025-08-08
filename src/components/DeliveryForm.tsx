import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Truck, Building2, Calendar, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DeliveryFormProps {
  deliveryMethod: 'retirada_local' | 'entrega' | 'transportadora';
  onDeliveryMethodChange: (method: 'retirada_local' | 'entrega' | 'transportadora') => void;
  onDeliveryDataChange: (data: any) => void;
  sellerAddress: string;
}

export const DeliveryForm = ({ 
  deliveryMethod, 
  onDeliveryMethodChange, 
  onDeliveryDataChange,
  sellerAddress 
}: DeliveryFormProps) => {
  const [deliveryData, setDeliveryData] = useState({
    address: '',
    complement: '',
    preferredDate: '',
    preferredTime: '',
    instructions: '',
    transportadora: 'correios'
  });

  const handleDataChange = (newData: any) => {
    const updated = { ...deliveryData, ...newData };
    setDeliveryData(updated);
    onDeliveryDataChange(updated);
  };

  const deliveryCosts = {
    retirada_local: 0,
    entrega: 25.90,
    transportadora: 45.00
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="w-5 h-5 text-eco-green" />
          Método de Entrega
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={deliveryMethod} onValueChange={(value: any) => onDeliveryMethodChange(value)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="retirada_local" className="flex items-center gap-1 text-xs">
              <MapPin className="w-3 h-3" />
              Retirada
            </TabsTrigger>
            <TabsTrigger value="entrega" className="flex items-center gap-1 text-xs">
              <Truck className="w-3 h-3" />
              Entrega
            </TabsTrigger>
            <TabsTrigger value="transportadora" className="flex items-center gap-1 text-xs">
              <Building2 className="w-3 h-3" />
              Transportadora
            </TabsTrigger>
          </TabsList>

          <div className="mt-4">
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg mb-4">
              <span className="font-medium">Custo da entrega:</span>
              <span className="font-bold text-eco-green">
                {deliveryCosts[deliveryMethod] === 0 ? 'Grátis' : formatPrice(deliveryCosts[deliveryMethod])}
              </span>
            </div>
          </div>

          <TabsContent value="retirada_local" className="space-y-4">
            <div className="bg-card p-4 rounded-lg border">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Local de Retirada
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                {sellerAddress}
              </p>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="pickupDate">Data Preferida para Retirada</Label>
                  <Input
                    id="pickupDate"
                    type="date"
                    value={deliveryData.preferredDate}
                    onChange={(e) => handleDataChange({ preferredDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <Label htmlFor="pickupTime">Horário Preferido</Label>
                  <Select value={deliveryData.preferredTime} onValueChange={(value) => handleDataChange({ preferredTime: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o horário" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manha">Manhã (08:00 - 12:00)</SelectItem>
                      <SelectItem value="tarde">Tarde (13:00 - 17:00)</SelectItem>
                      <SelectItem value="noite">Noite (18:00 - 20:00)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="instructions">Instruções Especiais</Label>
                  <Textarea
                    id="instructions"
                    placeholder="Informações adicionais sobre a retirada..."
                    value={deliveryData.instructions}
                    onChange={(e) => handleDataChange({ instructions: e.target.value })}
                  />
                </div>
              </div>
              <Badge className="mt-3 bg-eco-green text-white">
                <Clock className="w-3 h-3 mr-1" />
                Disponível imediatamente
              </Badge>
            </div>
          </TabsContent>

          <TabsContent value="entrega" className="space-y-4">
            <div className="bg-card p-4 rounded-lg border">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Truck className="w-4 h-4" />
                Entrega Expressa
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Entrega em até 24 horas na região metropolitana.
              </p>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="deliveryAddress">Endereço de Entrega</Label>
                  <Input
                    id="deliveryAddress"
                    placeholder="Rua, número, bairro"
                    value={deliveryData.address}
                    onChange={(e) => handleDataChange({ address: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="complement">Complemento</Label>
                  <Input
                    id="complement"
                    placeholder="Apartamento, casa, referência..."
                    value={deliveryData.complement}
                    onChange={(e) => handleDataChange({ complement: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="deliveryDate">Data Preferida</Label>
                  <Input
                    id="deliveryDate"
                    type="date"
                    value={deliveryData.preferredDate}
                    onChange={(e) => handleDataChange({ preferredDate: e.target.value })}
                    min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <Label htmlFor="deliveryTime">Período Preferido</Label>
                  <Select value={deliveryData.preferredTime} onValueChange={(value) => handleDataChange({ preferredTime: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manha">Manhã (08:00 - 12:00)</SelectItem>
                      <SelectItem value="tarde">Tarde (13:00 - 17:00)</SelectItem>
                      <SelectItem value="noite">Noite (18:00 - 20:00)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="deliveryInstructions">Instruções de Entrega</Label>
                  <Textarea
                    id="deliveryInstructions"
                    placeholder="Informações para o entregador..."
                    value={deliveryData.instructions}
                    onChange={(e) => handleDataChange({ instructions: e.target.value })}
                  />
                </div>
              </div>
              <Badge className="mt-3 bg-eco-blue text-white">
                <Clock className="w-3 h-3 mr-1" />
                Entrega em até 24h
              </Badge>
            </div>
          </TabsContent>

          <TabsContent value="transportadora" className="space-y-4">
            <div className="bg-card p-4 rounded-lg border">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Envio por Transportadora
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Para pedidos grandes ou longa distância. Prazo de 3-7 dias úteis.
              </p>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="transportadora">Escolha a Transportadora</Label>
                  <Select value={deliveryData.transportadora} onValueChange={(value) => handleDataChange({ transportadora: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="correios">Correios - 5-7 dias úteis</SelectItem>
                      <SelectItem value="jadlog">Jadlog - 3-5 dias úteis (+R$ 15,00)</SelectItem>
                      <SelectItem value="total">Total Express - 2-4 dias úteis (+R$ 25,00)</SelectItem>
                      <SelectItem value="transportadora-local">Transportadora Local - 3-5 dias úteis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="shippingAddress">Endereço de Entrega</Label>
                  <Input
                    id="shippingAddress"
                    placeholder="Endereço completo com CEP"
                    value={deliveryData.address}
                    onChange={(e) => handleDataChange({ address: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="shippingInstructions">Observações</Label>
                  <Textarea
                    id="shippingInstructions"
                    placeholder="Informações importantes sobre o envio..."
                    value={deliveryData.instructions}
                    onChange={(e) => handleDataChange({ instructions: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="mt-3 flex gap-2">
                <Badge className="bg-eco-brown text-white">
                  <Calendar className="w-3 h-3 mr-1" />
                  3-7 dias úteis
                </Badge>
                <Badge variant="outline">
                  Rastreamento incluído
                </Badge>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};