-- Fix security issue: Remove security definer function and rely on properly configured view
-- The get_public_profile function with SECURITY DEFINER is unnecessary since we have 
-- the public_profiles view with proper RLS policies and permissions

-- Drop the security definer function as it's redundant and poses security risks
DROP FUNCTION IF EXISTS public.get_public_profile(uuid);

-- The public_profiles view already provides the same functionality with proper security:
-- 1. It has SELECT permissions for anon and authenticated users
-- 2. It exposes only safe public fields (user_id, name, avatar_url, bio, created_at)
-- 3. It doesn't use SECURITY DEFINER, so it respects the caller's permissions