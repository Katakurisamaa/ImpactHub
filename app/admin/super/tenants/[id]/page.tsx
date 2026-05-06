"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Loader2, ArrowLeft, Users, MessageSquare, MapPin, Shield, Calendar, Mail } from "lucide-react";
import Link from "next/link";

type TenantDetail = {
    id: string;
    name: string;
    slug: string;
    church_code: string;
    created_at: string;
    members_count?: number;
    requests_count?: number;
    home_cells_count?: number;
    manager_email?: string;
};

export default function TenantDetailPage({ params }: { params: { id: string } }) {
    const [tenant, setTenant] = useState<TenantDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                // 1. Fetch Tenant Basic Info
                const { data: tenantData, error: tenantError } = await supabase
                    .from('tenants')
                    .select('*')
                    .eq('id', params.id)
                    .single();

                if (tenantError) throw tenantError;

                // 2. Fetch Stats
                const { count: membersCount } = await supabase
                    .from('users')
                    .select('*', { count: 'exact', head: true })
                    .eq('tenant_id', params.id);

                const { count: requestsCount } = await supabase
                    .from('requests')
                    .select('*', { count: 'exact', head: true })
                    .eq('tenant_id', params.id);

                const { count: cellsCount } = await supabase
                    .from('home_cells')
                    .select('*', { count: 'exact', head: true })
                    .eq('tenant_id', params.id);

                // 3. Fetch Manager Email
                // Complex join: tenant_admins -> users -> email
                // But simplified: we can select using inner join syntax if FK allows, 
                // OR just multiple queries.

                // Let's rely on `tenant_admins` connecting to `users`
                // But `users` table are MEMBERS usually.
                // Wait, our Manager Authentication is in `auth.users` (Supabase Auth).
                // `tenant_admins` links `tenant_id` to `auth.users.id`.
                // We CANNOT select from `auth.users` directly from the client (security).

                // Workaround: We can't display the manager email easily unless we stored it in public `users` table or we have a secure API.
                // However, I can use the same API I made earlier to "update" manager? No that's write only.
                // I will skip displaying the manager email for now if I can't get it cheaply, 
                // OR I can try to see if `public.users` has an entry for the admin?
                // Our schema has `users` (Members) and `super_admins`. 
                // Managers are just in `auth.users` and `tenant_admins`.
                // Displaying "Manager Email" is hard without a server component or an RPC.

                // Let's focus on statistics first.

                setTenant({
                    ...tenantData,
                    members_count: membersCount || 0,
                    requests_count: requestsCount || 0,
                    home_cells_count: cellsCount || 0,
                    manager_email: "Masqué (Auth Sécurisé)"
                });

            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (params.id) fetchDetails();
    }, [params.id]);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-black"><Loader2 className="animate-spin text-gold" /></div>;
    if (error) return <div className="text-red-500 p-8">Erreur: {error}</div>;
    if (!tenant) return <div className="text-white p-8">Introuvable</div>;

    return (
        <div className="min-h-screen bg-black text-white p-6">
            <Link href="/admin/super/tenants" className="flex items-center text-white/50 hover:text-white mb-6 transition">
                <ArrowLeft size={20} className="mr-2" /> Retour
            </Link>

            <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-8 mb-8 backdrop-blur-xl">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-4xl font-bold text-white">{tenant.name}</h1>
                            <span className="bg-gold/20 text-gold px-3 py-1 rounded-full text-sm font-mono border border-gold/30">
                                {tenant.church_code}
                            </span>
                        </div>
                        <p className="text-white/40 text-lg font-mono">/{tenant.slug}</p>
                        <p className="text-xs text-white/20 mt-2 font-mono">ID: {tenant.id}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* MODULE MEMBRES (Masqué en attendant développement)
                <div className="bg-white/5 border border-white/10 p-6 rounded-xl flex items-center gap-4">
                    <div className="p-4 rounded-full bg-primary/20 text-primary">
                        <Users size={32} />
                    </div>
                    <div>
                        <p className="text-white/40 text-sm">Membres Inscrits</p>
                        <p className="text-3xl font-bold">{tenant.members_count}</p>
                    </div>
                </div>
                */}

                <div className="bg-white/5 border border-white/10 p-6 rounded-xl flex items-center gap-4">
                    <div className="p-4 rounded-full bg-purple-500/20 text-purple-400">
                        <MessageSquare size={32} />
                    </div>
                    <div>
                        <p className="text-white/40 text-sm">Demandes / Prières</p>
                        <p className="text-3xl font-bold">{tenant.requests_count}</p>
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 p-6 rounded-xl flex items-center gap-4">
                    <div className="p-4 rounded-full bg-green-500/20 text-green-400">
                        <MapPin size={32} />
                    </div>
                    <div>
                        <p className="text-white/40 text-sm">Maisons d'Impact</p>
                        <p className="text-3xl font-bold">{tenant.home_cells_count}</p>
                    </div>
                </div>
            </div>

            {/* Manager Section */}
            <div className="mt-8 p-6 bg-white/5 border border-white/10 rounded-xl">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Shield size={20} className="text-gold" /> Zone Admin
                </h3>
                <p className="text-white/60 mb-4">
                    Pour gérer le manager de cette église, retournez sur la liste principale et utilisez l'icône de configuration.
                </p>
            </div>
        </div>
    );
}
