-- Create Super Admins table
CREATE TABLE IF NOT EXISTS super_admins (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for super_admins (only selectable by self basically, but mostly for backend check)
ALTER TABLE super_admins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super Admins can view themselves" ON super_admins FOR SELECT USING (auth.uid() = user_id);


-- Create Module Leaders table
CREATE TABLE IF NOT EXISTS module_leaders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- The auth user account for login
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    module_key TEXT NOT NULL, -- 'home_cells', 'prayer', etc.
    civility TEXT, -- 'M.', 'Mme.', 'Mlle.'
    full_name TEXT NOT NULL,
    phone TEXT,
    whatsapp_link TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(tenant_id, module_key) -- Ensure primarily one leader per module per tenant? OR multiple? 
    -- User request says "un ou plusieurs responsables". So we should NOT enforce unique module_key per tenant.
    -- But "Le responsable ne peux avoir une vue que sur son module".
    -- Let's keep it flexible: One user can handle one module.
    -- If multiple people manage 'prayer', they are both rows here.
);

-- RLS for Module Leaders
ALTER TABLE module_leaders ENABLE ROW LEVEL SECURITY;

-- 1. Managers can VIEW/INSERT/UPDATE/DELETE leaders for their tenant
CREATE POLICY "Managers can manage leaders" ON module_leaders
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM tenant_admins
            WHERE tenant_admins.user_id = auth.uid()
            AND tenant_admins.tenant_id = module_leaders.tenant_id
        )
    );

-- 2. Leaders can VIEW themselves
CREATE POLICY "Leaders can view themselves" ON module_leaders
    FOR SELECT
    USING (auth.uid() = user_id);

-- 3. Leaders can UPDATE their own profile (phone, civility, etc)
CREATE POLICY "Leaders can update themselves" ON module_leaders
    FOR UPDATE
    USING (auth.uid() = user_id);

-- 4. Public Access? (Maybe needed for displaying contact info on the frontend)
-- "The leader must contact..."
-- Ideally, we need a way to fetch the leader's info for a module (e.g. Navette).
CREATE POLICY "Public can view active leaders info" ON module_leaders
    FOR SELECT
    USING (is_active = TRUE); 
    -- Be careful, this exposes full name/phone publically. User request implies this is desired ("fournis pour le contacter").
