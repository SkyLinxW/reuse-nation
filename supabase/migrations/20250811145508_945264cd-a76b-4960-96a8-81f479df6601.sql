-- Add foreign key relationship between waste_items and profiles
ALTER TABLE public.waste_items 
ADD CONSTRAINT waste_items_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Add foreign key relationship between cart_items and waste_items
ALTER TABLE public.cart_items 
ADD CONSTRAINT cart_items_waste_item_id_fkey 
FOREIGN KEY (waste_item_id) REFERENCES public.waste_items(id) ON DELETE CASCADE;

-- Add foreign key relationship between cart_items and profiles  
ALTER TABLE public.cart_items 
ADD CONSTRAINT cart_items_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Add foreign key relationship between favorites and waste_items
ALTER TABLE public.favorites 
ADD CONSTRAINT favorites_waste_item_id_fkey 
FOREIGN KEY (waste_item_id) REFERENCES public.waste_items(id) ON DELETE CASCADE;

-- Add foreign key relationship between favorites and profiles
ALTER TABLE public.favorites 
ADD CONSTRAINT favorites_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Add foreign key relationship between transactions and waste_items
ALTER TABLE public.transactions 
ADD CONSTRAINT transactions_waste_item_id_fkey 
FOREIGN KEY (waste_item_id) REFERENCES public.waste_items(id) ON DELETE CASCADE;

-- Add foreign key relationship between transactions and profiles (buyer)
ALTER TABLE public.transactions 
ADD CONSTRAINT transactions_buyer_id_fkey 
FOREIGN KEY (buyer_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Add foreign key relationship between transactions and profiles (seller)
ALTER TABLE public.transactions 
ADD CONSTRAINT transactions_seller_id_fkey 
FOREIGN KEY (seller_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Add foreign key relationship between conversations and profiles (user1)
ALTER TABLE public.conversations 
ADD CONSTRAINT conversations_user1_id_fkey 
FOREIGN KEY (user1_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Add foreign key relationship between conversations and profiles (user2)
ALTER TABLE public.conversations 
ADD CONSTRAINT conversations_user2_id_fkey 
FOREIGN KEY (user2_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Add foreign key relationship between messages and conversations
ALTER TABLE public.messages 
ADD CONSTRAINT messages_conversation_id_fkey 
FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;

-- Add foreign key relationship between messages and profiles
ALTER TABLE public.messages 
ADD CONSTRAINT messages_sender_id_fkey 
FOREIGN KEY (sender_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Add foreign key relationship between notifications and profiles
ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Add foreign key relationship between reviews and profiles (reviewer)
ALTER TABLE public.reviews 
ADD CONSTRAINT reviews_reviewer_id_fkey 
FOREIGN KEY (reviewer_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Add foreign key relationship between reviews and profiles (reviewed_user)
ALTER TABLE public.reviews 
ADD CONSTRAINT reviews_reviewed_user_id_fkey 
FOREIGN KEY (reviewed_user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Add foreign key relationship between reviews and transactions
ALTER TABLE public.reviews 
ADD CONSTRAINT reviews_transaction_id_fkey 
FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON DELETE SET NULL;

-- Add foreign key relationship between search_history and profiles
ALTER TABLE public.search_history 
ADD CONSTRAINT search_history_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;