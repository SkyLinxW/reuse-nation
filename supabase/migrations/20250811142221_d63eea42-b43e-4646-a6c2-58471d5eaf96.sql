-- Create search history table for users
CREATE TABLE public.search_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  search_term TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, search_term)
);

-- Enable RLS
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;

-- Create policies for search history
CREATE POLICY "Users can view own search history" 
ON public.search_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own search history" 
ON public.search_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own search history" 
ON public.search_history 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reviewer_id UUID NOT NULL,
  reviewed_user_id UUID NOT NULL, 
  transaction_id UUID,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for reviews
CREATE POLICY "Anyone can view reviews" 
ON public.reviews 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create reviews" 
ON public.reviews 
FOR INSERT 
WITH CHECK (auth.uid() = reviewer_id);

-- Create eco impact tracking table
CREATE TABLE public.eco_impact (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  total_waste_reused NUMERIC NOT NULL DEFAULT 0,
  co2_saved NUMERIC NOT NULL DEFAULT 0,
  transactions_count INTEGER NOT NULL DEFAULT 0,
  category_impact JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert initial eco impact record
INSERT INTO public.eco_impact (total_waste_reused, co2_saved, transactions_count, category_impact)
VALUES (0, 0, 0, '{"plasticos": 0, "metais": 0, "papel": 0, "madeira": 0, "tecidos": 0, "eletronicos": 0, "organicos": 0, "outros": 0}');

-- Enable RLS (public read access)
ALTER TABLE public.eco_impact ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view eco impact" 
ON public.eco_impact 
FOR SELECT 
USING (true);

-- Create trigger for automatic timestamp updates on reviews
CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for automatic timestamp updates on transactions
CREATE TRIGGER update_transactions_updated_at
BEFORE UPDATE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update eco impact when transaction is completed
CREATE OR REPLACE FUNCTION public.update_eco_impact()
RETURNS TRIGGER AS $$
DECLARE
  waste_item_data RECORD;
  co2_factor NUMERIC;
  waste_weight NUMERIC;
  co2_saved_amount NUMERIC;
  current_impact RECORD;
  new_category_impact JSONB;
BEGIN
  -- Only update impact when transaction status changes to 'entregue'
  IF NEW.status = 'entregue' AND (OLD.status IS NULL OR OLD.status != 'entregue') THEN
    -- Get waste item details
    SELECT * INTO waste_item_data FROM public.waste_items WHERE id = NEW.waste_item_id;
    
    IF waste_item_data IS NOT NULL THEN
      -- Extract weight from quantity JSON
      waste_weight := (waste_item_data.quantity::jsonb->>'value')::numeric * NEW.quantity;
      
      -- Calculate CO2 saved based on category
      CASE waste_item_data.category
        WHEN 'plasticos' THEN co2_factor := 2.1;
        WHEN 'metais' THEN co2_factor := 3.5;
        WHEN 'papel' THEN co2_factor := 1.2;
        WHEN 'madeira' THEN co2_factor := 0.8;
        WHEN 'tecidos' THEN co2_factor := 1.8;
        WHEN 'eletronicos' THEN co2_factor := 4.2;
        WHEN 'organicos' THEN co2_factor := 0.3;
        ELSE co2_factor := 1.5;
      END CASE;
      
      co2_saved_amount := waste_weight * co2_factor;
      
      -- Get current impact
      SELECT * INTO current_impact FROM public.eco_impact ORDER BY updated_at DESC LIMIT 1;
      
      -- Update category impact
      new_category_impact := current_impact.category_impact;
      new_category_impact := jsonb_set(
        new_category_impact, 
        ARRAY[waste_item_data.category], 
        ((new_category_impact->>waste_item_data.category)::numeric + waste_weight)::text::jsonb
      );
      
      -- Update eco impact
      UPDATE public.eco_impact 
      SET 
        total_waste_reused = current_impact.total_waste_reused + waste_weight,
        co2_saved = current_impact.co2_saved + co2_saved_amount,
        transactions_count = current_impact.transactions_count + 1,
        category_impact = new_category_impact,
        updated_at = now()
      WHERE id = current_impact.id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for eco impact updates
CREATE TRIGGER update_eco_impact_on_transaction
AFTER UPDATE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_eco_impact();