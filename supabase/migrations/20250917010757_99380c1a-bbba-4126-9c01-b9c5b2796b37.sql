-- Fix search path for new function
CREATE OR REPLACE FUNCTION increment_waste_item_views(item_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.waste_items 
  SET views = COALESCE(views, 0) + 1 
  WHERE id = item_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;