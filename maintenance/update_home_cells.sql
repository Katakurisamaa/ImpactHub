-- Enable RLS for requests table
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

-- 1. Managers can view/manage all requests for their tenant
DROP POLICY IF EXISTS "Managers can manage requests" ON requests;
CREATE POLICY "Managers can manage requests" ON requests
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM tenant_admins
            WHERE tenant_admins.user_id = auth.uid()
            AND tenant_admins.tenant_id = requests.tenant_id
        )
    );

-- 2. Leaders can view/manage requests for their tenant
DROP POLICY IF EXISTS "Leaders can manage requests" ON requests;
DROP POLICY IF EXISTS "Leaders can view requests" ON requests; -- Drop old name if exists
CREATE POLICY "Leaders can manage requests" ON requests
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM module_leaders 
            WHERE module_leaders.user_id = auth.uid() 
            AND module_leaders.tenant_id = requests.tenant_id
        )
    );

-- 3. Users can view/create their own requests (Already likely exists, but ensuring)
-- CREATE POLICY "Users can manage own requests" ... (Skipping to avoid conflict if exists, focus on Managers/Leaders)


-- ALSO RE-APPLYING HOME CELL POLICIES JUST IN CASE
-- (Copying previous home cell logic to ensure single script execution fixes all)

-- Add missing columns to home_cells table
ALTER TABLE home_cells 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_link TEXT,
ADD COLUMN IF NOT EXISTS meeting_time TEXT; 

-- Enable RLS on home_cells just in case
ALTER TABLE home_cells ENABLE ROW LEVEL SECURITY;

-- 1. Managers Policy
DROP POLICY IF EXISTS "Managers can manage home cells" ON home_cells;
CREATE POLICY "Managers can manage home cells" ON home_cells
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM tenant_admins
            WHERE tenant_admins.user_id = auth.uid()
            AND tenant_admins.tenant_id = home_cells.tenant_id
        )
    );

-- 2. Leaders Policy (Link via module_leaders table)
DROP POLICY IF EXISTS "Leaders can manage home cells" ON home_cells;
CREATE POLICY "Leaders can manage home cells" ON home_cells
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM module_leaders 
            WHERE module_leaders.user_id = auth.uid() 
            AND module_leaders.tenant_id = home_cells.tenant_id
        )
    );

-- 3. Public View Policy (Read-only for everyone)
DROP POLICY IF EXISTS "Public can view active home cells" ON home_cells;
CREATE POLICY "Public can view active home cells" ON home_cells
    FOR SELECT
    USING (is_active = TRUE);
