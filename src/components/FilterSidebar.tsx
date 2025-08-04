import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WasteCategory } from '@/types';

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onFiltersChange: (filters: FilterState) => void;
}

export interface FilterState {
  searchTerm: string;
  categories: WasteCategory[];
  conditions: string[];
  priceRange: [number, number];
  location: string;
  sortBy: 'recent' | 'price-low' | 'price-high' | 'views';
}

const categoryOptions = [
  { value: 'plasticos', label: 'Plásticos' },
  { value: 'metais', label: 'Metais' },
  { value: 'papel', label: 'Papel' },
  { value: 'madeira', label: 'Madeira' },
  { value: 'tecidos', label: 'Tecidos' },
  { value: 'eletronicos', label: 'Eletrônicos' },
  { value: 'organicos', label: 'Orgânicos' },
  { value: 'outros', label: 'Outros' }
];

const conditionOptions = [
  { value: 'novo', label: 'Novo' },
  { value: 'usado', label: 'Usado' },
  { value: 'sobras_limpas', label: 'Sobras Limpas' },
  { value: 'contaminado', label: 'Contaminado' }
];

const sortOptions = [
  { value: 'recent', label: 'Mais Recentes' },
  { value: 'price-low', label: 'Menor Preço' },
  { value: 'price-high', label: 'Maior Preço' },
  { value: 'views', label: 'Mais Visualizados' }
];

export const FilterSidebar = ({ isOpen, onClose, onFiltersChange }: FilterSidebarProps) => {
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    categories: [],
    conditions: [],
    priceRange: [0, 1000],
    location: '',
    sortBy: 'recent'
  });

  const handleCategoryChange = (category: WasteCategory, checked: boolean) => {
    const newCategories = checked
      ? [...filters.categories, category]
      : filters.categories.filter(c => c !== category);
    
    const newFilters = { ...filters, categories: newCategories };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleConditionChange = (condition: string, checked: boolean) => {
    const newConditions = checked
      ? [...filters.conditions, condition]
      : filters.conditions.filter(c => c !== condition);
    
    const newFilters = { ...filters, conditions: newConditions };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handlePriceRangeChange = (value: number[]) => {
    const newFilters = { ...filters, priceRange: [value[0], value[1]] as [number, number] };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleLocationChange = (value: string) => {
    const newFilters = { ...filters, location: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleSortChange = (value: string) => {
    const newFilters = { ...filters, sortBy: value as FilterState['sortBy'] };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleSearchTermChange = (value: string) => {
    const newFilters = { ...filters, searchTerm: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const newFilters: FilterState = {
      searchTerm: '',
      categories: [],
      conditions: [],
      priceRange: [0, 1000],
      location: '',
      sortBy: 'recent'
    };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:relative lg:inset-auto lg:z-auto">
      {/* Backdrop for mobile */}
      <div 
        className="fixed inset-0 bg-black/50 lg:hidden"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <Card className="fixed left-0 top-0 h-full w-80 bg-card border-r shadow-lg lg:relative lg:h-auto lg:shadow-none overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="lg:hidden">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Search */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Buscar</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar produtos..."
                value={filters.searchTerm}
                onChange={(e) => handleSearchTermChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Sort */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Ordenar por</Label>
            <Select value={filters.sortBy} onValueChange={handleSortChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Categorias</Label>
            <div className="space-y-2">
              {categoryOptions.map(category => (
                <div key={category.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={category.value}
                    checked={filters.categories.includes(category.value as WasteCategory)}
                    onCheckedChange={(checked) => 
                      handleCategoryChange(category.value as WasteCategory, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={category.value}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {category.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Conditions */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Condição</Label>
            <div className="space-y-2">
              {conditionOptions.map(condition => (
                <div key={condition.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={condition.value}
                    checked={filters.conditions.includes(condition.value)}
                    onCheckedChange={(checked) => 
                      handleConditionChange(condition.value, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={condition.value}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {condition.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Faixa de Preço: R$ {filters.priceRange[0]} - R$ {filters.priceRange[1]}
            </Label>
            <Slider
              value={filters.priceRange}
              onValueChange={handlePriceRangeChange}
              max={1000}
              min={0}
              step={10}
              className="w-full"
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Localização</Label>
            <Input
              placeholder="Digite cidade ou estado..."
              value={filters.location}
              onChange={(e) => handleLocationChange(e.target.value)}
            />
          </div>

          {/* Clear Filters */}
          <Button
            variant="outline"
            onClick={clearFilters}
            className="w-full"
          >
            Limpar Filtros
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};