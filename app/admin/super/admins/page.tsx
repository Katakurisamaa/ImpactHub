"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { ShieldCheck, ShieldAlert, Loader2, Search, UserPlus, Trash2, Building } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AdminUser {
    id: string;
    full_name: string;
    email: string; // We'll try to get this from the session or profiles if available
    is_super_admin: boolean;
    tenant_name: string;
    tenant_id: string;
}

export default function AdminsManagementPage() {
    const [admins, setAdmins] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [currentIsRoot, setCurrentIsRoot] = useState(false);

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            setCurrentUserId(session?.user.id || null);

            // 1. Fetch all users from public.users
            const { data: allUsers, error: uError } = await supabase
                .from('users')
                .select('id, full_name, email');

            if (uError) throw uError;

            // 2. Fetch all tenant_admins links
            const { data: tenantAdmins, error: taError } = await supabase
                .from('tenant_admins')
                .select(`
                    user_id,
                    tenant_id,
                    created_by,
                    tenants ( name )
                `);

            if (taError) throw taError;

            // 3. Fetch all super admins
            const { data: superAdmins, error: saError } = await supabase
                .from('super_admins')
                .select('user_id, promoted_by');

            if (saError) throw saError;

            const superAdminIds = new Set(superAdmins.map(sa => sa.user_id));
            const promoterMap = new Map(superAdmins.map(sa => [sa.user_id, sa.promoted_by]));
            const managerIds = new Set(tenantAdmins.map(ta => ta.user_id));
            const creatorMap = new Map(tenantAdmins.map(ta => [ta.user_id, ta.created_by]));

            // Map tenant names by user_id
            const tenantMap = new Map<string, string[]>();
            tenantAdmins.forEach((ta: any) => {
                const existing = tenantMap.get(ta.user_id) || [];
                const name = ta.tenants?.name || "Inconnue";
                if (!existing.includes(name)) existing.push(name);
                tenantMap.set(ta.user_id, existing);
            });

            // Filter users: 
            // 1. If current user is "Root" (promoted_by is NULL), show ALL relevant users
            // 2. Otherwise, only show what they created/promoted
            const currentUserPromoter = promoterMap.get(session?.user.id || "");
            const isRootAdmin = currentUserPromoter === null;

            const filteredUsers = allUsers.filter((u: any) => {
                const isRelevant = managerIds.has(u.id) || superAdminIds.has(u.id);
                if (!isRelevant) return false;
                if (u.id === session?.user.id) return true; // Always see yourself

                if (isRootAdmin) return true; // Root sees everything

                const promotedBy = promoterMap.get(u.id);
                const createdBy = creatorMap.get(u.id);

                return promotedBy === session?.user.id || createdBy === session?.user.id;
            });

            // Merge everything
            const formattedAdmins: AdminUser[] = filteredUsers.map((u: any) => {
                const userTenants = tenantMap.get(u.id) || [];
                return {
                    id: u.id,
                    full_name: u.full_name || u.email || "Utilisateur sans nom",
                    email: u.email || "",
                    is_super_admin: superAdminIds.has(u.id),
                    tenant_name: userTenants.join(", ") || "Super Admin uniquement",
                    tenant_id: ""
                };
            });

            setCurrentIsRoot(isRootAdmin);
            setAdmins(formattedAdmins);
        } catch (error) {
            console.error("Error fetching admins:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSuperAdmin = async (userId: string, currentStatus: boolean) => {
        if (userId === currentUserId) {
            alert("Vous ne pouvez pas retirer vos propres droits de Super Admin.");
            return;
        }

        setProcessingId(userId);
        try {
            if (currentStatus) {
                // Demote: Remove from super_admins
                const { error } = await supabase
                    .from('super_admins')
                    .delete()
                    .eq('user_id', userId);
                if (error) throw error;
            } else {
                // Promote: Add to super_admins
                const { error } = await supabase
                    .from('super_admins')
                    .insert({
                        user_id: userId,
                        promoted_by: currentUserId
                    });
                if (error) throw error;
            }

            // Update local state
            setAdmins(prev => prev.map(admin =>
                admin.id === userId ? { ...admin, is_super_admin: !currentStatus } : admin
            ));
        } catch (error) {
            console.error("Error toggling super admin status:", error);
            alert("Une erreur est survenue lors du changement de droits.");
        } finally {
            setProcessingId(null);
        }
    };

    const filteredAdmins = admins.filter(admin =>
        admin.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        admin.tenant_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">Gestion des Administrateurs</h1>
                    <p className="text-muted-foreground mt-1 flex items-center gap-2">
                        {currentIsRoot
                            ? "Gérez tous les administrateurs du système."
                            : "Gérez les privilèges des managers que vous avez créés ou promus."}
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${currentIsRoot
                                ? 'bg-success/10 text-success border-success/20'
                                : 'bg-primary/10 text-primary border-primary/20'
                            }`}>
                            {currentIsRoot ? "Vue Globale" : "Vue Restreinte"}
                        </span>
                    </p>
                </div>

                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                    <input
                        type="text"
                        placeholder="Rechercher un administrateur..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-white/5 focus:border-primary outline-none transition"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </header>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                    <Loader2 className="animate-spin text-primary mb-4" size={48} />
                    <p className="text-muted-foreground">Chargement des administrateurs...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                        {filteredAdmins.map((admin) => (
                            <motion.div
                                key={`${admin.id}-${admin.tenant_id}`}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="group p-6 rounded-2xl bg-surface border border-white/5 hover:border-primary/20 transition-all duration-300 shadow-xl relative overflow-hidden"
                            >
                                {/* Status Glow */}
                                <div className={`absolute -right-8 -top-8 w-24 h-24 rounded-full blur-3xl opacity-10 transition-colors ${admin.is_super_admin ? 'bg-primary' : 'bg-muted-foreground'}`} />

                                <div className="relative flex items-start gap-4">
                                    <div className={`p-3 rounded-2xl ${admin.is_super_admin ? 'bg-primary/10 text-primary' : 'bg-white/5 text-muted-foreground'}`}>
                                        {admin.is_super_admin ? <ShieldCheck size={28} /> : <ShieldAlert size={28} />}
                                    </div>

                                    <div className="flex-1 space-y-1">
                                        <h3 className="font-bold text-lg text-foreground truncate">{admin.full_name}</h3>
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <Building size={14} />
                                            <span className="truncate max-w-[150px]">{admin.tenant_name}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Rôle Principal</p>
                                        <p className={`text-sm font-semibold mt-0.5 ${admin.is_super_admin ? 'text-primary' : 'text-muted-foreground'}`}>
                                            {admin.is_super_admin
                                                ? (admin.tenant_name && admin.tenant_name !== "Super Admin uniquement" ? 'Super Admin & Manager' : 'Super Admin')
                                                : 'Manager'}
                                        </p>
                                    </div>

                                    <button
                                        disabled={processingId === admin.id || admin.id === currentUserId}
                                        onClick={() => toggleSuperAdmin(admin.id, admin.is_super_admin)}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 transform active:scale-95 flex items-center gap-2 ${admin.is_super_admin
                                            ? 'bg-error/10 text-error hover:bg-error/20 border border-error/5 whitespace-nowrap'
                                            : 'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/5 whitespace-nowrap'
                                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        {processingId === admin.id ? (
                                            <Loader2 size={14} className="animate-spin" />
                                        ) : admin.is_super_admin ? (
                                            <>Retirer droits SA</>
                                        ) : (
                                            <>Promouvoir Super Admin</>
                                        )}
                                    </button>
                                </div>

                                {admin.id === currentUserId && (
                                    <div className="absolute top-2 right-2">
                                        <span className="bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold border border-primary/20">VOUS</span>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {!loading && filteredAdmins.length === 0 && (
                <div className="text-center py-20 bg-surface rounded-2xl border border-white/5">
                    <ShieldAlert className="mx-auto text-muted-foreground/30 mb-4" size={64} />
                    <h3 className="text-xl font-bold text-white mb-2">Aucun administrateur trouvé</h3>
                    <p className="text-white/40">Essayez de modifier vos critères de recherche.</p>
                </div>
            )}
        </div>
    );
}
