-- ============================================
-- Supabase Auth Integration Setup
-- ============================================
-- This script sets up the integration between Supabase Auth and your custom users table
-- Run this AFTER you have run the main schema.sql

-- ============================================
-- 1. Enable RLS on users table
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON users;

-- Users can view their own data
CREATE POLICY "Users can view own data"
ON users FOR SELECT
USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data"
ON users FOR UPDATE
USING (auth.uid() = id);

-- Users can insert their own data (for signup)
CREATE POLICY "Enable insert for authenticated users only"
ON users FOR INSERT
WITH CHECK (auth.uid() = id);

-- ============================================
-- 2. Create trigger to auto-create user record
-- ============================================
-- This trigger automatically creates a record in the users table
-- when a new user signs up via Supabase Auth

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1)),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 3. Create helper function to get current user
-- ============================================
CREATE OR REPLACE FUNCTION public.get_current_user()
RETURNS TABLE (
  id UUID,
  email VARCHAR(255),
  display_name VARCHAR(100),
  avatar_url TEXT,
  default_budget INTEGER,
  default_city VARCHAR(100),
  preferences JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.email,
    u.display_name,
    u.avatar_url,
    u.default_budget,
    u.default_city,
    u.preferences
  FROM users u
  WHERE u.id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. Grant necessary permissions
-- ============================================
-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION public.get_current_user() TO authenticated;

-- ============================================
-- 5. Verification Queries (Optional)
-- ============================================
-- You can run these queries to verify the setup:

-- Check if RLS is enabled on users table
-- SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'users';

-- Check policies on users table
-- SELECT * FROM pg_policies WHERE tablename = 'users';

-- Check if trigger exists
-- SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
