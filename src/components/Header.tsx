import { useState, useEffect } from 'react';
import { Search, Menu, User, Heart, MessageCircle, Plus, ShoppingCart, Bell, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  getCurrentUser, 
  setCurrentUser, 
  getCartItems, 
  getUnreadNotificationCount 
} from '@/lib/localStorage';
import ecoLogo from '@/assets/eco-marketplace-logo.png';

interface HeaderProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export const Header = ({ onNavigate, currentPage }: HeaderProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const currentUser = getCurrentUser();

  useEffect(() => {
    if (currentUser) {
      setCartCount(getCartItems(currentUser.id).length);
      setNotificationCount(getUnreadNotificationCount(currentUser.id));
    } else {
      setCartCount(0);
      setNotificationCount(0);
    }
  }, [currentUser]);

  const handleLogout = () => {
    setCurrentUser(null);
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
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => onNavigate('home')}
          >
            <img src={ecoLogo} alt="EcoMarket" className="w-10 h-10" />
            <div>
              <h1 className="text-xl font-bold text-eco-green">EcoMarket</h1>
              <p className="text-xs text-muted-foreground">Resíduos Sustentáveis</p>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Buscar resíduos, materiais..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-secondary/50 border-border focus:ring-eco-green"
              />
            </div>
          </form>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            {currentUser ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate('cart')}
                  className={`relative ${currentPage === 'cart' ? 'bg-eco-green-light' : ''}`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  {cartCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {cartCount}
                    </Badge>
                  )}
                  <span className="hidden md:inline ml-2">Carrinho</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate('notifications')}
                  className={`relative ${currentPage === 'notifications' ? 'bg-eco-green-light' : ''}`}
                >
                  <Bell className="w-4 h-4" />
                  {notificationCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {notificationCount}
                    </Badge>
                  )}
                  <span className="hidden md:inline ml-2">Notificações</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate('favorites')}
                  className={currentPage === 'favorites' ? 'bg-eco-green-light' : ''}
                >
                  <Heart className="w-4 h-4" />
                  <span className="hidden md:inline ml-2">Favoritos</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate('messages')}
                  className={currentPage === 'messages' ? 'bg-eco-green-light' : ''}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="hidden md:inline ml-2">Mensagens</span>
                </Button>

                <Button
                  onClick={() => onNavigate('create-listing')}
                  className="bg-gradient-eco hover:opacity-90 shadow-eco"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden md:inline ml-2">Anunciar</span>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="" alt={currentUser.name} />
                        <AvatarFallback className="bg-eco-green text-white">
                          {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{currentUser.name}</p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {currentUser.email}
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
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => onNavigate('login')}
                >
                  Entrar
                </Button>
                <Button
                  onClick={() => onNavigate('register')}
                  className="bg-gradient-eco hover:opacity-90"
                >
                  Cadastrar
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};