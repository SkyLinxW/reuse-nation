-- Check current RLS policies for favorites table
-- Drop existing policies that might be too restrictive
DROP POLICY IF EXISTS "Users can create own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can view own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON public.favorites;

-- Create new, more permissive policies for authenticated users
CREATE POLICY "Authenticated users can create favorites" 
ON public.favorites 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view own favorites" 
ON public.favorites 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete own favorites" 
ON public.favorites 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Grant necessary permissions to authenticated role
GRANT SELECT, INSERT, DELETE ON public.favorites TO authenticated;

-- Also ensure the public_profiles view has proper access
GRANT SELECT ON public.public_profiles TO anon, authenticated;