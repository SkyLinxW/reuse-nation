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
    const { cep } = await req.json();
    
    if (!cep) {
      return new Response(
        JSON.stringify({ error: 'CEP is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const cleanCep = cep.replace(/\D/g, '');
    
    if (cleanCep.length !== 8) {
      return new Response(
        JSON.stringify({ error: 'Invalid CEP format' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    
    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch CEP' }),
        { 
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const data = await response.json();
    
    if (data.erro) {
      return new Response(
        JSON.stringify({ error: 'CEP not found' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify(data),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in fetch-cep function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
