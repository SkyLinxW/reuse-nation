import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Coordinates, generateRoute } from '@/utils/distanceCalculator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Truck, MapPin, Package } from 'lucide-react';

// For demo purposes - in production, this should come from environment variables
const MAPBOX_TOKEN = 'pk.eyJ1IjoibG92YWJsZS1kZW1vIiwiYSI6ImNsdjN4d2RmMDBhd2sycnBiZ3duZ3VmNzIifQ.ZnOGriPPQ9wLljTxMUSnNw';

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
  const map = useRef<mapboxgl.Map | null>(null);
  const [currentPosition, setCurrentPosition] = useState<number>(0);
  const [route, setRoute] = useState<Coordinates[]>([]);

  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [origin.lng, origin.lat],
      zoom: 9,
    });

    // Add origin marker
    new mapboxgl.Marker({ color: '#22c55e' })
      .setLngLat([origin.lng, origin.lat])
      .setPopup(new mapboxgl.Popup().setHTML(`
        <div class="p-2">
          <strong>Origem</strong><br/>
          Local do vendedor
        </div>
      `))
      .addTo(map.current);

    // Add destination marker
    new mapboxgl.Marker({ color: '#3b82f6' })
      .setLngLat([destination.lng, destination.lat])
      .setPopup(new mapboxgl.Popup().setHTML(`
        <div class="p-2">
          <strong>Destino</strong><br/>
          Local de entrega
        </div>
      `))
      .addTo(map.current);

    // Generate route for animation
    const routePoints = generateRoute(origin, destination, 100);
    setRoute(routePoints);

    // Fit map to show both points
    const bounds = new mapboxgl.LngLatBounds();
    bounds.extend([origin.lng, origin.lat]);
    bounds.extend([destination.lng, destination.lat]);
    map.current.fitBounds(bounds, { padding: 50 });

    // Add route line
    map.current.on('load', () => {
      if (!map.current) return;

      map.current.addSource('route', {
        'type': 'geojson',
        'data': {
          'type': 'Feature',
          'properties': {},
          'geometry': {
            'type': 'LineString',
            'coordinates': routePoints.map(point => [point.lng, point.lat])
          }
        }
      });

      map.current.addLayer({
        'id': 'route',
        'type': 'line',
        'source': 'route',
        'layout': {
          'line-join': 'round',
          'line-cap': 'round'
        },
        'paint': {
          'line-color': '#22c55e',
          'line-width': 4,
          'line-opacity': 0.6
        }
      });
    });

    return () => {
      map.current?.remove();
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

    const existingMarker = document.querySelector('.product-marker');
    if (existingMarker) {
      existingMarker.remove();
    }

    if (currentPosition < route.length) {
      const currentPoint = route[currentPosition];
      
      const el = document.createElement('div');
      el.className = 'product-marker';
      el.innerHTML = `
        <div class="w-8 h-8 bg-eco-green rounded-full border-2 border-white shadow-lg flex items-center justify-center animate-pulse">
          <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
          </svg>
        </div>
      `;

      new mapboxgl.Marker(el)
        .setLngLat([currentPoint.lng, currentPoint.lat])
        .setPopup(new mapboxgl.Popup().setHTML(`
          <div class="p-2">
            <strong>${productTitle}</strong><br/>
            ${getStatusMessage()}
          </div>
        `))
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