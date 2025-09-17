import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { DeliveryMap } from './DeliveryMap';
import { Package, Truck, CheckCircle, Clock, MapPin, Phone, MessageCircle, Eye, EyeOff, Settings } from 'lucide-react';
import { Transaction, User, WasteItem } from '@/types';
import { calculateDeliveryDetails, updateDeliveryStatus } from '@/utils/deliveryCalculations';
import { geocodeAddress, SAO_PAULO_COORDINATES, Coordinates } from '@/services/addressService';
import { updateTransactionAddress } from '@/lib/supabase';
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
    console.log('EnhancedTrackingCard useEffect called with:', { 
      transaction: {
        id: transaction?.id,
        deliveryAddress: transaction?.deliveryAddress,
        deliveryMethod: transaction?.deliveryMethod
      }, 
      product: {
        location: product?.location
      },
      otherUser: otherUser?.name 
    });
    
    if (!transaction || !otherUser) {
      console.log('Missing transaction or otherUser data');
      return;
    }

    const calculateAndSetDeliveryDetails = async () => {
      try {
        let destination = null;
        let origin = SAO_PAULO_COORDINATES; // Default origin
        
        // Get product origin coordinates if available
        if (product?.coordinates) {
          try {
            const parsedCoords = typeof product.coordinates === 'string' 
              ? JSON.parse(product.coordinates) 
              : product.coordinates;
            if (parsedCoords && parsedCoords.lat && parsedCoords.lng) {
              origin = parsedCoords;
              console.log('Using product coordinates as origin:', origin);
            }
          } catch (error) {
            console.log('Error parsing product coordinates, using default origin:', error);
          }
        }
        
        // Se já temos coordenadas definidas pelo usuário, não recalcule
        if (destinationCoords && destinationCoords.lat && destinationCoords.lng) {
          console.log('Using existing user-selected destination coordinates:', destinationCoords);
          destination = destinationCoords;
        } else {
          // Priority 1: deliveryAddress from transaction
          if (transaction.deliveryAddress && transaction.deliveryAddress.trim()) {
            console.log('Geocoding delivery address:', transaction.deliveryAddress);
            destination = await geocodeAddress(transaction.deliveryAddress);
            if (destination) {
              console.log('Successfully geocoded delivery address:', { address: transaction.deliveryAddress, coords: destination });
            } else {
              console.log('Failed to geocode delivery address:', transaction.deliveryAddress);
            }
          }
          
          // Priority 2: product location from props
          if (!destination && product?.location) {
            // Check if coordinates already exist
            if (product.location.coordinates) {
              console.log('Using existing product coordinates:', product.location.coordinates);
              destination = product.location.coordinates;
            } else if (product.location.city && product.location.state) {
              // Geocode city and state
              const locationString = `${product.location.city}, ${product.location.state}, Brasil`;
              console.log('Geocoding product location:', locationString);
              destination = await geocodeAddress(locationString);
              if (destination) {
                console.log('Successfully geocoded product location:', { location: locationString, coords: destination });
              } else {
                console.log('Failed to geocode product location:', locationString);
              }
            }
          }
          
          // Priority 3: Try otherUser address if available
          if (!destination && otherUser?.address) {
            const userAddress = `${otherUser.address.city}, ${otherUser.address.state}, Brasil`;
            console.log('Geocoding user address:', userAddress);
            destination = await geocodeAddress(userAddress);
            if (destination) {
              console.log('Successfully geocoded user address:', { address: userAddress, coords: destination });
            } else {
              console.log('Failed to geocode user address:', userAddress);
            }
          }
          
          // Priority 4: Use default coordinates as last resort
          if (!destination) {
            console.log('No valid address found, using default destination coordinates (Brasília)');
            destination = { lat: -15.8267, lng: -47.9218 }; // Brasília - central Brazil location
          }
        }
        
        console.log('Final destination coordinates:', destination);
        setDestinationCoords(destination);
        
        // Calculate delivery details using real calculation
        const details = await calculateDeliveryDetails(
          origin,
          destination,
          transaction.deliveryMethod as 'retirada_local' | 'entrega' | 'transportadora'
        );
        
        console.log('Real delivery details calculated:', details);
        
        // Update step statuses based on transaction status
        const stepsWithStatus = updateDeliveryStatus(details.steps, transaction.status);
        
        setDeliveryDetails({
          ...details,
          steps: stepsWithStatus,
          origin,
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
  }, [transaction, otherUser, product]);

  // Function to check if address can be changed based on delivery method and status
  const canChangeAddress = () => {
    // Retirada local: Não permite alterar endereço (é no local do vendedor)
    if (transaction.deliveryMethod === 'retirada_local') {
      return false;
    }
    
    // Entrega e Transportadora: Permite alterar apenas quando pendente ou confirmado
    // Uma vez em transporte ou entregue, não pode mais alterar
    return (transaction.deliveryMethod === 'entrega' || transaction.deliveryMethod === 'transportadora') &&
           (transaction.status === 'pendente' || transaction.status === 'confirmado');
  };

  const handleAddressUpdate = async (address: string, coordinates: Coordinates) => {
    try {
      console.log('Updating delivery address:', { address, coordinates });
      
      // Ensure we have valid coordinates
      if (!coordinates || typeof coordinates.lat !== 'number' || typeof coordinates.lng !== 'number') {
        console.error('Invalid coordinates provided:', coordinates);
        return;
      }
      
      setDestinationCoords(coordinates);
      
      // Get origin coordinates from product
      let origin = SAO_PAULO_COORDINATES; // Default origin
      if (product?.coordinates) {
        try {
          const parsedCoords = typeof product.coordinates === 'string' 
            ? JSON.parse(product.coordinates) 
            : product.coordinates;
          if (parsedCoords && parsedCoords.lat && parsedCoords.lng) {
            origin = parsedCoords;
          }
        } catch (error) {
          console.log('Error parsing product coordinates in address update:', error);
        }
      }
      
      // Recalculate delivery details with new address
      const details = await calculateDeliveryDetails(
        origin,
        coordinates,
        transaction.deliveryMethod as 'retirada_local' | 'entrega' | 'transportadora'
      );
      
      const stepsWithStatus = updateDeliveryStatus(details.steps, transaction.status);
      
      setDeliveryDetails({
        ...details,
        steps: stepsWithStatus,
        origin,
        destination: coordinates
      });
      
      setShowAddressSelector(false);
      
      // Update the transaction in the database
      await updateTransactionAddress(transaction.id, address);
      
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
                  {transaction.deliveryMethod === 'transportadora' 
                    ? 'Alterar Endereço de Entrega' 
                    : 'Alterar Endereço'}
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
          
          {/* Address Selector - Only show for delivery methods that allow address changes */}
          {showAddressSelector && canChangeAddress() && (
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-muted-foreground">
                {transaction.deliveryMethod === 'transportadora' 
                  ? 'Endereço de Entrega via Transportadora' 
                  : 'Endereço de Entrega Local'}
              </h5>
              <AddressSelector
                onAddressSelected={handleAddressUpdate}
                defaultAddress={transaction.deliveryAddress || ''}
              />
            </div>
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
            <p className="text-sm text-muted-foreground">
              {transaction.deliveryMethod === 'retirada_local' && 'Retirada no Local'}
              {transaction.deliveryMethod === 'entrega' && 'Entrega Local'}
              {transaction.deliveryMethod === 'transportadora' && 'Entrega via Transportadora'}
            </p>
            {transaction.deliveryMethod === 'retirada_local' && (
              <p className="text-xs text-amber-600 mt-1">
                ⚠️ Endereço fixo - retirada no local do vendedor
              </p>
            )}
          </div>
          <div>
            <p className="text-sm font-medium">
              {transaction.deliveryMethod === 'retirada_local' ? 'Local de Retirada' : 'Endereço de Entrega'}
            </p>
            <p className="text-sm text-muted-foreground">
              {transaction.deliveryMethod === 'retirada_local' 
                ? (typeof product?.location === 'string' ? product.location : product?.location?.city + ', ' + product?.location?.state || 'Local do vendedor')
                : (transaction.deliveryAddress || 'Endereço não definido')}
            </p>
            {!transaction.deliveryAddress && transaction.deliveryMethod !== 'retirada_local' && (
              <p className="text-xs text-red-600 mt-1">
                ⚠️ Endereço de entrega não definido
              </p>
            )}
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