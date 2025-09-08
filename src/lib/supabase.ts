import { supabase } from '@/integrations/supabase/client';

// Profile management functions
export const getProfile = async (userId: string): Promise<any> => {
  console.log('getProfile called for userId:', userId);
  
  // Try to get full profile if it's the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user && user.id === userId) {
    console.log('Getting full profile for current user');
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching own profile:', error);
      return null;
    }
    
    console.log('Full profile data:', data);
    return data;
  }
  
  // For other users, try getting from profiles table first (fallback for public_profiles issues)
  console.log('Getting public profile for other user');
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('user_id, name, avatar_url, bio, created_at, email')
    .eq('user_id', userId)
    .single();

  if (profileData) {
    console.log('Profile data found:', profileData);
    return profileData;
  }

  if (profileError) {
    console.error('Error fetching profile from profiles table:', profileError);
  }

  // Fallback: try public_profiles view
  const { data, error } = await supabase
    .from('public_profiles')
    .select('user_id, name, avatar_url, bio, created_at')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching public profile from view:', error);
    return null;
  }
  
  console.log('Public profile data:', data);
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
  console.log('getWasteItems: Starting query...');
  
  const { data, error } = await supabase
    .from('waste_items')
    .select(`
      *,
      public_profiles!inner(name, avatar_url)
    `)
    .eq('availability', true)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('getWasteItems: Error occurred:', error);
    throw error;
  }
  
  console.log('getWasteItems: Success, returning data:', data?.length, 'items');
  return data;
};

export const getWasteItem = async (id: string) => {
  const { data, error } = await supabase
    .from('waste_items')
    .select(`
      *,
      public_profiles!inner(name, avatar_url, bio)
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
      waste_items(*)
    `)
    .eq('user_id', userId);
  
  if (error) throw error;
  return data;
};

export const addToFavorites = async (userId: string, wasteItemId: string) => {
  console.log('Adding to favorites:', { userId, wasteItemId });
  
  // Use upsert to avoid duplicate key errors
  const { data, error } = await supabase
    .from('favorites')
    .upsert(
      { user_id: userId, waste_item_id: wasteItemId },
      { onConflict: 'user_id,waste_item_id' }
    )
    .select()
    .single();
  
  if (error) {
    console.error('Supabase error adding to favorites:', error);
    throw error;
  }
  console.log('Successfully added to favorites:', data);
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
    .maybeSingle();
  
  return !!data;
};

// Cart
export const getCartItems = async (userId: string) => {
  const { data, error } = await supabase
    .from('cart_items')
    .select(`
      *,
      waste_items(*)
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
      waste_items(*)
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
  console.log('getConversations: Starting query for userId:', userId);
  
  // Simplified query without embedding messages to avoid foreign key issues
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .order('last_message_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
  
  console.log('getConversations: Found', data?.length || 0, 'conversations');
  
  // Get other user profiles manually
  if (data && data.length > 0) {
    const conversationsWithProfiles = await Promise.all(
      data.map(async (conversation) => {
        const otherUserId = conversation.user1_id === userId ? conversation.user2_id : conversation.user1_id;
        try {
          const otherUser = await getProfile(otherUserId);
          return {
            ...conversation,
            other_user: otherUser
          };
        } catch (error) {
          console.error('Error fetching other user profile:', error);
          return conversation;
        }
      })
    );
    console.log('getConversations: Returning with profiles');
    return conversationsWithProfiles;
  }
  
  return data || [];
};

export const getOrCreateConversation = async (user1Id: string, user2Id: string) => {
  console.log('getOrCreateConversation: Looking for conversation between', user1Id, 'and', user2Id);
  
  // Try to find existing conversation using maybeSingle to avoid errors
  const { data: existing, error: searchError } = await supabase
    .from('conversations')
    .select('*')
    .or(`and(user1_id.eq.${user1Id},user2_id.eq.${user2Id}),and(user1_id.eq.${user2Id},user2_id.eq.${user1Id})`)
    .maybeSingle();

  if (existing) {
    console.log('getOrCreateConversation: Found existing conversation:', existing.id);
    return existing;
  }

  // Create new conversation
  console.log('getOrCreateConversation: Creating new conversation');
  const { data, error } = await supabase
    .from('conversations')
    .insert({ user1_id: user1Id, user2_id: user2Id })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
  
  console.log('getOrCreateConversation: Created new conversation:', data.id);
  return data;
};

export const getMessages = async (conversationId: string) => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  
  if (error) throw error;
  
  // Manually fetch profile data for each message sender
  if (data) {
    const messagesWithProfiles = await Promise.all(
      data.map(async (message) => {
        const profile = await getProfile(message.sender_id);
        return {
          ...message,
          sender: profile
        };
      })
    );
    return messagesWithProfiles;
  }
  
  return data;
};

export const sendMessage = async (conversationId: string, senderId: string, content: string) => {
  console.log('sendMessage: Sending message to conversation', conversationId);
  
  const { data, error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, sender_id: senderId, content })
    .select()
    .single();
  
  if (error) {
    console.error('Error inserting message:', error);
    throw error;
  }

  console.log('sendMessage: Message inserted successfully:', data.id);

  // Update conversation last_message_at
  const { error: updateError } = await supabase
    .from('conversations')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', conversationId);

  if (updateError) {
    console.error('Error updating conversation timestamp:', updateError);
  }

  console.log('sendMessage: Message sent and conversation updated');
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