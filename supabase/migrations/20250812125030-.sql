-- Fix RLS policies for public_profiles view to allow anonymous access
-- This view should be publicly readable for marketplace functionality

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow anonymous access to public profiles" ON public_profiles;

-- Enable RLS on the view 
ALTER VIEW public_profiles SET (security_barrier = true);
ALTER VIEW public_profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access to the view
CREATE POLICY "Allow public read access to public profiles view" 
ON public_profiles 
FOR SELECT 
TO public, anon
USING (true);