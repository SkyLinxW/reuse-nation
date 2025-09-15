// Utility functions for delivery calculations
import { calculateDistance } from './distanceCalculator';

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

export interface Coordinates {
  lat: number;
  lng: number;
}

export const calculateDeliveryDetails = (
  origin: Coordinates,
  destination: Coordinates,
  deliveryMethod: 'retirada_local' | 'entrega' | 'transportadora'
): DeliveryCalculation => {
  const distance = calculateDistance(origin, destination);
  
  let baseCost = 0;
  let baseTimeHours = 0;
  let steps: DeliveryStep[] = [];

  switch (deliveryMethod) {
    case 'retirada_local':
      baseCost = 0;
      baseTimeHours = 0;
      steps = [
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
      break;

    case 'entrega':
      baseCost = 15 + (distance * 0.8);
      baseTimeHours = Math.max(2, distance / 25); // 25 km/h average speed
      steps = [
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
          estimatedTime: `${Math.ceil(baseTimeHours)}h`,
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
      break;

    case 'transportadora':
      baseCost = 25 + (distance * 0.5);
      baseTimeHours = Math.max(24, distance / 15); // 15 km/h average for transport companies
      steps = [
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
          estimatedTime: `${Math.ceil(baseTimeHours / 24)} dias`,
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
      break;
  }

  const estimatedTime = deliveryMethod === 'retirada_local' 
    ? 'Disponível imediatamente'
    : baseTimeHours < 24 
      ? `${Math.ceil(baseTimeHours)} horas`
      : `${Math.ceil(baseTimeHours / 24)} dias`;

  return {
    distance: Math.round(distance * 100) / 100,
    estimatedTime,
    cost: Math.round(baseCost * 100) / 100,
    steps
  };
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