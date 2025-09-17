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
      <div className="min-h-screen bg-gradient-to-br from-eco-green-light/20 to-eco-brown-light/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-eco-green mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando materiais...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (hasError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-eco-green-light/20 to-eco-brown-light/20 flex items-center justify-center">
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
    <div className="min-h-screen bg-gradient-to-br from-eco-green-light/20 to-eco-brown-light/20">
      {/* Hero Section */}
      <section className="relative py-24 px-4 bg-gradient-to-br from-eco-light/30 via-background to-eco-cream/20">
        <div className="container mx-auto text-center">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
                Transforme <span className="text-eco-green bg-gradient-to-r from-eco-green to-eco-green-dark bg-clip-text text-transparent">Resíduos</span> em{' '}
                <span className="text-eco-blue bg-gradient-to-r from-eco-blue to-eco-green bg-clip-text text-transparent">Recursos</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-10 leading-relaxed max-w-4xl mx-auto font-light">
                O marketplace sustentável que conecta quem tem sobras industriais e materiais 
                recicláveis com quem precisa. Reduza desperdício, economize dinheiro e 
                ajude o meio ambiente.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Button
                size="lg"
                onClick={() => onNavigate('auth')}
                className="bg-gradient-eco hover:opacity-90 shadow-eco text-lg px-10 py-7 rounded-2xl font-semibold text-white transition-all duration-300 hover:shadow-xl hover:scale-105"
              >
                <TrendingUp className="w-5 h-5 mr-2" />
                Começar Agora
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => onNavigate('about')}
                className="text-lg px-10 py-7 rounded-2xl border-2 border-eco-green text-eco-green hover:bg-eco-green-light font-semibold transition-all duration-300 hover:shadow-lg"
              >
                <Search className="w-5 h-5 mr-2" />
                Como Funciona
              </Button>
            </div>

            {/* Enhanced Impact Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <Card className="bg-card/80 backdrop-blur-sm border-eco-green/30 rounded-3xl shadow-soft hover:shadow-eco transition-all duration-300 hover:scale-105 group">
                <CardContent className="flex flex-col items-center p-8">
                  <div className="p-4 bg-eco-green-light rounded-2xl mb-4 group-hover:bg-eco-green-light/80 transition-colors">
                    <Recycle className="w-8 h-8 text-eco-green" />
                  </div>
                  <div className="text-3xl font-bold text-eco-green mb-2">
                    {formatNumber(ecoImpact.totalWasteReused)}kg
                  </div>
                  <div className="text-sm text-muted-foreground text-center font-medium">
                    Resíduos Reaproveitados
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/80 backdrop-blur-sm border-eco-blue/30 rounded-3xl shadow-soft hover:shadow-eco transition-all duration-300 hover:scale-105 group">
                <CardContent className="flex flex-col items-center p-8">
                  <div className="p-4 bg-eco-blue/20 rounded-2xl mb-4 group-hover:bg-eco-blue/30 transition-colors">
                    <Leaf className="w-8 h-8 text-eco-blue" />
                  </div>
                  <div className="text-3xl font-bold text-eco-blue mb-2">
                    {formatNumber(ecoImpact.co2Saved)}kg
                  </div>
                  <div className="text-sm text-muted-foreground text-center font-medium">
                    CO₂ Economizado
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/80 backdrop-blur-sm border-eco-orange/30 rounded-3xl shadow-soft hover:shadow-eco transition-all duration-300 hover:scale-105 group">
                <CardContent className="flex flex-col items-center p-8">
                  <div className="p-4 bg-eco-orange/20 rounded-2xl mb-4 group-hover:bg-eco-orange/30 transition-colors">
                    <Users className="w-8 h-8 text-eco-orange" />
                  </div>
                  <div className="text-3xl font-bold text-eco-orange mb-2">
                    {formatNumber(ecoImpact.transactionsCount)}
                  </div>
                  <div className="text-sm text-muted-foreground text-center font-medium">
                    Transações Realizadas
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-20 px-4 bg-eco-cream/30">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Filters */}
            <div className="lg:w-80 flex-shrink-0">
              <div className="lg:hidden mb-6">
                <Button
                  onClick={() => setShowFilters(true)}
                  variant="outline"
                  className="w-full h-12 rounded-xl border-eco-green/30 text-eco-green hover:bg-eco-green-light"
                >
                  <Filter className="w-5 h-5 mr-2" />
                  Filtros Avançados
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
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-foreground mb-3">
                    Materiais Disponíveis
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    {formatNumber(filteredItems.length)} materiais sustentáveis encontrados
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="bg-eco-green-light text-eco-green px-4 py-2 rounded-full font-medium">
                    <TrendingUp className="w-4 h-4 mr-2" />
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