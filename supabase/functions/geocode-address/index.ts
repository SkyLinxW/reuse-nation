import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { address } = await req.json();

    if (!address) {
      throw new Error('Address is required');
    }

    console.log('Geocoding address:', address);

    // Try OpenCage first (has generous free tier)
    const openCageKey = Deno.env.get('OPENCAGE_API_KEY');
    
    if (openCageKey) {
      const openCageUrl = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=${openCageKey}&countrycode=br&limit=1`;
      
      const openCageResponse = await fetch(openCageUrl);
      
      if (openCageResponse.ok) {
        const data = await openCageResponse.json();
        
        if (data.results && data.results.length > 0) {
          const result = data.results[0];
          return new Response(
            JSON.stringify({
              lat: result.geometry.lat,
              lng: result.geometry.lng,
              formatted_address: result.formatted
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }

    // Fallback to Nominatim (rate limited but free)
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ', Brasil')}&limit=1&countrycodes=br`;
    
    const nominatimResponse = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'EcoMarketplace/1.0'
      }
    });

    if (nominatimResponse.ok) {
      const data = await nominatimResponse.json();
      
      if (data.length > 0) {
        return new Response(
          JSON.stringify({
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon),
            formatted_address: data[0].display_name
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // City-based fallback for common Brazilian cities
    const cityCoordinates: Record<string, { lat: number; lng: number }> = {
      'são paulo': { lat: -23.5505, lng: -46.6333 },
      'rio de janeiro': { lat: -22.9068, lng: -43.1729 },
      'belo horizonte': { lat: -19.9167, lng: -43.9345 },
      'brasília': { lat: -15.8267, lng: -47.9218 },
      'salvador': { lat: -12.9714, lng: -38.5014 },
      'fortaleza': { lat: -3.7319, lng: -38.5267 },
      'recife': { lat: -8.0476, lng: -34.8770 },
      'porto alegre': { lat: -30.0346, lng: -51.2177 },
      'curitiba': { lat: -25.4284, lng: -49.2733 }
    };

    const addressLower = address.toLowerCase();
    for (const [city, coords] of Object.entries(cityCoordinates)) {
      if (addressLower.includes(city)) {
        // Add small random offset for approximate location
        return new Response(
          JSON.stringify({
            lat: coords.lat + (Math.random() - 0.5) * 0.02,
            lng: coords.lng + (Math.random() - 0.5) * 0.02,
            formatted_address: address,
            fallback: true
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Default to São Paulo
    return new Response(
      JSON.stringify({
        lat: -23.5505,
        lng: -46.6333,
        formatted_address: address,
        fallback: true
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Geocoding error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
