import React, { useEffect, useRef, useState } from 'react';
import { Map, MapMarker, MarkerContent, MarkerPopup, MapRoute, MapControls } from '@/components/ui/map';
import type { MapRef } from '@/components/ui/map';
import { Coordinates, generateRealRoute, generateRoute } from '@/utils/distanceCalculator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Truck, MapPin, Package } from 'lucide-react';

interface DeliveryMapProps {
  origin: Coordinates;
  destination: Coordinates;
  status: 'pendente' | 'confirmado' | 'em_transporte' | 'entregue' | 'cancelado';
  deliveryMethod: 'retirada_local' | 'entrega' | 'transportadora';
  productTitle: string;
  estimatedTime: string;
  distance: number;
}

export const DeliveryMap = ({
  origin,
  destination,
  status,
  deliveryMethod,
  productTitle,
  estimatedTime,
  distance,
}: DeliveryMapProps) => {
  const mapRef = useRef<MapRef | null>(null);
  const [route, setRoute] = useState<Coordinates[]>([]);
  const [currentPosition, setCurrentPosition] = useState(0);

  // Load real route
  useEffect(() => {
    if (!origin || !destination) return;
    let cancelled = false;
    (async () => {
      try {
        const points = await generateRealRoute(origin, destination);
        if (!cancelled) setRoute(points);
      } catch (err) {
        console.error('Error generating route:', err);
        if (!cancelled) setRoute(generateRoute(origin, destination, 50));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [origin, destination]);

  // Fit bounds when map and route are ready
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !origin || !destination) return;
    try {
      const bounds: [[number, number], [number, number]] = [
        [Math.min(origin.lng, destination.lng), Math.min(origin.lat, destination.lat)],
        [Math.max(origin.lng, destination.lng), Math.max(origin.lat, destination.lat)],
      ];
      map.fitBounds(bounds, { padding: 60, duration: 600 });
    } catch (err) {
      console.error('Error fitting bounds:', err);
    }
  }, [origin, destination, route.length]);

  // Animate the product marker based on status
  useEffect(() => {
    if (route.length === 0 || deliveryMethod === 'retirada_local') return;

    let progress = 0;
    switch (status) {
      case 'pendente':
      case 'confirmado':
        progress = 0;
        break;
      case 'em_transporte':
        progress = 0.5;
        break;
      case 'entregue':
        progress = 1;
        break;
    }

    const target = Math.floor(progress * (route.length - 1));
    const start = currentPosition;
    if (target === start) return;

    const duration = 2000;
    const t0 = Date.now();
    let raf = 0;
    const tick = () => {
      const t = Math.min((Date.now() - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setCurrentPosition(Math.floor(start + (target - start) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [status, route, deliveryMethod]);

  const routeCoords: [number, number][] = route.map((p) => [p.lng, p.lat]);
  const productPoint = route[Math.min(currentPosition, route.length - 1)];

  const getStatusMessage = () => {
    switch (status) {
      case 'pendente': return 'Aguardando confirmação';
      case 'confirmado': return 'Preparando para envio';
      case 'em_transporte': return 'Em transporte';
      case 'entregue': return 'Produto entregue';
      default: return 'Status desconhecido';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'confirmado': return 'bg-blue-100 text-blue-800';
      case 'em_transporte': return 'bg-purple-100 text-purple-800';
      case 'entregue': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDeliveryIcon = () => {
    switch (deliveryMethod) {
      case 'retirada_local': return <MapPin className="w-4 h-4" />;
      case 'entrega': return <Truck className="w-4 h-4" />;
      case 'transportadora': return <Package className="w-4 h-4" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            {getDeliveryIcon()}
            Rastreamento da Entrega
          </CardTitle>
          <Badge className={getStatusColor()}>{getStatusMessage()}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Distância:</span>
            <span className="ml-2">{distance.toFixed(1)} km</span>
          </div>
          <div>
            <span className="font-medium">Tempo estimado:</span>
            <span className="ml-2">{estimatedTime}</span>
          </div>
        </div>

        {deliveryMethod !== 'retirada_local' ? (
          <div className="h-80 w-full rounded-lg overflow-hidden border">
            <Map
              ref={mapRef}
              viewport={{
                center: [origin.lng, origin.lat],
                zoom: 8,
              }}
              onViewportChange={() => {}}
            >
              <MapControls />

              {routeCoords.length >= 2 && (
                <MapRoute coordinates={routeCoords} color="#22c55e" width={4} opacity={0.8} />
              )}

              {/* Origin marker */}
              <MapMarker longitude={origin.lng} latitude={origin.lat}>
                <MarkerContent>
                  <div className="w-6 h-6 rounded-full bg-eco-green border-2 border-white shadow-md" />
                </MarkerContent>
                <MarkerPopup>
                  <div className="p-1">
                    <strong>Origem</strong>
                    <br />
                    Local do vendedor
                  </div>
                </MarkerPopup>
              </MapMarker>

              {/* Destination marker */}
              <MapMarker longitude={destination.lng} latitude={destination.lat}>
                <MarkerContent>
                  <div className="w-6 h-6 rounded-full bg-eco-blue border-2 border-white shadow-md" />
                </MarkerContent>
                <MarkerPopup>
                  <div className="p-1">
                    <strong>Destino</strong>
                    <br />
                    Local de entrega
                  </div>
                </MarkerPopup>
              </MapMarker>

              {/* Animated product marker */}
              {productPoint && (
                <MapMarker longitude={productPoint.lng} latitude={productPoint.lat}>
                  <MarkerContent>
                    <div className="w-8 h-8 rounded-full bg-eco-green border-2 border-white shadow-lg flex items-center justify-center animate-bounce">
                      <Package className="w-4 h-4 text-white" />
                    </div>
                  </MarkerContent>
                  <MarkerPopup>
                    <div className="p-1">
                      <strong>{productTitle}</strong>
                      <br />
                      {getStatusMessage()}
                    </div>
                  </MarkerPopup>
                </MapMarker>
              )}
            </Map>
          </div>
        ) : (
          <div className="h-80 w-full rounded-lg border bg-muted flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 mx-auto mb-4 text-eco-green" />
              <h3 className="font-medium mb-2">Retirada Local</h3>
              <p className="text-sm text-muted-foreground">
                Produto disponível para retirada no local do vendedor
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
