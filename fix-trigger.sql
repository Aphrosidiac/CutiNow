-- Fix for the registration trigger
-- Execute this in Supabase SQL Editor to fix the handle_new_user function

-- Drop and recreate the function with proper RLS bypass
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Recreate function with SECURITY DEFINER to bypass RLS
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'employee')
  );
  
  -- Initialize leave balances for all leave types
  INSERT INTO public.leave_balances (user_id, leave_type_id, balance)
  SELECT NEW.id, id, default_days
  FROM public.leave_types;
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Also need to grant INSERT permissions for the trigger
GRANT INSERT ON public.profiles TO service_role;
GRANT INSERT ON public.leave_balances TO service_role;
GRANT SELECT ON public.leave_types TO service_role;
