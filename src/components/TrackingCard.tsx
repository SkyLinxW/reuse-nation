import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Package, Truck, CheckCircle, Clock, MapPin, Phone, MessageCircle } from 'lucide-react';
import { Transaction, User, WasteItem } from '@/types';

interface TrackingCardProps {
  transaction: Transaction;
  otherUser: User;
  product: WasteItem;
  onContactSeller?: () => void;
  onRateTransaction?: () => void;
}

export const TrackingCard = ({ 
  transaction, 
  otherUser, 
  product, 
  onContactSeller,
  onRateTransaction 
}: TrackingCardProps) => {
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

  const getEstimatedDelivery = () => {
    const now = new Date();
    let estimatedDays = 0;
    
    switch (transaction.deliveryMethod) {
      case 'retirada_local':
        estimatedDays = 0;
        break;
      case 'entrega':
        estimatedDays = 1;
        break;
      case 'transportadora':
        estimatedDays = 5;
        break;
    }
    
    const estimatedDate = new Date(now.getTime() + estimatedDays * 24 * 60 * 60 * 1000);
    return estimatedDate.toLocaleDateString('pt-BR');
  };

  const trackingSteps = [
    { 
      key: 'pendente',
      label: 'Pedido Realizado',
      description: 'Seu pedido foi recebido',
      icon: Package,
      completed: ['confirmado', 'em_transporte', 'entregue'].includes(transaction.status)
    },
    {
      key: 'confirmado',
      label: 'Pedido Confirmado',
      description: 'Vendedor confirmou o pedido',
      icon: CheckCircle,
      completed: ['em_transporte', 'entregue'].includes(transaction.status)
    },
    {
      key: 'em_transporte',
      label: 'Em Transporte',
      description: 'Produto a caminho',
      icon: Truck,
      completed: transaction.status === 'entregue'
    },
    {
      key: 'entregue',
      label: 'Entregue',
      description: 'Produto entregue com sucesso',
      icon: CheckCircle,
      completed: transaction.status === 'entregue'
    }
  ];

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
              {transaction.quantity} {product.quantity.unit}
            </p>
            <p className="text-lg font-bold text-eco-green">
              {formatPrice(transaction.totalPrice)}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        {transaction.status !== 'cancelado' && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso do Pedido</span>
              <span>{getStatusProgress()}%</span>
            </div>
            <Progress value={getStatusProgress()} className="h-2" />
          </div>
        )}

        {/* Tracking Timeline */}
        <div className="space-y-4">
          <h4 className="font-medium">Acompanhar Pedido</h4>
          <div className="space-y-3">
            {trackingSteps.map((step, index) => {
              const StepIcon = step.icon;
              const isCurrentStep = step.key === transaction.status;
              const isCompleted = step.completed;
              
              return (
                <div key={step.key} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isCompleted ? 'bg-eco-green text-white' : 
                    isCurrentStep ? 'bg-eco-blue text-white' : 
                    'bg-muted text-muted-foreground'
                  }`}>
                    <StepIcon className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1">
                    <p className={`font-medium ${
                      isCompleted || isCurrentStep ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {step.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                  
                  {isCurrentStep && (
                    <Clock className="w-4 h-4 text-eco-blue" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Delivery Info */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-card border rounded-lg">
          <div>
            <p className="text-sm font-medium">Método de Entrega</p>
            <p className="text-sm text-muted-foreground">{getDeliveryMethodLabel()}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Previsão</p>
            <p className="text-sm text-muted-foreground">
              {transaction.deliveryMethod === 'retirada_local' ? 'Disponível' : getEstimatedDelivery()}
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
                <span>{otherUser.address.city}, {otherUser.address.state}</span>
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
          <Button variant="outline" className="w-full">
            Rastrear Envio
          </Button>
        )}
      </CardContent>
    </Card>
  );
};