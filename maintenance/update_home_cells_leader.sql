-- Link home cells to leaders with ON DELETE CASCADE
ALTER TABLE home_cells
ADD COLUMN IF NOT EXISTS module_leader_id UUID REFERENCES module_leaders(id) ON DELETE CASCADE;

-- Update RLS policies to reflect this for leaders
-- Leaders can manage their OWN home cells.
DROP POLICY IF EXISTS "Leaders can manage home cells" ON home_cells;

CREATE POLICY "Leaders can manage home cells" ON home_cells
    FOR ALL
    USING (
        module_leader_id IN (
            SELECT id FROM module_leaders WHERE user_id = auth.uid()
        )
    );
