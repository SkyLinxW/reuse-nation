-- Grant access to public_profiles view for anonymous and authenticated users
-- Views inherit permissions from underlying tables, so we need to grant access directly

GRANT SELECT ON public_profiles TO anon;
GRANT SELECT ON public_profiles TO authenticated;