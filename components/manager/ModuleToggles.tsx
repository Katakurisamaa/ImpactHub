"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Loader2, ToggleLeft, ToggleRight, Settings2 } from "lucide-react";
import { motion } from "framer-motion";

type ModuleConfig = {
    key: string; // The join key from modules table
    is_active: boolean;
    moduleName: string; // Joined name
    whatsapp_link?: string;
};

export default function ModuleToggles() {
    const [modules, setModules] = useState<ModuleConfig[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch tenant modules joined with module definitions
    const fetchModules = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get tenant ID
        const { data: tenantAdmin } = await supabase
            .from('tenant_admins')
            .select('tenant_id')
            .eq('user_id', user.id)
            .single();

        if (!tenantAdmin) return;

        // Fetch tenant_modules joined with modules
        // Note: Supabase JS join syntax can be tricky. 
        // We'll do a two-step fetch or use a view if complex, but here a simple query is fine.
        // 'tenant_modules' has 'module_key', we want 'modules' table info.
        // Actually, our schema might not have foreign key on string 'key', let's check.
        // Schema says: tenant_modules (tenant_id, module_key, is_active). modules (key, name).
        // Let's just fetch both and map.

        const { data: tenantModules } = await supabase
            .from('tenant_modules')
            .select('*')
            .eq('tenant_id', tenantAdmin.tenant_id);

        const { data: allModules } = await supabase
            .from('modules')
            .select('*');

        if (tenantModules && allModules) {
            const merged = allModules.map(m => {
                const tm = tenantModules.find(t => t.module_key === m.key);
                return {
                    key: m.key,
                    moduleName: m.name,
                    is_active: tm ? tm.is_active : false,
                    whatsapp_link: tm ? tm.whatsapp_link : ''
                };
            });
            setModules(merged);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchModules();
    }, []);

    const toggleModule = async (key: string, currentState: boolean) => {
        // Optimistic update
        setModules(prev => prev.map(m => m.key === key ? { ...m, is_active: !currentState } : m));

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: tenantAdmin } = await supabase
            .from('tenant_admins')
            .select('tenant_id')
            .eq('user_id', user.id)
            .single();

        if (!tenantAdmin) return;

        const { error } = await supabase
            .from('tenant_modules')
            .upsert({
                tenant_id: tenantAdmin.tenant_id,
                module_key: key,
                is_active: !currentState
            }, { onConflict: 'tenant_id, module_key' });

        if (error) {
            console.error("Error toggling:", error);
            // Revert
            setModules(prev => prev.map(m => m.key === key ? { ...m, is_active: currentState } : m));
        }
    };

    const updateLink = async (key: string, link: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: tenantAdmin } = await supabase
            .from('tenant_admins')
            .select('tenant_id')
            .eq('user_id', user.id)
            .single();

        if (!tenantAdmin) return;

        // Optimistic update
        setModules(prev => prev.map(m => m.key === key ? { ...m, whatsapp_link: link } : m));

        const { error } = await supabase
            .from('tenant_modules')
            .update({ whatsapp_link: link })
            .eq('tenant_id', tenantAdmin.tenant_id)
            .eq('module_key', key);

        if (error) {
            console.error("Error updating link:", error);
            alert("Erreur lors de l'enregistrement du lien.");
        }
    };

    const modulesWithLinks = ['men_impact', 'women_impact', 'church_group'];

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-gold" /></div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {modules.map((m) => (
                <div
                    key={m.key}
                    className={`p-6 rounded-2xl border transition-all duration-500 flex flex-col group ${m.is_active ? 'bg-[#0a0f1c]/80 border-emerald-500/50 shadow-[0_10px_30px_rgba(16,185,129,0.15)]' : 'bg-[#0a0f1c]/40 border-white/5 hover:border-white/20'}`}
                >
                    <div className="flex justify-between items-center w-full">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl transition-colors duration-500 ${m.is_active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[inset_0_0_15px_rgba(16,185,129,0.1)]' : 'bg-white/5 text-slate-500 border border-white/10 group-hover:text-slate-300'}`}>
                                <Settings2 size={24} className={m.is_active ? "animate-[spin_4s_linear_infinite]" : ""} />
                            </div>
                            <div>
                                <h4 className={`font-bold text-lg tracking-wide transition-colors ${m.is_active ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`}>{m.moduleName}</h4>
                                <p className="text-xs text-slate-500 font-mono mt-1">{m.key}</p>
                            </div>
                        </div>

                        <button
                            onClick={() => toggleModule(m.key, m.is_active)}
                            className="focus:outline-none transition-transform hover:scale-105"
                        >
                            {m.is_active ? (
                                <ToggleRight size={44} className="text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                            ) : (
                                <ToggleLeft size={44} className="text-slate-600 group-hover:text-slate-400" />
                            )}
                        </button>
                    </div>

                    {/* Link Input for specific modules */}
                    {m.is_active && modulesWithLinks.includes(m.key) && (
                        <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lien du groupe (WhatsApp/Autre)</label>
                            <input
                                type="text"
                                defaultValue={m.whatsapp_link || ''}
                                onBlur={(e) => updateLink(m.key, e.target.value)}
                                placeholder="https://chat.whatsapp.com/..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                            />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
