-- Fix foreign key relationships step by step
-- First remove the duplicate foreign keys that are causing the many-to-one relationship errors

-- Remove duplicate foreign keys for waste_items relationships
ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS fk_cart_items_waste_item_id;
ALTER TABLE favorites DROP CONSTRAINT IF EXISTS fk_favorites_waste_item_id;
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS fk_transactions_waste_item_id;