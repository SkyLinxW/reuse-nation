import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  getCurrentUser, 
  getUserChats, 
  getChatMessages, 
  saveChatMessage,
  getUserById,
  getWasteItemById
} from '@/lib/localStorage';
import { Chat, ChatMessage, User, WasteItem } from '@/types';
import { ArrowLeft, Send, MessageCircle } from 'lucide-react';

interface MessagesPageProps {
  onNavigate: (page: string) => void;
  chatId?: string;
}

export const MessagesPage = ({ onNavigate, chatId }: MessagesPageProps) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [product, setProduct] = useState<WasteItem | null>(null);
  
  const currentUser = getCurrentUser();

  useEffect(() => {
    if (currentUser) {
      const userChats = getUserChats(currentUser.id);
      setChats(userChats);

      if (chatId) {
        const chat = userChats.find(c => c.id === chatId);
        if (chat) {
          setSelectedChat(chat);
          loadChatData(chat);
        }
      }
    }
  }, [currentUser, chatId]);

  const loadChatData = (chat: Chat) => {
    const chatMessages = getChatMessages(chat.id);
    setMessages(chatMessages);

    const otherUserId = chat.buyerId === currentUser?.id ? chat.sellerId : chat.buyerId;
    const user = getUserById(otherUserId);
    setOtherUser(user);

    const wasteItem = getWasteItemById(chat.wasteItemId);
    setProduct(wasteItem);
  };

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat);
    loadChatData(chat);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChat || !currentUser) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      chatId: selectedChat.id,
      senderId: currentUser.id,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      read: false
    };

    saveChatMessage(message);
    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Você precisa estar logado para ver suas mensagens.
            </p>
            <Button onClick={() => onNavigate('login')}>
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
                  const otherUserId = chat.buyerId === currentUser.id ? chat.sellerId : chat.buyerId;
                  const user = getUserById(otherUserId);
                  const wasteItem = getWasteItemById(chat.wasteItemId);
                  
                  if (!user || !wasteItem) return null;

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
                          <AvatarImage src="" alt={user.name} />
                          <AvatarFallback>
                            {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{user.name}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {wasteItem.title}
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
          {selectedChat && otherUser && product ? (
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
                    <p className="font-medium">{otherUser.name}</p>
                    <p className="text-sm text-muted-foreground">{product.title}</p>
                  </div>
                </div>
              </CardHeader>
              <Separator />
              
              {/* Mensagens */}
              <CardContent className="flex-1 p-4 max-h-96 overflow-y-auto">
                <div className="space-y-4">
                  {messages.map((message) => {
                    const isMyMessage = message.senderId === currentUser.id;
                    const sender = isMyMessage ? currentUser : otherUser;
                    
                    return (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${isMyMessage ? 'flex-row-reverse' : ''}`}
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarImage src="" alt={sender.name} />
                          <AvatarFallback className="text-xs">
                            {sender.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
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
                            {new Date(message.timestamp).toLocaleTimeString('pt-BR', {
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