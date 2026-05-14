"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { Tenant } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquareQuote, Send, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import ServiceUnavailable from "./ServiceUnavailable";
import PublicTestimoniesList from "./PublicTestimoniesList";

export default function TestimonyForm({
    tenant,
    onSuccess,
}: {
    tenant: Tenant;
    onSuccess: () => void;
}) {
    const [view, setView] = useState<'write' | 'read'>('write');
    const [topic, setTopic] = useState("");
    const [story, setStory] = useState("");
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [consent, setConsent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [leaderStatus, setLeaderStatus] = useState<'loading' | 'open' | 'not_found'>('loading');

    useEffect(() => {
        if (!tenant?.id) return;
        async function checkLeader() {
            try {
                const res = await fetch(`/api/leader/status?tenantId=${tenant.id}&moduleKey=testimonies`);
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
                type: "testimony",
                content: {
                    subject: topic || "Témoignage",
                    story: story,
                    is_anonymous: isAnonymous,
                    can_share_publicly: false,
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
            console.error("Error submitting testimony:", err);
            alert("Une erreur est survenue lors de l'envoi. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    };

    if (leaderStatus === 'loading') {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" size={32} /></div>;
    }

    if (view === 'write' && leaderStatus !== 'open') {
        return <ServiceUnavailable 
            title="Service Témoignages Indisponible" 
            message="Le département des témoignages n'a pas encore de responsable assigné pour votre église." 
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
                    <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Gloire à Dieu !</h3>
                    <p className="text-white/70 leading-relaxed max-w-xs mx-auto">
                        Votre témoignage a bien été reçu. Merci de partager ce que Dieu fait !
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
        <div className="h-full flex flex-col">
            <div className="flex p-1 bg-surface-highlight rounded-2xl mb-6 border border-white/5 relative shrink-0">
                <button
                    onClick={() => setView('write')}
                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 relative z-10 ${view === 'write' ? 'text-white shadow-glow' : 'text-muted-text hover:text-foreground'}`}
                >
                    Écrire
                </button>
                <button
                    onClick={() => setView('read')}
                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 relative z-10 ${view === 'read' ? 'text-white shadow-glow' : 'text-muted-text hover:text-foreground'}`}
                >
                    Lire les témoignages
                </button>
                {/* Animated Background Indicator */}
                <div
                    className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[var(--gold)] rounded-xl transition-all duration-300 ease-spring ${view === 'write' ? 'left-1' : 'left-[calc(50%+4px)]'}`}
                />
            </div>

            {view === 'read' ? (
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    <PublicTestimoniesList tenant={tenant} />
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                            De quoi s'agit-il ? (Titre)
                        </label>
                        <div className="relative">
                            <Sparkles
                                className="absolute left-4 top-3.5 text-white/60"
                                size={20}
                            />
                            <input
                                type="text"
                                required
                                placeholder="Ex: Guérison, Provision, Restauration..."
                                className="w-full py-3 pl-12 pr-4 rounded-xl bg-white/10 border border-white/20 focus:border-[var(--gold)] outline-none text-white placeholder-white/60 transition"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                            Racontez-nous tout
                        </label>
                        <textarea
                            required
                            rows={6}
                            placeholder="Écrivez ici votre témoignage..."
                            className="w-full p-4 rounded-xl bg-white/10 border border-white/20 focus:border-[var(--gold)] outline-none text-white placeholder-white/60 transition resize-none"
                            value={story}
                            onChange={(e) => setStory(e.target.value)}
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="flex items-center gap-4 p-4 rounded-2xl bg-[#0d1117] border border-white/5 cursor-pointer hover:bg-white/[0.04] transition-all group">
                            <div className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isAnonymous ? 'bg-[var(--gold)] border-[var(--gold)]' : 'border-white/10 group-hover:border-[var(--gold)]/50'}`}>
                                <AnimatePresence>
                                    {isAnonymous && (
                                        <motion.div
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0, opacity: 0 }}
                                        >
                                            <CheckCircle2 size={14} className="text-black" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            <input
                                type="checkbox"
                                className="hidden"
                                checked={isAnonymous}
                                onChange={(e) => setIsAnonymous(e.target.checked)}
                            />
                            <span className="text-white/80 text-sm font-medium">Rester anonyme</span>
                        </label>

                        <label className="flex items-start gap-4 p-4 rounded-2xl bg-[#0d1117] border border-white/5 cursor-pointer hover:bg-white/[0.04] transition-all group">
                            <div className={`mt-1 flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${consent ? 'bg-[var(--gold)] border-[var(--gold)]' : 'border-white/10 group-hover:border-[var(--gold)]/50'}`}>
                                <AnimatePresence>
                                    {consent && (
                                        <motion.div
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0, opacity: 0 }}
                                        >
                                            <CheckCircle2 size={14} className="text-black" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            <input
                                type="checkbox"
                                className="hidden"
                                checked={consent}
                                onChange={(e) => setConsent(e.target.checked)}
                                required
                            />
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-white/80 leading-snug">
                                    Consentement RGPD <span className="text-[var(--gold)]">*</span>
                                </p>
                                <p className="text-xs text-white/60 leading-relaxed">
                                    J'accepte que mes données personnelles soient collectées et traitées par Impact Centre Chrétien. Pour en savoir plus, consultez notre politique de confidentialité.
                                </p>
                            </div>
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
            )}
        </div>
    );
}
