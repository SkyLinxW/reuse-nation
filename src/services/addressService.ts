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

// Search address by CEP using edge function to avoid CORS issues
export const getAddressByCep = async (cep: string): Promise<AddressInfo | null> => {
  try {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) throw new Error('Invalid CEP');
    
    const response = await fetch(`https://zhanwvqujchafxaijujv.supabase.co/functions/v1/fetch-cep`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cep: cleanCep })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('CEP fetch error response:', errorText);
      throw new Error('Failed to fetch address');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching address by CEP:', error);
    return null;
  }
};

// Geocode address to coordinates using edge function
export const geocodeAddress = async (address: string): Promise<Coordinates | null> => {
  try {
    console.log('Geocoding address via edge function:', address);
    
    const response = await fetch(
      `https://zhanwvqujchafxaijujv.supabase.co/functions/v1/geocode-address`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address })
      }
    );
    
    if (!response.ok) {
      console.error('Geocoding failed:', await response.text());
      return null;
    }
    
    const data = await response.json();
    
    if (data.lat && data.lng) {
      const result = {
        lat: data.lat,
        lng: data.lng
      };
      console.log('Geocoded successfully:', result);
      return result;
    }
    
    return null;
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
};

// Calculate real route with robust fallback
export const calculateRealRoute = async (origin: Coordinates, destination: Coordinates): Promise<{ distance: number; duration: number; coordinates?: Coordinates[] } | null> => {
  try {
    // Validate coordinates
    if (!origin || !destination || 
        isNaN(origin.lat) || isNaN(origin.lng) || 
        isNaN(destination.lat) || isNaN(destination.lng)) {
      console.error('Invalid coordinates provided:', { origin, destination });
      return calculateFallbackRoute(origin || { lat: -23.5505, lng: -46.6333 }, 
                                   destination || { lat: -23.5505, lng: -46.6333 });
    }

    console.log('Calculating route:', { origin, destination });
    
    // Try OSRM with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    try {
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;
      
      const response = await fetch(osrmUrl, {
        headers: { 'User-Agent': 'EcoMarketplace/1.0' },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const distance = route.distance / 1000; // Convert to km
          const duration = route.duration; // Keep in seconds
          const coordinates = route.geometry.coordinates.map(([lng, lat]: [number, number]) => ({ lat, lng }));
          
          console.log('OSRM route calculated:', { distance, duration });
          return { distance, duration, coordinates };
        }
      }
    } catch (fetchError) {
      console.warn('OSRM fetch failed, using fallback:', fetchError);
      clearTimeout(timeoutId);
    }
    
    // Fallback to manual calculation
    console.log('Using fallback route calculation');
    return calculateFallbackRoute(origin, destination);
    
  } catch (error) {
    console.error('Error calculating route:', error);
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
  
  const result = {
    distance,
    duration,
    coordinates
  };
  
  console.log('Fallback route calculated:', result);
  return result;
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

// Mock function to get coordinates from address (for compatibility)
export const getAddressCoordinates = async (address: string): Promise<Coordinates> => {
  // First try geocoding
  const geocoded = await geocodeAddress(address);
  if (geocoded) {
    return geocoded;
  }
  
  // Fallback to city matching
  const mockCities: Record<string, Coordinates> = {
    'são paulo': { lat: -23.5505, lng: -46.6333 },
    'rio de janeiro': { lat: -22.9068, lng: -43.1729 },
    'belo horizonte': { lat: -19.9167, lng: -43.9345 },
    'brasília': { lat: -15.8267, lng: -47.9218 },
    'salvador': { lat: -12.9714, lng: -38.5014 },
    'fortaleza': { lat: -3.7319, lng: -38.5267 },
    'recife': { lat: -8.0476, lng: -34.8770 },
    'porto alegre': { lat: -30.0346, lng: -51.2177 },
    'curitiba': { lat: -25.4284, lng: -49.2733 },
    'goiânia': { lat: -16.6864, lng: -49.2643 },
    'campinas': { lat: -22.9099, lng: -47.0626 },
    'santos': { lat: -23.9609, lng: -46.3335 },
    'lucas do rio verde': { lat: -13.0583, lng: -55.9167 }
  };
  
  const addressLower = address.toLowerCase();
  
  for (const [city, coords] of Object.entries(mockCities)) {
    if (addressLower.includes(city)) {
      // Add some random offset to simulate exact address
      return {
        lat: coords.lat + (Math.random() - 0.5) * 0.02,
        lng: coords.lng + (Math.random() - 0.5) * 0.02
      };
    }
  }
  
  // Default to São Paulo with random offset
  return {
    lat: SAO_PAULO_COORDINATES.lat + (Math.random() - 0.5) * 0.02,
    lng: SAO_PAULO_COORDINATES.lng + (Math.random() - 0.5) * 0.02
  };
};

// São Paulo default coordinates (origin)
export const SAO_PAULO_COORDINATES: Coordinates = {
  lat: -23.5505,
  lng: -46.6333
};