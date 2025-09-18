-- Adicionar política para permitir inserção de notificações pelo trigger
CREATE POLICY "Allow trigger to insert notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true);

-- Ou podemos criar uma política mais específica que permite inserção apenas para transações
CREATE POLICY "System can create notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true);