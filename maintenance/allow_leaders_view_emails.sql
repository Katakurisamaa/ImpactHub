-- Allow Home Cell Leaders to view emails of pilots in their campus
-- This migration enables leaders to fetch email addresses from the public.users table for pilots managed within the same tenant.

DROP POLICY IF EXISTS "Leaders can view emails of pilots in their campus" ON public.users;
CREATE POLICY "Leaders can view emails of pilots in their campus" ON public.users
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM module_leaders viewer
        WHERE viewer.user_id = auth.uid()
        AND viewer.module_key = 'home_cells'
        AND EXISTS (
            SELECT 1 FROM module_leaders pilot
            WHERE pilot.user_id = public.users.id
            AND pilot.module_key = 'home_cells_pilot'
            AND pilot.tenant_id = viewer.tenant_id
        )
    )
);
