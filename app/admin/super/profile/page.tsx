"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { User, Mail, Lock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function SuperAdminProfile() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Form States
    const [newEmail, setNewEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");

    // Status States
    const [emailStatus, setEmailStatus] = useState<{ type: 'success' | 'error' | null, msg: string }>({ type: null, msg: "" });
    const [passStatus, setPassStatus] = useState<{ type: 'success' | 'error' | null, msg: string }>({ type: null, msg: "" });
    const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
    const [isUpdatingPass, setIsUpdatingPass] = useState(false);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
                setNewEmail(user.email || "");
            }
            setLoading(false);
        };
        getUser();
    }, []);

    const handleUpdateEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdatingEmail(true);
        setEmailStatus({ type: null, msg: "" });

        const { error } = await supabase.auth.updateUser({ email: newEmail });

        if (error) {
            setEmailStatus({ type: 'error', msg: error.message });
        } else {
            setEmailStatus({ type: 'success', msg: "Un email de confirmation a été envoyé à votre nouvelle adresse (et l'ancienne)." });
        }
        setIsUpdatingEmail(false);
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdatingPass(true);
        setPassStatus({ type: null, msg: "" });

        if (newPassword.length < 6) {
            setPassStatus({ type: 'error', msg: "Le mot de passe doit contenir au moins 6 caractères." });
            setIsUpdatingPass(false);
            return;
        }

        const { error } = await supabase.auth.updateUser({ password: newPassword });

        if (error) {
            setPassStatus({ type: 'error', msg: error.message });
        } else {
            setPassStatus({ type: 'success', msg: "Mot de passe mis à jour avec succès !" });
            setNewPassword(""); // Clear field for security
        }
        setIsUpdatingPass(false);
    };

    if (loading) return <div className="p-8 text-primary"><Loader2 className="animate-spin" /> Chargement...</div>;

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto pb-24 md:pb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
                <User className="text-primary" size={32} />
                Mon Profil Super Admin
            </h1>
            <p className="text-muted-foreground mb-8">Gérez vos identifiants de connexion.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Email Section */}
                <div className="bg-surface border border-white/5 rounded-2xl p-6 backdrop-blur-md">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-primary/20 rounded-xl text-primary">
                            <Mail size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-foreground">Adresse Email</h2>
                            <p className="text-xs text-muted-foreground">Utilisée pour la connexion</p>
                        </div>
                    </div>

                    <form onSubmit={handleUpdateEmail} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">Nouvelle adresse email</label>
                            <input
                                type="email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                className="w-full bg-surface-highlight border border-white/10 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary/50"
                                required
                            />
                        </div>

                        {emailStatus.msg && (
                            <div className={`p-3 rounded-lg text-sm flex items-start gap-2 ${emailStatus.type === 'success' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                                {emailStatus.type === 'success' ? <CheckCircle2 size={16} className="mt-0.5" /> : <AlertCircle size={16} className="mt-0.5" />}
                                <span>{emailStatus.msg}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isUpdatingEmail || newEmail === user?.email}
                            className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-glow"
                        >
                            {isUpdatingEmail && <Loader2 className="animate-spin" size={16} />}
                            Mettre à jour l'Email
                        </button>
                    </form>
                </div>

                {/* Password Section */}
                <div className="bg-surface border border-white/5 rounded-2xl p-6 backdrop-blur-md">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-primary/20 rounded-xl text-primary">
                            <Lock size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-foreground">Mot de passe</h2>
                            <p className="text-xs text-muted-foreground">Sécurisez votre compte</p>
                        </div>
                    </div>

                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">Nouveau mot de passe</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-surface-highlight border border-white/10 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary/50"
                                required
                                minLength={6}
                            />
                        </div>

                        {passStatus.msg && (
                            <div className={`p-3 rounded-lg text-sm flex items-start gap-2 ${passStatus.type === 'success' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                                {passStatus.type === 'success' ? <CheckCircle2 size={16} className="mt-0.5" /> : <AlertCircle size={16} className="mt-0.5" />}
                                <span>{passStatus.msg}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isUpdatingPass || !newPassword}
                            className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-glow"
                        >
                            {isUpdatingPass && <Loader2 className="animate-spin" size={16} />}
                            Changer le mot de passe
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
}
