const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function cleanup() {
  console.log("Fetching active leaders...");
  const { data: leaders, error: leaderErr } = await supabase.from('module_leaders').select('full_name, tenant_id').eq('module_key', 'home_cells');
  if (leaderErr) { console.error(leaderErr); return; }
  
  console.log("Fetching home cells...");
  const { data: cells, error: cellErr } = await supabase.from('home_cells').select('id, leader_name, tenant_id, name');
  if (cellErr) { console.error(cellErr); return; }
  
  let deletedCount = 0;
  for (const cell of cells) {
    const isOrphan = !leaders.some(l => l.full_name === cell.leader_name && l.tenant_id === cell.tenant_id);
    if (isOrphan) {
      console.log(`Deleting orphan cell: ${cell.name} (Leader: ${cell.leader_name})`);
      await supabase.from('home_cells').delete().eq('id', cell.id);
      deletedCount++;
    }
  }
  console.log(`Successfully deleted ${deletedCount} orphaned cells.`);
}
cleanup();
