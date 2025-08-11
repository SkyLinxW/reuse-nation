import { useState, useEffect } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { saveSearchTerm, getRecentSearches } from '@/lib/supabase';

interface SearchBarProps {
  onSearch: (term: string) => void;
  onShowFilters: () => void;
  recentSearches?: string[];
  className?: string;
}

export const SearchBar = ({ 
  onSearch, 
  onShowFilters, 
  recentSearches = [],
  className = ''
}: SearchBarProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearchesState, setRecentSearchesState] = useState<string[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const loadRecentSearches = async () => {
      if (user) {
        const searches = await getRecentSearches(user.id);
        setRecentSearchesState(searches);
      }
    };
    loadRecentSearches();
  }, [user]);

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    onSearch(term);
    setShowSuggestions(false);
    
    // Save to recent searches
    if (term.trim() && user) {
      await saveSearchTerm(user.id, term);
      const updatedSearches = await getRecentSearches(user.id);
      setRecentSearchesState(updatedSearches);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(searchTerm);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    onSearch('');
    setShowSuggestions(false);
  };

  const popularSearches = [
    'Plástico PET',
    'Madeira MDF',
    'Metal sucata',
    'Papel cartão',
    'Tecido algodão'
  ];

  return (
    <div className={`relative ${className}`}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar materiais, categorias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => setShowSuggestions(true)}
            className="pl-10 pr-10 h-12 text-base"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        <Button
          variant="outline"
          size="lg"
          onClick={() => handleSearch(searchTerm)}
          className="h-12 px-6"
        >
          <Search className="w-4 h-4 mr-2" />
          Buscar
        </Button>
        
        <Button
          variant="outline"
          size="lg"
          onClick={onShowFilters}
          className="h-12 px-4"
        >
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      {/* Search Suggestions */}
      {showSuggestions && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowSuggestions(false)}
          />
          <Card className="absolute top-full left-0 right-0 mt-2 z-20 shadow-lg">
            <CardContent className="p-4">
              {recentSearchesState.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">
                    Buscas Recentes
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {recentSearchesState.map((search, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="cursor-pointer hover:bg-secondary/80"
                        onClick={() => handleSearch(search)}
                      >
                        {search}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  Buscas Populares
                </h4>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((search, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="cursor-pointer hover:bg-accent"
                      onClick={() => handleSearch(search)}
                    >
                      {search}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};