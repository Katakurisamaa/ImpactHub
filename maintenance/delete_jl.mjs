import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://coegvfawxeszrgditpnf.supabase.co';
const supabaseServiceKey = 'sb_secret_QpFTOqNN-BOKqYWOQxYeqw_qKh6g3t1';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function run() {
    const { data: leaders, error } = await supabaseAdmin
        .from('module_leaders')
        .select('*')
        .ilike('full_name', '%Jean Louis%');
        
    if (error) {
        console.error("Error fetching leaders:", error);
        return;
    }
    
    if (!leaders || leaders.length === 0) {
        console.log("No leader found with name 'Jean Louis'");
        return;
    }

    console.log("Found leaders:", leaders);

    for (const leader of leaders) {
        console.log(`Deleting leader ${leader.full_name} (ID: ${leader.id}, UserID: ${leader.user_id})...`);
        const { error: delError } = await supabaseAdmin
            .from('module_leaders')
            .delete()
            .eq('id', leader.id);
            
        if (delError) {
            console.error("Error deleting from module_leaders:", delError);
        } else {
            console.log("Deleted from module_leaders");
        }
        
        if (leader.user_id) {
            const { error: authDelError } = await supabaseAdmin.auth.admin.deleteUser(leader.user_id);
            if (authDelError) {
                console.error("Error deleting auth user:", authDelError);
            } else {
                console.log("Deleted auth user");
            }
        }
    }
}

run();
