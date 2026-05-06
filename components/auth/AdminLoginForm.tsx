"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Mail, Lock, Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminLoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data: { user }, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
                if (error) throw error;
                if (!user) throw new Error("Erreur inconnue");

                // Check roles to decide redirection
                const [superAdminRes, tenantAdminRes] = await Promise.all([
                    supabase.from('super_admins').select('user_id').eq('user_id', user.id).single(),
                    supabase.from('tenant_admins').select('tenant_id').eq('user_id', user.id).single()
                ]);

                const isSuperAdmin = !!superAdminRes.data;
                const isTenantAdmin = !!tenantAdminRes.data;

                if (isTenantAdmin) {
                    router.push("/manager/dashboard");
                } else if (isSuperAdmin) {
                    router.push("/admin/super");
            } else {
                // Fallback or error: person has no roles
                setError("Vous n'avez pas les droits d'accès nécessaires.");
                await supabase.auth.signOut();
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl relative">
            <Link href="/" className="absolute top-6 left-6 p-2 rounded-full text-muted-foreground hover:text-white hover:bg-white/10 transition">
                <ArrowLeft size={20} />
            </Link>
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Manager Access</h1>
                <p className="text-white/60">Gérez votre église ImpactHub</p>
            </div>

            <form onSubmit={handleAuth} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Email</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-3.5 text-muted-foreground" size={20} />
                        <input
                            type="email"
                            required
                            placeholder="admin@impactcentrechretien.com"
                            className="w-full py-3 pl-12 pr-4 rounded-xl bg-surface border border-white/5 focus:border-primary outline-none text-foreground placeholder-muted-foreground/50 transition"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Mot de passe</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-3.5 text-muted-foreground" size={20} />
                        <input
                            type="password"
                            required
                            placeholder="••••••••"
                            className="w-full py-3 pl-12 pr-4 rounded-xl bg-surface border border-white/5 focus:border-primary outline-none text-foreground placeholder-muted-foreground/50 transition"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                {error && (
                    <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm text-center">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:bg-primary-hover shadow-glow transition transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <Loader2 className="animate-spin" />
                    ) : (
                        <>Se connecter <ArrowRight size={20} /></>
                    )}
                </button>

            </form>
        </div>
    );
}
