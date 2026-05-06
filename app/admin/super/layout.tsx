"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Loader2, ShieldAlert, LayoutDashboard, Building, LogOut, User, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import PremiumLoader from "@/components/ui/PremiumLoader";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isManager, setIsManager] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push("/manager/login");
                return;
            }

            // Check roles
            const [superAdminRes, tenantAdminRes] = await Promise.all([
                supabase.from('super_admins').select('user_id').eq('user_id', session.user.id).single(),
                supabase.from('tenant_admins').select('tenant_id').eq('user_id', session.user.id).single()
            ]);

            setIsAuthorized(!!superAdminRes.data);
            setIsManager(!!tenantAdminRes.data);
            setLoading(false);
        };

        checkAuth();
    }, [router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/manager/login");
    };


    if (loading) return <PremiumLoader text="Chargement de l'administration..." />;

    if (!isAuthorized) {
        return (
            <div className="h-screen bg-background flex flex-col items-center justify-center text-center p-6">
                <ShieldAlert size={64} className="text-error mb-4" />
                <h1 className="text-2xl font-bold text-white mb-2">Accès Refusé</h1>
                <p className="text-white/60 mb-6">Vous n'avez pas les droits de Super Admin.</p>
                <button
                    onClick={() => router.push("/manager/dashboard")}
                    className="px-6 py-3 bg-white/10 rounded-xl text-white hover:bg-white/20"
                >
                    Retour au Dashboard Manager
                </button>
            </div>
        );
    }

    const NAV_ITEMS = [
        { href: "/admin/super", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/super/tenants", label: "Églises", icon: Building },
        { href: "/admin/super/admins", label: "Administrateurs", icon: ShieldAlert },
        { href: "/admin/super/profile", label: "Profil", icon: User },
    ];

    return (
        <div className="min-h-screen bg-background flex relative overflow-hidden">
            {/* Sidebar - Desktop */}
            <aside className="hidden md:flex w-64 border-r border-white/5 bg-surface p-6 flex-col">
                <div className="mb-8 pl-4">
                    <h2 className="text-xl font-bold text-foreground">Super Admin</h2>
                    <p className="text-xs text-primary/80 font-medium">ImpactHub Master</p>
                </div>

                <nav className="space-y-2 flex-1">
                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${pathname === item.href
                                ? "bg-primary text-primary-foreground shadow-glow font-semibold"
                                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                }`}
                        >
                            <item.icon size={20} />
                            {item.label}
                        </Link>
                    ))}

                    {isManager && (
                        <div className="pt-4 mt-2 border-t border-white/10">
                            <Link
                                href="/manager/dashboard"
                                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-muted-foreground hover:text-primary transition-all duration-300 group"
                            >
                                <LayoutDashboard size={20} className="group-hover:scale-110 transition" />
                                <span className="font-medium">Vue Manager</span>
                            </Link>
                        </div>
                    )}
                </nav>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl text-error hover:bg-error/10 transition mt-auto font-medium"
                >
                    <LogOut size={20} />
                    Déconnexion
                </button>
            </aside>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden absolute bottom-6 left-4 right-4 h-16 bg-surface/80 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl z-50 flex items-center justify-around px-2">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? "text-primary" : "text-muted-foreground"
                                }`}
                        >
                            {isActive && (
                                <div className="absolute top-0 w-12 h-1 bg-primary rounded-b-full shadow-[0_2px_12px_rgba(34,197,94,0.5)]" />
                            )}
                            <item.icon size={22} className={isActive ? "drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]" : ""} />
                            <span className="text-[8px] font-bold uppercase tracking-tighter">{item.label}</span>
                        </Link>
                    );
                })}
                {isManager && (
                    <Link
                        href="/manager/dashboard"
                        className="flex flex-col items-center justify-center w-full h-full space-y-1 text-emerald-400 hover:text-emerald-300 transition"
                        title="Vue Manager"
                    >
                        <LayoutGrid size={22} className="opacity-80" />
                        <span className="text-[8px] font-bold uppercase tracking-tighter">Manager</span>
                    </Link>
                )}
                <button
                    onClick={handleLogout}
                    className="flex flex-col items-center justify-center w-full h-full space-y-1 text-red-400 hover:text-red-300 transition"
                >
                    <LogOut size={22} />
                    <span className="text-[8px] font-bold uppercase tracking-tighter">Quitter</span>
                </button>
            </nav>

            {/* Content */}
            <main className="flex-1 overflow-y-auto bg-background h-screen pb-24 md:pb-0">
                {children}
            </main>
        </div>
    );
}
