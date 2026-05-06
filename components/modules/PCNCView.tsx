"use client";

import { useEffect, useState } from "react";
import { GraduationCap, Loader2, Send, Calendar } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { Tenant } from "@/types";
import { motion } from "framer-motion";
import ServiceUnavailable from "./ServiceUnavailable";

interface Leader {
    full_name: string;
    phone: string;
    session_date?: string;
    is_active: boolean;
}

export default function PCNCView({ tenant, onSuccess }: { tenant: Tenant, onSuccess?: () => void }) {
    const [leader, setLeader] = useState<Leader | "not_found" | null>(null);
    const [loading, setLoading] = useState(true);

    // Form states
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!tenant?.id) return;

        // Prefill from local storage if available
        const stored = localStorage.getItem(`impact_member_${tenant.slug}`);
        if (stored) {
            try {
                const user = JSON.parse(stored);
                if (user.firstName) setFirstName(user.firstName);
                if (user.lastName) setLastName(user.lastName);
                if (user.email) setEmail(user.email);
                if (user.phone) setPhone(user.phone);
            } catch (e) {
                // Ignore parse errors
            }
        }

        async function fetchLeader() {
            try {
                const res = await fetch(`/api/leader/status?tenantId=${tenant.id}&moduleKey=registrations_pcnc`);
                if (!res.ok) throw new Error("Erreur réseau");
                const data = await res.json();

                if (data.status === "not_found") {
                    setLeader("not_found");
                } else if (data.status === "closed") {
                    setLeader({ full_name: "", phone: "", is_active: false });
                } else if (data.status === "open") {
                    setLeader({
                        full_name: data.leader.full_name,
                        phone: data.leader.phone,
                        session_date: data.leader.session_date,
                        is_active: true
                    });
                }
            } catch (err) {
                console.error("Error fetching PCNC leader:", err);
                setLeader("not_found");
            } finally {
                setLoading(false);
            }
        }

        fetchLeader();
    }, [tenant?.id, tenant?.slug]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tenant?.id) return;

        setSubmitting(true);

        const { error } = await supabase.from("requests").insert({
            tenant_id: tenant.id,
            type: "pcnc",
            content: {
                subject: "Nouvelle Inscription PCNC",
                sessionDate: typeof leader !== 'string' ? leader?.session_date : undefined,
                requester: {
                    firstName,
                    lastName,
                    email,
                    phone
                }
            }
        });

        setSubmitting(false);

        if (error) {
            console.error(error);
            alert("Erreur lors de l'envoi. Veuillez réessayer.");
        } else {
            setSuccess(true);
            setTimeout(() => {
                if (onSuccess) onSuccess();
            }, 2500);
        }
    };

    if (!tenant?.id) return null;

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    if (leader === "not_found") {
        return <ServiceUnavailable />;
    }

    if (!leader || !leader.is_active) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
                    <GraduationCap className="text-red-400" size={32} />
                </div>
                <h3 className="text-xl font-bold text-white">Session fermée</h3>
                <p className="text-white/60">
                    Les inscriptions pour le Parcours Nouvelle Création sont fermées pour le moment. Revenez plus tard !
                </p>
            </div>
        );
    }

    if (success) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center p-8 text-center"
            >
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                    <Send className="text-green-500" size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Inscription Réussie !</h3>
                <p className="text-white/60">Le responsable de la formation a bien reçu votre demande et vous recontactera très vite.</p>
            </motion.div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <div className="inline-flex p-4 rounded-full bg-primary/10 mb-2">
                    <GraduationCap size={40} className="text-primary" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Inscription PCNC</h3>
                {typeof leader !== 'string' && leader?.session_date && (
                    <div className="mb-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/20 border border-primary/30">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="text-sm font-semibold text-primary">Session : {leader.session_date}</span>
                    </div>
                )}
                <p className="text-white/60 text-sm px-4">
                    Remplissez ce formulaire pour vous inscrire à la prochaine session de formation.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">Prénom</label>
                        <input
                            type="text"
                            required
                            placeholder="Votre prénom"
                            className="w-full p-3 rounded-xl bg-white/5 border border-white/10 focus:border-gold outline-none text-white transition"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">Nom</label>
                        <input
                            type="text"
                            required
                            placeholder="Votre nom"
                            className="w-full p-3 rounded-xl bg-white/5 border border-white/10 focus:border-gold outline-none text-white transition"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Email</label>
                    <input
                        type="email"
                        required
                        placeholder="votre.email@exemple.com"
                        className="w-full p-3 rounded-xl bg-white/5 border border-white/10 focus:border-gold outline-none text-white transition"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Numéro de téléphone</label>
                    <input
                        type="tel"
                        required
                        placeholder="+33 6 ..."
                        className="w-full p-3 rounded-xl bg-white/5 border border-white/10 focus:border-gold outline-none text-white transition"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-4 rounded-xl bg-gold text-black font-bold flex items-center justify-center gap-2 hover:bg-yellow-400 transition transform active:scale-95 disabled:opacity-50"
                    >
                        {submitting ? <Loader2 className="animate-spin" /> : "Valider mon inscription"}
                    </button>
                </div>
            </form>
        </div>
    );
}
