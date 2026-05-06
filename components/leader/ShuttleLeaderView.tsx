"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { User, Phone, Save, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";

export default function ShuttleLeaderView({ tenantId }: { tenantId: string }) {
    const [leader, setLeader] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    // Form inputs
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");

    useEffect(() => {
        const fetchLeader = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from('module_leaders')
                .select('*')
                .eq('user_id', user.id)
                .eq('module_key', 'shuttle')
                .single();

            if (data) {
                setLeader(data);
                setFullName(data.full_name);
                setPhone(data.phone || "");
            }
            setLoading(false);
        };
        fetchLeader();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setStatus(null);

        try {
            const { error } = await supabase
                .from('module_leaders')
                .update({
                    full_name: fullName,
                    phone: phone
                })
                .eq('id', leader.id);

            if (error) throw error;
            
            setLeader({ ...leader, full_name: fullName, phone });
            setStatus({ type: 'success', message: "Informations mises à jour avec succès !" });
            
            // Clear status after 3 seconds
            setTimeout(() => setStatus(null), 3000);
        } catch (err: any) {
            setStatus({ type: 'error', message: err.message || "Une erreur est survenue" });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" size={32} /></div>;

    if (!leader) return <div className="text-white/40 text-center py-20 border border-dashed border-white/10 rounded-3xl">Responsable non trouvé.</div>;

    return (
        <div className="max-w-xl mx-auto space-y-8">
            <GlassCard className="p-8 overflow-hidden relative" glowColor="gold">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--gold)]/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
                
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <User className="text-[var(--gold)]" size={28} />
                    Mes Informations de Contact
                </h2>

                <p className="text-white/60 mb-8">
                    Renseignez vos coordonnées pour que les membres puissent vous contacter pour le service de navette.
                </p>

                <form onSubmit={handleSave} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Nom Complet</label>
                        <div className="relative group">
                            <input
                                type="text"
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 pl-12 text-white focus:border-[var(--gold)] outline-none transition-all"
                                placeholder="Jean Dupont"
                            />
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[var(--gold)] transition-colors" size={20} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Numéro de Téléphone</label>
                        <div className="relative group">
                            <input
                                type="tel"
                                required
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 pl-12 text-white focus:border-[var(--gold)] outline-none transition-all"
                                placeholder="+33 6 ..."
                            />
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[var(--gold)] transition-colors" size={20} />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="btn-primary w-full py-4 font-bold flex items-center justify-center gap-2 shadow-glow disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
                    >
                        {saving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Enregistrer les modifications</>}
                    </button>

                    <AnimatePresence>
                        {status && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={`p-4 rounded-2xl flex items-start gap-3 ${
                                    status.type === 'success' 
                                        ? 'bg-accent-success/10 text-accent-success border border-accent-success/20' 
                                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                }`}
                            >
                                {status.type === 'success' ? <CheckCircle2 size={20} className="shrink-0 mt-0.5" /> : <AlertCircle size={20} className="shrink-0 mt-0.5" />}
                                <p className="text-sm font-medium">{status.message}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </form>
            </GlassCard>

            <div className="p-6 rounded-3xl bg-[var(--gold)]/5 border border-[var(--gold)]/10">
                <h4 className="text-white font-bold mb-2 flex items-center gap-2 text-sm">
                    <AlertCircle size={16} className="text-[var(--gold)]" />
                    Note importante
                </h4>
                <p className="text-xs text-white/40 leading-relaxed">
                    Votre nom et votre numéro de téléphone seront directement visibles par les membres qui utilisent le service navette pour leur permettre de vous joindre facilement.
                </p>
            </div>
        </div>
    );
}
