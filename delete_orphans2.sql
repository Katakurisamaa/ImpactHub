-- Clean up all orphaned cells regardless of is_active status
DELETE FROM home_cells
WHERE module_leader_id IS NULL;
