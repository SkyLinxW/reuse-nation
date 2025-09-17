// Distance calculation utilities
export interface Coordinates {
  lat: number;
  lng: number;
}

// Haversine formula to calculate distance between two coordinates
export const calculateDistance = (coord1: Coordinates, coord2: Coordinates): number => {
  console.log('calculateDistance called with:', { coord1, coord2 });
  
  // Validate coordinates
  if (!coord1 || !coord2 || 
      typeof coord1.lat !== 'number' || typeof coord1.lng !== 'number' ||
      typeof coord2.lat !== 'number' || typeof coord2.lng !== 'number') {
    console.error('Invalid coordinates provided:', { coord1, coord2 });
    return 0;
  }

  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(coord2.lat - coord1.lat);
  const dLng = toRadians(coord2.lng - coord1.lng);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.lat)) * Math.cos(toRadians(coord2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  console.log('Calculated distance:', distance);
  return distance;
};

const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

// Generate intermediate points for animation (fallback - straight line)
export const generateRoute = (start: Coordinates, end: Coordinates, points: number = 50): Coordinates[] => {
  const route: Coordinates[] = [];
  
  for (let i = 0; i <= points; i++) {
    const ratio = i / points;
    const lat = start.lat + (end.lat - start.lat) * ratio;
    const lng = start.lng + (end.lng - start.lng) * ratio;
    route.push({ lat, lng });
  }
  
  return route;
};

// Generate real route with actual road data
export const generateRealRoute = async (start: Coordinates, end: Coordinates): Promise<Coordinates[]> => {
  try {
    // Import routing service to avoid circular dependency
    const { calculateRealRoute, calculateFallbackRoute } = await import('@/services/routingService');
    
    // Try to get real route first
    const routeInfo = await calculateRealRoute(start, end);
    
    if (routeInfo && routeInfo.coordinates.length > 0) {
      console.log('Using real route with', routeInfo.coordinates.length, 'points');
      return routeInfo.coordinates;
    }
    
    // Fallback to curve-enhanced straight line
    console.log('Using fallback route');
    const fallbackRoute = calculateFallbackRoute(start, end, 100);
    return fallbackRoute.coordinates;
  } catch (error) {
    console.error('Error generating real route, using simple fallback:', error);
    return generateRoute(start, end, 50);
  }
};

// Mock coordinates for major Brazilian cities
export const cityCoordinates: Record<string, Coordinates> = {
  'São Paulo': { lat: -23.5505, lng: -46.6333 },
  'Rio de Janeiro': { lat: -22.9068, lng: -43.1729 },
  'Belo Horizonte': { lat: -19.9167, lng: -43.9345 },
  'Brasília': { lat: -15.8267, lng: -47.9218 },
  'Salvador': { lat: -12.9714, lng: -38.5014 },
  'Fortaleza': { lat: -3.7319, lng: -38.5267 },
  'Recife': { lat: -8.0476, lng: -34.8770 },
  'Porto Alegre': { lat: -30.0346, lng: -51.2177 },
  'Curitiba': { lat: -25.4284, lng: -49.2733 },
  'Goiânia': { lat: -16.6864, lng: -49.2643 }
};

export const getCoordinatesFromAddress = (address: string): Coordinates => {
  console.log('getCoordinatesFromAddress called with:', address);
  
  if (!address || typeof address !== 'string') {
    console.error('Invalid address provided:', address);
    return { lat: -23.5505, lng: -46.6333 }; // Default São Paulo
  }

  // Simple mock implementation - in real app, use geocoding API
  const city = Object.keys(cityCoordinates).find(city => 
    address.toLowerCase().includes(city.toLowerCase())
  );
  
  if (city) {
    // Add some random offset to simulate exact address
    const baseCoord = cityCoordinates[city];
    const result = {
      lat: baseCoord.lat + (Math.random() - 0.5) * 0.1,
      lng: baseCoord.lng + (Math.random() - 0.5) * 0.1
    };
    console.log('Found city coordinates:', { city, result });
    return result;
  }
  
  // Default to São Paulo if no match
  const defaultCoords = {
    lat: -23.5505 + (Math.random() - 0.5) * 0.1,
    lng: -46.6333 + (Math.random() - 0.5) * 0.1
  };
  console.log('Using default São Paulo coordinates:', defaultCoords);
  return defaultCoords;
};