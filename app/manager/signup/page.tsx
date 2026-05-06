"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Mail, Lock, User, Phone, Loader2, ArrowRight, Check, MapPin, Eye, EyeOff, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

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
    const [moduleKey, setModuleKey] = useState("home_cells");
    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [availableModules, setAvailableModules] = useState<[string, string][]>([]);
    const [allAssigned, setAllAssigned] = useState(false);

    // Fetch campus name and assigned modules on mount
    useEffect(() => {
        const fetchCampusAndModules = async () => {
            if (!tenantId) {
                setInvalidLink(true);
                setLoadingCampus(false);
                return;
            }

            // Fetch tenant name
            const { data: tenantData, error: tenantError } = await supabase
                .from('tenants')
                .select('name')
                .eq('id', tenantId)
                .single();

            if (tenantError || !tenantData) {
                setInvalidLink(true);
                setLoadingCampus(false);
                return;
            }
            
            setCampusName(tenantData.name);

            // Fetch assigned modules
            const { data: leadersData, error: leadersError } = await supabase
                .from('module_leaders')
                .select('module_key')
                .eq('tenant_id', tenantId);

            if (leadersError) {
                setInvalidLink(true);
                setLoadingCampus(false);
                return;
            }

            const assignedKeys = leadersData.map(l => l.module_key);
            const available = Object.entries(MODULE_LABELS).filter(([key]) => !assignedKeys.includes(key));
            
            if (available.length === 0) {
                setAllAssigned(true);
            } else {
                setAvailableModules(available);
                setModuleKey(available[0][0]);
            }

            setLoadingCampus(false);
        };

        fetchCampusAndModules();
    }, [tenantId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

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
                <Loader2 className="animate-spin text-teal-500" size={32} />
                <p className="text-white/60 text-sm">Vérification du lien...</p>
            </div>
        );
    }

    if (invalidLink) {
        return (
            <div className="max-w-md mx-auto p-8 rounded-3xl bg-[#0a0f1c]/90 border border-red-500/20 text-center shadow-2xl backdrop-blur-xl">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                    <Shield className="text-red-400 w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Lien invalide</h2>
                <p className="text-slate-400 mb-8">
                    Ce lien d'inscription est invalide ou a expiré. Veuillez demander un nouveau lien à votre manager d'église.
                </p>
                <Link href="/leader/login" className="inline-block bg-white/5 hover:bg-white/10 text-white font-medium px-6 py-3 rounded-xl transition-all border border-white/10">
                    Retour à l'accueil
                </Link>
            </div>
        );
    }

    if (allAssigned) {
        return (
            <div className="max-w-md mx-auto p-8 rounded-3xl bg-[#0a0f1c]/90 border border-teal-500/20 text-center shadow-2xl backdrop-blur-xl">
                <div className="w-16 h-16 rounded-full bg-teal-500/10 flex items-center justify-center mx-auto mb-6 border border-teal-500/20">
                    <Shield className="text-teal-400 w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Équipe complète</h2>
                <p className="text-slate-400 mb-8">
                    Tous les modules ont déjà un responsable assigné pour <strong>{campusName}</strong>. 
                </p>
                <Link href="/leader/login" className="inline-block bg-white/5 hover:bg-white/10 text-white font-medium px-6 py-3 rounded-xl transition-all border border-white/10">
                    Retour à l'accueil
                </Link>
            </div>
        );
    }

    if (success) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md mx-auto p-8 rounded-3xl bg-[#0a0f1c]/90 border border-teal-500/20 text-center shadow-2xl backdrop-blur-xl relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-[80px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/5 rounded-full blur-[80px] pointer-events-none" />

                <div className="w-20 h-20 rounded-full bg-teal-500/20 flex items-center justify-center mx-auto mb-6 border border-teal-500/30 relative z-10 shadow-[0_0_30px_rgba(20,184,166,0.2)]">
                    <Check className="text-teal-400 w-10 h-10" />
                </div>
                <h2 className="text-3xl font-black text-white mb-3 tracking-tight relative z-10">Compte créé !</h2>
                <p className="text-slate-400 mb-8 relative z-10">
                    Votre compte de responsable pour <strong>{campusName}</strong> a été créé avec succès. Vous pouvez maintenant vous connecter.
                </p>
                <Link
                    href="/leader/login"
                    className="block w-full bg-teal-500 text-[#020617] font-black tracking-wide py-4 rounded-xl hover:bg-teal-400 transition-all shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:shadow-[0_0_30px_rgba(20,184,166,0.5)] relative z-10"
                >
                    Se connecter
                </Link>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md mx-auto relative z-10"
        >
            {/* Header */}
            <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-sm font-medium mb-6 backdrop-blur-md">
                    <MapPin size={16} />
                    <span>Église : <strong>{campusName}</strong></span>
                </div>
                <h1 className="text-4xl font-black text-white mb-4 tracking-tight drop-shadow-lg">
                    Rejoindre l'équipe
                </h1>
                <p className="text-slate-400 text-lg">
                    Créez votre compte responsable
                </p>
            </div>

            {/* Form Card */}
            <div className="p-8 rounded-3xl bg-[#0a0f1c]/80 border border-teal-500/20 shadow-[0_20px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl relative overflow-hidden group">
                {/* Glow effects */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-[50px] pointer-events-none group-hover:bg-teal-500/20 transition-colors duration-700" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-500/5 rounded-full blur-[50px] pointer-events-none group-hover:bg-teal-500/10 transition-colors duration-700" />

                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    <div className="space-y-4">
                        {/* Module Dropdown */}
                        <div>
                            <label className="block text-[11px] font-bold tracking-wider uppercase text-slate-400 mb-2 ml-1">
                                Module Responsable
                            </label>
                            <div className="relative group/input">
                                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-teal-400 transition-colors z-10" size={18} />
                                <select
                                    required
                                    value={moduleKey}
                                    onChange={e => setModuleKey(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:border-teal-400 focus:ring-1 focus:ring-teal-400/50 outline-none transition-all appearance-none cursor-pointer relative z-0"
                                >
                                    {availableModules.map(([key, label]) => (
                                        <option key={key} value={key} className="bg-[#020617]">{label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Full Name */}
                        <div>
                            <label className="block text-[11px] font-bold tracking-wider uppercase text-slate-400 mb-2 ml-1">
                                Nom Complet
                            </label>
                            <div className="relative group/input">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-teal-400 transition-colors" size={18} />
                                <input
                                    type="text"
                                    required
                                    value={fullName}
                                    onChange={e => setFullName(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:border-teal-400 focus:ring-1 focus:ring-teal-400/50 outline-none placeholder:text-slate-600 transition-all"
                                    placeholder="Jean Dupont"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-[11px] font-bold tracking-wider uppercase text-slate-400 mb-2 ml-1">
                                Adresse Email
                            </label>
                            <div className="relative group/input">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-teal-400 transition-colors" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:border-teal-400 focus:ring-1 focus:ring-teal-400/50 outline-none placeholder:text-slate-600 transition-all"
                                    placeholder="jean.dupont@email.com"
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-[11px] font-bold tracking-wider uppercase text-slate-400 mb-2 ml-1">
                                Téléphone <span className="text-white/30 lowercase font-normal tracking-normal">(optionnel)</span>
                            </label>
                            <div className="relative group/input">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-teal-400 transition-colors" size={18} />
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:border-teal-400 focus:ring-1 focus:ring-teal-400/50 outline-none placeholder:text-slate-600 transition-all"
                                    placeholder="+33 6..."
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-[11px] font-bold tracking-wider uppercase text-slate-400 mb-2 ml-1">
                                Mot de Passe
                            </label>
                            <div className="relative group/input">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-teal-400 transition-colors" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    minLength={6}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl py-4 pl-12 pr-12 text-white focus:border-teal-400 focus:ring-1 focus:ring-teal-400/50 outline-none placeholder:text-slate-600 transition-all"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-2 ml-2">6 caractères minimum</p>
                        </div>
                    </div>

                    {/* Error Message */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex gap-3 items-start">
                                    <Shield size={18} className="shrink-0 mt-0.5" />
                                    <span>{error}</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-teal-500 text-[#020617] font-black tracking-wide py-4 mt-2 rounded-xl hover:bg-teal-400 transition-all shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:shadow-[0_0_30px_rgba(20,184,166,0.5)] flex justify-center items-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                <span>Création en cours...</span>
                            </>
                        ) : (
                            <>
                                <span>Créer mon compte</span>
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>
            </div>
            
            <p className="text-center text-slate-500 text-sm mt-8">
                Vous avez déjà un compte ?{' '}
                <Link href="/leader/login" className="text-teal-400 hover:text-teal-300 font-medium transition-colors">
                    Connectez-vous
                </Link>
            </p>
        </motion.div>
    );
}

export default function SignupPage() {
    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
            
            <Suspense fallback={
                <div className="flex flex-col items-center justify-center gap-4">
                    <Loader2 className="animate-spin text-teal-500" size={40} />
                    <p className="text-white/60">Chargement...</p>
                </div>
            }>
                <SignupFormContent />
            </Suspense>
        </div>
    );
}
