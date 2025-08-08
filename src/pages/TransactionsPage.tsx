import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrackingCard } from '@/components/TrackingCard';
import { 
  getCurrentUser, 
  getUserTransactions, 
  getUserById, 
  getWasteItemById,
  saveTransaction
} from '@/lib/localStorage';
import { Transaction, User, WasteItem } from '@/types';
import { ArrowLeft, Package, TrendingUp, ShoppingBag, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'all' | 'purchases' | 'sales'>('all');
  
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

  const filteredTransactions = transactions.filter(transaction => {
    if (activeTab === 'purchases') return transaction.buyerId === currentUser?.id;
    if (activeTab === 'sales') return transaction.sellerId === currentUser?.id;
    return true;
  });

  const handleContactSeller = () => {
    toast({
      title: "Contato",
      description: "Funcionalidade de contato em desenvolvimento.",
    });
  };

  const handleRateTransaction = () => {
    toast({
      title: "Avaliação",
      description: "Sistema de avaliação em desenvolvimento.",
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
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Minhas Transações
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <ShoppingBag className="w-4 h-4" />
                {transactions.filter(t => t.buyerId === currentUser.id).length} Compras
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                {transactions.filter(t => t.sellerId === currentUser.id).length} Vendas
              </div>
            </div>
          </div>
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
              <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">Todas</TabsTrigger>
                  <TabsTrigger value="purchases">Compras</TabsTrigger>
                  <TabsTrigger value="sales">Vendas</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4 mt-6">
                  {filteredTransactions.map((transaction) => {
                    const details = transactionDetails[transaction.id];
                    if (!details?.otherUser || !details?.product) return null;

                    return (
                      <TrackingCard
                        key={transaction.id}
                        transaction={transaction}
                        otherUser={details.otherUser}
                        product={details.product}
                        onContactSeller={handleContactSeller}
                        onRateTransaction={handleRateTransaction}
                      />
                    );
                  })}
                </TabsContent>

                <TabsContent value="purchases" className="space-y-4 mt-6">
                  {filteredTransactions.map((transaction) => {
                    const details = transactionDetails[transaction.id];
                    if (!details?.otherUser || !details?.product) return null;

                    return (
                      <TrackingCard
                        key={transaction.id}
                        transaction={transaction}
                        otherUser={details.otherUser}
                        product={details.product}
                        onContactSeller={handleContactSeller}
                        onRateTransaction={handleRateTransaction}
                      />
                    );
                  })}
                </TabsContent>

                <TabsContent value="sales" className="space-y-4 mt-6">
                  {filteredTransactions.map((transaction) => {
                    const details = transactionDetails[transaction.id];
                    if (!details?.otherUser || !details?.product) return null;

                    return (
                      <div key={transaction.id} className="border-l-4 border-l-eco-brown p-4 bg-card rounded-lg">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-medium">Venda para {details.otherUser.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {new Date(transaction.createdAt).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          {!['entregue', 'cancelado'].includes(transaction.status) && (
                            <div className="flex gap-2">
                              {transaction.status === 'pendente' && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => handleUpdateStatus(transaction.id, 'confirmado')}
                                    className="bg-eco-green hover:bg-eco-green/90"
                                  >
                                    Confirmar
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleUpdateStatus(transaction.id, 'cancelado')}
                                  >
                                    Cancelar
                                  </Button>
                                </>
                              )}
                              {transaction.status === 'confirmado' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateStatus(transaction.id, 'em_transporte')}
                                  className="bg-eco-green hover:bg-eco-green/90"
                                >
                                  Enviar
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium">{details.product.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {transaction.quantity} {details.product.quantity.unit}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-eco-green">
                              R$ {transaction.totalPrice.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};