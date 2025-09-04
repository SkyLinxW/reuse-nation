-- Grant SELECT permission on profiles table to anon and authenticated roles
-- This is needed for the public_profiles view to work properly for unauthenticated users
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT ON public.profiles TO authenticated;

-- Ensure the public_profiles view also has proper permissions (should already be set)
GRANT SELECT ON public.public_profiles TO anon;
GRANT SELECT ON public.public_profiles TO authenticated;