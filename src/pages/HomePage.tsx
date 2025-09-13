import { useState, useEffect } from 'react';
import { Search, Filter, TrendingUp, Leaf, Recycle, Users } from 'lucide-react';
import { SearchBar } from '@/components/SearchBar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WasteCard } from '@/components/WasteCard';
import { FilterSidebar, FilterState } from '@/components/FilterSidebar';
import { getWasteItems, getEcoImpact, getRecentSearches } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export const HomePage = ({ onNavigate }: HomePageProps) => {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [ecoImpact, setEcoImpact] = useState({ totalWasteReused: 0, co2Saved: 0, transactionsCount: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  console.log('HomePage render, user:', user?.id, 'loading:', isLoading);

  useEffect(() => {
    console.log('HomePage useEffect triggered, user:', user?.id);
    
    const loadData = async () => {
      try {
        setIsLoading(true);
        setHasError(false);
        console.log('Starting to load waste items...');
        const wasteItems = await getWasteItems();
        console.log('Loaded waste items:', wasteItems?.length);
        
        // Transform the data from database format to frontend interface
        const transformedItems = wasteItems.map(item => ({
          ...item,
          sellerId: item.user_id,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
          isActive: item.availability,
          views: 0,
          favorites: 0,
          images: item.image_url ? [item.image_url] : [],
          location: typeof item.location === 'string' 
            ? { city: item.location, state: '' }
            : item.location || { city: 'Não informado', state: '' }
        }));
        const activeItems = transformedItems.filter(item => item.availability);
        console.log('Active items after transformation:', activeItems.length);
        setItems(activeItems);
        setFilteredItems(activeItems);
      } catch (error) {
        console.error('Error loading waste items:', error);
        setHasError(true);
        // Set empty arrays to prevent white screen
        setItems([]);
        setFilteredItems([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    const loadEcoImpact = async () => {
      try {
        const impact = await getEcoImpact();
        setEcoImpact(impact);
      } catch (error) {
        console.error('Error loading eco impact:', error);
      }
    };
    
    const loadRecentSearches = async () => {
      if (user) {
        try {
          const searches = await getRecentSearches(user.id);
          setRecentSearches(searches);
        } catch (error) {
          console.error('Error loading recent searches:', error);
        }
      }
    };
    
    loadData();
    loadEcoImpact();
    loadRecentSearches();
  }, [user]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    applyFilters(term);
  };

  const applyFilters = (searchTerm?: string) => {
    let filtered = [...items];

    // Search term filter
    const searchTermToUse = searchTerm ?? '';
    if (searchTermToUse) {
      const searchLower = searchTermToUse.toLowerCase();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower) ||
        item.category.toLowerCase().includes(searchLower) ||
        item.subcategory.toLowerCase().includes(searchLower)
      );
    }

    setFilteredItems(filtered);
  };

  const handleFiltersChange = (filters: FilterState) => {
    let filtered = [...items];

    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower) ||
        item.category.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(item => filters.categories.includes(item.category));
    }

    // Condition filter
    if (filters.conditions.length > 0) {
      filtered = filtered.filter(item => filters.conditions.includes(item.condition));
    }

    // Price range filter
    filtered = filtered.filter(item =>
      item.price >= filters.priceRange[0] && item.price <= filters.priceRange[1]
    );

    // Location filter
    if (filters.location) {
      const locationLower = filters.location.toLowerCase();
      filtered = filtered.filter(item =>
        item.location.city.toLowerCase().includes(locationLower) ||
        item.location.state.toLowerCase().includes(locationLower)
      );
    }

    // Sort
    switch (filters.sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'views':
        filtered.sort((a, b) => b.views - a.views);
        break;
    }

    setFilteredItems(filtered);
  };

  const handleItemClick = (id: string) => {
    onNavigate(`item/${id}`);
  };

  const handleContactSeller = async (sellerId: string, itemId: string) => {
    if (!user) {
      onNavigate('auth');
      return;
    }
    
    try {
      const { getOrCreateConversation } = await import('@/lib/supabase');
      const conversation = await getOrCreateConversation(user.id, sellerId);
      onNavigate(`messages?conversationId=${conversation.id}`);
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-BR').format(num);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando materiais...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (hasError) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <Card className="max-w-md mx-auto m-4">
          <CardContent className="text-center p-8">
            <div className="text-red-500 mb-4">⚠️</div>
            <h3 className="text-lg font-semibold mb-2">Erro ao carregar</h3>
            <p className="text-muted-foreground mb-4">
              Houve um problema ao carregar os materiais. Tente recarregar a página.
            </p>
            <Button onClick={() => window.location.reload()}>
              Recarregar Página
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-primary">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Transforme <span className="text-primary">Resíduos</span> em{' '}
              <span className="text-secondary">Recursos</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              O marketplace sustentável que conecta quem tem sobras industriais e materiais 
              recicláveis com quem precisa. Reduza desperdício, economize dinheiro e 
              ajude o meio ambiente.
            </p>
            
            {/* Search Bar - Removed from home, moved to header */}
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                size="lg"
                onClick={() => user ? onNavigate('create-listing') : onNavigate('auth')}
                variant="premium"
                className="shadow-elegant text-lg px-8 py-6"
              >
                {user ? 'Criar Anúncio' : 'Começar Agora'}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => onNavigate('search')}
                className="text-lg px-8 py-6 border-primary text-primary hover:bg-accent"
              >
                {user ? 'Explorar Materiais' : 'Como Funciona'}
              </Button>
            </div>

            {/* Impact Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <Card className="bg-card/50 backdrop-blur border-primary/20">
                <CardContent className="flex flex-col items-center p-6">
                  <Recycle className="w-12 h-12 text-primary mb-3" />
                  <div className="text-2xl font-bold text-primary">
                    {formatNumber(ecoImpact.totalWasteReused)}kg
                  </div>
                  <div className="text-sm text-muted-foreground text-center">
                    Resíduos Reaproveitados
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur border-secondary/20">
                <CardContent className="flex flex-col items-center p-6">
                  <Leaf className="w-12 h-12 text-secondary mb-3" />
                  <div className="text-2xl font-bold text-secondary">
                    {formatNumber(ecoImpact.co2Saved)}kg
                  </div>
                  <div className="text-sm text-muted-foreground text-center">
                    CO₂ Economizado
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur border-accent/20">
                <CardContent className="flex flex-col items-center p-6">
                  <Users className="w-12 h-12 text-accent mb-3" />
                  <div className="text-2xl font-bold text-accent">
                    {formatNumber(ecoImpact.transactionsCount)}
                  </div>
                  <div className="text-sm text-muted-foreground text-center">
                    Transações Realizadas
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 px-4 bg-background/80 backdrop-blur">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters */}
            <div className="lg:w-80 flex-shrink-0">
              <div className="lg:hidden mb-4">
                <Button
                  onClick={() => setShowFilters(true)}
                  variant="outline"
                  className="w-full"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                </Button>
              </div>
              
              <div className="hidden lg:block">
                <FilterSidebar
                  isOpen={true}
                  onClose={() => {}}
                  onFiltersChange={handleFiltersChange}
                />
              </div>
            </div>

            {/* Products Grid */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Materiais Disponíveis
                  </h2>
                  <p className="text-muted-foreground">
                    {formatNumber(filteredItems.length)} materiais encontrados
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-accent/20 text-accent border-accent/20">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Novos materiais diariamente
                  </Badge>
                </div>
              </div>

              {filteredItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredItems.map(item => (
                    <WasteCard
                      key={item.id}
                      waste={item}
                      onNavigate={onNavigate}
                      onItemClick={handleItemClick}
                      onContactSeller={handleContactSeller}
                    />
                  ))}
                </div>
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      Nenhum material encontrado
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Tente ajustar os filtros ou fazer uma busca diferente.
                    </p>
                    <Button
                      onClick={() => window.location.reload()}
                      variant="outline"
                    >
                      Limpar Filtros
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Filter Sidebar */}
      {showFilters && (
        <FilterSidebar
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          onFiltersChange={handleFiltersChange}
        />
      )}
    </div>
  );
};