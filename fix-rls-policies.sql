-- Fix for RLS infinite recursion on profiles table
-- Execute this in Supabase SQL Editor

-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Recreate policies without recursion
-- Simple policy: users can view their own profile
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admins can view all profiles (check auth metadata instead of profile table)
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
    OR
    auth.uid() = id
  );

-- Also fix the leave_balances policies to avoid similar issues
DROP POLICY IF EXISTS "Admins can view all balances" ON leave_balances;
CREATE POLICY "Admins can view all balances"
  ON leave_balances FOR SELECT
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
    OR
    user_id = auth.uid()
  );

-- Fix leave_requests policies
DROP POLICY IF EXISTS "Admins can view all requests" ON leave_requests;
DROP POLICY IF EXISTS "Admins can update all requests" ON leave_requests;

CREATE POLICY "Admins can view all requests"
  ON leave_requests FOR SELECT
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
    OR
    user_id = auth.uid()
  );

CREATE POLICY "Admins can update all requests"
  ON leave_requests FOR UPDATE
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
  );
