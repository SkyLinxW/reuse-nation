// Real address and geocoding services for Brazil
export interface BrazilianState {
  id: number;
  sigla: string;
  nome: string;
}

export interface BrazilianCity {
  id: number;
  nome: string;
  microrregiao: {
    mesorregiao: {
      UF: {
        sigla: string;
        nome: string;
      };
    };
  };
}

export interface AddressInfo {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface RouteInfo {
  distance: number; // em km
  duration: number; // em minutos
  coordinates: Coordinates[];
}

// Fetch Brazilian states
export const getBrazilianStates = async (): Promise<BrazilianState[]> => {
  try {
    const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome');
    if (!response.ok) throw new Error('Failed to fetch states');
    return await response.json();
  } catch (error) {
    console.error('Error fetching states:', error);
    return [];
  }
};

// Fetch cities by state
export const getCitiesByState = async (stateId: number): Promise<BrazilianCity[]> => {
  try {
    const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${stateId}/municipios?orderBy=nome`);
    if (!response.ok) throw new Error('Failed to fetch cities');
    return await response.json();
  } catch (error) {
    console.error('Error fetching cities:', error);
    return [];
  }
};

// Search address by CEP
export const getAddressByCep = async (cep: string): Promise<AddressInfo | null> => {
  try {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) throw new Error('Invalid CEP');
    
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    if (!response.ok) throw new Error('Failed to fetch address');
    
    const data = await response.json();
    if (data.erro) throw new Error('CEP not found');
    
    return data;
  } catch (error) {
    console.error('Error fetching address by CEP:', error);
    return null;
  }
};

// Geocode address to coordinates using Nominatim
export const geocodeAddress = async (address: string): Promise<Coordinates | null> => {
  try {
    console.log('Geocoding address:', address);
    
    const encodedAddress = encodeURIComponent(`${address}, Brasil`);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&countrycodes=br`,
      {
        headers: {
          'User-Agent': 'EcoMarketplace/1.0'
        }
      }
    );
    
    if (!response.ok) throw new Error('Geocoding failed');
    
    const data = await response.json();
    if (data.length === 0) throw new Error('Address not found');
    
    const result = {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon)
    };
    
    console.log('Geocoded coordinates:', result);
    return result;
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
};

// Calculate real route using OpenRouteService
export const calculateRealRoute = async (origin: Coordinates, destination: Coordinates): Promise<RouteInfo | null> => {
  try {
    console.log('Calculating real route:', { origin, destination });
    
    // Using OpenRouteService free tier
    const response = await fetch(
      `https://api.openrouteservice.org/v2/directions/driving-car?start=${origin.lng},${origin.lat}&end=${destination.lng},${destination.lat}`,
      {
        headers: {
          'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8'
        }
      }
    );
    
    if (!response.ok) {
      // Fallback to simple distance calculation if API fails
      console.warn('OpenRouteService failed, using fallback calculation');
      return calculateFallbackRoute(origin, destination);
    }
    
    const data = await response.json();
    const route = data.features[0];
    
    const distance = route.properties.segments[0].distance / 1000; // Convert to km
    const duration = route.properties.segments[0].duration / 60; // Convert to minutes
    const coordinates = route.geometry.coordinates.map(([lng, lat]: [number, number]) => ({ lat, lng }));
    
    const result = {
      distance,
      duration,
      coordinates
    };
    
    console.log('Real route calculated:', result);
    return result;
  } catch (error) {
    console.error('Error calculating real route:', error);
    return calculateFallbackRoute(origin, destination);
  }
};

// Fallback route calculation using Haversine formula
const calculateFallbackRoute = (origin: Coordinates, destination: Coordinates): RouteInfo => {
  console.log('Using fallback route calculation');
  
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(destination.lat - origin.lat);
  const dLng = toRadians(destination.lng - origin.lng);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(origin.lat)) * Math.cos(toRadians(destination.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  // Estimate duration: average speed of 60 km/h for highways, 40 km/h for cities
  const averageSpeed = distance > 100 ? 60 : 40;
  const duration = (distance / averageSpeed) * 60; // in minutes
  
  // Generate simple linear route
  const coordinates = generateLinearRoute(origin, destination);
  
  return {
    distance,
    duration,
    coordinates
  };
};

const generateLinearRoute = (start: Coordinates, end: Coordinates, points = 20): Coordinates[] => {
  const route: Coordinates[] = [];
  
  for (let i = 0; i <= points; i++) {
    const ratio = i / points;
    const lat = start.lat + (end.lat - start.lat) * ratio;
    const lng = start.lng + (end.lng - start.lng) * ratio;
    route.push({ lat, lng });
  }
  
  return route;
};

const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

// São Paulo default coordinates
export const SAO_PAULO_COORDINATES: Coordinates = {
  lat: -23.5505,
  lng: -46.6333
};