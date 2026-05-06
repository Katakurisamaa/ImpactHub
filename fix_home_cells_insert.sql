-- Correction des politiques RLS pour l'insertion ("INSERT") dans la table home_cells

-- 1. Redéfinir la politique "Managers can manage home cells"
DROP POLICY IF EXISTS "Managers can manage home cells" ON home_cells;

CREATE POLICY "Managers can manage home cells" ON home_cells
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM tenant_admins
            WHERE tenant_admins.user_id = auth.uid()
            AND tenant_admins.tenant_id = home_cells.tenant_id
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM tenant_admins
            WHERE tenant_admins.user_id = auth.uid()
            AND tenant_admins.tenant_id = tenant_id
        )
    );

-- 2. Redéfinir la politique "Leaders can manage home cells"
DROP POLICY IF EXISTS "Leaders can manage home cells" ON home_cells;

CREATE POLICY "Leaders can manage home cells" ON home_cells
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM module_leaders 
            WHERE module_leaders.user_id = auth.uid() 
            AND module_leaders.tenant_id = home_cells.tenant_id
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM module_leaders 
            WHERE module_leaders.user_id = auth.uid() 
            AND module_leaders.tenant_id = tenant_id
        )
    );
