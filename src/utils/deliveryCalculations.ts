// Real delivery calculations using address services
import { 
  calculateRealRoute, 
  SAO_PAULO_COORDINATES,
  Coordinates
} from '@/services/addressService';

export interface DeliveryCalculation {
  distance: number;
  estimatedTime: string;
  cost: number;
  steps: DeliveryStep[];
}

export interface DeliveryStep {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  status: 'pending' | 'active' | 'completed';
  icon: string;
}

// Coordinates interface is now imported from addressService

// Real delivery calculation using route APIs
export const calculateDeliveryDetails = async (
  origin: Coordinates,
  destination: Coordinates, 
  deliveryMethod: 'retirada_local' | 'entrega' | 'transportadora'
): Promise<DeliveryCalculation> => {
  console.log('calculateRealDeliveryDetails called with:', { origin, destination, deliveryMethod });
  
  // Use the provided origin coordinates (from product location)
  const actualOrigin = origin || SAO_PAULO_COORDINATES; // Fallback to São Paulo if no origin provided
  
  // Validate destination coordinates
  if (!destination || 
      typeof destination.lat !== 'number' || typeof destination.lng !== 'number') {
    console.error('Invalid destination coordinates:', destination);
    
    return {
      distance: 0,
      estimatedTime: 'Não calculado',
      cost: 0,
      steps: getDefaultSteps(deliveryMethod)
    };
  }

  let distance = 0;
  let estimatedTime = '';
  let cost = 0;
  let duration = 0; // in minutes
  
  if (deliveryMethod === 'retirada_local') {
    // For local pickup, calculate distance for reference only
    try {
      const routeInfo = await calculateRealRoute(actualOrigin, destination);
      if (routeInfo) {
        distance = routeInfo.distance;
      }
    } catch (error) {
      console.error('Error calculating route for pickup:', error);
    }
    
    estimatedTime = 'Disponível imediatamente';
    cost = 0;
  } else {
    // Calculate real route for delivery
    try {
      const routeInfo = await calculateRealRoute(actualOrigin, destination);
      
      if (routeInfo) {
        distance = routeInfo.distance;
        duration = routeInfo.duration; // Always in seconds
        
        console.log('Route calculated:', { distanceKm: distance, durationSeconds: duration });
        
        // Calculate time and cost based on delivery method
        if (deliveryMethod === 'entrega') {
          // Local delivery: travel time + 1h processing
          const travelHours = duration / 3600;
          const totalHours = Math.max(2, Math.ceil(travelHours + 1));
          
          if (totalHours >= 24) {
            const days = Math.ceil(totalHours / 24);
            estimatedTime = `${days} dia${days > 1 ? 's' : ''}`;
          } else {
            estimatedTime = `${totalHours} hora${totalHours > 1 ? 's' : ''}`;
          }
          
          // Pricing: R$8 base + R$1.50/km for first 20km, R$0.80/km after
          if (distance <= 20) {
            cost = 8 + distance * 1.50;
          } else {
            cost = 8 + 20 * 1.50 + (distance - 20) * 0.80;
          }
          cost = Math.min(cost, 150); // Cap at R$150
          
        } else if (deliveryMethod === 'transportadora') {
          // Shipping company: business days estimate
          const travelHours = duration / 3600;
          const drivingDays = Math.ceil(travelHours / 10); // 10h driving per day
          const totalDays = Math.max(2, drivingDays + 1); // +1 day processing
          estimatedTime = `${totalDays}-${totalDays + 2} dias úteis`;
          
          // Pricing: R$15 base + R$0.40/km, with weight tiers
          cost = 15 + distance * 0.40;
          cost = Math.min(cost, 200); // Cap at R$200
        }
      } else {
        throw new Error('Failed to calculate route');
      }
    } catch (error) {
      console.error('Error calculating real route, using fallback:', error);
      
      // Fallback using Haversine * 1.3 road factor
      const R = 6371;
      const dLat = (destination.lat - actualOrigin.lat) * Math.PI / 180;
      const dLng = (destination.lng - actualOrigin.lng) * Math.PI / 180;
      const a = Math.sin(dLat/2)**2 + Math.cos(actualOrigin.lat*Math.PI/180) * Math.cos(destination.lat*Math.PI/180) * Math.sin(dLng/2)**2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      distance = R * c * 1.3;
      
      if (deliveryMethod === 'entrega') {
        const hours = Math.max(2, Math.ceil(distance / 40) + 1);
        estimatedTime = hours >= 24 ? `${Math.ceil(hours/24)} dia(s)` : `${hours} hora${hours > 1 ? 's' : ''}`;
        cost = Math.min(8 + distance * (distance <= 20 ? 1.50 : 0.80), 150);
      } else {
        const days = Math.max(2, Math.ceil(distance / 400) + 1);
        estimatedTime = `${days}-${days + 2} dias úteis`;
        cost = Math.min(15 + distance * 0.40, 200);
      }
    }
  }

  console.log('Final real delivery details:', { distance, estimatedTime, cost, deliveryMethod });

  return {
    distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
    estimatedTime,
    cost: Math.round(cost * 100) / 100, // Round to 2 decimal places
    steps: getDefaultSteps(deliveryMethod)
  };
};

