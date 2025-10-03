import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Truck, Building2, Calendar, Clock, Calculator } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { calculateDeliveryDetails } from '@/utils/deliveryCalculations';
import { AddressSelector } from './AddressSelector';
import { Coordinates } from '@/services/addressService';

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
    fullAddress: '',
    coordinates: null as Coordinates | null,
    complement: '',
    preferredDate: '',
    preferredTime: '',
    instructions: '',
    transportadora: 'correios'
  });

  const [deliveryCalculation, setDeliveryCalculation] = useState<any>(null);

  useEffect(() => {
    const updateCalculation = async () => {
      if (deliveryData.coordinates) {
        try {
          // For DeliveryForm, we use São Paulo as default origin since we don't have product context here
          const calculation = await calculateDeliveryDetails(
            { lat: -23.5505, lng: -46.6333 }, // São Paulo coordinates as origin
            deliveryData.coordinates, 
            deliveryMethod
          );
          setDeliveryCalculation(calculation);
        } catch (error) {
          console.error('Error calculating delivery:', error);
        }
      }
    };
    
    updateCalculation();
  }, [deliveryMethod, deliveryData.coordinates]);

  const handleAddressSelected = (address: string, coordinates: Coordinates) => {
    console.log('DeliveryForm - Address selected:', { address, coordinates });
    const updated = { 
      ...deliveryData, 
      address,
      fullAddress: address,
      coordinates,
      isAddressConfirmed: true
    };
    console.log('DeliveryForm - Updated deliveryData:', updated);
    setDeliveryData(updated);
    onDeliveryDataChange(updated);
  };

  const handleDataChange = (newData: any) => {
    const updated = { ...deliveryData, ...newData };
    console.log('DeliveryForm - Data change:', { newData, updated });
    setDeliveryData(updated);
    onDeliveryDataChange(updated);
  };

  const getDeliveryCost = () => {
    if (deliveryCalculation) {
      return deliveryCalculation.cost;
    }
    
    const baseCosts = {
      retirada_local: 0,
      entrega: 25.90,
      transportadora: 45.00
    };
    return baseCosts[deliveryMethod];
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

          <div className="mt-4 space-y-3">
            {deliveryCalculation && (
              <div className="grid grid-cols-3 gap-3 p-3 bg-card border rounded-lg">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Calculator className="w-3 h-3 text-eco-green" />
                    <span className="text-xs font-medium">Distância</span>
                  </div>
                  <span className="text-sm font-bold text-eco-green">
                    {deliveryCalculation.distance} km
                  </span>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Clock className="w-3 h-3 text-eco-blue" />
                    <span className="text-xs font-medium">Tempo</span>
                  </div>
                  <span className="text-sm font-bold text-eco-blue">
                    {deliveryCalculation.estimatedTime}
                  </span>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Truck className="w-3 h-3 text-eco-brown" />
                    <span className="text-xs font-medium">Custo</span>
                  </div>
                  <span className="text-sm font-bold text-eco-brown">
                    {getDeliveryCost() === 0 ? 'Grátis' : formatPrice(getDeliveryCost())}
                  </span>
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="font-medium">Custo total da entrega:</span>
              <span className="font-bold text-eco-green">
                {getDeliveryCost() === 0 ? 'Grátis' : formatPrice(getDeliveryCost())}
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
                Produto entra em preparação em até 24 horas após confirmação.
              </p>
              
                <div className="space-y-4">
                  <div>
                    <Label>Endereço de Entrega</Label>
                    <AddressSelector 
                      onAddressSelected={handleAddressSelected}
                      defaultAddress={deliveryData.fullAddress}
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
                
                <div className="space-y-4">
                  <div>
                    <Label>Endereço de Entrega</Label>
                    <AddressSelector 
                      onAddressSelected={handleAddressSelected}
                      defaultAddress={deliveryData.fullAddress}
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