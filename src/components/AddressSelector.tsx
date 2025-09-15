import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Search, Loader2 } from 'lucide-react';
import { 
  getBrazilianStates, 
  getCitiesByState, 
  getAddressByCep,
  geocodeAddress,
  BrazilianState,
  BrazilianCity,
  AddressInfo,
  Coordinates
} from '@/services/addressService';
import { useToast } from '@/hooks/use-toast';

interface AddressSelectorProps {
  onAddressSelected: (address: string, coordinates: Coordinates) => void;
  defaultAddress?: string;
}

export const AddressSelector = ({ onAddressSelected, defaultAddress }: AddressSelectorProps) => {
  const [states, setStates] = useState<BrazilianState[]>([]);
  const [cities, setCities] = useState<BrazilianCity[]>([]);
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [street, setStreet] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [cep, setCep] = useState('');
  const [loading, setLoading] = useState(false);
  const [addressInfo, setAddressInfo] = useState<AddressInfo | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadStates();
  }, []);

  useEffect(() => {
    if (defaultAddress) {
      setStreet(defaultAddress);
    }
  }, [defaultAddress]);

  const loadStates = async () => {
    try {
      const statesData = await getBrazilianStates();
      setStates(statesData);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os estados",
        variant: "destructive"
      });
    }
  };

  const loadCities = async (stateId: string) => {
    try {
      setLoading(true);
      const citiesData = await getCitiesByState(parseInt(stateId));
      setCities(citiesData);
      setSelectedCity('');
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar as cidades",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStateChange = (stateId: string) => {
    setSelectedState(stateId);
    loadCities(stateId);
  };

  const handleCepSearch = async () => {
    if (!cep || cep.length < 8) {
      toast({
        title: "CEP inválido",
        description: "Digite um CEP válido com 8 dígitos",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const address = await getAddressByCep(cep);
      
      if (address) {
        setAddressInfo(address);
        setStreet(address.logradouro);
        setNeighborhood(address.bairro);
        
        // Find and select the state
        const state = states.find(s => s.sigla === address.uf);
        if (state) {
          setSelectedState(state.id.toString());
          await loadCities(state.id.toString());
          
          // Set city after cities are loaded
          setTimeout(() => {
            setSelectedCity(address.localidade);
          }, 100);
        }
        
        toast({
          title: "Endereço encontrado",
          description: `${address.logradouro}, ${address.bairro}, ${address.localidade} - ${address.uf}`,
        });
      } else {
        toast({
          title: "CEP não encontrado",
          description: "Verifique se o CEP está correto",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível buscar o CEP",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAddress = async () => {
    if (!selectedState || !selectedCity || !street) {
      toast({
        title: "Dados incompletos",
        description: "Preencha pelo menos estado, cidade e rua",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      const stateName = states.find(s => s.id.toString() === selectedState)?.nome || '';
      const fullAddress = `${street}${neighborhood ? ', ' + neighborhood : ''}, ${selectedCity}, ${stateName}`;
      
      console.log('Attempting to geocode:', fullAddress);
      
      const coordinates = await geocodeAddress(fullAddress);
      
      if (coordinates) {
        onAddressSelected(fullAddress, coordinates);
        toast({
          title: "Endereço confirmado",
          description: fullAddress,
        });
      } else {
        toast({
          title: "Erro de localização",
          description: "Não foi possível encontrar as coordenadas do endereço",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível confirmar o endereço",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCep = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 5) {
      return numbers;
    }
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Selecionar Endereço de Entrega
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* CEP Search */}
        <div className="space-y-2">
          <Label htmlFor="cep">CEP (Busca Rápida)</Label>
          <div className="flex gap-2">
            <Input
              id="cep"
              placeholder="00000-000"
              value={cep}
              onChange={(e) => setCep(formatCep(e.target.value))}
              maxLength={9}
            />
            <Button 
              onClick={handleCepSearch} 
              disabled={loading}
              variant="outline"
              size="icon"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              ou preencha manualmente
            </span>
          </div>
        </div>

        {/* State Selection */}
        <div className="space-y-2">
          <Label htmlFor="state">Estado</Label>
          <Select value={selectedState} onValueChange={handleStateChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o estado" />
            </SelectTrigger>
            <SelectContent>
              {states.map((state) => (
                <SelectItem key={state.id} value={state.id.toString()}>
                  {state.nome} ({state.sigla})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* City Selection */}
        <div className="space-y-2">
          <Label htmlFor="city">Cidade</Label>
          <Select 
            value={selectedCity} 
            onValueChange={setSelectedCity}
            disabled={!selectedState || loading}
          >
            <SelectTrigger>
              <SelectValue placeholder={selectedState ? "Selecione a cidade" : "Primeiro selecione o estado"} />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={city.id} value={city.nome}>
                  {city.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Street */}
        <div className="space-y-2">
          <Label htmlFor="street">Rua/Logradouro</Label>
          <Input
            id="street"
            placeholder="Digite o nome da rua"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
          />
        </div>

        {/* Neighborhood */}
        <div className="space-y-2">
          <Label htmlFor="neighborhood">Bairro (Opcional)</Label>
          <Input
            id="neighborhood"
            placeholder="Digite o bairro"
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
          />
        </div>

        {/* Address Preview */}
        {selectedState && selectedCity && street && (
          <div className="p-3 bg-muted rounded-lg">
            <Label className="text-sm font-medium">Endereço a ser localizado:</Label>
            <p className="text-sm mt-1">
              {street}
              {neighborhood && `, ${neighborhood}`}
              , {selectedCity}
              , {states.find(s => s.id.toString() === selectedState)?.nome}
            </p>
          </div>
        )}

        {/* Origin Info */}
        <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-4 h-4 text-green-600" />
            <Label className="text-sm font-medium text-green-800 dark:text-green-200">
              Ponto de Origem (Sempre)
            </Label>
          </div>
          <p className="text-sm text-green-700 dark:text-green-300">
            São Paulo, SP - Centro de distribuição
          </p>
        </div>

        <Button 
          onClick={handleConfirmAddress} 
          disabled={!selectedState || !selectedCity || !street || loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Localizando...
            </>
          ) : (
            <>
              <MapPin className="w-4 h-4 mr-2" />
              Confirmar Endereço
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};