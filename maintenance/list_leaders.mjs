import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://coegvfawxeszrgditpnf.supabase.co';
const supabaseServiceKey = 'sb_secret_QpFTOqNN-BOKqYWOQxYeqw_qKh6g3t1';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function run() {
    const { data: leaders, error } = await supabaseAdmin
        .from('module_leaders')
        .select('*');
        
    console.log("All leaders:");
    for (const l of leaders) {
        console.log(l.full_name);
    }
}

run();
