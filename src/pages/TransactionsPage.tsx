import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EnhancedTrackingCard } from '@/components/EnhancedTrackingCard';
import { getTransactions, updateTransactionStatus, getProfile, getWasteItem } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Package, TrendingUp, ShoppingBag, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TransactionsPageProps {
  onNavigate: (page: string) => void;
}

export const TransactionsPage = ({ onNavigate }: TransactionsPageProps) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [transactionDetails, setTransactionDetails] = useState<{
    [key: string]: {
      otherUser: any | null;
      product: any | null;
    }
  }>({});
  const [activeTab, setActiveTab] = useState<'all' | 'purchases' | 'sales'>('all');
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const loadTransactions = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const userTransactions = await getTransactions(user.id);
        setTransactions(userTransactions);

        // Carregar detalhes das transações
        const details: typeof transactionDetails = {};
        
        for (const transaction of userTransactions) {
          const otherUserId = transaction.buyer_id === user.id 
            ? transaction.seller_id 
            : transaction.buyer_id;
          
          const [otherUser, product] = await Promise.all([
            getProfile(otherUserId),
            getWasteItem(transaction.waste_item_id)
          ]);
          
          details[transaction.id] = {
            otherUser,
            product
          };
        }
        
        setTransactionDetails(details);
      } catch (error) {
        console.error('Erro ao carregar transações:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar transações.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, [user, toast]);

  const getStatusInfo = (status: string) => {
    const statusMap: any = {
      pendente: { label: 'Pendente', icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
      confirmado: { label: 'Confirmado', icon: CheckCircle, color: 'bg-blue-100 text-blue-800' },
      em_transporte: { label: 'Em Transporte', icon: Truck, color: 'bg-purple-100 text-purple-800' },
      entregue: { label: 'Entregue', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
      cancelado: { label: 'Cancelado', icon: XCircle, color: 'bg-red-100 text-red-800' }
    };
    return statusMap[status] || statusMap.pendente;
  };

  const getPaymentMethodLabel = (method: string) => {
    const methods: any = {
      pix: 'PIX',
      boleto: 'Boleto',
      cartao: 'Cartão',
      dinheiro: 'Dinheiro'
    };
    return methods[method] || method;
  };

  const getDeliveryMethodLabel = (method: string) => {
    const methods: any = {
      retirada_local: 'Retirada Local',
      entrega: 'Entrega',
      transportadora: 'Transportadora'
    };
    return methods[method] || method;
  };

  const handleUpdateStatus = async (transactionId: string, newStatus: string) => {
    try {
      console.log('Attempting to update transaction status:', { transactionId, newStatus });
      
      await updateTransactionStatus(transactionId, newStatus);
      
      setTransactions(prev => 
        prev.map(t => t.id === transactionId ? { ...t, status: newStatus } : t)
      );

      toast({
        title: "Status atualizado",
        description: `Transação marcada como ${getStatusInfo(newStatus).label.toLowerCase()}.`,
      });
    } catch (error: any) {
      console.error('Error updating transaction status:', error);
      toast({
        title: "Erro",
        description: `Erro ao atualizar status da transação: ${error.message || 'Erro desconhecido'}`,
        variant: "destructive",
      });
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (activeTab === 'purchases') return transaction.buyer_id === user?.id;
    if (activeTab === 'sales') return transaction.seller_id === user?.id;
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

  if (!user) {
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
                {transactions.filter(t => t.buyer_id === user?.id).length} Compras
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                {transactions.filter(t => t.seller_id === user?.id).length} Vendas
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Carregando transações...</p>
            </div>
          ) : transactions.length === 0 ? (
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

                    // Convert database transaction to expected format
                    const formattedTransaction = {
                      ...transaction,
                      deliveryMethod: transaction.delivery_method || 'retirada_local',
                      deliveryAddress: transaction.delivery_address,
                      createdAt: transaction.created_at,
                      totalPrice: transaction.total_price
                    };

                    return (
                      <EnhancedTrackingCard
                        key={transaction.id}
                        transaction={formattedTransaction}
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

                    // Convert database transaction to expected format
                    const formattedTransaction = {
                      ...transaction,
                      deliveryMethod: transaction.delivery_method || 'retirada_local',
                      deliveryAddress: transaction.delivery_address,
                      createdAt: transaction.created_at,
                      totalPrice: transaction.total_price
                    };

                    return (
                      <EnhancedTrackingCard
                        key={transaction.id}
                        transaction={formattedTransaction}
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
                              {new Date(transaction.created_at).toLocaleDateString('pt-BR')}
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
                              {transaction.quantity} {JSON.parse(details.product.quantity || '{}').unit || 'unidades'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-eco-green">
                              R$ {Number(transaction.total_price).toFixed(2)}
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