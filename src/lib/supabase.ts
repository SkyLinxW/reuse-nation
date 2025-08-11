import { supabase } from '@/integrations/supabase/client';

// Profiles
export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) throw error;
  return data;
};

export const updateProfile = async (userId: string, updates: any) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Waste Items
export const getWasteItems = async () => {
  const { data, error } = await supabase
    .from('waste_items')
    .select(`
      *,
      profiles!user_id(name, avatar_url)
    `)
    .eq('availability', true)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const getWasteItem = async (id: string) => {
  const { data, error } = await supabase
    .from('waste_items')
    .select(`
      *,
      profiles!waste_items_user_id_fkey(name, avatar_url, bio)
    `)
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

export const createWasteItem = async (wasteItem: any) => {
  const { data, error } = await supabase
    .from('waste_items')
    .insert(wasteItem)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateWasteItem = async (id: string, updates: any) => {
  const { data, error } = await supabase
    .from('waste_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteWasteItem = async (id: string) => {
  const { error } = await supabase
    .from('waste_items')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// Favorites
export const getFavorites = async (userId: string) => {
  const { data, error } = await supabase
    .from('favorites')
    .select(`
      *,
      waste_items(*, profiles!waste_items_user_id_fkey(name, avatar_url))
    `)
    .eq('user_id', userId);
  
  if (error) throw error;
  return data;
};

export const addToFavorites = async (userId: string, wasteItemId: string) => {
  const { data, error } = await supabase
    .from('favorites')
    .insert({ user_id: userId, waste_item_id: wasteItemId })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const removeFromFavorites = async (userId: string, wasteItemId: string) => {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('waste_item_id', wasteItemId);
  
  if (error) throw error;
};

export const isFavorite = async (userId: string, wasteItemId: string) => {
  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('waste_item_id', wasteItemId)
    .single();
  
  return !error && data;
};

// Cart
export const getCartItems = async (userId: string) => {
  const { data, error } = await supabase
    .from('cart_items')
    .select(`
      *,
      waste_items(*, profiles!waste_items_user_id_fkey(name, avatar_url))
    `)
    .eq('user_id', userId);
  
  if (error) throw error;
  return data;
};

export const addToCart = async (userId: string, wasteItemId: string, quantity: number = 1) => {
  const { data, error } = await supabase
    .from('cart_items')
    .upsert(
      { user_id: userId, waste_item_id: wasteItemId, quantity },
      { onConflict: 'user_id,waste_item_id' }
    )
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateCartItemQuantity = async (userId: string, wasteItemId: string, quantity: number) => {
  const { data, error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('user_id', userId)
    .eq('waste_item_id', wasteItemId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const removeFromCart = async (userId: string, wasteItemId: string) => {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', userId)
    .eq('waste_item_id', wasteItemId);
  
  if (error) throw error;
};

export const clearCart = async (userId: string) => {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', userId);
  
  if (error) throw error;
};

// Transactions
export const createTransaction = async (transaction: any) => {
  const { data, error } = await supabase
    .from('transactions')
    .insert(transaction)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getTransactions = async (userId: string) => {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      waste_items(*),
      buyer:profiles!transactions_buyer_id_fkey(name, avatar_url),
      seller:profiles!transactions_seller_id_fkey(name, avatar_url)
    `)
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const updateTransactionStatus = async (id: string, status: string) => {
  const updates: any = { status };
  if (status === 'entregue') {
    updates.completed_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('transactions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Notifications
export const getNotifications = async (userId: string) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const createNotification = async (notification: any) => {
  const { data, error } = await supabase
    .from('notifications')
    .insert(notification)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const markNotificationAsRead = async (id: string) => {
  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getUnreadNotificationCount = async (userId: string) => {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false);
  
  if (error) throw error;
  return count || 0;
};

// Messages and Conversations
export const getConversations = async (userId: string) => {
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      user1:profiles!conversations_user1_id_fkey(name, avatar_url),
      user2:profiles!conversations_user2_id_fkey(name, avatar_url),
      messages(content, created_at, sender_id)
    `)
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .order('last_message_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const getOrCreateConversation = async (user1Id: string, user2Id: string) => {
  // Try to find existing conversation
  const { data: existing, error: searchError } = await supabase
    .from('conversations')
    .select('*')
    .or(`and(user1_id.eq.${user1Id},user2_id.eq.${user2Id}),and(user1_id.eq.${user2Id},user2_id.eq.${user1Id})`)
    .single();

  if (existing) return existing;

  // Create new conversation
  const { data, error } = await supabase
    .from('conversations')
    .insert({ user1_id: user1Id, user2_id: user2Id })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getMessages = async (conversationId: string) => {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey(name, avatar_url)
    `)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  
  if (error) throw error;
  return data;
};

export const sendMessage = async (conversationId: string, senderId: string, content: string) => {
  const { data, error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, sender_id: senderId, content })
    .select()
    .single();
  
  if (error) throw error;

  // Update conversation last_message_at
  await supabase
    .from('conversations')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', conversationId);

  return data;
};

// Get eco impact stats
export const getEcoImpact = async () => {
  const { data, error } = await supabase
    .from('eco_impact')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching eco impact:', error);
    return {
      totalWasteReused: 0,
      co2Saved: 0,
      transactionsCount: 0
    };
  }

  return {
    totalWasteReused: Number(data.total_waste_reused),
    co2Saved: Number(data.co2_saved),
    transactionsCount: data.transactions_count
  };
};

// Search history functions
export const getRecentSearches = async (userId: string) => {
  const { data, error } = await supabase
    .from('search_history')
    .select('search_term')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error fetching recent searches:', error);
    return [];
  }

  return data.map(item => item.search_term);
};

export const saveSearchTerm = async (userId: string, searchTerm: string) => {
  if (!searchTerm.trim()) return;

  const { error } = await supabase
    .from('search_history')
    .upsert(
      { user_id: userId, search_term: searchTerm },
      { onConflict: 'user_id,search_term' }
    );

  if (error) {
    console.error('Error saving search term:', error);
  }
};

// Reviews functions
export const getReviewsByUser = async (userId: string) => {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      reviewer:reviewer_id(name),
      transaction:transaction_id(*)
    `)
    .eq('reviewed_user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }

  return data;
};

export const createReview = async (review: {
  reviewer_id: string;
  reviewed_user_id: string;
  transaction_id?: string;
  rating: number;
  comment?: string;
}) => {
  const { data, error } = await supabase
    .from('reviews')
    .insert(review)
    .select()
    .single();

  if (error) {
    console.error('Error creating review:', error);
    throw error;
  }

  return data;
};