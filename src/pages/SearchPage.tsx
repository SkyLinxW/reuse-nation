import { useState, useEffect } from 'react';
import { ArrowLeft, Search, Filter, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SearchBar } from '@/components/SearchBar';
import { FilterSidebar } from '@/components/FilterSidebar';
import { WasteCard } from '@/components/WasteCard';
import { useSearch } from '@/hooks/useSearch';
import { getWasteItems } from '@/lib/supabase';
import { WasteItem } from '@/types';

interface SearchPageProps {
  onNavigate: (page: string) => void;
  initialQuery?: string;
}

export const SearchPage = ({ onNavigate, initialQuery = '' }: SearchPageProps) => {
  const [items, setItems] = useState<WasteItem[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  const {
    searchTerm,
    filteredItems,
    recentSearches,
    handleSearch,
    resultsCount
  } = useSearch(items);

  useEffect(() => {
    initializeDemoData();
    const wasteItems = getWasteItems().filter(item => item.isActive);
    setItems(wasteItems);
  }, []);

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery, handleSearch]);

  const handleItemClick = (id: string) => {
    onNavigate(`product?id=${id}`);
  };

  const handleContactSeller = (sellerId: string, itemId: string) => {
    onNavigate(`chat/${sellerId}/${itemId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => onNavigate('home')}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="flex-1">
            <SearchBar
              onSearch={handleSearch}
              onShowFilters={() => setShowFilters(true)}
              recentSearches={recentSearches}
            />
          </div>
        </div>

        <div className="flex gap-6">
          {/* Desktop Filters */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FilterSidebar
                  isOpen={true}
                  onClose={() => {}}
                  onFiltersChange={() => {}}
                />
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">
                  {searchTerm ? `Resultados para "${searchTerm}"` : 'Todos os Materiais'}
                </h2>
                <p className="text-muted-foreground mt-1">
                  {resultsCount} {resultsCount === 1 ? 'resultado encontrado' : 'resultados encontrados'}
                </p>
              </div>

              <Button
                variant="outline"
                onClick={() => setShowFilters(true)}
                className="lg:hidden"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
            </div>

            {/* Results Grid */}
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
                    Nenhum resultado encontrado
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm 
                      ? `Não encontramos materiais para "${searchTerm}". Tente outras palavras-chave.`
                      : 'Nenhum material disponível no momento.'
                    }
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button
                      variant="outline"
                      onClick={() => handleSearch('')}
                    >
                      Limpar Busca
                    </Button>
                    <Button onClick={() => onNavigate('home')}>
                      Voltar ao Início
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Sidebar */}
      {showFilters && (
        <FilterSidebar
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          onFiltersChange={() => {}}
        />
      )}
    </div>
  );
};