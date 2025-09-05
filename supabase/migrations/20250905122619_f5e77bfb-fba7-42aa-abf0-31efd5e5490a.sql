-- Fix foreign key relationships for conversations and messages
-- Drop existing foreign keys if they exist
ALTER TABLE conversations DROP CONSTRAINT IF EXISTS conversations_user1_id_fkey;
ALTER TABLE conversations DROP CONSTRAINT IF EXISTS conversations_user2_id_fkey;
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;

-- Remove duplicate foreign keys for waste_items relationships
ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS fk_cart_items_waste_item_id;
ALTER TABLE favorites DROP CONSTRAINT IF EXISTS fk_favorites_waste_item_id;
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS fk_transactions_waste_item_id;

-- Add proper foreign keys for conversations referencing profiles table
ALTER TABLE conversations 
ADD CONSTRAINT conversations_user1_id_fkey 
FOREIGN KEY (user1_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

ALTER TABLE conversations 
ADD CONSTRAINT conversations_user2_id_fkey 
FOREIGN KEY (user2_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

-- Add proper foreign key for messages referencing profiles table
ALTER TABLE messages 
ADD CONSTRAINT messages_sender_id_fkey 
FOREIGN KEY (sender_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

-- Add proper foreign key for messages referencing conversations
ALTER TABLE messages 
ADD CONSTRAINT messages_conversation_id_fkey 
FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE;