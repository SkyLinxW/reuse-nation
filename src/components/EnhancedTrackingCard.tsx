import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { DeliveryMap } from './DeliveryMap';
import { Package, Truck, CheckCircle, Clock, MapPin, Phone, MessageCircle, Eye, EyeOff, Settings } from 'lucide-react';
import { Transaction, User, WasteItem } from '@/types';
import { calculateDeliveryDetails, updateDeliveryStatus } from '@/utils/deliveryCalculations';
import { geocodeAddress, SAO_PAULO_COORDINATES } from '@/services/addressService';
import { AddressSelector } from './AddressSelector';

interface EnhancedTrackingCardProps {
  transaction: Transaction;
  otherUser: User;
  product: WasteItem;
  onContactSeller?: () => void;
  onRateTransaction?: () => void;
}

export const EnhancedTrackingCard = ({ 
  transaction, 
  otherUser, 
  product, 
  onContactSeller,
  onRateTransaction 
}: EnhancedTrackingCardProps) => {
  const [showMap, setShowMap] = useState(false);
  const [showAddressSelector, setShowAddressSelector] = useState(false);
  const [deliveryDetails, setDeliveryDetails] = useState<any>(null);
  const [destinationCoords, setDestinationCoords] = useState<any>(null);

  useEffect(() => {
    console.log('EnhancedTrackingCard useEffect called with:', { transaction, otherUser });
    
    if (!transaction || !otherUser) {
      console.log('Missing transaction or otherUser data');
      return;
    }

    const calculateAndSetDeliveryDetails = async () => {
      try {
        let destination = null;
        
        // Try to geocode the delivery address if it exists
        if (transaction.deliveryAddress) {
          console.log('Geocoding delivery address:', transaction.deliveryAddress);
          destination = await geocodeAddress(transaction.deliveryAddress);
        }
        
        // If no valid coordinates, use fallback
        if (!destination) {
          console.log('Using fallback coordinates for Rio de Janeiro');
          destination = { lat: -22.9068, lng: -43.1729 }; // Rio de Janeiro default
        }
        
        console.log('Final destination coordinates:', destination);
        setDestinationCoords(destination);
        
        // Calculate delivery details using new real calculation
        const details = await calculateDeliveryDetails(
          destination,
          transaction.deliveryMethod as 'retirada_local' | 'entrega' | 'transportadora'
        );
        
        console.log('Real delivery details calculated:', details);
        
        // Update step statuses based on transaction status
        const stepsWithStatus = updateDeliveryStatus(details.steps, transaction.status);
        
        setDeliveryDetails({
          ...details,
          steps: stepsWithStatus,
          origin: SAO_PAULO_COORDINATES,
          destination
        });
        
      } catch (error) {
        console.error('Error calculating real delivery details:', error);
        setDeliveryDetails({
          distance: 0,
          estimatedTime: 'Erro no cálculo',
          cost: 0,
          steps: [],
          origin: SAO_PAULO_COORDINATES,
          destination: { lat: -22.9068, lng: -43.1729 }
        });
      }
    };

    calculateAndSetDeliveryDetails();
  }, [transaction, otherUser]);

  // Function to check if address can be changed
  const canChangeAddress = () => {
    // Allow address changes only for pending and confirmed statuses
    // Once it's in transport or delivered, address cannot be changed
    return transaction.status === 'pendente' || transaction.status === 'confirmado';
  };

  const handleAddressUpdate = async (address: string, coordinates: any) => {
    try {
      console.log('Updating delivery address:', { address, coordinates });
      setDestinationCoords(coordinates);
      
      // Recalculate delivery details with new address
      const details = await calculateDeliveryDetails(
        coordinates,
        transaction.deliveryMethod as 'retirada_local' | 'entrega' | 'transportadora'
      );
      
      const stepsWithStatus = updateDeliveryStatus(details.steps, transaction.status);
      
      setDeliveryDetails({
        ...details,
        steps: stepsWithStatus,
        origin: SAO_PAULO_COORDINATES,
        destination: coordinates
      });
      
      setShowAddressSelector(false);
      
      // You would also want to update the transaction in the database here
      // await updateTransactionAddress(transaction.id, address);
      
    } catch (error) {
      console.error('Error updating address:', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getStatusProgress = () => {
    const statusMap = {
      pendente: 20,
      confirmado: 40,
      em_transporte: 70,
      entregue: 100,
      cancelado: 0
    };
    return statusMap[transaction.status];
  };

  const getStatusColor = () => {
    const colorMap = {
      pendente: 'bg-yellow-500',
      confirmado: 'bg-blue-500',
      em_transporte: 'bg-purple-500',
      entregue: 'bg-eco-green',
      cancelado: 'bg-red-500'
    };
    return colorMap[transaction.status];
  };

  const getStatusLabel = () => {
    const labelMap = {
      pendente: 'Aguardando Confirmação',
      confirmado: 'Pedido Confirmado',
      em_transporte: 'Em Transporte',
      entregue: 'Entregue',
      cancelado: 'Cancelado'
    };
    return labelMap[transaction.status];
  };

  const getDeliveryMethodLabel = () => {
    const methods = {
      retirada_local: 'Retirada Local',
      entrega: 'Entrega Expressa',
      transportadora: 'Transportadora'
    };
    return methods[transaction.deliveryMethod];
  };

  const getStepIcon = (iconName: string) => {
    const icons = {
      package: Package,
      truck: Truck,
      'check-circle': CheckCircle,
      'map-pin': MapPin,
      'building-2': Clock
    };
    const IconComponent = icons[iconName as keyof typeof icons] || Package;
    return <IconComponent className="w-4 h-4" />;
  };

  if (!deliveryDetails) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center">
          <div className="animate-pulse">Calculando detalhes da entrega...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-eco-green" />
              Pedido #{transaction.id.slice(-8)}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {new Date(transaction.createdAt).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <Badge className={`${getStatusColor()} text-white`}>
            {getStatusLabel()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Product Info */}
        <div className="flex gap-4 p-4 bg-muted rounded-lg">
          <div className="flex-1">
            <h4 className="font-medium">{product.title}</h4>
            <p className="text-sm text-muted-foreground">
              {transaction.quantity} {typeof product.quantity === 'string' ? JSON.parse(product.quantity).unit : product.quantity.unit || 'unidades'}
            </p>
            <p className="text-lg font-bold text-eco-green">
              {formatPrice(transaction.totalPrice)}
            </p>
          </div>
        </div>

        {/* Enhanced Progress Section */}
        {transaction.status !== 'cancelado' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Progresso do Pedido</span>
              <span className="text-sm text-muted-foreground">{getStatusProgress()}%</span>
            </div>
            <Progress value={getStatusProgress()} className="h-3" />
            
            {/* Delivery Stats */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-card border rounded-lg">
              <div className="text-center">
                <p className="text-sm font-medium">Distância</p>
                <p className="text-lg font-bold text-eco-green">{deliveryDetails.distance} km</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Tempo Estimado</p>
                <p className="text-lg font-bold text-eco-blue">{deliveryDetails.estimatedTime}</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Custo Entrega</p>
                <p className="text-lg font-bold text-eco-brown">
                  {deliveryDetails.cost === 0 ? 'Grátis' : formatPrice(deliveryDetails.cost)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Tracking Timeline */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Etapas da Entrega</h4>
            <div className="flex gap-2">
              {canChangeAddress() && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddressSelector(!showAddressSelector)}
                  className="flex items-center gap-2"
                >
                  <Settings className="w-3 h-3" />
                  Alterar Endereço
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMap(!showMap)}
                className="flex items-center gap-2"
              >
                {showMap ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                {showMap ? 'Ocultar Mapa' : 'Ver no Mapa'}
              </Button>
            </div>
          </div>
          
          {/* Address Selector - Only show if transaction status allows changes */}
          {showAddressSelector && canChangeAddress() && (
            <AddressSelector
              onAddressSelected={handleAddressUpdate}
              defaultAddress={transaction.deliveryAddress || ''}
            />
          )}

          <div className="space-y-3">
            {deliveryDetails.steps.map((step: any, index: number) => {
              const isCompleted = step.status === 'completed';
              const isActive = step.status === 'active';
              
              return (
                <div key={step.id} className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    isCompleted ? 'bg-eco-green border-eco-green text-white' : 
                    isActive ? 'bg-eco-blue border-eco-blue text-white animate-pulse' : 
                    'bg-muted border-muted-foreground text-muted-foreground'
                  }`}>
                    {getStepIcon(step.icon)}
                  </div>
                  
                  <div className="flex-1">
                    <p className={`font-medium ${
                      isCompleted || isActive ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                    <p className="text-xs font-medium text-eco-green">{step.estimatedTime}</p>
                  </div>
                  
                  {isActive && (
                    <div className="flex items-center gap-1 text-eco-blue">
                      <Clock className="w-3 h-3" />
                      <span className="text-xs font-medium">Em andamento</span>
                    </div>
                  )}
                  
                  {isCompleted && (
                    <CheckCircle className="w-4 h-4 text-eco-green" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Map Component */}
        {showMap && (
          <DeliveryMap
            origin={deliveryDetails.origin}
            destination={deliveryDetails.destination}
            status={transaction.status}
            deliveryMethod={transaction.deliveryMethod}
            productTitle={product.title}
            estimatedTime={deliveryDetails.estimatedTime}
            distance={deliveryDetails.distance}
          />
        )}

        {/* Delivery Method Info */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-card border rounded-lg">
          <div>
            <p className="text-sm font-medium">Método de Entrega</p>
            <p className="text-sm text-muted-foreground">{getDeliveryMethodLabel()}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Previsão de Entrega</p>
            <p className="text-sm text-muted-foreground">
              {transaction.deliveryMethod === 'retirada_local' ? 'Disponível para retirada' : deliveryDetails.estimatedTime}
            </p>
          </div>
        </div>

        {/* Seller Info */}
        <div className="p-4 bg-card border rounded-lg">
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="font-medium">Vendedor</p>
              <p className="text-sm text-muted-foreground">{otherUser.name}</p>
              <div className="flex items-center gap-1 text-xs">
                <MapPin className="w-3 h-3" />
                <span>{otherUser.address?.city || 'São Paulo'}, {otherUser.address?.state || 'SP'}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={onContactSeller}>
                <Phone className="w-3 h-3 mr-1" />
                Contato
              </Button>
              <Button size="sm" variant="outline">
                <MessageCircle className="w-3 h-3 mr-1" />
                Chat
              </Button>
            </div>
          </div>
        </div>

        {/* Actions */}
        {transaction.status === 'entregue' && (
          <div className="flex gap-2">
            <Button onClick={onRateTransaction} className="flex-1 bg-gradient-eco hover:opacity-90">
              Avaliar Transação
            </Button>
            <Button variant="outline" className="flex-1">
              Comprar Novamente
            </Button>
          </div>
        )}

        {transaction.status === 'em_transporte' && transaction.deliveryMethod !== 'retirada_local' && (
          <Button variant="outline" className="w-full" onClick={() => setShowMap(true)}>
            <MapPin className="w-4 h-4 mr-2" />
            Acompanhar no Mapa
          </Button>
        )}
      </CardContent>
    </Card>
  );
};