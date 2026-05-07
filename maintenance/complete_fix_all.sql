-- MASTER FIX SCRIPT
-- Run this to fix EVERYTHING (Requests + Home Cells)

-- ==========================================
-- PART 1: REQUESTS (Fixing the Member View Issue)
-- ==========================================

ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

-- 1. Give PUBLIC/ANON access (Crucial for Members to see their requests)
-- We use 'TO anon' to be explicit.
DROP POLICY IF EXISTS "Public can create requests" ON requests;
CREATE POLICY "Public can create requests" ON requests
    FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view requests" ON requests;
CREATE POLICY "Public can view requests" ON requests
    FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Public can delete requests" ON requests;
CREATE POLICY "Public can delete requests" ON requests
    FOR DELETE TO anon USING (true);


-- 2. Managers Access
DROP POLICY IF EXISTS "Managers can manage requests" ON requests;
CREATE POLICY "Managers can manage requests" ON requests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM tenant_admins
            WHERE tenant_admins.user_id = auth.uid()
            AND tenant_admins.tenant_id = requests.tenant_id
        )
    );

-- 3. Leaders Access
DROP POLICY IF EXISTS "Leaders can manage requests" ON requests;
CREATE POLICY "Leaders can manage requests" ON requests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM module_leaders 
            WHERE module_leaders.user_id = auth.uid() 
            AND module_leaders.tenant_id = requests.tenant_id
        )
    );


-- ==========================================
-- PART 2: HOME CELLS (Fixing Columns & Permissions)
-- ==========================================

-- Add any missing columns
ALTER TABLE home_cells 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_link TEXT,
ADD COLUMN IF NOT EXISTS meeting_time TEXT; 

ALTER TABLE home_cells ENABLE ROW LEVEL SECURITY;

-- 1. Managers Policy
DROP POLICY IF EXISTS "Managers can manage home cells" ON home_cells;
CREATE POLICY "Managers can manage home cells" ON home_cells
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM tenant_admins
            WHERE tenant_admins.user_id = auth.uid()
            AND tenant_admins.tenant_id = home_cells.tenant_id
        )
    );

-- 2. Leaders Policy
DROP POLICY IF EXISTS "Leaders can manage home cells" ON home_cells;
CREATE POLICY "Leaders can manage home cells" ON home_cells
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM module_leaders 
            WHERE module_leaders.user_id = auth.uid() 
            AND module_leaders.tenant_id = home_cells.tenant_id
        )
    );

-- 3. Public View Policy
DROP POLICY IF EXISTS "Public can view active home cells" ON home_cells;
CREATE POLICY "Public can view active home cells" ON home_cells
    FOR SELECT USING (is_active = TRUE);


-- ==========================================
-- PART 3: USERS TABLE & SUPER ADMIN ACCESS
-- ==========================================

-- 1. Create PUBLIC USERS table (Sync with Auth)
CREATE TABLE IF NOT EXISTS users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    tenant_id UUID, -- If you use multi-tenancy on users/members
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 2. Trigger to Handle New Users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Backfill Existing Users (Important!)
INSERT INTO public.users (id, email, full_name)
SELECT id, email, raw_user_meta_data->>'full_name'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 4. Super Admin Policies

-- Policy for Super Admins on Users (Members)
DROP POLICY IF EXISTS "Super Admins can manage users" ON users;
CREATE POLICY "Super Admins can manage users" ON users
    FOR ALL USING (
        EXISTS (SELECT 1 FROM super_admins WHERE super_admins.user_id = auth.uid())
    );

-- Policy for Super Admins on Requests
DROP POLICY IF EXISTS "Super Admins can manage requests" ON requests;
CREATE POLICY "Super Admins can manage requests" ON requests
    FOR ALL USING (
        EXISTS (SELECT 1 FROM super_admins WHERE super_admins.user_id = auth.uid())
    );

-- Policy for Super Admins on Home Cells
DROP POLICY IF EXISTS "Super Admins can manage home_cells" ON home_cells;
CREATE POLICY "Super Admins can manage home_cells" ON home_cells
    FOR ALL USING (
        EXISTS (SELECT 1 FROM super_admins WHERE super_admins.user_id = auth.uid())
    );
