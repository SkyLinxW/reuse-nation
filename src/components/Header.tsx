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

      return () => {
        supabase.removeChannel(messagesChannel);
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
    <header className="bg-card border-b border-border shadow-soft sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center h-16 gap-6">
          {/* Logo Section */}
          <div 
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" 
            onClick={() => onNavigate('home')}
          >
            <img src={ecoLogo} alt="EcoChain" className="w-10 h-10" />
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-eco-green leading-tight">EcoChain</h1>
              <p className="text-xs text-muted-foreground leading-tight">Resíduos Sustentáveis</p>
            </div>
          </div>

          {/* Search Bar - Central */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                type="text" 
                placeholder="Buscar resíduos, materiais..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="pl-10 h-10 bg-secondary/50 border-border focus:ring-eco-green focus:border-eco-green transition-all" 
              />
            </div>
          </form>

          {/* Navigation Links - Desktop Only */}
          <nav className="hidden xl:flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onNavigate('about')}
              className={`h-9 px-3 ${currentPage === 'about' ? 'bg-eco-green-light text-eco-green' : 'hover:bg-muted'}`}
            >
              Sobre
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onNavigate('services')}
              className={`h-9 px-3 ${currentPage === 'services' ? 'bg-eco-green-light text-eco-green' : 'hover:bg-muted'}`}
            >
              Serviços
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onNavigate('news')}
              className={`h-9 px-3 ${currentPage === 'news' ? 'bg-eco-green-light text-eco-green' : 'hover:bg-muted'}`}
            >
              Impacto
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onNavigate('announcements')}
              className={`h-9 px-3 ${currentPage === 'announcements' ? 'bg-eco-green-light text-eco-green' : 'hover:bg-muted'}`}
            >
              Parcerias
            </Button>
          </nav>

          {/* User Actions */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                {/* Action Buttons */}
                <div className="hidden md:flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onNavigate('cart')} 
                    className={`relative h-9 px-3 ${currentPage === 'cart' ? 'bg-eco-green-light text-eco-green' : 'hover:bg-muted'}`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span className="hidden lg:inline ml-2">Carrinho</span>
                    {cartCount > 0 && (
                      <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                        {cartCount}
                      </Badge>
                    )}
                  </Button>

                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onNavigate('favorites')} 
                    className={`h-9 px-3 ${currentPage === 'favorites' ? 'bg-eco-green-light text-eco-green' : 'hover:bg-muted'}`}
                  >
                    <Heart className="w-4 h-4" />
                    <span className="hidden lg:inline ml-2">Favoritos</span>
                  </Button>

                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onNavigate('messages')} 
                    className={`relative h-9 px-3 ${currentPage === 'messages' ? 'bg-eco-green-light text-eco-green' : 'hover:bg-muted'}`}
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="hidden lg:inline ml-2">Mensagens</span>
                    {unreadMessagesCount > 0 && (
                      <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                        {unreadMessagesCount}
                      </Badge>
                    )}
                  </Button>

                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onNavigate('notifications')} 
                    className={`relative h-9 px-3 ${currentPage === 'notifications' ? 'bg-eco-green-light text-eco-green' : 'hover:bg-muted'}`}
                  >
                    <Bell className="w-4 h-4" />
                    <span className="hidden lg:inline ml-2">Notificações</span>
                    {notificationCount > 0 && (
                      <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                        {notificationCount}
                      </Badge>
                    )}
                  </Button>
                </div>

                {/* Primary CTA */}
                <Button 
                  onClick={() => onNavigate('create-listing')} 
                  className="bg-gradient-eco hover:opacity-90 shadow-eco h-9 px-4"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline ml-2">Anunciar</span>
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full hover:bg-muted">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="" alt={user?.user_metadata?.name || user?.email || ''} />
                        <AvatarFallback className="bg-eco-green text-white text-sm">
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
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onNavigate('auth')}
                  className="h-9 px-4 hover:bg-muted"
                >
                  Entrar
                </Button>
                <Button 
                  onClick={() => onNavigate('auth')} 
                  className="bg-gradient-eco hover:opacity-90 h-9 px-4"
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