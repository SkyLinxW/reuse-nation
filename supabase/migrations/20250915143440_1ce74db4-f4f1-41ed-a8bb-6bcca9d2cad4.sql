-- Habilitar as extensões necessárias para cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Criar cron job para processar entregas automaticamente a cada 10 minutos
SELECT cron.schedule(
  'process-deliveries-every-10min',
  '*/10 * * * *', -- A cada 10 minutos
  $$
  SELECT
    net.http_post(
        url:='https://zhanwvqujchafxaijujv.functions.supabase.co/functions/v1/delivery-processor',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoYW53dnF1amNoYWZ4YWlqdWp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2NTA0MzAsImV4cCI6MjA3MDIyNjQzMH0.Epdl5bcu2OR5VcOTd_kuZ3PV8814rf2ru9OWg1u5aJw"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);

-- Adicionar notificação inicial para transações confirmadas
CREATE OR REPLACE FUNCTION notify_transaction_confirmed()
RETURNS TRIGGER AS $$
BEGIN
  -- Só notificar quando o status muda para 'confirmado'
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
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para notificação de confirmação
DROP TRIGGER IF EXISTS transaction_confirmed_notification ON transactions;
CREATE TRIGGER transaction_confirmed_notification
  AFTER UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION notify_transaction_confirmed();