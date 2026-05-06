"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Loader2, Plus, Trash2, Edit2, Check, X, Settings, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";

export default function StarSettings({ tenantId }: { tenantId: string }) {
    const [departments, setDepartments] = useState<string[]>(["Accueil", "Intégration"]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [newDept, setNewDept] = useState("");
    const [editingIdx, setEditingIdx] = useState<number | null>(null);
    const [editingValue, setEditingValue] = useState("");

    useEffect(() => {
        if (!tenantId) return;

        async function fetchConfig() {
            const { data, error } = await supabase
                .from('module_configs')
                .select('config')
                .eq('tenant_id', tenantId)
                .eq('module_key', 'star')
                .maybeSingle();

            if (data?.config?.departments) {
                setDepartments(data.config.departments);
            }
            setLoading(false);
        }

        fetchConfig();
    }, [tenantId]);

    const handleSave = async (newList: string[]) => {
        setSaving(true);
        const { error } = await supabase
            .from('module_configs')
            .upsert({
                tenant_id: tenantId,
                module_key: 'star',
                config: { departments: newList },
                updated_at: new Date().toISOString()
            }, { onConflict: 'tenant_id, module_key' });

        if (error) {
            alert("Erreur lors de la sauvegarde : " + error.message);
        }
        setSaving(false);
    };

    const addDept = () => {
        if (!newDept.trim() || departments.includes(newDept.trim())) return;
        const newList = [...departments, newDept.trim()];
        setDepartments(newList);
        setNewDept("");
        handleSave(newList);
    };

    const deleteDept = (name: string) => {
        const newList = departments.filter(d => d !== name);
        setDepartments(newList);
        handleSave(newList);
    };

    const startEdit = (idx: number) => {
        setEditingIdx(idx);
        setEditingValue(departments[idx]);
    };

    const saveEdit = () => {
        if (editingIdx === null) return;
        const newList = [...departments];
        newList[editingIdx] = editingValue.trim();
        setDepartments(newList);
        setEditingIdx(null);
        handleSave(newList);
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-emerald-400" /></div>;

    return (
        <GlassCard className="p-8 border-emerald-500/20 bg-[#0a0f1c]/60 overflow-hidden relative">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Settings size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-black text-white tracking-tight">Configuration S.T.A.R</h3>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">Liste des départements</p>
                </div>
                {saving && (
                    <div className="ml-auto flex items-center gap-2 text-emerald-400 text-xs font-bold animate-pulse">
                        <Loader2 size={14} className="animate-spin" />
                        Synchronisation...
                    </div>
                )}
            </div>

            <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                        {departments.map((dept, idx) => (
                            <motion.div
                                key={dept}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="group relative"
                            >
                                {editingIdx === idx ? (
                                    <div className="flex items-center bg-white/5 border border-emerald-500/50 rounded-2xl p-4 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                                        <input 
                                            autoFocus
                                            className="bg-transparent text-sm text-white outline-none w-full"
                                            value={editingValue}
                                            onChange={(e) => setEditingValue(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                                        />
                                        <div className="flex gap-1 ml-2">
                                            <button onClick={saveEdit} className="p-1.5 hover:text-emerald-400 transition-colors">
                                                <Check size={18} />
                                            </button>
                                            <button onClick={() => setEditingIdx(null)} className="p-1.5 hover:text-red-400 transition-colors">
                                                <X size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between bg-white/[0.03] border border-white/5 rounded-2xl p-4 hover:border-emerald-500/30 transition-all duration-300 group">
                                        <span className="text-sm font-bold text-slate-200">{dept}</span>
                                        <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => startEdit(idx)}
                                                className="p-1.5 text-slate-500 hover:text-white transition-colors"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button 
                                                onClick={() => deleteDept(dept)}
                                                className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Add New */}
                    <div className="flex items-center bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 focus-within:border-emerald-500/40 transition-all group">
                        <input 
                            placeholder="Nouveau..."
                            className="bg-transparent text-sm text-white outline-none w-full placeholder:text-slate-600"
                            value={newDept}
                            onChange={(e) => setNewDept(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addDept()}
                        />
                        <button 
                            onClick={addDept}
                            className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-all ml-2"
                        >
                            <Plus size={18} />
                        </button>
                    </div>
                </div>

                <div className="mt-8 flex items-start gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                        <Check size={14} />
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed uppercase tracking-wider font-bold">
                        Les modifications sont enregistrées automatiquement et seront visibles immédiatement pour les nouveaux candidats S.T.A.R. 
                        Par défaut, les départements "Accueil" et "Intégration" sont suggérés.
                    </p>
                </div>
            </div>
        </GlassCard>
    );
}
