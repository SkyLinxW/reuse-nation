import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { saveWasteItem, getCurrentUser } from '@/lib/localStorage';
import { WasteItem, WasteCategory } from '@/types';
import { ArrowLeft, Upload } from 'lucide-react';

interface CreateListingPageProps {
  onNavigate: (page: string) => void;
}

export const CreateListingPage = ({ onNavigate }: CreateListingPageProps) => {
  const currentUser = getCurrentUser();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '' as WasteCategory,
    subcategory: '',
    quantityValue: '',
    quantityUnit: 'kg' as 'kg' | 'm3' | 'unidades' | 'toneladas',
    condition: '' as 'novo' | 'usado' | 'sobras_limpas' | 'contaminado',
    price: '',
    city: '',
    state: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para criar um anúncio.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const newListing: WasteItem = {
        id: Date.now().toString(),
        sellerId: currentUser.id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        subcategory: formData.subcategory,
        quantity: {
          value: parseFloat(formData.quantityValue),
          unit: formData.quantityUnit
        },
        condition: formData.condition,
        price: parseFloat(formData.price),
        images: [],
        location: {
          city: formData.city,
          state: formData.state
        },
        technicalDetails: formData.category === 'plasticos' ? {
          plasticType: formData.plasticType,
          purity: formData.purity,
          composition: formData.composition
        } : undefined,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: 0,
        favorites: 0
      };

      saveWasteItem(newListing);

      toast({
        title: "Anúncio criado com sucesso!",
        description: "Seu anúncio já está disponível no marketplace.",
      });

      onNavigate('my-listings');
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

  if (!currentUser) {
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

              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  required
                />
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
              disabled={loading}
            >
              {loading ? 'Criando Anúncio...' : 'Criar Anúncio'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};