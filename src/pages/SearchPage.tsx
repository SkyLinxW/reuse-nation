import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/SearchBar';
import { FilterSidebar } from '@/components/FilterSidebar';
import { WasteCard } from '@/components/WasteCard';
import { useSearch } from '@/hooks/useSearch';
import { getWasteItems } from '@/lib/supabase';
import { ArrowLeft, Filter, X, Search } from 'lucide-react';

interface SearchPageProps {
  onNavigate: (page: string) => void;
}

export const SearchPage = ({ onNavigate }: SearchPageProps) => {
  const [availableItems, setAvailableItems] = useState<any[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const {
    searchTerm,
    filters,
    filteredItems,
    resultsCount,
    handleSearch,
    updateFilters,
    clearFilters,
    recentSearches,
    clearRecentSearches
  } = useSearch(availableItems);

  useEffect(() => {
    const loadItems = async () => {
      try {
        const allItems = await getWasteItems();
        const availableItems = allItems.filter(item => item.availability);
        setAvailableItems(availableItems);
      } catch (error) {
        console.error('Error loading items:', error);
      }
    };
    loadItems();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-eco-light/20 to-eco-cream/30 relative overflow-hidden">
      <div className="absolute inset-0 opacity-40">
        <div className="w-full h-full bg-eco-green/5 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-eco-green/10 via-transparent to-transparent"></div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => onNavigate('home')}
            className="mb-6 hover:bg-white/20 backdrop-blur-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-eco-dark mb-4">
                Buscar Materiais
              </h1>
              <p className="text-xl text-muted-foreground">
                Encontre exatamente o que você precisa no marketplace sustentável
              </p>
            </div>

            <div className="flex gap-4 items-center mb-6">
              <div className="flex-1">
                <SearchBar
                  onSearch={handleSearch}
                  onShowFilters={() => setShowFilters(!showFilters)}
                  recentSearches={recentSearches}
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden h-12 px-4 border-eco-green/30 text-eco-green hover:bg-eco-green-light rounded-xl"
              >
                <Filter className="w-5 h-5" />
              </Button>
            </div>

            {/* Filtros ativos */}
            {(filters.category || filters.condition || filters.location || filters.minPrice || filters.maxPrice) && (
              <Card className="mb-6 bg-white/95 backdrop-blur-sm shadow-soft border-0">
                <CardContent className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {filters.category && (
                      <div className="flex items-center gap-1 bg-eco-green/10 text-eco-green px-4 py-2 rounded-full text-sm font-medium">
                        Categoria: {filters.category}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 ml-2 hover:bg-transparent"
                          onClick={() => updateFilters({ category: '' })}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                    {filters.condition && (
                      <div className="flex items-center gap-1 bg-eco-blue/10 text-eco-blue px-4 py-2 rounded-full text-sm font-medium">
                        Condição: {filters.condition}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 ml-2 hover:bg-transparent"
                          onClick={() => updateFilters({ condition: '' })}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearFilters}
                      className="text-muted-foreground border-border/50 hover:bg-muted/50"
                    >
                      Limpar todos os filtros
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="mb-6">
              <Card className="bg-white/95 backdrop-blur-sm shadow-soft border-0">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-semibold text-eco-dark">
                      {resultsCount} resultado(s) encontrado(s)
                      {searchTerm && <span className="text-muted-foreground"> para "{searchTerm}"</span>}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setShowFilters(!showFilters)}
                      className="hidden md:flex items-center gap-2 border-eco-green/30 text-eco-green hover:bg-eco-green-light"
                    >
                      <Filter className="w-4 h-4" />
                      {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar de filtros */}
          <div className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-80 shrink-0`}>
            <FilterSidebar 
              isOpen={showFilters}
              onClose={() => setShowFilters(false)}
              onFiltersChange={updateFilters}
            />
          </div>

          {/* Resultados */}
          <div className="flex-1">
            {filteredItems.length === 0 ? (
              <Card className="shadow-xl bg-white/95 backdrop-blur-sm border-0">
                <CardContent className="text-center py-16">
                  <div className="w-24 h-24 bg-eco-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="w-12 h-12 text-eco-green" />
                  </div>
                  <h3 className="text-2xl font-bold text-eco-dark mb-4">
                    Nenhum resultado encontrado
                  </h3>
                  <p className="text-muted-foreground text-lg mb-6 max-w-md mx-auto">
                    Tente ajustar seus filtros ou buscar por outros termos para encontrar materiais disponíveis
                  </p>
                  <Button 
                    onClick={clearFilters}
                    className="bg-eco-green hover:bg-eco-green/90 text-white px-8 py-3 rounded-xl"
                  >
                    Limpar filtros
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item) => (
                  <WasteCard
                    key={item.id}
                    waste={item}
                    onNavigate={onNavigate}
                    onItemClick={(id) => onNavigate(`product?id=${id}`)}
                    onContactSeller={(sellerId) => onNavigate(`seller-profile?id=${sellerId}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};