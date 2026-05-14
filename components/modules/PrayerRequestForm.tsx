"use client";

import { useState, useEffect } from "react";
import { Tenant } from "@/types";
import { supabase } from "@/lib/supabase/client";
import { Send, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ServiceUnavailable from "./ServiceUnavailable";

export default function PrayerRequestForm({ tenant, onSuccess }: { tenant: Tenant, onSuccess: () => void }) {
    const [subject, setSubject] = useState("");
    const [content, setContent] = useState("");
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [consent, setConsent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [leaderStatus, setLeaderStatus] = useState<'loading' | 'open' | 'not_found'>('loading');

    useEffect(() => {
        if (!tenant?.id) return;
        async function checkLeader() {
            try {
                const res = await fetch(`/api/leader/status?tenantId=${tenant.id}&moduleKey=prayer`);
                const data = await res.json();
                setLeaderStatus(data.status);
            } catch (err) {
                console.error("Error fetching leader status:", err);
                setLeaderStatus('not_found');
            }
        }
        checkLeader();
    }, [tenant.id]);

    // Get user from local storage
    const getUser = () => {
        const stored = localStorage.getItem(`impact_member_${tenant.slug}`);
        return stored ? JSON.parse(stored) : null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!consent) {
            alert("Vous devez accepter la politique de confidentialité pour continuer.");
            return;
        }
        setLoading(true);

        const user = getUser();
        // Use dummy member ID if not found (or handle appropriately), technically user should be logged in
        const memberId = user?.id || null; // We might need to store member ID in storage or query it

        // For soft auth, we might not have a database UUID for the member if we didn't fetch it.
        // Ideally, we should resolve the member ID. For now, we'll rely on LocalStorage "soft" identity
        // and store details in content if member_id is purely optional or strict.
        // The Schema says member_id is UUID. We need to handle this.
        // Option: Upsert member on login? Or just perform a lookup now?

        // Simplification for Soft Auth: 
        // We will store the requester info in the JSONB content for now.
        // If strict member_id is needed, we'd need a real 'members' record.
        // Let's assume for this MVP we store data in content.

        try {
            const { error } = await supabase.from("requests").insert({
                tenant_id: tenant.id,
                type: "prayer",
                content: {
                    subject,
                    details: content,
                    is_anonymous: isAnonymous,
                    consent_rgpd: consent,
                    requester: isAnonymous ? "Anonyme" : { firstName: user?.firstName, lastName: user?.lastName }
                }
            });

            if (error) throw error;

            setSuccess(true);
            setTimeout(() => {
                onSuccess();
            }, 2000);
        } catch (err) {
            console.error("Error submitting prayer:", err);
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
            title="Service Prière Indisponible" 
            message="Le département de prière n'a pas encore de responsable assigné pour votre église." 
        />;
    }

    if (success) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center p-8 text-center space-y-6"
            >
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
                    <Send className="text-green-500" size={40} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white mb-2">Reçu 5/5 !</h3>
                    <p className="text-white/70">Ton sujet est entre de bonnes mains.</p>
                </div>
                <button
                    onClick={onSuccess}
                    className="w-full py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition transform active:scale-95"
                >
                    Fermer
                </button>
            </motion.div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Sujet</label>
                <input
                    type="text"
                    required
                    placeholder="Ex: Santé, Famille, Examen..."
                    className="w-full p-3 rounded-xl bg-white/10 border border-white/20 focus:border-gold outline-none text-white transition placeholder:text-white/60"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Détails</label>
                <textarea
                    required
                    rows={4}
                    placeholder="Partage-nous ce que tu as sur le cœur..."
                    className="w-full p-3 rounded-xl bg-white/10 border border-white/20 focus:border-gold outline-none text-white transition resize-none placeholder:text-white/60"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
            </div>

            <div className="space-y-3">
                <div className="flex items-center gap-3">
                    <div
                        onClick={() => setIsAnonymous(!isAnonymous)}
                        className={`w-6 h-6 rounded border cursor-pointer flex items-center justify-center transition ${isAnonymous ? 'bg-[var(--gold)] border-[var(--gold)]' : 'border-white/30'}`}
                    >
                        {isAnonymous && <motion.div layoutId="check" className="w-3 h-3 bg-black rounded-sm" />}
                    </div>
                    <span className="text-white/70 text-sm cursor-pointer" onClick={() => setIsAnonymous(!isAnonymous)}>Envoyer anonymement</span>
                </div>

                <div className="pt-4 border-t border-white/5">
                    <label className="flex items-start gap-4 p-4 rounded-2xl bg-[#0d1117] border border-white/5 cursor-pointer hover:bg-white/[0.04] transition-all group">
                        <div className={`mt-1 flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${consent ? 'bg-[var(--gold)] border-[var(--gold)]' : 'border-white/10 group-hover:border-[var(--gold)]/50'}`}>
                            <AnimatePresence>
                                {consent && (
                                    <motion.div
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0, opacity: 0 }}
                                    >
                                        <div className="w-2 h-2 bg-black rounded-full" />
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
                                J'accepte que mes données personnelles soient collectées et traitées par Impact Centre Chrétien dans le cadre de ma demande de prière.
                            </p>
                        </div>
                    </label>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-4 btn-primary font-bold flex items-center justify-center gap-2"
            >
                {loading ? <Loader2 className="animate-spin" /> : "Envoyer ma prière"}
            </button>
        </form>
    );
}
