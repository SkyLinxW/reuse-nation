import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DeliveryStep {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  status: 'pending' | 'active' | 'completed';
  icon: string;
}

interface Transaction {
  id: string;
  buyer_id: string;
  seller_id: string;
  status: string;
  delivery_method: string;
  created_at: string;
  waste_items: {
    title: string;
  };
}

const serve_handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Buscar transações que precisam ser processadas
    const { data: transactions, error: transactionsError } = await supabaseClient
      .from('transactions')
      .select(`
        *,
        waste_items (
          title
        )
      `)
      .in('status', ['confirmado', 'em_transporte'])
      .order('created_at', { ascending: true });

    if (transactionsError) {
      console.error('Erro ao buscar transações:', transactionsError);
      throw transactionsError;
    }

    if (!transactions || transactions.length === 0) {
      return new Response(
        JSON.stringify({ message: 'Nenhuma transação para processar' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const processedTransactions = [];

    for (const transaction of transactions) {
      try {
        await processTransaction(supabaseClient, transaction);
        processedTransactions.push(transaction.id);
      } catch (error) {
        console.error(`Erro ao processar transação ${transaction.id}:`, error);
      }
    }

    console.log(`Processadas ${processedTransactions.length} transações`);

    return new Response(
      JSON.stringify({ 
        message: `Processadas ${processedTransactions.length} transações`,
        processed: processedTransactions
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro no processador de entregas:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
};

async function processTransaction(supabaseClient: any, transaction: Transaction) {
  const now = new Date();
  const createdAt = new Date(transaction.created_at);
  const minutesSinceCreated = (now.getTime() - createdAt.getTime()) / (1000 * 60);
  const hoursSinceCreated = minutesSinceCreated / 60;

  console.log(`Processando transação ${transaction.id}, criada há ${hoursSinceCreated.toFixed(1)} horas (${minutesSinceCreated.toFixed(0)} minutos)`);

  let newStatus = transaction.status;
  let buyerNotification = null;
  let sellerNotification = null;

  // Lógica para entrega local (mais realista e gradual)
  if (transaction.delivery_method === 'entrega') {
    if (transaction.status === 'confirmado' && minutesSinceCreated >= 90) {
      // Após 1.5h (90 min): coleta realizada
      newStatus = 'em_transporte';
      buyerNotification = {
        user_id: transaction.buyer_id,
        type: 'delivery_update',
        title: 'Produto Coletado!',
        message: `Seu produto "${transaction.waste_items?.title}" foi coletado pelo entregador e está a caminho do seu endereço!`,
        read: false
      };
      sellerNotification = {
        user_id: transaction.seller_id,
        type: 'sale_update',
        title: 'Produto Coletado!',
        message: `Seu produto "${transaction.waste_items?.title}" foi coletado pelo entregador!`,
        read: false
      };
    } else if (transaction.status === 'em_transporte' && minutesSinceCreated >= 180) {
      // Após 3h total (180 min): entregue
      newStatus = 'entregue';
      buyerNotification = {
        user_id: transaction.buyer_id,
        type: 'delivery_complete',
        title: 'Produto Entregue!',
        message: `Seu produto "${transaction.waste_items?.title}" foi entregue com sucesso! Que tal avaliar sua experiência?`,
        read: false
      };
      sellerNotification = {
        user_id: transaction.seller_id,
        type: 'sale_complete',
        title: 'Venda Concluída!',
        message: `Sua venda do produto "${transaction.waste_items?.title}" foi concluída com sucesso!`,
        read: false
      };
    }
  }
  
  // Lógica para transportadora (tempos mais realistas)
  else if (transaction.delivery_method === 'transportadora') {
    if (transaction.status === 'confirmado' && hoursSinceCreated >= 8) {
      // Após 8h: coleta pela transportadora
      newStatus = 'em_transporte';
      buyerNotification = {
        user_id: transaction.buyer_id,
        type: 'delivery_update',
        title: 'Produto Coletado pela Transportadora!',
        message: `Seu produto "${transaction.waste_items?.title}" foi coletado pela transportadora e está sendo processado no centro de distribuição!`,
        read: false
      };
      sellerNotification = {
        user_id: transaction.seller_id,
        type: 'sale_update',
        title: 'Produto Coletado!',
        message: `Seu produto "${transaction.waste_items?.title}" foi coletado pela transportadora!`,
        read: false
      };
    } else if (transaction.status === 'em_transporte' && hoursSinceCreated >= 48) {
      // Após 48h total: entregue
      newStatus = 'entregue';
      buyerNotification = {
        user_id: transaction.buyer_id,
        type: 'delivery_complete',
        title: 'Produto Entregue!',
        message: `Seu produto "${transaction.waste_items?.title}" foi entregue pela transportadora! Que tal avaliar sua experiência?`,
        read: false
      };
      sellerNotification = {
        user_id: transaction.seller_id,
        type: 'sale_complete',
        title: 'Venda Concluída!',
        message: `Sua venda do produto "${transaction.waste_items?.title}" foi concluída com sucesso!`,
        read: false
      };
    }
  }

  // Atualizar status se houve mudança
  if (newStatus !== transaction.status) {
    const { error: updateError } = await supabaseClient
      .from('transactions')
      .update({ 
        status: newStatus,
        completed_at: newStatus === 'entregue' ? new Date().toISOString() : null
      })
      .eq('id', transaction.id);

    if (updateError) {
      console.error(`Erro ao atualizar transação ${transaction.id}:`, updateError);
      throw updateError;
    }

    console.log(`Transação ${transaction.id} atualizada para status: ${newStatus}`);
  }

  // Criar notificações se necessário
  if (buyerNotification) {
    const { error: buyerNotificationError } = await supabaseClient
      .from('notifications')
      .insert(buyerNotification);

    if (buyerNotificationError) {
      console.error(`Erro ao criar notificação do comprador para transação ${transaction.id}:`, buyerNotificationError);
    } else {
      console.log(`Notificação do comprador criada para usuário ${buyerNotification.user_id}`);
    }
  }

  if (sellerNotification) {
    const { error: sellerNotificationError } = await supabaseClient
      .from('notifications')
      .insert(sellerNotification);

    if (sellerNotificationError) {
      console.error(`Erro ao criar notificação do vendedor para transação ${transaction.id}:`, sellerNotificationError);
    } else {
      console.log(`Notificação do vendedor criada para usuário ${sellerNotification.user_id}`);
    }
  }
}

serve(serve_handler);