import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { EnhancedTrackingCard } from '@/components/EnhancedTrackingCard';
import { getTransactions, updateTransactionStatus, getProfile, getOrCreateConversation, createReview, createNotification } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Package, TrendingUp, ShoppingBag, Clock, CheckCircle, Truck, XCircle, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TransactionsPageProps {
  onNavigate: (page: string) => void;
}

/** Maps a raw DB transaction + joined waste_items row into the shape
 *  that EnhancedTrackingCard expects. */
const formatTransaction = (t: any) => ({
  ...t,
  buyerId: t.buyer_id,
  sellerId: t.seller_id,
  wasteItemId: t.waste_item_id,
  totalPrice: t.total_price,
  paymentMethod: t.payment_method,
  deliveryMethod: t.delivery_method || 'retirada_local',
  deliveryAddress: t.delivery_address,
  createdAt: t.created_at,
  completedAt: t.completed_at,
});

/** Normalises the joined waste_items row coming from getTransactions. */
const normaliseProduct = (wi: any) => ({
  ...wi,
  // location comes from DB as a plain string; keep as-is for EnhancedTrackingCard
  location: wi.location,
  quantity: wi.quantity,
});

export const TransactionsPage = ({ onNavigate }: TransactionsPageProps) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [otherUsers, setOtherUsers] = useState<{ [key: string]: any }>({});
  const [activeTab, setActiveTab] = useState<'all' | 'purchases' | 'sales'>('all');
  const [loading, setLoading] = useState(true);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewTransaction, setReviewTransaction] = useState<any>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const loadTransactions = async () => {
      if (!user) { setLoading(false); return; }

      try {
        // getTransactions already joins waste_items(*) so no extra fetch needed
        const userTransactions = await getTransactions(user.id);
        setTransactions(userTransactions);

        // Load other-user profiles (deduplicated)
        const otherUserIds = new Set<string>();
        for (const t of userTransactions) {
          const otherId = t.buyer_id === user.id ? t.seller_id : t.buyer_id;
          otherUserIds.add(otherId);
        }

        const profiles: { [id: string]: any } = {};
        await Promise.all(
          Array.from(otherUserIds).map(async (uid) => {
            try {
              profiles[uid] = await getProfile(uid);
            } catch { profiles[uid] = null; }
          })
        );
        setOtherUsers(profiles);
      } catch (error) {
        console.error('Erro ao carregar transações:', error);
        toast({ title: "Erro", description: "Erro ao carregar transações.", variant: "destructive" });
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
      cancelado: { label: 'Cancelado', icon: XCircle, color: 'bg-red-100 text-red-800' },
    };
    return statusMap[status] || statusMap.pendente;
  };

  const handleUpdateStatus = async (transactionId: string, newStatus: string) => {
    try {
      await updateTransactionStatus(transactionId, newStatus);

      const transaction = transactions.find(t => t.id === transactionId);

      setTransactions(prev =>
        prev.map(t => (t.id === transactionId ? { ...t, status: newStatus } : t))
      );

      if (transaction) {
        const statusLabels: Record<string, string> = {
          confirmado: 'confirmado pelo vendedor',
          em_transporte: 'enviado e está em transporte',
          entregue: 'marcado como entregue',
          cancelado: 'cancelado pelo vendedor',
        };

        await createNotification({
          user_id: transaction.buyer_id,
          type: `order_${newStatus}`,
          title: `Pedido ${getStatusInfo(newStatus).label}`,
          message: `Seu pedido foi ${statusLabels[newStatus] || newStatus}. Verifique suas transações para mais detalhes.`,
          read: false,
        });
      }

      toast({
        title: "Status atualizado",
        description: `Transação marcada como ${getStatusInfo(newStatus).label.toLowerCase()}.`,
      });
    } catch (error: any) {
      console.error('Error updating transaction status:', error);
      toast({
        title: "Erro",
        description: `Erro ao atualizar status: ${error.message || 'Erro desconhecido'}`,
        variant: "destructive",
      });
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (activeTab === 'purchases') return transaction.buyer_id === user?.id;
    if (activeTab === 'sales') return transaction.seller_id === user?.id;
    return true;
  });

  const handleContactSeller = async (otherUserId: string) => {
    if (!user || !otherUserId) return;
    try {
      const conversation = await getOrCreateConversation(user.id, otherUserId);
      onNavigate(`messages?conversationId=${conversation.id}`);
    } catch {
      toast({ title: "Erro", description: "Erro ao iniciar conversa.", variant: "destructive" });
    }
  };

  const handleRateTransaction = (transactionId?: string) => {
    if (!transactionId) return;
    const transaction = transactions.find(t => t.id === transactionId);
    if (transaction) {
      setReviewTransaction(transaction);
      setReviewRating(5);
      setReviewComment('');
      setReviewDialogOpen(true);
    }
  };

  const handleSubmitReview = async () => {
    if (!user || !reviewTransaction) return;

    setReviewSubmitting(true);
    try {
      const reviewedUserId =
        reviewTransaction.buyer_id === user.id
          ? reviewTransaction.seller_id
          : reviewTransaction.buyer_id;

      await createReview({
        reviewer_id: user.id,
        reviewed_user_id: reviewedUserId,
        transaction_id: reviewTransaction.id,
        rating: reviewRating,
        comment: reviewComment || undefined,
      });

      toast({ title: "Avaliação enviada!", description: "Obrigado pela sua avaliação." });
      setReviewDialogOpen(false);
    } catch {
      toast({ title: "Erro", description: "Erro ao enviar avaliação.", variant: "destructive" });
    } finally {
      setReviewSubmitting(false);
    }
  };

  /* ── Render helpers ────────────────────────────────────── */

  const renderTransactionCard = (transaction: any) => {
    const product = transaction.waste_items;
    if (!product) return null; // orphaned transaction

    const otherUserId = transaction.buyer_id === user?.id ? transaction.seller_id : transaction.buyer_id;
    const other = otherUsers[otherUserId];
    if (!other) return null;

    return (
      <EnhancedTrackingCard
        key={transaction.id}
        transaction={formatTransaction(transaction)}
        otherUser={other}
        product={normaliseProduct(product)}
        onContactSeller={() => handleContactSeller(otherUserId)}
        onRateTransaction={() => handleRateTransaction(transaction.id)}
      />
    );
  };

  const renderSaleCard = (transaction: any) => {
    const product = transaction.waste_items;
    if (!product) return null;

    const otherUserId = transaction.buyer_id;
    const other = otherUsers[otherUserId];
    if (!other) return null;

    let quantityUnit = 'unidades';
    try {
      const q = typeof product.quantity === 'string' ? JSON.parse(product.quantity) : product.quantity;
      quantityUnit = q?.unit || 'unidades';
    } catch {}

    return (
      <div key={transaction.id} className="border-l-4 border-l-eco-brown p-4 bg-card rounded-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-4">
          <div>
            <h4 className="font-medium">Venda para {other.name}</h4>
            <p className="text-sm text-muted-foreground">
              {new Date(transaction.created_at).toLocaleDateString('pt-BR')}
            </p>
          </div>
          {!['entregue', 'cancelado'].includes(transaction.status) && (
            <div className="flex gap-2 flex-wrap">
              {transaction.status === 'pendente' && (
                <>
                  <Button size="sm" onClick={() => handleUpdateStatus(transaction.id, 'confirmado')} className="bg-eco-green hover:bg-eco-green/90">
                    Confirmar
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(transaction.id, 'cancelado')}>
                    Cancelar
                  </Button>
                </>
              )}
              {transaction.status === 'confirmado' && (
                <Button size="sm" onClick={() => handleUpdateStatus(transaction.id, 'em_transporte')} className="bg-eco-green hover:bg-eco-green/90">
                  Enviar
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <p className="text-sm font-medium">{product.title}</p>
            <p className="text-xs text-muted-foreground">
              {transaction.quantity} {quantityUnit}
            </p>
          </div>
          <p className="text-lg font-bold text-eco-green">
            R$ {Number(transaction.total_price).toFixed(2)}
          </p>
        </div>
      </div>
    );
  };

  /* ── Main render ───────────────────────────────────────── */

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Você precisa estar logado para ver suas transações.
            </p>
            <Button onClick={() => onNavigate('auth')}>Fazer Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <Button variant="ghost" onClick={() => onNavigate('home')} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar
      </Button>

      <Card>
        <CardHeader className="px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
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
        <CardContent className="px-3 sm:px-6">
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
              <Button onClick={() => onNavigate('home')}>Explorar Produtos</Button>
            </div>
          ) : (
            <div className="space-y-6">
              <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">Todas</TabsTrigger>
                  <TabsTrigger value="purchases">Compras</TabsTrigger>
                  <TabsTrigger value="sales">Vendas</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4 mt-6">
                  {filteredTransactions.map(renderTransactionCard)}
                </TabsContent>

                <TabsContent value="purchases" className="space-y-4 mt-6">
                  {filteredTransactions.map(renderTransactionCard)}
                </TabsContent>

                <TabsContent value="sales" className="space-y-4 mt-6">
                  {filteredTransactions.map(renderSaleCard)}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Avaliar Transação</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nota</Label>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => setReviewRating(star)} className="focus:outline-none">
                    <Star className={`w-8 h-8 ${star <= reviewRating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="review-comment">Comentário (opcional)</Label>
              <Textarea
                id="review-comment"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Conte como foi sua experiência..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmitReview} disabled={reviewSubmitting} className="bg-gradient-eco hover:opacity-90">
              {reviewSubmitting ? 'Enviando...' : 'Enviar Avaliação'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
