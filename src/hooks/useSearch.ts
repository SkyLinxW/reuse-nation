import { useState, useEffect, useMemo } from 'react';
import { WasteItem } from '@/types';

export interface SearchFilters {
  category?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  sortBy?: 'recent' | 'price-low' | 'price-high' | 'views';
}

export const useSearch = (items: WasteItem[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('eco-recent-searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const filteredItems = useMemo(() => {
    let filtered = [...items];

    // Apply search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower) ||
        item.category.toLowerCase().includes(searchLower) ||
        item.subcategory.toLowerCase().includes(searchLower) ||
        item.location.city.toLowerCase().includes(searchLower) ||
        item.location.state.toLowerCase().includes(searchLower)
      );
    }

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(item => item.category === filters.category);
    }

    // Apply condition filter
    if (filters.condition) {
      filtered = filtered.filter(item => item.condition === filters.condition);
    }

    // Apply price range filter
    if (filters.minPrice !== undefined) {
      filtered = filtered.filter(item => item.price >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter(item => item.price <= filters.maxPrice!);
    }

    // Apply location filter
    if (filters.location) {
      const locationLower = filters.location.toLowerCase();
      filtered = filtered.filter(item =>
        item.location.city.toLowerCase().includes(locationLower) ||
        item.location.state.toLowerCase().includes(locationLower)
      );
    }

    // Apply sorting
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
      default:
        // Default to recent
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return filtered;
  }, [items, searchTerm, filters]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    
    // Save to recent searches if not empty
    if (term.trim()) {
      const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('eco-recent-searches', JSON.stringify(updated));
    }
  };

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('eco-recent-searches');
  };

  return {
    searchTerm,
    filters,
    filteredItems,
    recentSearches,
    handleSearch,
    updateFilters,
    clearFilters,
    clearRecentSearches,
    resultsCount: filteredItems.length
  };
};