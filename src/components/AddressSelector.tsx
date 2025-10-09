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
  getAddressCoordinates,
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
  const [isAddressSent, setIsAddressSent] = useState(false);
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
          title: "✓ Endereço encontrado",
          description: `${address.logradouro}${address.bairro ? ', ' + address.bairro : ''}, ${address.localidade} - ${address.uf}`,
        });
      } else {
        toast({
          title: "CEP não encontrado",
          description: "Por favor, verifique se o CEP está correto e tente novamente",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching CEP:', error);
      toast({
        title: "Erro ao buscar CEP",
        description: "Ocorreu um erro ao buscar o endereço. Tente novamente ou preencha manualmente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };



  const getFullAddress = () => {
    if (!selectedState || !selectedCity || !street) {
      return '';
    }
    
    const stateName = states.find(s => s.id.toString() === selectedState)?.nome || '';
    
    // Clean street to ensure it doesn't already contain city/state
    let cleanStreet = street.trim();
    
    // Remove city and state if they are already in the street field
    const cityToRemove = selectedCity.trim();
    const stateToRemove = stateName.trim();
    
    // Remove patterns like ", City" or ", State" from the end
    cleanStreet = cleanStreet.replace(new RegExp(`,\\s*${cityToRemove}.*$`, 'i'), '');
    cleanStreet = cleanStreet.replace(new RegExp(`,\\s*${stateToRemove}.*$`, 'i'), '');
    
    // Build clean address parts without duplications
    const addressParts: string[] = [];
    
    // Add street (cleaned)
    if (cleanStreet) {
      addressParts.push(cleanStreet);
    }
    
    // Add neighborhood if different from city
    if (neighborhood && neighborhood.trim() && neighborhood.trim() !== selectedCity.trim()) {
      addressParts.push(neighborhood.trim());
    }
    
    // Add city
    if (selectedCity.trim()) {
      addressParts.push(selectedCity.trim());
    }
    
    // Add state
    if (stateName.trim()) {
      addressParts.push(stateName.trim());
    }
    
    return addressParts.join(', ');
  };

  // Send address only once when all fields are complete and user stops editing
  useEffect(() => {
    // Reset sent flag when user changes any field
    setIsAddressSent(false);
  }, [selectedState, selectedCity, street, neighborhood]);

  // Handle address confirmation with explicit button
  const handleConfirmAddress = async () => {
    if (!selectedState || !selectedCity || !street.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha Estado, Cidade e Rua para confirmar o endereço",
        variant: "destructive"
      });
      return;
    }

    if (isAddressSent) {
      toast({
        title: "Endereço já confirmado",
        description: "O endereço já foi selecionado",
      });
      return;
    }

    const fullAddress = getFullAddress();
    console.log('AddressSelector - Confirming address:', fullAddress);

    setLoading(true);
    
    try {
      // Use geocoding service to get real coordinates
      const coordinates = await geocodeAddress(fullAddress);
      
      if (coordinates) {
        console.log('AddressSelector - Coordinates found:', coordinates);
        setIsAddressSent(true);
        onAddressSelected(fullAddress, coordinates);
        
        toast({
          title: "Endereço confirmado",
          description: "Endereço de entrega selecionado com sucesso",
        });
      } else {
        console.warn('AddressSelector - Could not geocode, using fallback');
        
        // Fallback to city-based coordinates
        const fallbackCoords = await getAddressCoordinates(fullAddress);
        setIsAddressSent(true);
        onAddressSelected(fullAddress, fallbackCoords);
        
        toast({
          title: "Endereço confirmado",
          description: "Usando localização aproximada da cidade",
        });
      }
    } catch (error) {
      console.error('AddressSelector - Error confirming:', error);
      toast({
        title: "Erro",
        description: "Não foi possível processar o endereço",
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

        {/* Confirm Button */}
        <Button 
          onClick={handleConfirmAddress}
          disabled={loading || !selectedState || !selectedCity || !street.trim() || isAddressSent}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Confirmando...
            </>
          ) : isAddressSent ? (
            '✓ Endereço Confirmado'
          ) : (
            'Confirmar Endereço'
          )}
        </Button>

      </CardContent>
    </Card>
  );
};