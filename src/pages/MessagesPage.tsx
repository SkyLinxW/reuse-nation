import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  getConversations,
  getMessages,
  sendMessage,
  getProfile,
  getOrCreateConversation,
  getUnreadMessagesCountForConversation,
  markMessagesAsRead
} from '@/lib/supabase';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Send, MessageCircle, Search, Smile, MoreVertical, Check, CheckCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

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
  const [loading, setLoading] = useState(true);
  const [otherUserOnline, setOtherUserOnline] = useState(false);
  const [presenceChannel, setPresenceChannel] = useState<any>(null);
  const [chatUnreadCounts, setChatUnreadCounts] = useState<{[key: string]: number}>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const loadChats = async () => {
      if (!user) { setLoading(false); return; }

      try {
        const userChats = await getConversations(user.id);
        setChats(userChats);

        const unreadCounts: {[key: string]: number} = {};
        for (const chat of userChats) {
          try {
            unreadCounts[chat.id] = await getUnreadMessagesCountForConversation(chat.id, user.id);
          } catch { unreadCounts[chat.id] = 0; }
        }
        setChatUnreadCounts(unreadCounts);

        if (chatId) {
          const chat = userChats.find((c: any) => c.id === chatId);
          if (chat) { setSelectedChat(chat); setShowMobileChat(true); await loadChatData(chat); }
        }
        
        if (sellerId) {
          if (sellerId === user.id) {
            toast({ title: "Ação inválida", description: "Você não pode enviar mensagens para si mesmo.", variant: "destructive" });
          } else {
            try {
              const conversation = await getOrCreateConversation(user.id, sellerId);
              const updatedChats = await getConversations(user.id);
              setChats(updatedChats);
              const newSelectedChat = updatedChats.find((c: any) => c.id === conversation.id);
              if (newSelectedChat) { setSelectedChat(newSelectedChat); setShowMobileChat(true); await loadChatData(newSelectedChat); }
            } catch (error) { console.error('Error creating conversation with seller:', error); }
          }
        }
      } catch (error) { console.error('Error loading chats:', error); }
      setLoading(false);
    };

    loadChats();
  }, [user, chatId, sellerId]);

  // Realtime messages subscription
  useEffect(() => {
    if (!user || !selectedChat) return;

    const channelName = `chat-${selectedChat.id}-${Date.now()}`;
    const messagesChannel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${selectedChat.id}`
      }, async (payload) => {
        const msg = payload.new as any;
        
        let messageWithSender;
        if (msg.sender_id === user.id) {
          messageWithSender = {
            ...msg,
            sender: { user_id: user.id, name: user.user_metadata?.name || user.email, email: user.email }
          };
        } else {
          const senderProfile = await getProfile(msg.sender_id);
          messageWithSender = { ...msg, sender: senderProfile };
        }
        
        setMessages(prev => {
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, messageWithSender];
        });

        if (msg.sender_id !== user.id) {
          if (selectedChat?.id === msg.conversation_id) {
            try {
              await markMessagesAsRead(msg.conversation_id, user.id);
              setChatUnreadCounts(prev => ({ ...prev, [msg.conversation_id]: 0 }));
            } catch {}
          } else {
            setChatUnreadCounts(prev => ({ ...prev, [msg.conversation_id]: (prev[msg.conversation_id] || 0) + 1 }));
          }
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${selectedChat.id}`
      }, (payload) => {
        const updated = payload.new as any;
        setMessages(prev => prev.map(m => m.id === updated.id ? { ...m, ...updated } : m));
      })
      .subscribe();

    return () => { supabase.removeChannel(messagesChannel); };
  }, [user?.id, selectedChat?.id]);

  // Realtime conversations subscription  
  useEffect(() => {
    if (!user) return;

    const conversationChannel = supabase
      .channel(`conversations-${user.id}-${Date.now()}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
      }, async (payload) => {
        // Any message change -> refresh conversation list
        try {
          const updatedChats = await getConversations(user.id);
          setChats(updatedChats);
          
          const unreadCounts: {[key: string]: number} = {};
          for (const chat of updatedChats) {
            try { unreadCounts[chat.id] = await getUnreadMessagesCountForConversation(chat.id, user.id); } catch { unreadCounts[chat.id] = 0; }
          }
          setChatUnreadCounts(unreadCounts);
        } catch {}
      })
      .subscribe();

    return () => { supabase.removeChannel(conversationChannel); };
  }, [user?.id]);

  // Presence tracking
  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel('user-presence', {
      config: { presence: { key: user.id } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        if (otherUser) setOtherUserOnline(!!state[otherUser.user_id]);
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        if (otherUser && key === otherUser.user_id) setOtherUserOnline(true);
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        if (otherUser && key === otherUser.user_id) setOtherUserOnline(false);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user_id: user.id, online_at: new Date().toISOString() });
        }
      });

    setPresenceChannel(channel);
    return () => { channel.untrack(); supabase.removeChannel(channel); };
  }, [user]);

  useEffect(() => {
    if (presenceChannel && otherUser) {
      setOtherUserOnline(!!presenceChannel.presenceState()[otherUser.user_id]);
    }
  }, [otherUser, presenceChannel]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const loadChatData = async (chat: any) => {
    try {
      const chatMessages = await getMessages(chat.id);
      setMessages(chatMessages);

      if (user) {
        await markMessagesAsRead(chat.id, user.id);
        setChatUnreadCounts(prev => ({ ...prev, [chat.id]: 0 }));
        window.dispatchEvent(new CustomEvent('notifications:changed'));
      }

      if (chat.other_user) {
        setOtherUser(chat.other_user);
      } else {
        const otherUserId = chat.user1_id === user?.id ? chat.user2_id : chat.user1_id;
        setOtherUser(await getProfile(otherUserId));
      }
    } catch (error) { console.error('Error loading chat data:', error); }
  };

  const handleChatSelect = async (chat: any) => {
    setSelectedChat(chat);
    setShowMobileChat(true);
    await loadChatData(chat);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !user) return;

    const messageContent = newMessage.trim();
    setNewMessage('');

    try {
      const sentMessage = await sendMessage(selectedChat.id, user.id, messageContent);
      const messageWithSender = {
        ...sentMessage,
        sender: { user_id: user.id, name: user.user_metadata?.name || user.email, email: user.email }
      };
      setMessages(prev => prev.some(msg => msg.id === sentMessage.id) ? prev : [...prev, messageWithSender]);
    } catch (error) {
      console.error('Error sending message:', error);
      setNewMessage(messageContent);
      toast({ title: "Erro", description: "Falha ao enviar mensagem. Tente novamente.", variant: "destructive" });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
  };

  const filteredChats = chats.filter(chat => {
    if (!searchQuery) return true;
    const name = chat.other_user?.name || chat.other_user?.email || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const formatMessageDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    if (days === 1) return 'Ontem';
    if (days < 7) return date.toLocaleDateString('pt-BR', { weekday: 'short' });
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Carregando conversas...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <MessageCircle className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Faça login para conversar</h2>
          <p className="text-muted-foreground">Você precisa estar logado para ver suas mensagens.</p>
          <Button onClick={() => onNavigate('auth')} className="bg-primary hover:bg-primary/90">
            Fazer Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="h-screen flex flex-col">
        {/* Top bar */}
        <div className="border-b bg-card px-4 py-3 flex items-center gap-3 shrink-0">
          <Button variant="ghost" size="icon" onClick={() => onNavigate('home')} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-semibold text-foreground">Mensagens</h1>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Conversation sidebar */}
          <div className={`w-full md:w-96 border-r bg-card flex flex-col shrink-0 ${showMobileChat ? 'hidden md:flex' : 'flex'}`}>
            {/* Search */}
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar conversa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/30 h-9 text-sm"
                />
              </div>
            </div>

            {/* Chat list */}
            <div className="flex-1 overflow-y-auto">
              {filteredChats.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-3">
                    <MessageCircle className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {searchQuery ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}
                  </p>
                </div>
              ) : (
                filteredChats.map((chat) => {
                  const displayName = chat.other_user?.name || chat.other_user?.email || 'Usuário';
                  const unread = chatUnreadCounts[chat.id] || 0;
                  const isSelected = selectedChat?.id === chat.id;
                  const isOnline = presenceChannel?.presenceState()[chat.other_user?.user_id];
                  
                  return (
                    <div
                      key={chat.id}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-150 border-l-3
                        ${isSelected 
                          ? 'bg-primary/5 border-l-primary' 
                          : 'border-l-transparent hover:bg-muted/40'
                        }
                        ${unread > 0 ? 'bg-primary/[0.02]' : ''}
                      `}
                      onClick={() => handleChatSelect(chat)}
                    >
                      <div className="relative shrink-0">
                        <Avatar className="w-12 h-12 ring-2 ring-border">
                          <AvatarImage src={chat.other_user?.avatar_url || ""} alt={displayName} />
                          <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
                            {getInitials(displayName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-card ${
                          isOnline ? 'bg-emerald-500' : 'bg-muted-foreground/30'
                        }`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`truncate text-sm ${unread > 0 ? 'font-semibold text-foreground' : 'font-medium text-foreground/80'}`}>
                            {displayName}
                          </p>
                          <span className="text-xs text-muted-foreground shrink-0 ml-2">
                            {formatMessageDate(chat.last_message_at)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-0.5">
                          <p className="text-xs text-muted-foreground truncate">
                            {isOnline ? '🟢 Online' : 'Offline'}
                          </p>
                          {unread > 0 && (
                            <Badge className="bg-primary text-primary-foreground h-5 min-w-[20px] flex items-center justify-center text-[10px] font-bold rounded-full px-1.5">
                              {unread > 99 ? '99+' : unread}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat area */}
          <div className={`flex-1 flex flex-col bg-background ${!showMobileChat ? 'hidden md:flex' : 'flex'}`}>
            {selectedChat && otherUser ? (
              <>
                {/* Chat header */}
                <div className="px-4 py-3 border-b bg-card flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="md:hidden text-muted-foreground" 
                      onClick={() => setShowMobileChat(false)}
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div className="relative">
                      <Avatar className="w-10 h-10 ring-2 ring-border">
                        <AvatarImage src={otherUser?.avatar_url || ""} alt={otherUser?.name || 'Usuário'} />
                        <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
                          {getInitials(otherUser?.name || otherUser?.email || 'U')}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card ${
                        otherUserOnline ? 'bg-emerald-500' : 'bg-muted-foreground/30'
                      }`} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">{otherUser?.name || otherUser?.email || 'Usuário'}</p>
                      <p className={`text-xs ${otherUserOnline ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                        {otherUserOnline ? 'Online agora' : 'Offline'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages area */}
                <div 
                  ref={messagesContainerRef}
                  className="flex-1 overflow-y-auto px-4 py-6"
                  style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, hsl(var(--muted) / 0.3) 0%, transparent 70%)' }}
                >
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <div className="w-24 h-24 rounded-full bg-primary/5 flex items-center justify-center mb-4">
                        <MessageCircle className="w-12 h-12 text-primary/30" />
                      </div>
                      <h3 className="font-medium text-foreground/70 mb-1">Nenhuma mensagem ainda</h3>
                      <p className="text-sm text-muted-foreground">Envie a primeira mensagem para iniciar a conversa!</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-w-3xl mx-auto">
                      {messages.map((message, index) => {
                        const isOwn = message.sender_id === user?.id;
                        const senderName = message.sender?.name || message.sender?.email || 'Usuário';
                        const showAvatar = index === 0 || messages[index - 1]?.sender_id !== message.sender_id;
                        const isLastInGroup = index === messages.length - 1 || messages[index + 1]?.sender_id !== message.sender_id;
                        
                        return (
                          <div
                            key={message.id}
                            className={`flex items-end gap-2 ${isOwn ? 'justify-end' : 'justify-start'} ${!isLastInGroup ? 'mb-0.5' : ''}`}
                          >
                            {!isOwn && (
                              <div className="w-7 shrink-0">
                                {showAvatar ? (
                                  <Avatar className="w-7 h-7">
                                    <AvatarImage src={message.sender?.avatar_url || ""} alt={senderName} />
                                    <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-medium">
                                      {getInitials(senderName)}
                                    </AvatarFallback>
                                  </Avatar>
                                ) : null}
                              </div>
                            )}
                            
                            <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}>
                              <div
                                className={`px-3.5 py-2 text-sm leading-relaxed break-words
                                  ${isOwn
                                    ? `bg-primary text-primary-foreground ${
                                        showAvatar && isLastInGroup ? 'rounded-2xl rounded-br-md' :
                                        showAvatar ? 'rounded-2xl rounded-br-md' :
                                        isLastInGroup ? 'rounded-2xl rounded-br-md' :
                                        'rounded-2xl'
                                      }`
                                    : `bg-card border border-border text-foreground shadow-sm ${
                                        showAvatar && isLastInGroup ? 'rounded-2xl rounded-bl-md' :
                                        showAvatar ? 'rounded-2xl rounded-bl-md' :
                                        isLastInGroup ? 'rounded-2xl rounded-bl-md' :
                                        'rounded-2xl'
                                      }`
                                  }`}
                              >
                                {message.content}
                              </div>
                              {isLastInGroup && (
                                <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                  <span className="text-[10px] text-muted-foreground">
                                    {new Date(message.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                  {isOwn && (
                                    message.read 
                                      ? <CheckCheck className="w-3 h-3 text-primary" />
                                      : <Check className="w-3 h-3 text-muted-foreground" />
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* Message input */}
                <div className="px-4 py-3 border-t bg-card shrink-0">
                  <div className="flex items-center gap-2 max-w-3xl mx-auto">
                    <div className="flex-1 relative">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Digite uma mensagem..."
                        className="rounded-full bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/30 pr-4 h-11 text-sm"
                      />
                    </div>
                    <Button 
                      onClick={handleSendMessage} 
                      disabled={!newMessage.trim()}
                      size="icon"
                      className="rounded-full w-11 h-11 bg-primary hover:bg-primary/90 shadow-md shrink-0 disabled:opacity-40"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-28 h-28 rounded-full bg-primary/5 flex items-center justify-center mx-auto">
                    <MessageCircle className="w-14 h-14 text-primary/20" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground/70">Selecione uma conversa</h3>
                    <p className="text-sm text-muted-foreground mt-1">Escolha uma conversa ao lado para começar</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
