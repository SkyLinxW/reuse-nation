-- Verificar se a coluna updated_at existe e adicionar se necessário
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'transactions' 
                   AND column_name = 'updated_at' 
                   AND table_schema = 'public') THEN
        ALTER TABLE public.transactions 
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
        
        -- Atualizar registros existentes
        UPDATE public.transactions 
        SET updated_at = created_at 
        WHERE updated_at IS NULL;
    END IF;
END $$;

-- Remover trigger antigo se existir
DROP TRIGGER IF EXISTS update_transactions_updated_at ON public.transactions;

-- Criar trigger para atualizar o campo updated_at automaticamente
CREATE TRIGGER update_transactions_updated_at
BEFORE UPDATE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();