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

/** Safely parse quantity from DB (could be JSON string or object). */
const parseQuantity = (q: any): { value?: number; unit?: string } => {
  if (!q) return {};
  if (typeof q === 'string') {
    try { return JSON.parse(q); } catch { return {}; }
  }
  return q;
};

/** Safely get location string for display. */
const getLocationString = (loc: any): string => {
  if (!loc) return '';
  if (typeof loc === 'string') return loc;
  if (loc.city && loc.state) return `${loc.city}, ${loc.state}`;
  return '';
};

export const EnhancedTrackingCard = ({
  transaction,
  otherUser,
  product,
  onContactSeller,
  onRateTransaction,
}: EnhancedTrackingCardProps) => {
  const [showMap, setShowMap] = useState(false);
  const [showAddressSelector, setShowAddressSelector] = useState(false);
  const [deliveryDetails, setDeliveryDetails] = useState<any>(null);
  const [destinationCoords, setDestinationCoords] = useState<any>(null);

  useEffect(() => {
    if (!transaction || !otherUser) return;

    const calculate = async () => {
      try {
        let destination = null;
        let origin = SAO_PAULO_COORDINATES;

        // Product origin coordinates
        if (product?.coordinates) {
          try {
            const parsed = typeof product.coordinates === 'string'
              ? JSON.parse(product.coordinates)
              : product.coordinates;
            if (parsed?.lat && parsed?.lng) origin = parsed;
          } catch {}
        }

        if (destinationCoords?.lat && destinationCoords?.lng) {
          destination = destinationCoords;
        } else {
          // Try delivery address
          const addr = (transaction as any).deliveryAddress as string | undefined;
          if (addr && addr.trim()) {
            destination = await geocodeAddress(addr);
          }

          // Try product location string
          if (!destination && product?.location) {
            if (typeof product.location === 'string' && product.location.trim()) {
              destination = await geocodeAddress(`${product.location}, Brasil`);
            } else if (typeof product.location === 'object') {
              const loc = product.location as any;
              if (loc.coordinates?.lat) {
                destination = loc.coordinates;
              } else if (loc.city && loc.state) {
                destination = await geocodeAddress(`${loc.city}, ${loc.state}, Brasil`);
              }
            }
          }

          if (!destination) {
            destination = { lat: -15.8267, lng: -47.9218 }; // Brasília fallback
          }
        }

        setDestinationCoords(destination);

        const details = await calculateDeliveryDetails(
          origin,
          destination,
          transaction.deliveryMethod as 'retirada_local' | 'entrega' | 'transportadora',
        );
        const stepsWithStatus = updateDeliveryStatus(details.steps, transaction.status);

        setDeliveryDetails({ ...details, steps: stepsWithStatus, origin, destination });
      } catch (error) {
        console.error('Error calculating delivery details:', error);
        setDeliveryDetails({
          distance: 0,
          estimatedTime: 'Erro no cálculo',
          cost: 0,
          steps: [],
          origin: SAO_PAULO_COORDINATES,
          destination: { lat: -22.9068, lng: -43.1729 },
        });
      }
    };

    calculate();
  }, [transaction, otherUser, product]);

  const canChangeAddress = () => {
    if (transaction.deliveryMethod === 'retirada_local') return false;
    return (
      (transaction.deliveryMethod === 'entrega' || transaction.deliveryMethod === 'transportadora') &&
      (transaction.status === 'pendente' || transaction.status === 'confirmado')
    );
  };

  const handleAddressUpdate = async (address: string, coordinates: Coordinates) => {
    try {
      if (!coordinates?.lat || !coordinates?.lng) return;

      setDestinationCoords(coordinates);

      let origin = SAO_PAULO_COORDINATES;
      if (product?.coordinates) {
        try {
          const parsed = typeof product.coordinates === 'string'
            ? JSON.parse(product.coordinates)
            : product.coordinates;
          if (parsed?.lat && parsed?.lng) origin = parsed;
        } catch {}
      }

      const details = await calculateDeliveryDetails(
        origin,
        coordinates,
        transaction.deliveryMethod as 'retirada_local' | 'entrega' | 'transportadora',
      );
      const stepsWithStatus = updateDeliveryStatus(details.steps, transaction.status);
      setDeliveryDetails({ ...details, steps: stepsWithStatus, origin, destination: coordinates });
      setShowAddressSelector(false);

      await updateTransactionAddress(transaction.id, address);
    } catch (error) {
      console.error('Error updating address:', error);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);

  const formatAddress = (address?: string) => {
    if (!address) return 'Endereço não definido';
    const parts = address.split(',').map(p => p.trim());
    return [...new Set(parts)].slice(0, 4).join(', ');
  };

  const getStatusProgress = () =>
    ({ pendente: 20, confirmado: 40, em_transporte: 70, entregue: 100, cancelado: 0 }[transaction.status] ?? 0);

  const getStatusColor = () =>
    ({
      pendente: 'bg-yellow-500',
      confirmado: 'bg-blue-500',
      em_transporte: 'bg-purple-500',
      entregue: 'bg-eco-green',
      cancelado: 'bg-red-500',
    }[transaction.status] ?? 'bg-muted');

  const getStatusLabel = () =>
    ({
      pendente: 'Aguardando Confirmação',
      confirmado: 'Pedido Confirmado',
      em_transporte: 'Em Transporte',
      entregue: 'Entregue',
      cancelado: 'Cancelado',
    }[transaction.status] ?? transaction.status);

  const getStepIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      package: Package,
      truck: Truck,
      'check-circle': CheckCircle,
      'map-pin': MapPin,
      'building-2': Clock,
    };
    const Icon = icons[iconName] || Package;
    return <Icon className="w-4 h-4" />;
  };

  const qty = parseQuantity(product?.quantity);

  if (!deliveryDetails) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center">
          <div className="animate-pulse text-muted-foreground">Calculando detalhes da entrega...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Package className="w-5 h-5 text-eco-green shrink-0" />
              <span className="truncate">Pedido #{transaction.id.slice(-8)}</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {new Date(transaction.createdAt).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <Badge className={`${getStatusColor()} text-white shrink-0`}>{getStatusLabel()}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 px-4 sm:px-6">
        {/* Product Info */}
        <div className="flex gap-4 p-3 sm:p-4 bg-muted rounded-lg">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium truncate">{product.title}</h4>
            <p className="text-sm text-muted-foreground">
              {transaction.quantity} {qty.unit || 'unidades'}
            </p>
            <p className="text-lg font-bold text-eco-green">{formatPrice(transaction.totalPrice)}</p>
          </div>
        </div>

        {/* Progress */}
        {transaction.status !== 'cancelado' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium text-sm sm:text-base">Progresso do Pedido</span>
              <span className="text-sm text-muted-foreground">{getStatusProgress()}%</span>
            </div>
            <Progress value={getStatusProgress()} className="h-2.5 sm:h-3" />

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 p-3 sm:p-4 bg-card border rounded-lg">
              <div className="text-center">
                <p className="text-xs sm:text-sm font-medium">Distância</p>
                <p className="text-sm sm:text-lg font-bold text-eco-green">{deliveryDetails.distance} km</p>
              </div>
              <div className="text-center">
                <p className="text-xs sm:text-sm font-medium">Tempo</p>
                <p className="text-sm sm:text-lg font-bold text-eco-blue">{deliveryDetails.estimatedTime}</p>
              </div>
              <div className="text-center">
                <p className="text-xs sm:text-sm font-medium">Custo</p>
                <p className="text-sm sm:text-lg font-bold text-eco-brown">
                  {deliveryDetails.cost === 0 ? 'Grátis' : formatPrice(deliveryDetails.cost)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <h4 className="font-medium text-sm sm:text-base">Etapas da Entrega</h4>
            <div className="flex gap-2 flex-wrap">
              {canChangeAddress() && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddressSelector(!showAddressSelector)}
                  className="flex items-center gap-1.5 text-xs sm:text-sm h-8"
                >
                  <Settings className="w-3 h-3" />
                  <span className="hidden sm:inline">Alterar Endereço</span>
                  <span className="sm:hidden">Endereço</span>
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMap(!showMap)}
                className="flex items-center gap-1.5 text-xs sm:text-sm h-8"
              >
                {showMap ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span className="hidden sm:inline">{showMap ? 'Ocultar Mapa' : 'Ver no Mapa'}</span>
                <span className="sm:hidden">Mapa</span>
              </Button>
            </div>
          </div>

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
            {deliveryDetails.steps.map((step: any) => {
              const isCompleted = step.status === 'completed';
              const isActive = step.status === 'active';

              return (
                <div key={step.id} className="flex items-start sm:items-center gap-3">
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 shrink-0 ${
                      isCompleted
                        ? 'bg-eco-green border-eco-green text-white'
                        : isActive
                        ? 'bg-eco-blue border-eco-blue text-white animate-pulse'
                        : 'bg-muted border-muted-foreground text-muted-foreground'
                    }`}
                  >
                    {getStepIcon(step.icon)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm ${isCompleted || isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{step.description}</p>
                    <p className="text-xs font-medium text-eco-green">{step.estimatedTime}</p>
                  </div>

                  {isActive && (
                    <div className="flex items-center gap-1 text-eco-blue shrink-0">
                      <Clock className="w-3 h-3" />
                      <span className="text-xs font-medium hidden sm:inline">Em andamento</span>
                    </div>
                  )}
                  {isCompleted && <CheckCircle className="w-4 h-4 text-eco-green shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Map */}
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

        {/* Delivery info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 bg-card border rounded-lg">
          <div>
            <p className="text-sm font-medium">Método de Entrega</p>
            <p className="text-sm text-muted-foreground">
              {transaction.deliveryMethod === 'retirada_local' && 'Retirada no Local'}
              {transaction.deliveryMethod === 'entrega' && 'Entrega Local'}
              {transaction.deliveryMethod === 'transportadora' && 'Entrega via Transportadora'}
            </p>
            {transaction.deliveryMethod === 'retirada_local' && (
              <p className="text-xs text-amber-600 mt-1">⚠️ Endereço fixo - retirada no local do vendedor</p>
            )}
          </div>
          <div>
            <p className="text-sm font-medium">
              {transaction.deliveryMethod === 'retirada_local' ? 'Local de Retirada' : 'Endereço de Entrega'}
            </p>
            <p className="text-sm text-muted-foreground break-words">
              {transaction.deliveryMethod === 'retirada_local'
                ? getLocationString(product?.location) || 'Local do vendedor'
                : formatAddress(transaction.deliveryAddress)}
            </p>
            {!transaction.deliveryAddress && transaction.deliveryMethod !== 'retirada_local' && (
              <p className="text-xs text-red-600 mt-1">⚠️ Endereço de entrega não definido</p>
            )}
          </div>
        </div>

        {/* Seller */}
        <div className="p-3 sm:p-4 bg-card border rounded-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <p className="font-medium">Vendedor</p>
              <p className="text-sm text-muted-foreground">{otherUser.name}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={onContactSeller} className="h-8 text-xs sm:text-sm">
                <Phone className="w-3 h-3 mr-1" />
                Contato
              </Button>
              <Button size="sm" variant="outline" onClick={onContactSeller} className="h-8 text-xs sm:text-sm">
                <MessageCircle className="w-3 h-3 mr-1" />
                Chat
              </Button>
            </div>
          </div>
        </div>

        {/* Actions */}
        {transaction.status === 'entregue' && (
          <div className="flex flex-col sm:flex-row gap-2">
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
