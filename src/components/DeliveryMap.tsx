import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Map,
  MapMarker,
  MarkerContent,
  MarkerPopup,
  MarkerTooltip,
  MapRoute,
  MapControls,
} from '@/components/ui/map';
import type { MapRef } from '@/components/ui/map';
import { Coordinates } from '@/utils/distanceCalculator';
import { calculateRealRoute, calculateFallbackRoute, RouteInfo } from '@/services/routingService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Truck, MapPin, Package, Navigation, Clock, Route as RouteIcon } from 'lucide-react';

interface DeliveryMapProps {
  origin: Coordinates;
  destination: Coordinates;
  status: 'pendente' | 'confirmado' | 'em_transporte' | 'entregue' | 'cancelado';
  deliveryMethod: 'retirada_local' | 'entrega' | 'transportadora';
  productTitle: string;
  estimatedTime: string;
  distance: number;
}

// Bearing in degrees from point A to point B
function bearing(a: Coordinates, b: Coordinates): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;
  const φ1 = toRad(a.lat);
  const φ2 = toRad(b.lat);
  const Δλ = toRad(b.lng - a.lng);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
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
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [progressIndex, setProgressIndex] = useState(0);

  // Fetch real road route — single source of truth
  useEffect(() => {
    if (!origin || !destination || deliveryMethod === 'retirada_local') {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    (async () => {
      const real = await calculateRealRoute(origin, destination);
      if (cancelled) return;
      setRouteInfo(real ?? calculateFallbackRoute(origin, destination, 60));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [origin, destination, deliveryMethod]);

  const route = routeInfo?.coordinates ?? [];
  const routeCoords = useMemo<[number, number][]>(
    () => route.map((p) => [p.lng, p.lat]),
    [route],
  );

  // Smooth fit bounds over the ACTUAL route (not just endpoints)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || routeCoords.length < 2) return;
    let minLng = Infinity,
      minLat = Infinity,
      maxLng = -Infinity,
      maxLat = -Infinity;
    for (const [lng, lat] of routeCoords) {
      if (lng < minLng) minLng = lng;
      if (lat < minLat) minLat = lat;
      if (lng > maxLng) maxLng = lng;
      if (lat > maxLat) maxLat = lat;
    }
    try {
      map.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat],
        ],
        { padding: 80, duration: 800, maxZoom: 14 },
      );
    } catch (err) {
      console.error('fitBounds error', err);
    }
  }, [routeCoords]);

  // Animate the product marker along the real route
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
    const start = progressIndex;
    if (target === start) return;

    const duration = 1500;
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setProgressIndex(Math.floor(start + (target - start) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, route.length, deliveryMethod]);

  const productPoint = route[Math.min(progressIndex, route.length - 1)];
  const nextPoint = route[Math.min(progressIndex + 1, route.length - 1)];
  const truckBearing = productPoint && nextPoint ? bearing(productPoint, nextPoint) : 0;

  // Travelled portion (solid) and remaining portion (dashed)
  const travelledCoords = useMemo<[number, number][]>(
    () => routeCoords.slice(0, Math.max(progressIndex + 1, 2)),
    [routeCoords, progressIndex],
  );
  const remainingCoords = useMemo<[number, number][]>(
    () => routeCoords.slice(Math.max(progressIndex, 0)),
    [routeCoords, progressIndex],
  );

  const realDistance = routeInfo?.distance ?? distance;
  const realDuration = routeInfo
    ? `${Math.round(routeInfo.duration / 60)} min`
    : estimatedTime;

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
      case 'pendente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmado': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'em_transporte': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'entregue': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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
    <Card className="w-full overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-base">
            {getDeliveryIcon()}
            Rastreamento da Entrega
          </CardTitle>
          <Badge variant="outline" className={getStatusColor()}>
            {getStatusMessage()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
            <RouteIcon className="w-4 h-4 text-eco-green shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground leading-none">Distância real</p>
              <p className="text-sm font-semibold truncate">{realDistance.toFixed(1)} km</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
            <Clock className="w-4 h-4 text-eco-blue shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground leading-none">Tempo estimado</p>
              <p className="text-sm font-semibold truncate">{realDuration}</p>
            </div>
          </div>
        </div>

        {deliveryMethod !== 'retirada_local' ? (
          <div className="h-80 w-full rounded-lg overflow-hidden border relative">
            <Map
              ref={mapRef}
              loading={loading}
              viewport={{
                center: [origin.lng, origin.lat],
                zoom: 8,
              }}
              onViewportChange={() => {}}
            >
              <MapControls showCompass showFullscreen showLocate={false} />

              {/* Remaining route — dashed, subtle */}
              {remainingCoords.length >= 2 && (
                <MapRoute
                  id="remaining"
                  coordinates={remainingCoords}
                  color="#94a3b8"
                  width={4}
                  opacity={0.6}
                  dashArray={[2, 2]}
                  interactive={false}
                />
              )}

              {/* Travelled route — solid eco green */}
              {travelledCoords.length >= 2 && (
                <MapRoute
                  id="travelled"
                  coordinates={travelledCoords}
                  color="hsl(142 71% 45%)"
                  width={5}
                  opacity={0.95}
                  interactive={false}
                />
              )}

              {/* Origin */}
              <MapMarker longitude={origin.lng} latitude={origin.lat}>
                <MarkerContent>
                  <div className="relative flex items-center justify-center">
                    <div className="absolute w-8 h-8 rounded-full bg-eco-green/30 animate-ping" />
                    <div className="relative w-7 h-7 rounded-full bg-eco-green border-[3px] border-white shadow-lg flex items-center justify-center">
                      <MapPin className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>
                </MarkerContent>
                <MarkerTooltip>Origem · Vendedor</MarkerTooltip>
                <MarkerPopup>
                  <div className="p-1 text-xs">
                    <p className="font-semibold">Origem</p>
                    <p className="text-muted-foreground">Local do vendedor</p>
                  </div>
                </MarkerPopup>
              </MapMarker>

              {/* Destination */}
              <MapMarker longitude={destination.lng} latitude={destination.lat}>
                <MarkerContent>
                  <div className="relative flex items-center justify-center">
                    <div className="w-7 h-7 rounded-full bg-eco-blue border-[3px] border-white shadow-lg flex items-center justify-center">
                      <Navigation className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>
                </MarkerContent>
                <MarkerTooltip>Destino · Entrega</MarkerTooltip>
                <MarkerPopup>
                  <div className="p-1 text-xs">
                    <p className="font-semibold">Destino</p>
                    <p className="text-muted-foreground">Local de entrega</p>
                  </div>
                </MarkerPopup>
              </MapMarker>

              {/* Animated product marker — rotated to bearing */}
              {productPoint && status !== 'pendente' && (
                <MapMarker
                  longitude={productPoint.lng}
                  latitude={productPoint.lat}
                  rotation={truckBearing - 90}
                  rotationAlignment="map"
                >
                  <MarkerContent>
                    <div className="relative flex items-center justify-center">
                      <div className="absolute w-10 h-10 rounded-full bg-eco-green/40 animate-ping" />
                      <div className="relative w-9 h-9 rounded-full bg-gradient-eco border-[3px] border-white shadow-xl flex items-center justify-center">
                        <Truck className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </MarkerContent>
                  <MarkerTooltip>{productTitle}</MarkerTooltip>
                  <MarkerPopup>
                    <div className="p-1 text-xs">
                      <p className="font-semibold">{productTitle}</p>
                      <p className="text-muted-foreground">{getStatusMessage()}</p>
                    </div>
                  </MarkerPopup>
                </MapMarker>
              )}
            </Map>
          </div>
        ) : (
          <div className="h-80 w-full rounded-lg border bg-muted flex items-center justify-center">
            <div className="text-center px-4">
              <MapPin className="w-12 h-12 mx-auto mb-3 text-eco-green" />
              <h3 className="font-medium mb-1">Retirada Local</h3>
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
