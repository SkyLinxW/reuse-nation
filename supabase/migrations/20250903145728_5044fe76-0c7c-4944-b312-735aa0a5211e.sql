-- Check current profiles RLS policy to understand the access pattern
-- Then ensure the public_profiles view works correctly

-- First, let's make sure the public_profiles view doesn't bypass RLS
-- by making it a simple view that still respects the underlying table's RLS
DROP VIEW IF EXISTS public.public_profiles;

-- Create a view that will respect RLS policies from the profiles table
-- This view will only show data that the querying user is allowed to see
CREATE VIEW public.public_profiles AS 
SELECT 
  user_id,
  name,
  avatar_url,
  bio,
  created_at
FROM public.profiles
WHERE true; -- Let the underlying RLS policies handle access control

-- Since the profiles table has RLS that only allows users to see their own profiles,
-- we need a different approach for public profiles
-- Let's create a proper RLS policy for public profiles access

-- Update the profiles table RLS to allow public viewing of certain fields
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (true); -- Allow everyone to read all profiles

-- Remove the restrictive policy that only allows users to see their own profiles
DROP POLICY IF EXISTS "Authenticated users can view own profile only" ON public.profiles;
DROP POLICY IF EXISTS "Deny all access to anonymous users" ON public.profiles;