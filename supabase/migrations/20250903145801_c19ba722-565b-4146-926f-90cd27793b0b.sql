-- Fix the security definer view issue by explicitly using SECURITY INVOKER
-- This ensures the view runs with the querying user's privileges, not the owner's

DROP VIEW IF EXISTS public.public_profiles;

-- Create the view with SECURITY INVOKER to respect the querying user's RLS policies
CREATE VIEW public.public_profiles 
WITH (security_invoker = true) AS 
SELECT 
  user_id,
  name,
  avatar_url,
  bio,
  created_at
FROM public.profiles;

-- Grant appropriate permissions for the view
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;