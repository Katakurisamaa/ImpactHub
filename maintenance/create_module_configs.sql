-- Migration to create the module_configs table for centralized module settings
-- This table allows managers to configure specific module parameters (like STAR departments)

CREATE TABLE IF NOT EXISTS module_configs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    module_key TEXT NOT NULL,
    config JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(tenant_id, module_key)
);

-- Enable RLS
ALTER TABLE module_configs ENABLE ROW LEVEL SECURITY;

-- 1. Managers can manage their own module configs
DROP POLICY IF EXISTS "Managers can manage their module configs" ON module_configs;
CREATE POLICY "Managers can manage their module configs" ON module_configs
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM tenant_admins
            WHERE tenant_admins.user_id = auth.uid()
            AND tenant_admins.tenant_id = module_configs.tenant_id
        )
    );

-- 2. Public read access (essential for members to load the form configuration)
DROP POLICY IF EXISTS "Public can view module configs" ON module_configs;
CREATE POLICY "Public can view module configs" ON module_configs
    FOR SELECT
    USING (true);

-- Insert default departments for existing tenants if needed (optional)
-- This can be handled by the application logic (defaults in code)
