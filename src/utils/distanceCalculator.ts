// Distance calculation utilities
export interface Coordinates {
  lat: number;
  lng: number;
}

// Haversine formula to calculate distance between two coordinates
export const calculateDistance = (coord1: Coordinates, coord2: Coordinates): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(coord2.lat - coord1.lat);
  const dLng = toRadians(coord2.lng - coord1.lng);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.lat)) * Math.cos(toRadians(coord2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
};

const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

// Generate intermediate points for animation
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
  // Simple mock implementation - in real app, use geocoding API
  const city = Object.keys(cityCoordinates).find(city => 
    address.toLowerCase().includes(city.toLowerCase())
  );
  
  if (city) {
    // Add some random offset to simulate exact address
    const baseCoord = cityCoordinates[city];
    return {
      lat: baseCoord.lat + (Math.random() - 0.5) * 0.1,
      lng: baseCoord.lng + (Math.random() - 0.5) * 0.1
    };
  }
  
  // Default to São Paulo if no match
  return {
    lat: -23.5505 + (Math.random() - 0.5) * 0.1,
    lng: -46.6333 + (Math.random() - 0.5) * 0.1
  };
};