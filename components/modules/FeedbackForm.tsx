"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { Tenant } from "@/types";
import { motion } from "framer-motion";
import { MessageCircle, Send, Loader2, CheckCircle2 } from "lucide-react";
import ServiceUnavailable from "./ServiceUnavailable";

const CATEGORIES = [
    "Accueil",
    "Culte",
    "Baptême",
    "Séminaire",
    "Autre",
];

export default function FeedbackForm({
    tenant,
    onSuccess,
}: {
    tenant: Tenant;
    onSuccess: () => void;
}) {
    const [category, setCategory] = useState(CATEGORIES[1]);
    const [message, setMessage] = useState("");
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [consent, setConsent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [leaderStatus, setLeaderStatus] = useState<'loading' | 'open' | 'not_found'>('loading');

    useEffect(() => {
        if (!tenant?.id) return;
        async function checkLeader() {
            try {
                const res = await fetch(`/api/leader/status?tenantId=${tenant.id}&moduleKey=feedback`);
                const data = await res.json();
                setLeaderStatus(data.status);
            } catch (err) {
                console.error("Error fetching leader status:", err);
                setLeaderStatus('not_found');
            }
        }
        checkLeader();
    }, [tenant.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!consent) {
            alert("Vous devez accepter la politique de confidentialité pour continuer.");
            return;
        }
        setLoading(true);
        try {
            const user = JSON.parse(
                localStorage.getItem(`impact_member_${tenant.slug}`) || "{}"
            );

            const { error } = await supabase.from("requests").insert({
                tenant_id: tenant.id,
                type: "feedback",
                content: {
                    subject: `Retour : ${category}`,
                    category,
                    message,
                    is_anonymous: isAnonymous,
                    consent_rgpd: consent,
                    requester: isAnonymous ? { firstName: "Anonyme", lastName: "" } : { firstName: user.firstName, lastName: user.lastName },
                },
            });

            if (error) throw error;

            setSuccess(true);
            setTimeout(() => {
                onSuccess();
            }, 2000);
        } catch (err) {
            console.error("Error submitting feedback:", err);
            alert("Une erreur est survenue lors de l'envoi. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    };

    if (leaderStatus === 'loading') {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" size={32} /></div>;
    }

    if (leaderStatus !== 'open') {
        return <ServiceUnavailable 
            title="Service Retour Indisponible" 
            message="Le département des retours n'a pas encore de responsable assigné pour votre église." 
        />;
    }

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center h-full space-y-6">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 rounded-full bg-accent-success/20 flex items-center justify-center"
                >
                    <CheckCircle2 size={40} className="text-accent-success" />
                </motion.div>
                <div>
                    <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Merci pour votre retour !</h3>
                    <p className="text-white/70 leading-relaxed max-w-xs mx-auto">
                        Votre avis nous aide à nous améliorer chaque jour.
                    </p>
                </div>
                <button
                    onClick={onSuccess}
                    className="w-full py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition transform active:scale-95"
                >
                    Fermer
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                    Sur quel sujet souhaitez-vous faire un retour ?
                </label>
                <div className="grid grid-cols-2 gap-3">
                    {CATEGORIES.map((cat) => (
                        <div
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`p-3 rounded-xl border cursor-pointer text-center text-sm font-medium transition duration-300 ${category === cat
                                ? "bg-[var(--gold)] text-black border-[var(--gold)] shadow-glow"
                                : "bg-white/10 text-white/70 border-white/20 hover:border-[var(--gold)]/50 hover:text-white"
                                }`}
                        >
                            {cat}
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                    Votre message
                </label>
                <textarea
                    required
                    rows={5}
                    placeholder="Dites-nous ce que vous en avez pensé..."
                    className="w-full py-3 px-4 rounded-xl bg-white/10 border border-white/20 focus:border-[var(--gold)] outline-none text-white placeholder-white/60 transition resize-none"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
            </div>

            <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                        <input
                            type="checkbox"
                            className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-white/30 checked:bg-[var(--gold)] checked:border-[var(--gold)] transition-all"
                            checked={isAnonymous}
                            onChange={(e) => setIsAnonymous(e.target.checked)}
                        />
                        <CheckCircle2 size={14} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                    </div>
                    <span className="text-white/80 text-sm group-hover:text-white transition">Rester anonyme</span>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition">
                    <div className="relative flex items-center">
                        <input
                            type="checkbox"
                            className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-white/30 checked:bg-[var(--gold)] checked:border-[var(--gold)] transition-all"
                            checked={consent}
                            onChange={(e) => setConsent(e.target.checked)}
                            required
                        />
                        <CheckCircle2
                            size={14}
                            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none"
                        />
                    </div>
                    <span className="text-white/80 text-sm italic">Consentement RGPD <span className="text-[var(--gold)]">*</span></span>
                </label>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-4 btn-primary font-bold text-lg flex items-center justify-center gap-2"
            >
                {loading ? (
                    <Loader2 className="animate-spin" />
                ) : (
                    <>
                        Envoyer <Send size={20} />
                    </>
                )}
            </button>
        </form>
    );
}
