-- Add RLS policy to allow users to mark messages as read in their conversations
CREATE POLICY "Users can mark messages as read in own conversations" 
ON public.messages 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM conversations 
    WHERE conversations.id = messages.conversation_id 
    AND (conversations.user1_id = auth.uid() OR conversations.user2_id = auth.uid())
  )
) 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM conversations 
    WHERE conversations.id = messages.conversation_id 
    AND (conversations.user1_id = auth.uid() OR conversations.user2_id = auth.uid())
  )
);