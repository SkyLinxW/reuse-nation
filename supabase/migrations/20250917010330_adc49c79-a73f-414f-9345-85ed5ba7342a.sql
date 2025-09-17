-- Add coordinates column to waste_items table to store product location coordinates
ALTER TABLE public.waste_items 
ADD COLUMN coordinates JSONB;