// Helper function to get default steps for each delivery method
const getDefaultSteps = (deliveryMethod: 'retirada_local' | 'entrega' | 'transportadora'): DeliveryStep[] => {
  switch (deliveryMethod) {
    case 'retirada_local':
      return [
        {
          id: 'preparation',
          title: 'Preparação do Produto',
          description: 'Vendedor separando e preparando seu produto',
          estimatedTime: '1-2 horas',
          status: 'pending',
          icon: 'package'
        },
        {
          id: 'ready',
          title: 'Pronto para Retirada',
          description: 'Produto disponível para retirada no local',
          estimatedTime: 'Imediata após preparo',
          status: 'pending',
          icon: 'check-circle'
        }
      ];

    case 'entrega':
      return [
        {
          id: 'preparation',
          title: 'Preparação do Produto',
          description: 'Vendedor preparando produto para coleta',
          estimatedTime: '1 hora',
          status: 'pending',
          icon: 'package'
        },
        {
          id: 'pickup',
          title: 'Coleta Realizada',
          description: 'Entregador coletou o produto',
          estimatedTime: '1.5h após confirmação',
          status: 'pending',
          icon: 'truck'
        },
        {
          id: 'in_transit',
          title: 'Em Transporte',
          description: 'Produto sendo entregue no seu endereço',
          estimatedTime: '1.5h após coleta',
          status: 'pending',
          icon: 'map-pin'
        },
        {
          id: 'delivered',
          title: 'Entregue',
          description: 'Produto entregue com sucesso!',
          estimatedTime: '3h após confirmação',
          status: 'pending',
          icon: 'check-circle'
        }
      ];

    case 'transportadora':
      return [
        {
          id: 'preparation',
          title: 'Preparação para Envio',
          description: 'Vendedor embalando e etiquetando produto',
          estimatedTime: '4-6 horas',
          status: 'pending',
          icon: 'package'
        },
        {
          id: 'collection',
          title: 'Coleta da Transportadora',
          description: 'Transportadora coletou o produto',
          estimatedTime: '8h após confirmação',
          status: 'pending',
          icon: 'truck'
        },
        {
          id: 'sorting',
          title: 'Centro de Distribuição',
          description: 'Produto sendo processado no centro de triagem',
          estimatedTime: '12-24h após coleta',
          status: 'pending',
          icon: 'building-2'
        },
        {
          id: 'in_transit',
          title: 'Em Transporte',
          description: 'Produto em rota para sua região',
          estimatedTime: '1-2 dias após triagem',
          status: 'pending',
          icon: 'map-pin'
        },
        {
          id: 'out_for_delivery',
          title: 'Saiu para Entrega',
          description: 'Produto no centro de distribuição local',
          estimatedTime: '48h após confirmação',
          status: 'pending',
          icon: 'truck'
        },
        {
          id: 'delivered',
          title: 'Entregue',
          description: 'Produto entregue em seu endereço!',
          estimatedTime: '2 dias úteis',
          status: 'pending',
          icon: 'check-circle'
        }
      ];

    default:
      return [];
  }
};

export const updateDeliveryStatus = (
  steps: DeliveryStep[],
  currentStatus: string
): DeliveryStep[] => {
  // Mapear status do banco para etapas específicas de cada método
  const statusMap: Record<string, string[]> = {
    'pendente': [],
    'confirmado': ['preparation'], // Após confirmação, preparação inicia
    'em_transporte': ['preparation', 'pickup', 'collection'], // Produto foi coletado
    'entregue': ['preparation', 'pickup', 'collection', 'sorting', 'in_transit', 'out_for_delivery', 'delivered', 'ready'] // Tudo completo
  };

  const completedSteps = statusMap[currentStatus] || [];
  
  return steps.map((step, index) => {
    if (completedSteps.includes(step.id)) {
      return { ...step, status: 'completed' };
    } else if (index === completedSteps.length && currentStatus !== 'entregue') {
      // Próxima etapa fica ativa
      return { ...step, status: 'active' };
    }
    return { ...step, status: 'pending' };
  });
};