import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/SearchBar';
import { FilterSidebar } from '@/components/FilterSidebar';
import { WasteCard } from '@/components/WasteCard';
import { useSearch } from '@/hooks/useSearch';
import { getWasteItems } from '@/lib/supabase';
import { ArrowLeft, Filter, X } from 'lucide-react';

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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => onNavigate('home')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          <div className="flex gap-4 items-center mb-4">
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
              className="md:hidden"
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>

          {/* Filtros ativos */}
          {(filters.category || filters.condition || filters.location || filters.minPrice || filters.maxPrice) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {filters.category && (
                <div className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                  Categoria: {filters.category}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => updateFilters({ category: '' })}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
              {filters.condition && (
                <div className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                  Condição: {filters.condition}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => updateFilters({ condition: '' })}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground"
              >
                Limpar filtros
              </Button>
            </div>
          )}

          <div className="text-sm text-muted-foreground mb-4">
            {resultsCount} resultado(s) encontrado(s)
            {searchTerm && ` para "${searchTerm}"`}
          </div>
        </div>

        <div className="flex gap-6">
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
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground text-lg mb-2">
                    Nenhum resultado encontrado
                  </p>
                  <p className="text-muted-foreground mb-4">
                    Tente ajustar seus filtros ou buscar por outros termos
                  </p>
                  <Button onClick={clearFilters}>
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