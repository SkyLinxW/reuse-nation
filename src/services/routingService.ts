// Real routing service using OSRM (Open Source Routing Machine)
import { Coordinates } from '@/utils/distanceCalculator';

export interface RouteInfo {
  distance: number; // in kilometers
  duration: number; // in seconds
  coordinates: Coordinates[]; // Array of lat,lng points forming the real route
}

const OSRM_BASE_URL = 'https://router.project-osrm.org';

export const calculateRealRoute = async (
  origin: Coordinates,
  destination: Coordinates
): Promise<RouteInfo | null> => {
  try {
    console.log('Calculating real route from', origin, 'to', destination);
    
    // OSRM API call for driving route
    const response = await fetch(
      `${OSRM_BASE_URL}/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&steps=true`
    );
    
    if (!response.ok) {
      throw new Error(`OSRM API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.routes || data.routes.length === 0) {
      throw new Error('No route found');
    }
    
    const route = data.routes[0];
    const geometry = route.geometry;
    
    // Convert the route coordinates to our format
    const coordinates: Coordinates[] = geometry.coordinates.map((coord: [number, number]) => ({
      lat: coord[1], // GeoJSON uses [lng, lat] format
      lng: coord[0]
    }));
    
    const routeInfo: RouteInfo = {
      distance: route.distance / 1000, // Convert meters to kilometers
      duration: route.duration, // Duration in seconds
      coordinates: coordinates
    };
    
    console.log('Real route calculated:', {
      distance: routeInfo.distance,
      duration: routeInfo.duration,
      pointsCount: coordinates.length
    });
    
    return routeInfo;
  } catch (error) {
    console.error('Error calculating real route:', error);
    return null;
  }
};

// Fallback function for when real routing fails
export const calculateFallbackRoute = (
  origin: Coordinates,
  destination: Coordinates,
  points: number = 50
): RouteInfo => {
  console.log('Using fallback route calculation');
  
  // Generate a simple straight line with some curvature
  const coordinates: Coordinates[] = [];
  
  for (let i = 0; i <= points; i++) {
    const ratio = i / points;
    
    // Add some curve to make it more realistic
    const curveFactor = Math.sin(ratio * Math.PI) * 0.01;
    
    const lat = origin.lat + (destination.lat - origin.lat) * ratio + curveFactor;
    const lng = origin.lng + (destination.lng - origin.lng) * ratio + curveFactor;
    
    coordinates.push({ lat, lng });
  }
  
  // Calculate approximate distance using Haversine formula
  const R = 6371; // Earth's radius in km
  const dLat = (destination.lat - origin.lat) * Math.PI / 180;
  const dLng = (destination.lng - origin.lng) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(origin.lat * Math.PI / 180) * Math.cos(destination.lat * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  // Estimate duration (assuming average 50 km/h in urban areas)
  const duration = (distance / 50) * 3600; // Convert hours to seconds
  
  return {
    distance,
    duration,
    coordinates
  };
};