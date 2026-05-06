"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Building, Users, Activity, QrCode, Search, ChevronRight, X } from "lucide-react";
import CampusQRCode from "@/components/manager/CampusQRCode";
import { Tenant } from "@/types";
import { GlassCard } from "@/components/ui/glass-card";
import PremiumLoader from "@/components/ui/PremiumLoader";

export default function SuperAdminDashboard() {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [stats, setStats] = useState({
        tenants: 0,
        users: 0,
        requests: 0
    });

    useEffect(() => {
        const fetchData = async () => {
            const { count: tenantCount, data: tenantData } = await supabase.from('tenants').select('*', { count: 'exact' });
            const { count: requests } = await supabase.from('requests').select('*', { count: 'exact', head: true });

            setStats({
                tenants: tenantCount || 0,
                users: 0,
                requests: requests || 0
            });

            if (tenantData) {
                setTenants(tenantData);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    const filteredTenants = tenants.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        t.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <PremiumLoader text="Connexion Super Admin..." />;

    return (
        <div className="p-4 md:p-8 space-y-8">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Vue d'ensemble</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div className="p-6 rounded-2xl bg-primary/10 border border-primary/20 backdrop-blur-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-muted-foreground text-sm mb-1">Total Églises</p>
                            <h3 className="text-4xl font-bold text-foreground">{stats.tenants}</h3>
                        </div>
                        <Building className="text-primary" size={32} />
                    </div>
                </div>

                <div className="p-6 rounded-2xl bg-accent-pink/10 border border-accent-pink/20 backdrop-blur-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-muted-foreground text-sm mb-1">Total Demandes</p>
                            <h3 className="text-4xl font-bold text-foreground">{stats.requests}</h3>
                        </div>
                        <Activity className="text-accent-pink" size={32} />
                    </div>
                </div>

                <div className="p-6 rounded-2xl bg-success/10 border border-success/20 backdrop-blur-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-muted-foreground text-sm mb-1">Status Système</p>
                            <h3 className="text-xl font-bold text-success">Opérationnel</h3>
                        </div>
                        <Activity className="text-success" size={32} />
                    </div>
                </div>
            </div>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h2 className="text-xl font-bold text-white">Gestion des Campus</h2>
                    <div className="relative w-full md:w-80">
                        <input 
                            type="text" 
                            placeholder="Rechercher un campus..."
                            className="w-full py-2.5 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 focus:border-primary outline-none text-white transition-all shadow-xl"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTenants.map((tenant) => (
                        <GlassCard key={tenant.id} className="p-5 bg-[#0a0f1c]/60 border-white/5 hover:border-emerald-500/20 transition-all duration-300">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-white mb-1">{tenant.name}</h3>
                                    <p className="text-xs text-slate-500 font-mono tracking-widest uppercase mb-4">{tenant.slug}</p>
                                    
                                    <button
                                        onClick={() => setSelectedTenant(tenant)}
                                        className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors py-2 px-3 rounded-lg bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/10 hover:border-emerald-500/20"
                                    >
                                        <QrCode size={14} /> Voir le QR Code
                                    </button>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center border border-white/5 text-slate-400">
                                    <ChevronRight size={20} />
                                </div>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            </div>

            {/* QR Code Modal Overlay */}
            {selectedTenant && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#020617]/90 backdrop-blur-xl" onClick={() => setSelectedTenant(null)} />
                    <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in duration-300">
                        <button 
                            onClick={() => setSelectedTenant(null)}
                            className="absolute -top-12 right-0 p-2 text-white/50 hover:text-white transition-colors"
                        >
                            <X size={24} />
                        </button>
                        <CampusQRCode slug={selectedTenant.slug} tenantName={selectedTenant.name} />
                    </div>
                </div>
            )}
        </div>
    );
}
