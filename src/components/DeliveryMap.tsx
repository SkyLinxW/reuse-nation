import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Coordinates, generateRoute } from '@/utils/distanceCalculator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Truck, MapPin, Package } from 'lucide-react';

// Fix default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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
  distance 
}: DeliveryMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const [currentPosition, setCurrentPosition] = useState<number>(0);
  const [route, setRoute] = useState<Coordinates[]>([]);
  const markersRef = useRef<L.Marker[]>([]);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const productMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize Leaflet map
    map.current = L.map(mapContainer.current).setView([origin.lat, origin.lng], 9);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map.current);

    // Create custom icons
    const originIcon = L.divIcon({
      html: '<div style="background-color: #22c55e; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>',
      className: 'custom-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    const destinationIcon = L.divIcon({
      html: '<div style="background-color: #3b82f6; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>',
      className: 'custom-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    // Add origin marker
    const originMarker = L.marker([origin.lat, origin.lng], { icon: originIcon })
      .bindPopup(`
        <div class="p-2">
          <strong>Origem</strong><br/>
          Local do vendedor
        </div>
      `)
      .addTo(map.current);

    // Add destination marker
    const destinationMarker = L.marker([destination.lat, destination.lng], { icon: destinationIcon })
      .bindPopup(`
        <div class="p-2">
          <strong>Destino</strong><br/>
          Local de entrega
        </div>
      `)
      .addTo(map.current);

    markersRef.current = [originMarker, destinationMarker];

    // Generate route for animation
    const routePoints = generateRoute(origin, destination, 100);
    setRoute(routePoints);

    // Add route polyline
    if (routePoints.length > 0) {
      const routeCoords: [number, number][] = routePoints.map(point => [point.lat, point.lng]);
      const routeLine = L.polyline(routeCoords, {
        color: '#22c55e',
        weight: 4,
        opacity: 0.6
      }).addTo(map.current);

      routeLayerRef.current = routeLine;
    }

    // Fit map to show both points
    const group = new L.FeatureGroup([originMarker, destinationMarker]);
    map.current.fitBounds(group.getBounds(), { padding: [20, 20] });

    return () => {
      if (map.current) {
        markersRef.current.forEach(marker => marker.remove());
        if (routeLayerRef.current) routeLayerRef.current.remove();
        if (productMarkerRef.current) productMarkerRef.current.remove();
        map.current.remove();
        map.current = null;
      }
    };
  }, [origin, destination]);

  // Animate product movement based on status
  useEffect(() => {
    if (!map.current || route.length === 0 || deliveryMethod === 'retirada_local') return;

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

    const targetPosition = Math.floor(progress * (route.length - 1));
    
    if (targetPosition !== currentPosition) {
      const animateToPosition = (start: number, end: number) => {
        const duration = 2000; // 2 seconds
        const startTime = Date.now();
        
        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
          
          const currentPos = Math.floor(start + (end - start) * easeProgress);
          setCurrentPosition(currentPos);
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };
        
        animate();
      };
      
      animateToPosition(currentPosition, targetPosition);
    }
  }, [status, route, currentPosition, deliveryMethod]);

  // Add/update product marker
  useEffect(() => {
    if (!map.current || route.length === 0 || deliveryMethod === 'retirada_local') return;

    // Remove previous product marker
    if (productMarkerRef.current) {
      productMarkerRef.current.remove();
    }

    if (currentPosition < route.length) {
      const currentPoint = route[currentPosition];
      
      // Create product marker icon with animation
      const productIcon = L.divIcon({
        html: `
          <div style="
            width: 32px;
            height: 32px;
            background: #22c55e;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            animation: bounce 2s infinite;
          ">
            <svg style="width: 16px; height: 16px; color: white;" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
            </svg>
          </div>
          <style>
            @keyframes bounce {
              0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
              40% { transform: translateY(-10px); }
              60% { transform: translateY(-5px); }
            }
          </style>
        `,
        className: 'product-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      productMarkerRef.current = L.marker([currentPoint.lat, currentPoint.lng], { icon: productIcon })
        .bindPopup(`
          <div class="p-2">
            <strong>${productTitle}</strong><br/>
            ${getStatusMessage()}
          </div>
        `)
        .addTo(map.current);
    }
  }, [currentPosition, route, productTitle]);

  const getStatusMessage = () => {
    switch (status) {
      case 'pendente':
        return 'Aguardando confirmação';
      case 'confirmado':
        return 'Preparando para envio';
      case 'em_transporte':
        return 'Em transporte';
      case 'entregue':
        return 'Produto entregue';
      default:
        return 'Status desconhecido';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmado':
        return 'bg-blue-100 text-blue-800';
      case 'em_transporte':
        return 'bg-purple-100 text-purple-800';
      case 'entregue':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDeliveryIcon = () => {
    switch (deliveryMethod) {
      case 'retirada_local':
        return <MapPin className="w-4 h-4" />;
      case 'entrega':
        return <Truck className="w-4 h-4" />;
      case 'transportadora':
        return <Package className="w-4 h-4" />;
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
          <Badge className={getStatusColor()}>
            {getStatusMessage()}
          </Badge>
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
        
        {deliveryMethod !== 'retirada_local' && (
          <div 
            ref={mapContainer} 
            className="h-80 w-full rounded-lg overflow-hidden border"
          />
        )}
        
        {deliveryMethod === 'retirada_local' && (
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