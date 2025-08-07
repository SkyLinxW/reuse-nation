import { useState, useEffect } from 'react';
import { Search, Filter, TrendingUp, Leaf, Recycle, Users } from 'lucide-react';
import { SearchBar } from '@/components/SearchBar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WasteCard } from '@/components/WasteCard';
import { FilterSidebar, FilterState } from '@/components/FilterSidebar';
import { getWasteItems, getEcoImpact, initializeDemoData } from '@/lib/localStorage';
import { WasteItem } from '@/types';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export const HomePage = ({ onNavigate }: HomePageProps) => {
  const [items, setItems] = useState<WasteItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<WasteItem[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [ecoImpact] = useState(() => getEcoImpact());

  useEffect(() => {
    initializeDemoData();
    const wasteItems = getWasteItems().filter(item => item.isActive);
    setItems(wasteItems);
    setFilteredItems(wasteItems);
    
    // Load recent searches
    const recent = JSON.parse(localStorage.getItem('eco-recent-searches') || '[]');
    setRecentSearches(recent);
  }, []);

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

  const handleContactSeller = (sellerId: string, itemId: string) => {
    onNavigate(`chat/${sellerId}/${itemId}`);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-BR').format(num);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-eco-green-light/20 to-eco-brown-light/20">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Transforme <span className="text-eco-green">Resíduos</span> em{' '}
              <span className="text-eco-blue">Recursos</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              O marketplace sustentável que conecta quem tem sobras industriais e materiais 
              recicláveis com quem precisa. Reduza desperdício, economize dinheiro e 
              ajude o meio ambiente.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <SearchBar
                onSearch={handleSearch}
                onShowFilters={() => setShowFilters(true)}
                recentSearches={recentSearches}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                size="lg"
                onClick={() => onNavigate('register')}
                className="bg-gradient-eco hover:opacity-90 shadow-eco text-lg px-8 py-6"
              >
                Começar Agora
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => onNavigate('about')}
                className="text-lg px-8 py-6 border-eco-green text-eco-green hover:bg-eco-green-light"
              >
                Como Funciona
              </Button>
            </div>

            {/* Impact Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <Card className="bg-card/50 backdrop-blur border-eco-green/20">
                <CardContent className="flex flex-col items-center p-6">
                  <Recycle className="w-12 h-12 text-eco-green mb-3" />
                  <div className="text-2xl font-bold text-eco-green">
                    {formatNumber(ecoImpact.totalWasteReused)}kg
                  </div>
                  <div className="text-sm text-muted-foreground text-center">
                    Resíduos Reaproveitados
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur border-eco-blue/20">
                <CardContent className="flex flex-col items-center p-6">
                  <Leaf className="w-12 h-12 text-eco-blue mb-3" />
                  <div className="text-2xl font-bold text-eco-blue">
                    {formatNumber(ecoImpact.co2Saved)}kg
                  </div>
                  <div className="text-sm text-muted-foreground text-center">
                    CO₂ Economizado
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur border-eco-orange/20">
                <CardContent className="flex flex-col items-center p-6">
                  <Users className="w-12 h-12 text-eco-orange mb-3" />
                  <div className="text-2xl font-bold text-eco-orange">
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
                  <Badge variant="secondary" className="bg-eco-green-light text-eco-green">
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