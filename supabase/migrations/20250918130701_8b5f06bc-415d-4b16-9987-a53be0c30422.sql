-- Primeiro, vamos adicionar uma coluna updated_at à tabela transactions
ALTER TABLE public.transactions 
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Criar trigger para atualizar o campo updated_at automaticamente
CREATE TRIGGER update_transactions_updated_at
BEFORE UPDATE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Corrigir a função para notificar transações confirmadas
-- Adicionar também notificação para outros status importantes
CREATE OR REPLACE FUNCTION public.notify_transaction_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Notificar quando o status muda para 'confirmado'
  IF NEW.status = 'confirmado' AND (OLD.status IS NULL OR OLD.status != 'confirmado') THEN
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      read
    ) VALUES (
      NEW.buyer_id,
      'order_confirmed',
      'Pedido Confirmado!',
      'Seu pedido foi confirmado pelo vendedor e está sendo preparado. Você receberá atualizações sobre o progresso da entrega.',
      false
    );
  END IF;
  
  -- Notificar quando o status muda para 'em_transporte'
  IF NEW.status = 'em_transporte' AND (OLD.status IS NULL OR OLD.status != 'em_transporte') THEN
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      read
    ) VALUES (
      NEW.buyer_id,
      'order_shipped',
      'Pedido Enviado!',
      'Seu pedido foi enviado e está a caminho. Você pode acompanhar o progresso na página de transações.',
      false
    );
  END IF;
  
  -- Notificar quando o status muda para 'entregue'
  IF NEW.status = 'entregue' AND (OLD.status IS NULL OR OLD.status != 'entregue') THEN
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      read
    ) VALUES (
      NEW.buyer_id,
      'order_delivered',
      'Pedido Entregue!',
      'Seu pedido foi entregue com sucesso. Avalie sua experiência na página de transações.',
      false
    );
  END IF;
  
  -- Notificar quando o status muda para 'cancelado'
  IF NEW.status = 'cancelado' AND (OLD.status IS NULL OR OLD.status != 'cancelado') THEN
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      read
    ) VALUES (
      NEW.buyer_id,
      'order_cancelled',
      'Pedido Cancelado',
      'Seu pedido foi cancelado pelo vendedor. Entre em contato se tiver dúvidas.',
      false
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Remover o trigger antigo e criar o novo
DROP TRIGGER IF EXISTS notify_transaction_confirmed_trigger ON public.transactions;
CREATE TRIGGER notify_transaction_status_trigger
AFTER UPDATE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.notify_transaction_status();