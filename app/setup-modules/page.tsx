"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function SetupModules() {
    const [status, setStatus] = useState("");

    const activateStar = async () => {
        setStatus("Processing...");

        // 1. Get current user & tenant
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setStatus("Error: Not logged in");
            return;
        }

        const { data: tenantAdmin } = await supabase
            .from('tenant_admins')
            .select('tenant_id')
            .eq('user_id', user.id)
            .single();

        if (!tenantAdmin) {
            setStatus("Error: Not an admin");
            return;
        }

        // 2. Insert into 'modules' (if RLS allows, otherwise skipping might be issue if table is strict)
        // Try to insert 'star' if missing. 
        // Note: If 'modules' table is strictly managed by super-admin, this might fail, 
        // but usually in this MVP setup it might be open or we check.

        const { error: modError } = await supabase
            .from('modules')
            .upsert({ key: 'star', name: 'Devenir S.T.A.R' }, { onConflict: 'key' });

        if (modError) {
            console.error("Module insert error:", modError);
            // Continue anyway, maybe it exists
        }

        // 3. Insert into 'tenant_modules'
        const { error: tmError } = await supabase
            .from('tenant_modules')
            .upsert({
                tenant_id: tenantAdmin.tenant_id,
                module_key: 'star',
                is_active: true
            }, { onConflict: 'tenant_id, module_key' });

        if (tmError) {
            setStatus("Error activating: " + tmError.message);
        } else {
            setStatus("Success! STAR module activated.");
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
            <h1 className="text-2xl font-bold">Setup Modules</h1>
            <button
                onClick={activateStar}
                className="px-6 py-3 bg-gold text-black font-bold rounded-xl hover:bg-yellow-400"
            >
                Activate STAR Module
            </button>
            <p className="text-gold">{status}</p>
        </div>
    );
}
