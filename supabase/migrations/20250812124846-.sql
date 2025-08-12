-- Create RPC function to get public profile data
CREATE OR REPLACE FUNCTION public.get_public_profile(profile_user_id UUID)
RETURNS TABLE(
  user_id UUID,
  name TEXT,
  avatar_url TEXT,
  bio TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.user_id,
    p.name,
    p.avatar_url,
    p.bio
  FROM public_profiles p
  WHERE p.user_id = profile_user_id;
END;
$$;