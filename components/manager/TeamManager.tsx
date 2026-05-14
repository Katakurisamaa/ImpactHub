"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Loader2, UserPlus, Trash2, Shield, AlertCircle, Eye, EyeOff, Plus, X, Copy, MessageCircle, Check } from "lucide-react";

type Leader = {
    id: string;
    full_name: string;
    module_key: string;
    user_id: string;
    tenant_id: string;
    created_at: string;
    phone?: string;
};

// Granular Module Labels
const MODULE_LABELS: Record<string, string> = {
    registrations_baptism: 'Inscriptions - Baptême',
    registrations_pcnc: 'Inscriptions - PCNC',
    rdv_pastoral: 'RDV - Pastoral',
    rdv_social: 'RDV - Social',
    home_cells: 'Cellules de Maison',
    shuttle: 'Navette',
    prayer: 'Prière',
    testimonies: 'Témoignages',
    feedback: 'Retour',
    star: 'Devenir S.T.A.R',
};

export default function TeamManager() {
    const [leaders, setLeaders] = useState<Leader[]>([]);
    const [loading, setLoading] = useState(true);
    const [tenantId, setTenantId] = useState<string | null>(null);

    // Form
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [moduleKey, setModuleKey] = useState("home_cells");
    const [status, setStatus] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);

    const fetchLeaders = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get tenant_id
        const { data: tenantAdmin } = await supabase
            .from('tenant_admins')
            .select('tenant_id')
            .eq('user_id', user.id)
            .single();

        if (!tenantAdmin) return;
        setTenantId(tenantAdmin.tenant_id);

        const { data } = await supabase
            .from('module_leaders')
            .select('*')
            .eq('tenant_id', tenantAdmin.tenant_id)
            .order('created_at', { ascending: false });

        if (data) {
            setLeaders(data);
            const available = Object.keys(MODULE_LABELS).filter(
                (key) => !data.some((l) => l.module_key === key)
            );
            if (available.length > 0 && !available.includes(moduleKey)) {
                setModuleKey(available[0]);
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchLeaders();
    }, []);

    const handleAddLeader = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("creating");

        if (!tenantId) {
            setStatus("error: Tenant ID manquant");
            return;
        }

        try {
            const res = await fetch('/api/manager/create-leader', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    password,
                    fullName,
                    phone,
                    moduleKey,
                    tenantId
                })
            });

            // Handle Non-JSON errors
            const contentType = res.headers.get("content-type");
            let data;
            if (contentType && contentType.includes("application/json")) {
                data = await res.json();
            } else {
                const text = await res.text();
                throw new Error("Server Error: " + text.substring(0, 50));
            }

            if (!res.ok) {
                setStatus("error: " + (data.error || "Erreur inconnue"));
                return;
            }

            setStatus("success");
            setEmail("");
            setPassword("");
            setFullName("");
            setPhone("");
            fetchLeaders();
            setTimeout(() => setStatus(""), 3000);

        } catch (err: any) {
            setStatus("error: " + err.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Retirer ce responsable ? Il ne pourra plus se connecter.")) return;

        const leaderToDelete = leaders.find(l => l.id === id);
        if (leaderToDelete) {
            if (leaderToDelete.module_key === 'home_cells') {
                // Manually delete cells associated with this leader as a fallback for missing ON DELETE CASCADE
                await supabase.from('home_cells').delete()
                    .eq('tenant_id', leaderToDelete.tenant_id)
                    .eq('leader_name', leaderToDelete.full_name);
            }
            // Future module-specific cleanup could go here
        }

        try {
            const res = await fetch(`/api/manager/delete-leader?id=${id}&userId=${leaderToDelete?.user_id || ''}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.error || 'Erreur lors de la suppression');
            }
            
            fetchLeaders();
        } catch (err: any) {
            alert("Erreur: " + err.message);
        }
    };

    const availableModules = Object.entries(MODULE_LABELS).filter(
        ([key]) => !leaders.some((l) => l.module_key === key)
    );

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-gold" /></div>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* List */}
            <div className="lg:col-span-2 space-y-6">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <Shield className="w-6 h-6 text-teal-400" />
                    Membres de l'équipe
                </h3>

                {leaders.length === 0 ? (
                    <div className="p-12 rounded-3xl bg-[#0a0f1c]/40 border border-white/5 text-center text-slate-500 italic shadow-inner">
                        Aucun responsable assigné pour le moment.
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {leaders.map((leader) => (
                            <div key={leader.id} className="p-5 rounded-2xl bg-[#0a0f1c]/80 border border-white/5 flex justify-between items-center group hover:border-teal-500/30 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(20,184,166,0.1)]">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 font-bold text-lg shadow-[inset_0_0_15px_rgba(20,184,166,0.1)]">
                                        {leader.full_name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-lg tracking-wide">{leader.full_name}</h4>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-[10px] uppercase font-bold tracking-wider bg-teal-500/10 text-teal-400 px-2.5 py-1 rounded-md border border-teal-500/20">
                                                {MODULE_LABELS[leader.module_key] || leader.module_key}
                                            </span>
                                            {leader.phone && <span className="text-xs text-slate-400">{leader.phone}</span>}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDelete(leader.id)}
                                    className="p-3 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                                    title="Révoquer"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Form */}
            <div className="p-8 rounded-3xl bg-[#0a0f1c]/90 border border-teal-500/20 h-fit shadow-[0_20px_40px_rgba(0,0,0,0.4)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-[50px] pointer-events-none group-hover:bg-teal-500/20 transition-colors duration-700" />
                <div className="flex justify-between items-center mb-6 relative z-10">
                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                        <UserPlus size={24} className="text-teal-400" />
                        Inviter un responsable
                    </h3>
                </div>

                <div className="relative z-10 mb-6 space-y-3">
                    <p className="text-sm text-slate-400 mb-4">
                        Partagez ce lien avec les responsables pour qu'ils créent leur propre compte, ou ajoutez-les manuellement.
                    </p>
                    
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => {
                                const url = `${window.location.origin}/manager/signup?tenant=${tenantId}`;
                                navigator.clipboard.writeText(url);
                                setLinkCopied(true);
                                setTimeout(() => setLinkCopied(false), 2000);
                            }}
                            className="w-full px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition text-sm bg-white/5 text-white hover:bg-white/10 border border-white/10"
                        >
                            {linkCopied ? <Check size={18} className="text-teal-400" /> : <Copy size={18} />}
                            {linkCopied ? "Lien copié !" : "Copier le lien d'inscription"}
                        </button>
                        
                        <button
                            onClick={() => {
                                const url = `${window.location.origin}/manager/signup?tenant=${tenantId}`;
                                const text = `Bonjour ! Voici le lien pour créer votre compte en tant que responsable de module : ${url}`;
                                window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                            }}
                            className="w-full px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition text-sm bg-green-600/20 text-green-400 hover:bg-green-600/30 border border-green-500/20"
                        >
                            <MessageCircle size={18} /> WhatsApp
                        </button>

                        <button
                            onClick={() => { if (isAdding) { setIsAdding(false); setStatus(""); } else setIsAdding(true); }}
                            className={`w-full px-4 py-3 mt-2 rounded-xl font-bold flex items-center justify-center gap-2 transition text-sm ${isAdding
                                ? "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
                                : "bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 border border-teal-500/20"}`}
                        >
                            {isAdding ? <X size={20} /> : <Plus size={20} />}
                            {isAdding ? "Annuler l'ajout manuel" : "Ajouter manuellement"}
                        </button>
                    </div>
                </div>

                {isAdding && availableModules.length === 0 && (
                    <div className="p-6 rounded-xl bg-slate-500/10 border border-white/5 text-center text-slate-400 mt-6 backdrop-blur-md">
                        Tous les modules ont déjà un responsable assigné.
                    </div>
                )}

                {isAdding && availableModules.length > 0 && (
                    <form onSubmit={handleAddLeader} className="space-y-5 relative z-10 pt-4 border-t border-white/10 mt-6">
                        <div>
                            <label className="block text-[11px] font-bold tracking-wider uppercase text-slate-400 mb-2">Email (Login)</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-xl p-3.5 text-white focus:border-teal-400 focus:ring-1 focus:ring-teal-400/50 outline-none placeholder:text-slate-600 transition-all"
                            placeholder="responsable@eglise.com"
                        />
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold tracking-wider uppercase text-slate-400 mb-2">Mot de Passe Provisoire</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                minLength={6}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-xl p-3.5 text-white focus:border-teal-400 focus:ring-1 focus:ring-teal-400/50 outline-none placeholder:text-slate-600 transition-all"
                                placeholder="******"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold tracking-wider uppercase text-slate-400 mb-2">Nom Complet</label>
                        <input
                            type="text"
                            required
                            value={fullName}
                            onChange={e => setFullName(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-xl p-3.5 text-white focus:border-teal-400 focus:ring-1 focus:ring-teal-400/50 outline-none placeholder:text-slate-600 transition-all"
                            placeholder="Jean Dupont"
                        />
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold tracking-wider uppercase text-slate-400 mb-2">Téléphone (Optionnel)</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-xl p-3.5 text-white focus:border-teal-400 focus:ring-1 focus:ring-teal-400/50 outline-none placeholder:text-slate-600 transition-all"
                            placeholder="06..."
                        />
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold tracking-wider uppercase text-slate-400 mb-2">Module Assigné</label>
                        <select
                            value={moduleKey}
                            onChange={e => setModuleKey(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-xl p-3.5 text-white focus:border-teal-400 focus:ring-1 focus:ring-teal-400/50 outline-none transition-all appearance-none cursor-pointer"
                        >
                            {availableModules.map(([key, label]) => (
                                <option key={key} value={key} className="bg-[#020617] text-white">{label}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={status === 'creating'}
                        className="w-full bg-teal-500 text-[#020617] font-black tracking-wide py-4 mt-2 rounded-xl hover:bg-teal-400 transition-all shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:shadow-[0_0_30px_rgba(20,184,166,0.5)] flex justify-center items-center gap-2"
                    >
                        {status === 'creating' ? <Loader2 className="animate-spin" /> : "Créer le compte"}
                    </button>

                    {status.startsWith('error') && (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex gap-3 items-start backdrop-blur-md">
                            <AlertCircle size={18} className="shrink-0 mt-0.5" />
                            {status.replace('error: ', '')}
                        </div>
                    )}
                    {status === 'success' && <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 text-sm font-bold text-center backdrop-blur-md">Responsable créé avec succès !</div>}
                    </form>
                )}
            </div>
        </div>
    );
}

