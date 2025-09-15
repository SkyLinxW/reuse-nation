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
  destination: Coordinates, 
  deliveryMethod: 'retirada_local' | 'entrega' | 'transportadora'
): Promise<DeliveryCalculation> => {
  console.log('calculateRealDeliveryDetails called with:', { destination, deliveryMethod });
  
  // Always use São Paulo as origin
  const origin = SAO_PAULO_COORDINATES;
  
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
      const routeInfo = await calculateRealRoute(origin, destination);
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
      const routeInfo = await calculateRealRoute(origin, destination);
      
      if (routeInfo) {
        distance = routeInfo.distance;
        duration = routeInfo.duration;
        
        console.log('Real route calculated:', { distance, duration });
        
        // Calculate time and cost based on delivery method
        if (deliveryMethod === 'entrega') {
          // Local delivery service - use real duration + processing time
          const totalHours = Math.max(2, Math.ceil(duration / 60) + 1); // Add 1 hour processing
          estimatedTime = `${totalHours} hora${totalHours > 1 ? 's' : ''}`;
          cost = Math.max(15, distance * 0.8); // Minimum R$ 15, then R$ 0.80 per km
        } else if (deliveryMethod === 'transportadora') {
          // Shipping company - convert to days
          const totalDays = Math.max(1, Math.ceil(duration / (60 * 8))); // 8 hours driving per day
          estimatedTime = `${totalDays} dia${totalDays > 1 ? 's' : ''}`;
          cost = Math.max(25, distance * 0.5); // Minimum R$ 25, then R$ 0.50 per km
        }
      } else {
        throw new Error('Failed to calculate route');
      }
    } catch (error) {
      console.error('Error calculating real route, using fallback:', error);
      
      // Fallback to simple calculation
      distance = Math.sqrt(
        Math.pow(destination.lat - origin.lat, 2) + 
        Math.pow(destination.lng - origin.lng, 2)
      ) * 111; // Rough km conversion
      
      if (deliveryMethod === 'entrega') {
        const hours = Math.max(2, Math.floor(distance / 50)); // 50 km/h average
        estimatedTime = `${hours} hora${hours > 1 ? 's' : ''}`;
        cost = Math.max(15, distance * 0.8);
      } else {
        const days = Math.max(1, Math.ceil(distance / 400)); // 400 km per day
        estimatedTime = `${days} dia${days > 1 ? 's' : ''}`;
        cost = Math.max(25, distance * 0.5);
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
          description: 'Produto sendo preparado para retirada',
          estimatedTime: '1-2 horas',
          status: 'pending',
          icon: 'package'
        },
        {
          id: 'ready',
          title: 'Pronto para Retirada',
          description: 'Produto disponível no local do vendedor',
          estimatedTime: 'Imediato',
          status: 'pending',
          icon: 'check-circle'
        }
      ];

    case 'entrega':
      return [
        {
          id: 'preparation',
          title: 'Preparação do Produto',
          description: 'Produto sendo preparado para envio',
          estimatedTime: '1-2 horas',
          status: 'pending',
          icon: 'package'
        },
        {
          id: 'pickup',
          title: 'Coleta Realizada',
          description: 'Entregador coletou o produto',
          estimatedTime: '2-4 horas',
          status: 'pending',
          icon: 'truck'
        },
        {
          id: 'in_transit',
          title: 'Em Transporte',
          description: 'Produto a caminho do destino',
          estimatedTime: 'Calculando...',
          status: 'pending',
          icon: 'map-pin'
        },
        {
          id: 'delivered',
          title: 'Entregue',
          description: 'Produto entregue no destino',
          estimatedTime: 'Concluído',
          status: 'pending',
          icon: 'check-circle'
        }
      ];

    case 'transportadora':
      return [
        {
          id: 'preparation',
          title: 'Preparação para Envio',
          description: 'Produto sendo embalado e etiquetado',
          estimatedTime: '4-8 horas',
          status: 'pending',
          icon: 'package'
        },
        {
          id: 'collection',
          title: 'Coleta da Transportadora',
          description: 'Transportadora coletou o produto',
          estimatedTime: '8-24 horas',
          status: 'pending',
          icon: 'truck'
        },
        {
          id: 'sorting',
          title: 'Centro de Distribuição',
          description: 'Produto em centro de triagem',
          estimatedTime: '1-2 dias',
          status: 'pending',
          icon: 'building-2'
        },
        {
          id: 'in_transit',
          title: 'Em Transporte',
          description: 'Produto a caminho do destino final',
          estimatedTime: 'Calculando...',
          status: 'pending',
          icon: 'map-pin'
        },
        {
          id: 'out_for_delivery',
          title: 'Saiu para Entrega',
          description: 'Produto saiu para entrega final',
          estimatedTime: '4-8 horas',
          status: 'pending',
          icon: 'truck'
        },
        {
          id: 'delivered',
          title: 'Entregue',
          description: 'Produto entregue no destino',
          estimatedTime: 'Concluído',
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
  const statusMap: Record<string, string[]> = {
    'pendente': [],
    'confirmado': ['preparation'],
    'em_transporte': ['preparation', 'pickup', 'collection'],
    'entregue': ['preparation', 'pickup', 'collection', 'sorting', 'in_transit', 'out_for_delivery', 'delivered']
  };

  const completedSteps = statusMap[currentStatus] || [];
  
  return steps.map((step, index) => {
    if (completedSteps.includes(step.id)) {
      return { ...step, status: 'completed' };
    } else if (index === completedSteps.length && currentStatus !== 'entregue') {
      return { ...step, status: 'active' };
    }
    return { ...step, status: 'pending' };
  });
};