import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  getConversations,
  getMessages,
  sendMessage,
  getProfile,
  getWasteItem,
  getOrCreateConversation
} from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Chat, ChatMessage, User, WasteItem } from '@/types';
import { ArrowLeft, Send, MessageCircle } from 'lucide-react';

interface MessagesPageProps {
  onNavigate: (page: string) => void;
  chatId?: string;
}

export const MessagesPage = ({ onNavigate, chatId }: MessagesPageProps) => {
  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUser, setOtherUser] = useState<any | null>(null);
  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuth();

  useEffect(() => {
    const loadChats = async () => {
      if (user) {
        try {
          const userChats = await getConversations(user.id);
          setChats(userChats);

          if (chatId) {
            const chat = userChats.find((c: any) => c.id === chatId);
            if (chat) {
              setSelectedChat(chat);
              await loadChatData(chat);
            }
          }
        } catch (error) {
          console.error('Error loading chats:', error);
        }
      }
      setLoading(false);
    };

    loadChats();
    
    // Check if we need to create a conversation with a seller
    const checkSellerConversation = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const sellerId = urlParams.get('sellerId');
      
      if (sellerId && user && sellerId !== user.id) {
        try {
          const conversation = await getOrCreateConversation(user.id, sellerId);
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
    };
    
    if (user) {
      checkSellerConversation();
    }
  }, [user, chatId]);

  const loadChatData = async (chat: any) => {
    try {
      const chatMessages = await getMessages(chat.id);
      setMessages(chatMessages);

      // Use other_user if available from getConversations, otherwise get profile
      if (chat.other_user) {
        setOtherUser(chat.other_user);
      } else {
        const otherUserId = chat.user1_id === user?.id ? chat.user2_id : chat.user1_id;
        const userProfile = await getProfile(otherUserId);
        setOtherUser(userProfile);
      }

      // Note: We'll need to add wasteItemId to conversations table or get it from another way
      // For now, we'll skip the product loading
      setProduct(null);
    } catch (error) {
      console.error('Error loading chat data:', error);
    }
  };

  const handleChatSelect = async (chat: any) => {
    setSelectedChat(chat);
    await loadChatData(chat);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !user) return;

    try {
      const message = await sendMessage(selectedChat.id, user.id, newMessage.trim());
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
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
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => onNavigate('home')}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Lista de conversas */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Conversas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {chats.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                Nenhuma conversa encontrada
              </div>
            ) : (
              <div className="space-y-0">
                {chats.map((chat) => {
                  const otherUserId = chat.user1_id === user.id ? chat.user2_id : chat.user1_id;
                  
                  return (
                    <div
                      key={chat.id}
                      className={`p-4 cursor-pointer hover:bg-muted/50 border-b ${
                        selectedChat?.id === chat.id ? 'bg-muted' : ''
                      }`}
                      onClick={() => handleChatSelect(chat)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src="" alt="Usuário" />
                          <AvatarFallback>
                            U
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">Conversa</p>
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
          </CardContent>
        </Card>

        {/* Área de mensagens */}
        <Card className="lg:col-span-2">
          {selectedChat ? (
            <>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src="" alt={otherUser.name} />
                    <AvatarFallback>
                      {otherUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{otherUser?.name || 'Usuário'}</p>
                    <p className="text-sm text-muted-foreground">Conversa</p>
                  </div>
                </div>
              </CardHeader>
              <Separator />
              
              {/* Mensagens */}
              <CardContent className="flex-1 p-4 max-h-96 overflow-y-auto">
                <div className="space-y-4">
                  {messages.map((message) => {
                    const isMyMessage = message.sender_id === user.id;
                    const senderName = isMyMessage ? (user.user_metadata?.name || user.email) : (otherUser?.name || 'Usuário');
                    
                    return (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${isMyMessage ? 'flex-row-reverse' : ''}`}
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarImage src="" alt={senderName} />
                          <AvatarFallback className="text-xs">
                            {senderName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`max-w-[70%] p-3 rounded-lg ${
                            isMyMessage
                              ? 'bg-eco-green text-white'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            isMyMessage ? 'text-white/70' : 'text-muted-foreground'
                          }`}>
                            {new Date(message.created_at).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
              
              {/* Input de nova mensagem */}
              <Separator />
              <div className="p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Digite sua mensagem..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-eco-green hover:bg-eco-green/90"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <MessageCircle className="w-16 h-16 mx-auto mb-4" />
                <p>Selecione uma conversa para começar</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};