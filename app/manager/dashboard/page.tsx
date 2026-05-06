"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut, Settings, ShieldAlert, ShieldCheck, Activity } from "lucide-react";
import ModuleToggles from "@/components/manager/ModuleToggles";
import TeamManager from "@/components/manager/TeamManager";
import CampusQRCode from "@/components/manager/CampusQRCode";
import StarSettings from "@/components/manager/StarSettings";
import { GlassCard } from "@/components/ui/glass-card";
import PremiumLoader from "@/components/ui/PremiumLoader";

export default function ManagerDashboard() {
    const router = useRouter();
    const [email, setEmail] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'modules' | 'team'>('overview');
    const [loading, setLoading] = useState(true);

    const [tenantSlug, setTenantSlug] = useState<string>("");
    const [tenantId, setTenantId] = useState<string>("");
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const getUserAndTenant = async () => {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setEmail(user.email || "Admin");

                // Check Super Admin
                const { data: adminCheck } = await supabase
                    .from('super_admins')
                    .select('user_id')
                    .eq('user_id', user.id)
                    .single();
                setIsAdmin(!!adminCheck);

                // Fetch tenant
                const { data: adminData } = await supabase
                    .from('tenant_admins')
                    .select('tenant_id')
                    .eq('user_id', user.id)
                    .single();

                if (adminData) {
                    setTenantId(adminData.tenant_id);
                    const { data: tenantData } = await supabase
                        .from('tenants')
                        .select('slug')
                        .eq('id', adminData.tenant_id)
                        .single();

                    if (tenantData) {
                        setTenantSlug(tenantData.slug.toUpperCase());
                    }
                }
            }
            setLoading(false);
        };
        getUserAndTenant();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/manager/login");
    };

    if (loading) return <PremiumLoader text="Connexion Manager..." />;

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen pb-24 md:pb-12 text-slate-200">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 relative z-10">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/5 bg-white/[0.02] backdrop-blur-md mb-4 text-xs font-semibold text-emerald-400">
                        <ShieldCheck className="w-3 h-3" />
                        ESPACE MANAGER
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight">
                        Campus <span className="text-emerald-400">{tenantSlug}</span>
                    </h1>
                    <p className="text-slate-400 mt-2 font-light">Connecté en tant que <strong className="text-white font-medium">{email}</strong></p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    {isAdmin && (
                        <button
                            onClick={() => router.push("/admin/super")}
                            className="flex-1 md:flex-none px-5 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-all flex items-center justify-center gap-2 text-sm text-emerald-400 font-bold shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                        >
                            <ShieldAlert size={18} />
                            <span className="hidden sm:inline">Interface</span> Super Admin
                        </button>
                    )}
                    <button
                        onClick={handleLogout}
                        className="flex-1 md:flex-none px-5 py-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-red-500/10 hover:border-red-500/20 transition-all flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-red-400 group"
                    >
                        <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                        Déconnexion
                    </button>
                </div>
            </header>

            {/* Navigation par Onglets */}
            <div className="flex gap-2 md:gap-4 mb-10 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 relative z-10">
                <div className="flex p-1.5 bg-[#0a0f1c]/80 backdrop-blur-xl rounded-2xl border border-white/5 shadow-2xl">
                    {[
                        { id: 'overview', label: 'Vue d\'ensemble' },
                        { id: 'modules', label: 'Modules' },
                        { id: 'team', label: 'Équipe S.T.A.R' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as typeof activeTab)}
                            className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-500 whitespace-nowrap relative ${activeTab === tab.id
                                ? 'text-[#020617] bg-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.4)]'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <main className="relative z-10">
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                        <div onClick={() => setActiveTab('modules')} className="cursor-pointer group">
                            <GlassCard className="h-full p-8 flex flex-col justify-between bg-[#0a0f1c]/80 border-white/5 hover:border-amber-500/30 transition-all duration-500 shadow-2xl" glowColor="gold">
                                <div>
                                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6 border border-amber-500/20 group-hover:rotate-90 transition-transform duration-700">
                                        <Settings className="w-7 h-7 text-amber-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-3">Configuration</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed">
                                        Activez ou désactivez les différents modules fonctionnels de votre campus.
                                    </p>
                                </div>
                                <div className="mt-8 text-amber-400 text-sm font-bold flex items-center group-hover:translate-x-2 transition-transform duration-300">
                                    Gérer les modules <span className="ml-2">→</span>
                                </div>
                            </GlassCard>
                        </div>

                        <div onClick={() => setActiveTab('team')} className="cursor-pointer group">
                            <GlassCard className="h-full p-8 flex flex-col justify-between bg-[#0a0f1c]/80 border-white/5 hover:border-teal-500/30 transition-all duration-500 shadow-2xl">
                                <div>
                                    <div className="w-14 h-14 rounded-2xl bg-teal-500/10 flex items-center justify-center mb-6 border border-teal-500/20 group-hover:scale-110 transition-transform duration-500">
                                        <Activity className="w-7 h-7 text-teal-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-3">Équipe S.T.A.R</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed">
                                        Assignez des responsables qualifiés pour la gestion quotidienne des cellules et requêtes.
                                    </p>
                                </div>
                                <div className="mt-8 text-teal-400 text-sm font-bold flex items-center group-hover:translate-x-2 transition-transform duration-300">
                                    Gérer l'équipe <span className="ml-2">→</span>
                                </div>
                            </GlassCard>
                        </div>

                        <div className="lg:col-span-1">
                            {tenantSlug && <CampusQRCode slug={tenantSlug} />}
                        </div>
                    </div>
                )}

                {activeTab === 'modules' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-3xl font-bold text-white mb-8 tracking-tight">Configuration des <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Modules</span></h2>
                        <ModuleToggles />
                        {tenantId && (
                            <div className="mt-8">
                                <StarSettings tenantId={tenantId} />
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'team' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-3xl font-bold text-white mb-8 tracking-tight">Gestion de l'<span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-teal-600">Équipe</span></h2>
                        <TeamManager />
                    </div>
                )}
            </main>
        </div>
    );
}
