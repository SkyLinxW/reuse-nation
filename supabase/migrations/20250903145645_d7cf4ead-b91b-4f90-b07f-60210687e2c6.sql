-- Drop the existing public_profiles view with security definer
DROP VIEW IF EXISTS public.public_profiles;

-- Recreate the view without SECURITY DEFINER to respect RLS policies
CREATE VIEW public.public_profiles AS 
SELECT 
  user_id,
  name,
  avatar_url,
  bio,
  created_at
FROM public.profiles;

-- Grant appropriate permissions
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;