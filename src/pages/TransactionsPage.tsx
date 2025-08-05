import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  getCurrentUser, 
  getUserTransactions, 
  getUserById, 
  getWasteItemById,
  saveTransaction
} from '@/lib/localStorage';
import { Transaction, User, WasteItem } from '@/types';
import { ArrowLeft, Package, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TransactionsPageProps {
  onNavigate: (page: string) => void;
}

export const TransactionsPage = ({ onNavigate }: TransactionsPageProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionDetails, setTransactionDetails] = useState<{
    [key: string]: {
      otherUser: User | null;
      product: WasteItem | null;
    }
  }>({});
  
  const currentUser = getCurrentUser();
  const { toast } = useToast();

  useEffect(() => {
    if (currentUser) {
      const userTransactions = getUserTransactions(currentUser.id);
      setTransactions(userTransactions);

      // Carregar detalhes das transações
      const details: typeof transactionDetails = {};
      userTransactions.forEach(transaction => {
        const otherUserId = transaction.buyerId === currentUser.id 
          ? transaction.sellerId 
          : transaction.buyerId;
        
        details[transaction.id] = {
          otherUser: getUserById(otherUserId),
          product: getWasteItemById(transaction.wasteItemId)
        };
      });
      setTransactionDetails(details);
    }
  }, [currentUser]);

  const getStatusInfo = (status: Transaction['status']) => {
    const statusMap = {
      pendente: { label: 'Pendente', icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
      confirmado: { label: 'Confirmado', icon: CheckCircle, color: 'bg-blue-100 text-blue-800' },
      em_transporte: { label: 'Em Transporte', icon: Truck, color: 'bg-purple-100 text-purple-800' },
      entregue: { label: 'Entregue', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
      cancelado: { label: 'Cancelado', icon: XCircle, color: 'bg-red-100 text-red-800' }
    };
    return statusMap[status];
  };

  const getPaymentMethodLabel = (method: Transaction['paymentMethod']) => {
    const methods = {
      pix: 'PIX',
      boleto: 'Boleto',
      cartao: 'Cartão',
      dinheiro: 'Dinheiro'
    };
    return methods[method];
  };

  const getDeliveryMethodLabel = (method: Transaction['deliveryMethod']) => {
    const methods = {
      retirada_local: 'Retirada Local',
      entrega: 'Entrega',
      transportadora: 'Transportadora'
    };
    return methods[method];
  };

  const handleUpdateStatus = (transactionId: string, newStatus: Transaction['status']) => {
    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction) return;

    const updatedTransaction = { ...transaction, status: newStatus };
    if (newStatus === 'entregue') {
      updatedTransaction.completedAt = new Date().toISOString();
    }

    saveTransaction(updatedTransaction);
    setTransactions(prev => 
      prev.map(t => t.id === transactionId ? updatedTransaction : t)
    );

    toast({
      title: "Status atualizado",
      description: `Transação marcada como ${getStatusInfo(newStatus).label.toLowerCase()}.`,
    });
  };

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Você precisa estar logado para ver suas transações.
            </p>
            <Button onClick={() => onNavigate('login')}>
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => onNavigate('home')}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Minhas Transações
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                Você ainda não tem nenhuma transação.
              </p>
              <Button onClick={() => onNavigate('home')}>
                Explorar Produtos
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {transactions.map((transaction) => {
                const details = transactionDetails[transaction.id];
                const isBuyer = transaction.buyerId === currentUser.id;
                const statusInfo = getStatusInfo(transaction.status);
                const StatusIcon = statusInfo.icon;

                if (!details?.otherUser || !details?.product) return null;

                return (
                  <Card key={transaction.id} className="border-l-4 border-l-eco-green">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src="" alt={details.otherUser.name} />
                            <AvatarFallback>
                              {details.otherUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {isBuyer ? 'Compra de' : 'Venda para'} {details.otherUser.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(transaction.createdAt).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        
                        <Badge className={statusInfo.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                      </div>

                      <Separator className="mb-4" />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="font-medium mb-2">Produto</h4>
                          <p className="text-sm">{details.product.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {transaction.quantity} {details.product.quantity.unit}
                          </p>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Valor Total</h4>
                          <p className="text-lg font-bold text-eco-green">
                            R$ {transaction.totalPrice.toFixed(2)}
                          </p>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Pagamento</h4>
                          <p className="text-sm">{getPaymentMethodLabel(transaction.paymentMethod)}</p>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Entrega</h4>
                          <p className="text-sm">{getDeliveryMethodLabel(transaction.deliveryMethod)}</p>
                        </div>
                      </div>

                      {/* Ações baseadas no status e tipo de usuário */}
                      {!isBuyer && transaction.status === 'pendente' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleUpdateStatus(transaction.id, 'confirmado')}
                            className="bg-eco-green hover:bg-eco-green/90"
                          >
                            Confirmar Pedido
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateStatus(transaction.id, 'cancelado')}
                          >
                            Cancelar
                          </Button>
                        </div>
                      )}

                      {!isBuyer && transaction.status === 'confirmado' && (
                        <Button
                          size="sm"
                          onClick={() => handleUpdateStatus(transaction.id, 'em_transporte')}
                          className="bg-eco-green hover:bg-eco-green/90"
                        >
                          Marcar como Em Transporte
                        </Button>
                      )}

                      {isBuyer && transaction.status === 'em_transporte' && (
                        <Button
                          size="sm"
                          onClick={() => handleUpdateStatus(transaction.id, 'entregue')}
                          className="bg-eco-green hover:bg-eco-green/90"
                        >
                          Confirmar Recebimento
                        </Button>
                      )}

                      {transaction.completedAt && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Concluída em {new Date(transaction.completedAt).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};