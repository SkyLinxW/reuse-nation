import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  getConversations,
  getMessages,
  sendMessage,
  getProfile,
  getWasteItem,
  getOrCreateConversation,
  getUnreadMessagesCountForConversation,
  markMessagesAsRead
} from '@/lib/supabase';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Chat, ChatMessage, User, WasteItem } from '@/types';
import { ArrowLeft, Send, MessageCircle } from 'lucide-react';

interface MessagesPageProps {
  onNavigate: (page: string) => void;
  chatId?: string;
  sellerId?: string;
}

export const MessagesPage = ({ onNavigate, chatId, sellerId }: MessagesPageProps) => {
  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUser, setOtherUser] = useState<any | null>(null);
  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [otherUserOnline, setOtherUserOnline] = useState(false);
  const [presenceChannel, setPresenceChannel] = useState<any>(null);
  const [chatUnreadCounts, setChatUnreadCounts] = useState<{[key: string]: number}>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  const { user } = useAuth();

  useEffect(() => {
    const loadChats = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        console.log('MessagesPage: Loading chats for user:', user.id);
        const userChats = await getConversations(user.id);
        console.log('MessagesPage: Loaded chats:', userChats.length);
        setChats(userChats);

        // Load unread counts for each chat
        const unreadCounts: {[key: string]: number} = {};
        for (const chat of userChats) {
          try {
            const count = await getUnreadMessagesCountForConversation(chat.id, user.id);
            unreadCounts[chat.id] = count;
          } catch (error) {
            console.error('Error loading unread count for chat:', chat.id, error);
            unreadCounts[chat.id] = 0;
          }
        }
        setChatUnreadCounts(unreadCounts);

        // Handle direct conversation ID
        if (chatId) {
          const chat = userChats.find((c: any) => c.id === chatId);
          if (chat) {
            setSelectedChat(chat);
            await loadChatData(chat);
          }
        }
        
        // Handle seller ID - create or find conversation
        if (sellerId && sellerId !== user.id) {
          console.log('MessagesPage: Creating/finding conversation with seller:', sellerId);
          try {
            const conversation = await getOrCreateConversation(user.id, sellerId);
            console.log('MessagesPage: Got conversation:', conversation.id);
            
            // Refresh chats to include the new conversation
            const updatedChats = await getConversations(user.id);
            setChats(updatedChats);
            
            const newSelectedChat = updatedChats.find((c: any) => c.id === conversation.id);
            if (newSelectedChat) {
              setSelectedChat(newSelectedChat);
              await loadChatData(newSelectedChat);
            }
          } catch (error) {
            console.error('Error creating conversation with seller:', error);
          }
        }
      } catch (error) {
        console.error('Error loading chats:', error);
      }
      setLoading(false);
    };

    loadChats();
  }, [user, chatId, sellerId]);

  // Realtime subscription for new messages - IMPROVED VERSION
  useEffect(() => {
    if (!user || !selectedChat) {
      console.log('⏸️ Skipping realtime setup - missing user or selectedChat');
      return;
    }

    console.log('🔥 SETTING UP REALTIME FOR MESSAGES:', {
      userId: user.id,
      chatId: selectedChat.id,
      timestamp: new Date().toISOString()
    });
    
    const channelName = `chat-${selectedChat.id}-${Date.now()}`;
    const messagesChannel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedChat.id}`
        },
        async (payload) => {
          console.log('🚀 REALTIME MESSAGE RECEIVED!', {
            payload,
            currentUserId: user.id,
            timestamp: new Date().toISOString()
          });
          
          const newMessage = payload.new as any;
          
          // Always add the message but check if it's from current user
          try {
            console.log('🔍 Processing new message:', newMessage.id, 'from:', newMessage.sender_id);
            
            let messageWithSender;
            if (newMessage.sender_id === user.id) {
              // Our own message - use current user data
              messageWithSender = {
                ...newMessage,
                sender: {
                  user_id: user.id,
                  name: user.user_metadata?.name || user.email,
                  email: user.email
                }
              };
              console.log('👤 Message from current user, using cached data');
            } else {
              // Other user's message - fetch profile
              console.log('👥 Message from other user, fetching profile...');
              const senderProfile = await getProfile(newMessage.sender_id);
              messageWithSender = {
                ...newMessage,
                sender: senderProfile
              };
              console.log('✅ Sender profile fetched:', senderProfile?.name);
            }
            
            setMessages(prev => {
              const exists = prev.some(msg => msg.id === newMessage.id);
              if (exists) {
                console.log('⚠️ Message already exists, skipping');
                return prev;
              }
              console.log('➕ Adding message to state, total will be:', prev.length + 1);
              return [...prev, messageWithSender];
            });

            // If message is from another user and we're currently viewing this chat,
            // mark it as read immediately. If not viewing, update unread count
            if (newMessage.sender_id !== user.id) {
              if (selectedChat?.id === newMessage.conversation_id) {
                // We're viewing this chat, mark message as read immediately
                try {
                  await markMessagesAsRead(newMessage.conversation_id, user.id);
                  setChatUnreadCounts(prev => ({
                    ...prev,
                    [newMessage.conversation_id]: 0
                  }));
                  console.log('✅ Real-time message marked as read immediately');
                } catch (error) {
                  console.error('Error marking real-time message as read:', error);
                }
              } else {
                // We're not viewing this chat, increment unread count
                setChatUnreadCounts(prev => ({
                  ...prev,
                  [newMessage.conversation_id]: (prev[newMessage.conversation_id] || 0) + 1
                }));
              }
            }
            
          } catch (error) {
            console.error('❌ Error processing new message:', error);
          }
        }
      )
      .subscribe((status, err) => {
        console.log('📡 Realtime subscription status changed:', {
          status,
          error: err,
          channelName,
          timestamp: new Date().toISOString()
        });
      });

    return () => {
      console.log('🧹 Cleaning up realtime subscription:', channelName);
      supabase.removeChannel(messagesChannel);
    };
  }, [user?.id, selectedChat?.id]); // More specific dependencies

  // Realtime subscription for conversation updates
  useEffect(() => {
    if (!user) return;

    console.log('🔥 Setting up realtime subscription for conversations');
    
    const conversationChannel = supabase
      .channel(`conversations-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations',
          filter: `or(user1_id.eq.${user.id},user2_id.eq.${user.id})`
        },
          async (payload) => {
            console.log('🔄 Conversation updated via realtime:', payload);
            // Refresh conversations list and unread counts
            try {
              const updatedChats = await getConversations(user.id);
              setChats(updatedChats);
              
              // Refresh unread counts for all chats
              const unreadCounts: {[key: string]: number} = {};
              for (const chat of updatedChats) {
                try {
                  const count = await getUnreadMessagesCountForConversation(chat.id, user.id);
                  unreadCounts[chat.id] = count;
                } catch (error) {
                  console.error('Error loading unread count for chat:', chat.id, error);
                  unreadCounts[chat.id] = 0;
                }
              }
              setChatUnreadCounts(unreadCounts);
              
              console.log('✅ Conversations and unread counts refreshed');
            } catch (error) {
              console.error('❌ Error refreshing conversations:', error);
            }
          }
      )
      .subscribe((status) => {
        console.log('📡 Conversations subscription status:', status);
      });

    return () => {
      console.log('🧹 Cleaning up conversation subscription');
      supabase.removeChannel(conversationChannel);
    };
  }, [user]);

  // User presence tracking
  useEffect(() => {
    if (!user) return;

    console.log('Setting up presence tracking for user:', user.id);
    
    const channel = supabase.channel('user-presence', {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        console.log('Presence sync:', presenceState);
        
        if (otherUser) {
          const isOnline = !!presenceState[otherUser.user_id];
          console.log(`Other user ${otherUser.user_id} online:`, isOnline);
          setOtherUserOnline(isOnline);
        }
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
        if (otherUser && key === otherUser.user_id) {
          setOtherUserOnline(true);
        }
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
        if (otherUser && key === otherUser.user_id) {
          setOtherUserOnline(false);
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Presence subscription successful');
          // Track this user's presence
          await channel.track({
            user_id: user.id,
            online_at: new Date().toISOString(),
          });
        }
      });

    setPresenceChannel(channel);

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up presence tracking');
      if (channel) {
        channel.untrack();
        supabase.removeChannel(channel);
      }
    };
  }, [user]);

  // Update other user online status when otherUser changes
  useEffect(() => {
    if (presenceChannel && otherUser) {
      const presenceState = presenceChannel.presenceState();
      const isOnline = !!presenceState[otherUser.user_id];
      console.log(`Checking if other user ${otherUser.user_id} is online:`, isOnline);
      setOtherUserOnline(isOnline);
    }
  }, [otherUser, presenceChannel]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatData = async (chat: any) => {
    console.log('MessagesPage: Loading chat data for:', chat.id);
    try {
      const chatMessages = await getMessages(chat.id);
      console.log('MessagesPage: Loaded messages:', chatMessages.length);
      setMessages(chatMessages);

      // Mark messages as read when opening the chat
      if (user) {
        await markMessagesAsRead(chat.id, user.id);
        // Update unread count for this chat to 0
        setChatUnreadCounts(prev => ({
          ...prev,
          [chat.id]: 0
        }));
        console.log('Messages marked as read for conversation:', chat.id);
      }

      // Use other_user from chat if available, otherwise fetch profile
      if (chat.other_user) {
        console.log('MessagesPage: Using cached other_user');
        setOtherUser(chat.other_user);
      } else {
        console.log('MessagesPage: Fetching other user profile');
        const otherUserId = chat.user1_id === user?.id ? chat.user2_id : chat.user1_id;
        const userProfile = await getProfile(otherUserId);
        setOtherUser(userProfile);
      }

      // Product loading can be added later if needed
      setProduct(null);
    } catch (error) {
      console.error('Error loading chat data:', error);
    }
  };

  const handleChatSelect = async (chat: any) => {
    console.log('🔄 Selecting chat:', chat.id);
    setSelectedChat(chat);
    await loadChatData(chat);
    
    // Force mark messages as read after selecting
    if (user) {
      try {
        await markMessagesAsRead(chat.id, user.id);
        setChatUnreadCounts(prev => ({
          ...prev,
          [chat.id]: 0
        }));
        console.log('✅ Messages marked as read after chat selection');
      } catch (error) {
        console.error('❌ Error marking messages as read on chat select:', error);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !user) return;

    const messageContent = newMessage.trim();
    setNewMessage(''); // Clear input immediately for better UX

    try {
      console.log('📤 Sending message:', messageContent);
      const sentMessage = await sendMessage(selectedChat.id, user.id, messageContent);
      console.log('✅ Message sent successfully:', sentMessage);
      
      // Add message to state immediately (our own message)
      const messageWithSender = {
        ...sentMessage,
        sender: {
          user_id: user.id,
          name: user.user_metadata?.name || user.email,
          email: user.email
        }
      };
      
      setMessages(prev => {
        // Check if message already exists to avoid duplicates
        const exists = prev.some(msg => msg.id === sentMessage.id);
        if (exists) return prev;
        return [...prev, messageWithSender];
      });
      
    } catch (error) {
      console.error('❌ Error sending message:', error);
      // Restore message in input if failed
      setNewMessage(messageContent);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Carregando mensagens...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Você precisa estar logado para ver suas mensagens.
            </p>
            <Button onClick={() => onNavigate('auth')}>
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => onNavigate('home')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="flex h-[calc(100vh-200px)] bg-background rounded-lg border">
          {/* Lista de conversas - Sidebar */}
          <div className="w-80 border-r bg-card">
            <div className="p-4 border-b">
              <h2 className="font-semibold flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Conversas
              </h2>
            </div>
            <div className="overflow-y-auto h-full">
              {chats.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  Nenhuma conversa encontrada
                </div>
              ) : (
                <div className="space-y-0">
                  {chats.map((chat) => {
                    // Display name from other_user or fallback
                    const displayName = chat.other_user?.name || chat.other_user?.email || 'Usuário';
                    const initials = displayName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
                    
                    return (
                      <div
                        key={chat.id}
                        className={`p-4 cursor-pointer hover:bg-muted/50 border-b transition-colors ${
                          selectedChat?.id === chat.id ? 'bg-muted' : ''
                        }`}
                        onClick={() => handleChatSelect(chat)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={chat.other_user?.avatar_url || ""} alt={displayName} />
                              <AvatarFallback className="bg-eco-green text-white">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            {/* Online status indicator */}
                            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                              presenceChannel?.presenceState()[chat.other_user?.user_id] ? 'bg-green-500' : 'bg-gray-400'
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium truncate">{displayName}</p>
                              {(chatUnreadCounts[chat.id] || 0) > 0 && (
                                <Badge variant="destructive" className="h-5 w-5 flex items-center justify-center p-0 text-xs ml-2">
                                  {chatUnreadCounts[chat.id]}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {new Date(chat.last_message_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Área de mensagens */}
          <div className="flex-1 flex flex-col">
            {selectedChat ? (
              <>
                {/* Header do chat */}
                <div className="p-4 border-b bg-card">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={otherUser?.avatar_url || ""} alt={otherUser?.name || 'Usuário'} />
                        <AvatarFallback className="bg-eco-green text-white">
                          {otherUser?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      {/* Status indicator */}
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                        otherUserOnline ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium">{otherUser?.name || otherUser?.email || 'Usuário'}</p>
                      <p className="text-sm text-muted-foreground">
                        {otherUserOnline ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mensagens */}
                <div 
                  ref={messagesContainerRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4"
                  style={{ maxHeight: 'calc(100vh - 400px)' }}
                >
                  {messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma mensagem ainda</p>
                      <p className="text-sm">Envie a primeira mensagem!</p>
                    </div>
                  ) : (
                    messages.map((message) => {
                      const isOwnMessage = message.sender_id === user?.id;
                      const senderName = message.sender?.name || message.sender?.email || 'Usuário';
                      
                      return (
                        <div
                          key={message.id}
                          className={`flex gap-3 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          {!isOwnMessage && (
                            <Avatar className="w-8 h-8 flex-shrink-0">
                              <AvatarImage src={message.sender?.avatar_url || ""} alt={senderName} />
                              <AvatarFallback className="bg-eco-green text-white text-xs">
                                {senderName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          
                          <div className={`max-w-[70%] ${isOwnMessage ? 'order-first' : ''}`}>
                            <div
                              className={`p-3 rounded-lg ${
                                isOwnMessage
                                  ? 'bg-eco-green text-white'
                                  : 'bg-muted'
                              }`}
                            >
                              <p className="break-words">{message.content}</p>
                            </div>
                            <p className={`text-xs text-muted-foreground mt-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                              {new Date(message.created_at).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          
                          {isOwnMessage && (
                            <Avatar className="w-8 h-8 flex-shrink-0">
                              <AvatarImage src="" alt={user?.user_metadata?.name || user?.email || ''} />
                              <AvatarFallback className="bg-eco-green text-white text-xs">
                                {(user?.user_metadata?.name || user?.email || 'U').split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input de mensagem */}
                <div className="p-4 border-t bg-card">
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Digite sua mensagem..."
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleSendMessage} 
                      disabled={!newMessage.trim()}
                      size="sm"
                      className="px-4"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center">
                <div>
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Selecione uma conversa</h3>
                  <p className="text-muted-foreground">
                    Escolha uma conversa para começar a trocar mensagens
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
