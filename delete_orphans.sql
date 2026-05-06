-- Clean up orphaned cells
DELETE FROM home_cells
WHERE module_leader_id IS NULL AND is_active = TRUE;
