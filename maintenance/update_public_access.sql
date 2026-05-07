-- Enable RLS for requests table
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

-- 1. Managers Policy
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

-- 2. Leaders Policy
DROP POLICY IF EXISTS "Leaders can manage requests" ON requests;
CREATE POLICY "Leaders can manage requests" ON requests
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM module_leaders 
            WHERE module_leaders.user_id = auth.uid() 
            AND module_leaders.tenant_id = requests.tenant_id
        )
    );

-- 3. Public/Anon User Policy
-- We explicitly target 'anon' role to be safe, although public includes it.
DROP POLICY IF EXISTS "Public can create requests" ON requests;
CREATE POLICY "Public can create requests" ON requests
    FOR INSERT
    TO anon
    WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view requests" ON requests;
CREATE POLICY "Public can view requests" ON requests
    FOR SELECT
    TO anon
    USING (true);

DROP POLICY IF EXISTS "Public can delete requests" ON requests;
CREATE POLICY "Public can delete requests" ON requests
    FOR DELETE
    TO anon
    USING (true);

-- Also add 'authenticated' just in case the client is weirdly identifying, though usually it's anon.
DROP POLICY IF EXISTS "Public authenticated view backup" ON requests;
CREATE POLICY "Public authenticated view backup" ON requests
    FOR SELECT
    TO authenticated
    USING (true);
