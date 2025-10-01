import { useState, useEffect } from 'react';
import { Search, Menu, User, Heart, MessageCircle, Plus, ShoppingCart, Bell, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { getCartItems, getUnreadNotificationCount, getUnreadMessagesCount } from '@/lib/supabase';
import { supabase } from '@/integrations/supabase/client';
import ecoLogo from '@/assets/eco-marketplace-logo.png';
interface HeaderProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}
export const Header = ({
  onNavigate,
  currentPage
}: HeaderProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const { user, signOut } = useAuth();
  useEffect(() => {
    const loadCounts = async () => {
      if (user) {
        try {
          const cartItems = await getCartItems(user.id);
          setCartCount(cartItems.length);
          const unreadCount = await getUnreadNotificationCount(user.id);
          setNotificationCount(unreadCount);
          const unreadMsgCount = await getUnreadMessagesCount(user.id);
          setUnreadMessagesCount(unreadMsgCount);
        } catch (error) {
          console.error('Error loading counts:', error);
        }
      } else {
        setCartCount(0);
        setNotificationCount(0);
        setUnreadMessagesCount(0);
      }
    };
    
    loadCounts();

    // Set up real-time subscription to update unread messages count
    if (user) {
      const messagesChannel = supabase
        .channel(`header-messages-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages',
          },
          async () => {
            // Add delay to ensure database consistency
            setTimeout(async () => {
              try {
                const unreadMsgCount = await getUnreadMessagesCount(user.id);
                setUnreadMessagesCount(unreadMsgCount);
                console.log('🔄 Header unread count updated:', unreadMsgCount);
              } catch (error) {
                console.error('Error updating unread messages count:', error);
              }
            }, 100);
          }
        )
        .subscribe();

      // Set up real-time subscription for notifications
      const notificationsChannel = supabase
        .channel(`header-notifications-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          async () => {
            setTimeout(async () => {
              try {
                const unreadCount = await getUnreadNotificationCount(user.id);
                setNotificationCount(unreadCount);
                console.log('🔄 Header notification count updated:', unreadCount);
              } catch (error) {
                console.error('Error updating notification count:', error);
              }
            }, 100);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(messagesChannel);
        supabase.removeChannel(notificationsChannel);
      };
    }
  }, [user]);
  const handleLogout = async () => {
    await signOut();
    onNavigate('home');
  };
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onNavigate(`search?q=${encodeURIComponent(searchTerm)}`);
    }
  };
  return (
    <header className="bg-card/95 backdrop-blur-md border-b border-border/50 shadow-soft sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center h-20 gap-8">
          {/* Logo Section - Enhanced */}
          <div 
            className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-all duration-300" 
            onClick={() => onNavigate('home')}
          >
            <div className="relative">
              <img src={ecoLogo} alt="EcoChain" className="w-12 h-12 drop-shadow-sm" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-2xl font-bold text-eco-green leading-none tracking-tight">EcoChain</h1>
              <p className="text-sm text-eco-green/70 leading-none font-medium">Marketplace Sustentável</p>
            </div>
          </div>

          {/* Navigation Menu - Institutional */}
          <nav className="hidden lg:flex items-center gap-1 px-4">
            <div className="flex items-center gap-1 border-r border-border/50 pr-4 mr-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onNavigate('about')}
                className={`h-10 px-4 text-sm font-medium transition-all duration-200 ${
                  currentPage === 'about' 
                    ? 'bg-eco-green-light text-eco-green border-b-2 border-eco-green rounded-b-none' 
                    : 'hover:bg-eco-green-light/50 hover:text-eco-green'
                }`}
              >
                Sobre Nós
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onNavigate('services')}
                className={`h-10 px-4 text-sm font-medium transition-all duration-200 ${
                  currentPage === 'services' 
                    ? 'bg-eco-green-light text-eco-green border-b-2 border-eco-green rounded-b-none' 
                    : 'hover:bg-eco-green-light/50 hover:text-eco-green'
                }`}
              >
                Serviços
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onNavigate('news')}
                className={`h-10 px-4 text-sm font-medium transition-all duration-200 ${
                  currentPage === 'news' 
                    ? 'bg-eco-green-light text-eco-green border-b-2 border-eco-green rounded-b-none' 
                    : 'hover:bg-eco-green-light/50 hover:text-eco-green'
                }`}
              >
                Impacto
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onNavigate('announcements')}
                className={`h-10 px-4 text-sm font-medium transition-all duration-200 ${
                  currentPage === 'announcements' 
                    ? 'bg-eco-green-light text-eco-green border-b-2 border-eco-green rounded-b-none' 
                    : 'hover:bg-eco-green-light/50 hover:text-eco-green'
                }`}
              >
                Parcerias
              </Button>
            </div>
          </nav>

          {/* Search Bar - Enhanced */}
          <form onSubmit={handleSearch} className="flex-1 max-w-lg mx-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-eco-green/60 w-5 h-5" />
              <Input 
                type="text" 
                placeholder="Buscar materiais, resíduos, produtos..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="pl-12 pr-4 h-12 bg-eco-light/50 border-eco-green/20 rounded-full text-sm focus:ring-2 focus:ring-eco-green/30 focus:border-eco-green transition-all duration-200 placeholder:text-eco-green/50" 
              />
            </div>
          </form>

          {/* User Area Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* User Action Icons */}
                <div className="hidden md:flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onNavigate('cart')} 
                    className={`relative h-11 w-11 rounded-xl hover:bg-eco-green-light/50 transition-colors ${
                      currentPage === 'cart' ? 'bg-eco-green-light text-eco-green' : 'text-eco-green/70 hover:text-eco-green'
                    }`}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {cartCount > 0 && (
                      <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-eco-orange">
                        {cartCount}
                      </Badge>
                    )}
                  </Button>

                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onNavigate('favorites')} 
                    className={`h-11 w-11 rounded-xl hover:bg-eco-green-light/50 transition-colors ${
                      currentPage === 'favorites' ? 'bg-eco-green-light text-eco-green' : 'text-eco-green/70 hover:text-eco-green'
                    }`}
                  >
                    <Heart className="w-5 h-5" />
                  </Button>

                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onNavigate('messages')} 
                    className={`relative h-11 w-11 rounded-xl hover:bg-eco-green-light/50 transition-colors ${
                      currentPage === 'messages' ? 'bg-eco-green-light text-eco-green' : 'text-eco-green/70 hover:text-eco-green'
                    }`}
                  >
                    <MessageCircle className="w-5 h-5" />
                    {unreadMessagesCount > 0 && (
                      <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-eco-orange">
                        {unreadMessagesCount}
                      </Badge>
                    )}
                  </Button>

                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onNavigate('notifications')} 
                    className={`relative h-11 w-11 rounded-xl hover:bg-eco-green-light/50 transition-colors ${
                      currentPage === 'notifications' ? 'bg-eco-green-light text-eco-green' : 'text-eco-green/70 hover:text-eco-green'
                    }`}
                  >
                    <Bell className="w-5 h-5" />
                    {notificationCount > 0 && (
                      <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-eco-orange">
                        {notificationCount}
                      </Badge>
                    )}
                  </Button>
                </div>

                {/* Primary CTA Button */}
                <Button 
                  onClick={() => onNavigate('create-listing')} 
                  className="bg-gradient-eco hover:opacity-90 shadow-eco h-12 px-6 rounded-xl font-medium text-white transition-all duration-200 hover:shadow-lg hover:scale-105"
                >
                  <Plus className="w-5 h-5" />
                  <span className="hidden sm:inline ml-2">Anunciar</span>
                </Button>

                {/* User Avatar Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-12 w-12 rounded-xl hover:bg-eco-green-light/50 transition-colors border-2 border-eco-green/20">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="" alt={user?.user_metadata?.name || user?.email || ''} />
                        <AvatarFallback className="bg-eco-green text-white text-sm font-semibold">
                          {(user?.user_metadata?.name || user?.email || 'U').split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium text-sm">{user?.user_metadata?.name || 'Usuário'}</p>
                        <p className="w-[200px] truncate text-xs text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onNavigate('profile')}>
                      <User className="mr-2 h-4 w-4" />
                      Meu Perfil
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onNavigate('my-listings')}>
                      <Menu className="mr-2 h-4 w-4" />
                      Meus Anúncios
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onNavigate('transactions')}>
                      <Menu className="mr-2 h-4 w-4" />
                      Transações
                    </DropdownMenuItem>
                    
                    {/* Mobile-only navigation items */}
                    <div className="md:hidden">
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onNavigate('cart')} className="relative">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Carrinho
                        {cartCount > 0 && (
                          <Badge variant="destructive" className="ml-auto h-5 w-5 flex items-center justify-center p-0 text-xs">
                            {cartCount}
                          </Badge>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onNavigate('favorites')}>
                        <Heart className="mr-2 h-4 w-4" />
                        Favoritos
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onNavigate('messages')} className="relative">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Mensagens
                        {unreadMessagesCount > 0 && (
                          <Badge variant="destructive" className="ml-auto h-5 w-5 flex items-center justify-center p-0 text-xs">
                            {unreadMessagesCount}
                          </Badge>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onNavigate('notifications')} className="relative">
                        <Bell className="mr-2 h-4 w-4" />
                        Notificações
                        {notificationCount > 0 && (
                          <Badge variant="destructive" className="ml-auto h-5 w-5 flex items-center justify-center p-0 text-xs">
                            {notificationCount}
                          </Badge>
                        )}
                      </DropdownMenuItem>
                    </div>

                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onNavigate('auth')}
                  className="h-11 px-6 rounded-xl hover:bg-eco-green-light/50 text-eco-green font-medium transition-all duration-200"
                >
                  Entrar
                </Button>
                <Button 
                  onClick={() => onNavigate('auth')} 
                  className="bg-gradient-eco hover:opacity-90 h-11 px-6 rounded-xl font-medium text-white shadow-eco transition-all duration-200 hover:shadow-lg hover:scale-105"
                >
                  Cadastrar
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};