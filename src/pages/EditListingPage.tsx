import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { getWasteItem, updateWasteItem } from '@/lib/supabase';
import { WasteItem, WasteCategory } from '@/types';
import { ArrowLeft, Upload, MapPin } from 'lucide-react';
import { ListingAddressSelector } from '@/components/ListingAddressSelector';
import { Coordinates } from '@/services/addressService';

interface EditListingPageProps {
  onNavigate: (page: string) => void;
  listingId: string;
}

export const EditListingPage = ({ onNavigate, listingId }: EditListingPageProps) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'plasticos' as WasteCategory,
    subcategory: '',
    quantityValue: '',
    quantityUnit: 'kg' as 'kg' | 'm3' | 'unidades' | 'toneladas',
    condition: 'novo' as 'novo' | 'usado' | 'sobras_limpas' | 'contaminado',
    price: '',
    location: '',
    coordinates: null as Coordinates | null,
    plasticType: '',
    purity: '',
    composition: ''
  });
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
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

  useEffect(() => {
    const loadListingData = async () => {
      try {
        const listing = await getWasteItem(listingId);
        if (listing) {
          const quantity = typeof listing.quantity === 'string' ? JSON.parse(listing.quantity) : listing.quantity;
          const coordinates = listing.coordinates ? (typeof listing.coordinates === 'string' ? JSON.parse(listing.coordinates) : listing.coordinates) : null;
          
          setFormData({
            title: listing.title || '',
            description: listing.description || '',
            category: (listing.category as WasteCategory) || 'plasticos',
            subcategory: '', // This field doesn't exist in the database
            quantityValue: quantity?.value?.toString() || '',
            quantityUnit: (quantity?.unit as 'kg' | 'm3' | 'unidades' | 'toneladas') || 'kg',
            condition: (listing.condition as 'novo' | 'usado' | 'sobras_limpas' | 'contaminado') || 'novo',
            price: listing.price?.toString() || '',
            location: listing.location || '',
            coordinates: coordinates,
            plasticType: '',
            purity: '',
            composition: ''
          });
        }
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao carregar dados do anúncio",
          variant: "destructive",
        });
      } finally {
        setLoadingData(false);
      }
    };

    if (listingId) {
      loadListingData();
    }
  }, [listingId]);

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
        description: "Você precisa estar logado para editar um anúncio.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const updatedListing = {
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
        coordinates: formData.coordinates ? JSON.stringify(formData.coordinates) : null,
        updated_at: new Date().toISOString()
      };

      await updateWasteItem(listingId, updatedListing);

      toast({
        title: "Anúncio atualizado com sucesso!",
        description: "As alterações foram salvas.",
      });

      onNavigate('my-listings');
    } catch (error) {
      toast({
        title: "Erro ao atualizar anúncio",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-eco-light/20 to-eco-cream/30 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-xl bg-white/95 backdrop-blur-sm border-0">
          <CardContent className="text-center py-8">
            <Upload className="w-16 h-16 mx-auto mb-4 text-eco-green" />
            <p className="text-muted-foreground mb-4">
              Você precisa estar logado para editar um anúncio.
            </p>
            <Button onClick={() => onNavigate('login')} className="bg-eco-green hover:bg-eco-green/90">
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-eco-light/20 to-eco-cream/30 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-xl bg-white/95 backdrop-blur-sm border-0">
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Carregando dados do anúncio...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-eco-light/20 to-eco-cream/30 relative overflow-hidden">
      <div className="absolute inset-0 opacity-40">
        <div className="w-full h-full bg-eco-green/5 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-eco-green/10 via-transparent to-transparent"></div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => onNavigate('my-listings')}
          className="mb-6 hover:bg-white/20 backdrop-blur-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-eco-dark mb-4">
              Editar Anúncio
            </h1>
            <p className="text-xl text-muted-foreground">
              Atualize as informações do seu anúncio
            </p>
          </div>

          <Card className="shadow-xl bg-white/95 backdrop-blur-sm border-0">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium">Título do Anúncio</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Ex: Sobras de Plástico PET"
                      className="h-12 bg-background/50 border-border/50 focus:bg-background focus:border-eco-green"
                      required
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Descreva detalhadamente o material..."
                      rows={4}
                      className="bg-background/50 border-border/50 focus:bg-background focus:border-eco-green resize-none"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-sm font-medium">Categoria</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger className="h-12 bg-background/50 border-border/50 focus:bg-background focus:border-eco-green">
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
                    <Label htmlFor="subcategory" className="text-sm font-medium">Subcategoria</Label>
                    <Input
                      id="subcategory"
                      value={formData.subcategory}
                      onChange={(e) => handleInputChange('subcategory', e.target.value)}
                      placeholder="Ex: PET, Alumínio, etc."
                      className="h-12 bg-background/50 border-border/50 focus:bg-background focus:border-eco-green"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantityValue" className="text-sm font-medium">Quantidade</Label>
                    <Input
                      id="quantityValue"
                      type="number"
                      step="0.01"
                      value={formData.quantityValue}
                      onChange={(e) => handleInputChange('quantityValue', e.target.value)}
                      className="h-12 bg-background/50 border-border/50 focus:bg-background focus:border-eco-green"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantityUnit" className="text-sm font-medium">Unidade</Label>
                    <Select value={formData.quantityUnit} onValueChange={(value) => handleInputChange('quantityUnit', value)}>
                      <SelectTrigger className="h-12 bg-background/50 border-border/50 focus:bg-background focus:border-eco-green">
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
                    <Label htmlFor="condition" className="text-sm font-medium">Condição</Label>
                    <Select value={formData.condition} onValueChange={(value) => handleInputChange('condition', value)}>
                      <SelectTrigger className="h-12 bg-background/50 border-border/50 focus:bg-background focus:border-eco-green">
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
                    <Label htmlFor="price" className="text-sm font-medium">Preço por unidade (R$)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      className="h-12 bg-background/50 border-border/50 focus:bg-background focus:border-eco-green"
                      required
                    />
                  </div>

                  {/* Localização Section */}
                  <div className="md:col-span-2 space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-eco-green/10 rounded-full flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-eco-green" />
                      </div>
                      <Label className="text-lg font-semibold text-eco-dark">Localização do Material</Label>
                    </div>
                    <div className="p-6 border rounded-xl bg-eco-light/20 border-eco-green/20">
                      <ListingAddressSelector 
                        onAddressSelected={handleAddressSelected}
                        defaultAddress={formData.location}
                      />
                    </div>
                    {formData.location && (
                      <div className="flex items-center gap-3 p-4 bg-eco-green/10 rounded-xl border border-eco-green/20">
                        <div className="w-8 h-8 bg-eco-green/20 rounded-full flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-eco-green" />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-eco-green">
                            Localização Selecionada:
                          </Label>
                          <p className="text-sm text-eco-dark">
                            {formData.location}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {formData.category === 'plasticos' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="plasticType" className="text-sm font-medium">Tipo de Plástico</Label>
                        <Input
                          id="plasticType"
                          value={formData.plasticType}
                          onChange={(e) => handleInputChange('plasticType', e.target.value)}
                          placeholder="Ex: PET, HDPE, PVC"
                          className="h-12 bg-background/50 border-border/50 focus:bg-background focus:border-eco-green"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="purity" className="text-sm font-medium">Pureza</Label>
                        <Input
                          id="purity"
                          value={formData.purity}
                          onChange={(e) => handleInputChange('purity', e.target.value)}
                          placeholder="Ex: 98%"
                          className="h-12 bg-background/50 border-border/50 focus:bg-background focus:border-eco-green"
                        />
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="composition" className="text-sm font-medium">Composição</Label>
                        <Input
                          id="composition"
                          value={formData.composition}
                          onChange={(e) => handleInputChange('composition', e.target.value)}
                          placeholder="Ex: Politereftalato de etileno"
                          className="h-12 bg-background/50 border-border/50 focus:bg-background focus:border-eco-green"
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="border-t pt-6">
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-eco hover:opacity-90 shadow-eco h-12 text-lg font-semibold rounded-xl"
                    disabled={loading || !formData.location}
                  >
                    {loading ? 'Salvando Alterações...' : 'Salvar Alterações'}
                  </Button>
                  
                  {!formData.location && (
                    <p className="text-sm text-muted-foreground text-center mt-4">
                      Selecione uma localização para continuar
                    </p>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};