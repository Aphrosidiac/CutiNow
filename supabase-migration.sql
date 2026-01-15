-- CutiNow Supabase Migration
-- Execute this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. CREATE TABLES
-- ============================================

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('employee', 'admin')),
  join_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leave Types
CREATE TABLE IF NOT EXISTS leave_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  default_days INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leave Balances
CREATE TABLE IF NOT EXISTS leave_balances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES leave_types(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, leave_type_id)
);

-- Leave Requests
CREATE TABLE IF NOT EXISTS leave_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES leave_types(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_count INTEGER NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_remarks TEXT,
  file_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. CREATE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_leave_balances_user_id ON leave_balances(user_id);
CREATE INDEX IF NOT EXISTS idx_leave_balances_leave_type_id ON leave_balances(leave_type_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_user_id ON leave_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_leave_requests_created_at ON leave_requests(created_at DESC);

-- ============================================
-- 3. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Leave Types policies (everyone can read)
CREATE POLICY "Anyone can view leave types"
  ON leave_types FOR SELECT
  TO authenticated
  USING (true);

-- Leave Balances policies
CREATE POLICY "Users can view their own balances"
  ON leave_balances FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all balances"
  ON leave_balances FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Leave Requests policies
CREATE POLICY "Users can view their own requests"
  ON leave_requests FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own requests"
  ON leave_requests FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all requests"
  ON leave_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all requests"
  ON leave_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 4. FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leave_types_updated_at BEFORE UPDATE ON leave_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leave_balances_updated_at BEFORE UPDATE ON leave_balances
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leave_requests_updated_at BEFORE UPDATE ON leave_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile
  INSERT INTO profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'employee')
  );
  
  -- Initialize leave balances for all leave types
  INSERT INTO leave_balances (user_id, leave_type_id, balance)
  SELECT NEW.id, id, default_days
  FROM leave_types;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users for new registrations
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- 5. SEED DATA
-- ============================================

-- Insert default leave types
INSERT INTO leave_types (name, default_days) VALUES
  ('Annual Leave', 14),
  ('Sick Leave', 14),
  ('Hospitalization', 60),
  ('Emergency Leave', 3)
ON CONFLICT (name) DO NOTHING;

-- Note: Admin user must be created through Supabase Auth Dashboard or signup
-- After creating admin user, update their role:
-- UPDATE profiles SET role = 'admin' WHERE id = '<admin-user-id>';

-- ============================================
-- 6. HELPER FUNCTIONS FOR BACKEND
-- ============================================

-- Function to approve/reject leave request (handles transaction)
CREATE OR REPLACE FUNCTION process_leave_request(
  request_id UUID,
  new_status TEXT,
  remarks TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  request_record leave_requests;
  balance_record leave_balances;
  result JSON;
BEGIN
  -- Validate status
  IF new_status NOT IN ('approved', 'rejected') THEN
    RAISE EXCEPTION 'Invalid status. Must be approved or rejected.';
  END IF;

  -- Get request
  SELECT * INTO request_record FROM leave_requests WHERE id = request_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Leave request not found';
  END IF;

  IF request_record.status != 'pending' THEN
    RAISE EXCEPTION 'Request already processed';
  END IF;

  -- If approving, check and deduct balance
  IF new_status = 'approved' THEN
    SELECT * INTO balance_record 
    FROM leave_balances 
    WHERE user_id = request_record.user_id 
      AND leave_type_id = request_record.leave_type_id;

    IF balance_record.balance < request_record.days_count THEN
      RAISE EXCEPTION 'Insufficient leave balance';
    END IF;

    -- Deduct balance
    UPDATE leave_balances
    SET balance = balance - request_record.days_count
    WHERE user_id = request_record.user_id 
      AND leave_type_id = request_record.leave_type_id;
  END IF;

  -- Update request
  UPDATE leave_requests
  SET status = new_status,
      admin_remarks = remarks
  WHERE id = request_id;

  -- Return result
  SELECT json_build_object(
    'success', true,
    'message', 'Request ' || new_status,
    'request_id', request_id
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
