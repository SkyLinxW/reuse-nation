import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { createWasteItem } from '@/lib/supabase';
import { WasteItem, WasteCategory } from '@/types';
import { ArrowLeft, Upload, MapPin } from 'lucide-react';
import { ListingAddressSelector } from '@/components/ListingAddressSelector';
import { Coordinates } from '@/services/addressService';

interface CreateListingPageProps {
  onNavigate: (page: string) => void;
}

export const CreateListingPage = ({ onNavigate }: CreateListingPageProps) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '' as WasteCategory,
    subcategory: '',
    quantityValue: '',
    quantityUnit: 'kg' as 'kg' | 'm3' | 'unidades' | 'toneladas',
    condition: '' as 'novo' | 'usado' | 'sobras_limpas' | 'contaminado',
    price: '',
    location: '',
    coordinates: null as Coordinates | null,
    plasticType: '',
    purity: '',
    composition: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const categories = [
    { value: 'plasticos', label: 'Plásticos' },
    { value: 'metais', label: 'Metais' },
    { value: 'papel', label: 'Papel' },
    { value: 'madeira', label: 'Madeira' },
    { value: 'tecidos', label: 'Tecidos' },
    { value: 'eletronicos', label: 'Eletrônicos' },
    { value: 'organicos', label: 'Orgânicos' },
    { value: 'outros', label: 'Outros' }
  ];

  const conditions = [
    { value: 'novo', label: 'Novo' },
    { value: 'usado', label: 'Usado' },
    { value: 'sobras_limpas', label: 'Sobras Limpas' },
    { value: 'contaminado', label: 'Contaminado' }
  ];

  const units = [
    { value: 'kg', label: 'Quilogramas (kg)' },
    { value: 'm3', label: 'Metros Cúbicos (m³)' },
    { value: 'unidades', label: 'Unidades' },
    { value: 'toneladas', label: 'Toneladas' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddressSelected = (address: string, coordinates: Coordinates) => {
    setFormData(prev => ({ 
      ...prev, 
      location: address,
      coordinates: coordinates
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para criar um anúncio.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const newListing = {
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        quantity: JSON.stringify({
          value: parseFloat(formData.quantityValue),
          unit: formData.quantityUnit
        }),
        condition: formData.condition,
        price: parseFloat(formData.price),
        location: formData.location,
        availability: true
      };

      const result = await createWasteItem(newListing);

      toast({
        title: "Anúncio criado com sucesso!",
        description: "Seu anúncio já está disponível no marketplace.",
      });

      // Clear form and go back to home to show the new listing
      setFormData({
        title: '',
        description: '',
        category: '' as WasteCategory,
        subcategory: '',
        quantityValue: '',
        quantityUnit: 'kg' as 'kg' | 'm3' | 'unidades' | 'toneladas',
        condition: '' as 'novo' | 'usado' | 'sobras_limpas' | 'contaminado',
        price: '',
        location: '',
        coordinates: null,
        plasticType: '',
        purity: '',
        composition: ''
      });
      onNavigate('home');
    } catch (error) {
      toast({
        title: "Erro ao criar anúncio",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Você precisa estar logado para criar um anúncio.
            </p>
            <Button onClick={() => onNavigate('login')}>
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => onNavigate('home')}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar
      </Button>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-eco-green">Criar Novo Anúncio</CardTitle>
          <CardDescription>
            Anuncie seus resíduos e contribua para a economia circular
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="title">Título do Anúncio</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Ex: Sobras de Plástico PET"
                  required
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Descreva detalhadamente o material..."
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subcategory">Subcategoria</Label>
                <Input
                  id="subcategory"
                  value={formData.subcategory}
                  onChange={(e) => handleInputChange('subcategory', e.target.value)}
                  placeholder="Ex: PET, Alumínio, etc."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantityValue">Quantidade</Label>
                <Input
                  id="quantityValue"
                  type="number"
                  step="0.01"
                  value={formData.quantityValue}
                  onChange={(e) => handleInputChange('quantityValue', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantityUnit">Unidade</Label>
                <Select value={formData.quantityUnit} onValueChange={(value) => handleInputChange('quantityUnit', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map(unit => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition">Condição</Label>
                <Select value={formData.condition} onValueChange={(value) => handleInputChange('condition', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a condição" />
                  </SelectTrigger>
                  <SelectContent>
                    {conditions.map(cond => (
                      <SelectItem key={cond.value} value={cond.value}>
                        {cond.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Preço por unidade (R$)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  required
                />
              </div>

              {/* Localização Section */}
              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-5 h-5 text-eco-green" />
                  <Label className="text-lg font-semibold">Localização do Material</Label>
                </div>
                <div className="p-4 border rounded-lg bg-muted/50">
                  <ListingAddressSelector 
                    onAddressSelected={handleAddressSelected}
                    defaultAddress={formData.location}
                  />
                </div>
                {formData.location && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <MapPin className="w-4 h-4 text-green-600" />
                    <div>
                      <Label className="text-sm font-medium text-green-800 dark:text-green-200">
                        Localização Selecionada:
                      </Label>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        {formData.location}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {formData.category === 'plasticos' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="plasticType">Tipo de Plástico</Label>
                    <Input
                      id="plasticType"
                      value={formData.plasticType}
                      onChange={(e) => handleInputChange('plasticType', e.target.value)}
                      placeholder="Ex: PET, HDPE, PVC"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="purity">Pureza</Label>
                    <Input
                      id="purity"
                      value={formData.purity}
                      onChange={(e) => handleInputChange('purity', e.target.value)}
                      placeholder="Ex: 98%"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="composition">Composição</Label>
                    <Input
                      id="composition"
                      value={formData.composition}
                      onChange={(e) => handleInputChange('composition', e.target.value)}
                      placeholder="Ex: Politereftalato de etileno"
                    />
                  </div>
                </>
              )}

              <div className="md:col-span-2 space-y-2">
                <Label>Imagens</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Clique para adicionar imagens (em breve)
                  </p>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-eco hover:opacity-90"
              disabled={loading || !formData.location}
            >
              {loading ? 'Criando Anúncio...' : 'Criar Anúncio'}
            </Button>
            
            {!formData.location && (
              <p className="text-sm text-muted-foreground text-center">
                Selecione uma localização para continuar
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};