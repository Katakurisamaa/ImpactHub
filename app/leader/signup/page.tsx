"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Mail, Lock, User, Phone, Loader2, ArrowRight, Check, MapPin, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

function SignupFormContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const tenantId = searchParams.get("tenant");

    const [campusName, setCampusName] = useState<string | null>(null);
    const [invalidLink, setInvalidLink] = useState(false);
    const [loadingCampus, setLoadingCampus] = useState(true);

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Fetch campus name on mount
    useEffect(() => {
        const fetchCampus = async () => {
            if (!tenantId) {
                setInvalidLink(true);
                setLoadingCampus(false);
                return;
            }

            const { data, error } = await supabase
                .from('tenants')
                .select('name')
                .eq('id', tenantId)
                .single();

            if (error || !data) {
                setInvalidLink(true);
            } else {
                setCampusName(data.name);
            }
            setLoadingCampus(false);
        };

        fetchCampus();
    }, [tenantId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/leader/register-pilot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    password,
                    fullName,
                    phone,
                    tenantId
                })
            });

            const contentType = res.headers.get("content-type");
            let data;
            if (contentType && contentType.includes("application/json")) {
                data = await res.json();
            } else {
                const text = await res.text();
                throw new Error("Erreur serveur: " + text.substring(0, 100));
            }

            if (!res.ok) {
                throw new Error(data.error || "Erreur inconnue");
            }

            setSuccess(true);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loadingCampus) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 py-20">
                <Loader2 className="animate-spin text-primary" size={32} />
                <p className="text-white/60 text-sm">Vérification du lien...</p>
            </div>
        );
    }

    if (invalidLink) {
        return (
            <div className="w-full max-w-md p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-red-500/20 shadow-2xl text-center">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin size={28} className="text-red-400" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Lien invalide</h2>
                <p className="text-white/60 text-sm mb-6">
                    Ce lien d&apos;inscription n&apos;est pas valide ou le campus est introuvable.
                    Contactez votre responsable pour obtenir un nouveau lien.
                </p>
                <Link
                    href="/leader/login"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition font-bold text-sm"
                >
                    Aller à la connexion <ArrowRight size={16} />
                </Link>
            </div>
        );
    }

    if (success) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-green-500/20 shadow-2xl text-center"
            >
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check size={28} className="text-green-400" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Compte créé avec succès !</h2>
                <p className="text-white/60 text-sm mb-6">
                    Votre compte pilote pour <span className="text-primary font-bold">{campusName}</span> a été créé.
                    Vous pouvez maintenant vous connecter.
                </p>
                <Link
                    href="/leader/login"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary-hover transition font-bold text-sm shadow-glow"
                >
                    Se connecter <ArrowRight size={16} />
                </Link>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl"
        >
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-4">
                    <MapPin size={14} />
                    {campusName}
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Inscription Pilote</h1>
                <p className="text-white/60 text-sm">
                    Créez votre compte pour gérer votre cellule de maison
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-xs font-medium text-white/60 mb-1.5">Nom complet</label>
                    <div className="relative">
                        <User className="absolute left-3.5 top-3 text-white/30" size={18} />
                        <input
                            type="text"
                            required
                            placeholder="Prénom Nom"
                            className="w-full py-3 pl-11 pr-4 rounded-xl bg-black/30 border border-white/10 focus:border-primary outline-none text-white placeholder-white/30 transition text-sm"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-medium text-white/60 mb-1.5">Email</label>
                    <div className="relative">
                        <Mail className="absolute left-3.5 top-3 text-white/30" size={18} />
                        <input
                            type="email"
                            required
                            placeholder="pilote@email.com"
                            className="w-full py-3 pl-11 pr-4 rounded-xl bg-black/30 border border-white/10 focus:border-primary outline-none text-white placeholder-white/30 transition text-sm"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-medium text-white/60 mb-1.5">Mot de passe</label>
                    <div className="relative">
                        <Lock className="absolute left-3.5 top-3 text-white/30" size={18} />
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            minLength={6}
                            placeholder="Min. 6 caractères"
                            className="w-full py-3 pl-11 pr-11 rounded-xl bg-black/30 border border-white/10 focus:border-primary outline-none text-white placeholder-white/30 transition text-sm"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-medium text-white/60 mb-1.5">Téléphone <span className="text-white/30">(optionnel)</span></label>
                    <div className="relative">
                        <Phone className="absolute left-3.5 top-3 text-white/30" size={18} />
                        <input
                            type="tel"
                            placeholder="06..."
                            className="w-full py-3 pl-11 pr-4 rounded-xl bg-black/30 border border-white/10 focus:border-primary outline-none text-white placeholder-white/30 transition text-sm"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>
                </div>

                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm text-center"
                        >
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary-hover shadow-glow transition transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <Loader2 className="animate-spin" size={20} />
                    ) : (
                        <>Créer mon compte <ArrowRight size={18} /></>
                    )}
                </button>
            </form>

            <p className="text-center text-white/40 text-xs mt-6">
                Vous avez déjà un compte ?{" "}
                <Link href="/leader/login" className="text-primary hover:underline font-medium">
                    Se connecter
                </Link>
            </p>
        </motion.div>
    );
}

export default function PilotSignupPage() {
    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-black">
            {/* Background Elements */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-600/15 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[120px]" />
            <div className="absolute top-[40%] left-[50%] translate-x-[-50%] w-[40%] h-[20%] bg-amber-500/5 rounded-full blur-[150px]" />

            <div className="relative z-10 w-full flex justify-center">
                <Suspense fallback={<div className="flex items-center gap-2 text-white/60"><Loader2 className="animate-spin" /> Chargement...</div>}>
                    <SignupFormContent />
                </Suspense>
            </div>
        </div>
    );
}
