-- Add views column to track item views
ALTER TABLE public.waste_items 
ADD COLUMN views INTEGER DEFAULT 0;

-- Create function to increment views
CREATE OR REPLACE FUNCTION increment_waste_item_views(item_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.waste_items 
  SET views = COALESCE(views, 0) + 1 
  WHERE id = item_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;