"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { Tenant } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2, Send, Phone, Mail, Droplets, User, Calendar } from "lucide-react";

import ServiceUnavailable from "./ServiceUnavailable";

const FORMATIONS = ["001", "101", "201", "301", "IEBI"];

export default function BaptismForm({
    tenant,
    onSuccess,
}: {
    tenant: Tenant;
    onSuccess: () => void;
}) {
    const [gender, setGender] = useState("");
    const [lastName, setLastName] = useState("");
    const [firstName, setFirstName] = useState("");
    const [birthYear, setBirthYear] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [salvationPrayer, setSalvationPrayer] = useState("");
    const [confirmed, setConfirmed] = useState("");
    const [formations, setFormations] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [consent, setConsent] = useState(false);
    const [success, setSuccess] = useState(false);
    const [leaderStatus, setLeaderStatus] = useState<"not_found" | "closed" | "open">("not_found");
    const [sessionDate, setSessionDate] = useState<string | null>(null);

    useEffect(() => {
        if (!tenant?.id) return;

        async function fetchLeaderStatus() {
            try {
                const res = await fetch(`/api/leader/status?tenantId=${tenant.id}&moduleKey=registrations_baptism`);
                if (!res.ok) throw new Error("Erreur réseau");
                const data = await res.json();

                if (data.status === "not_found") {
                    setLeaderStatus("not_found");
                } else if (data.status === "closed") {
                    setLeaderStatus("closed");
                } else if (data.status === "open") {
                    setLeaderStatus("open");
                    setSessionDate(data.leader.session_date || null);
                }
            } catch (err) {
                console.error("Error fetching Baptism leader status:", err);
                setLeaderStatus("not_found");
            } finally {
                setLoading(false);
            }
        }

        fetchLeaderStatus();
    }, [tenant?.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!consent) {
            alert("Vous devez accepter la politique de confidentialité pour continuer.");
            return;
        }
        setSubmitting(true);

        const user = JSON.parse(
            localStorage.getItem(`impact_member_${tenant.slug}`) || "{}"
        );

        const { error } = await supabase.from("requests").insert({
            tenant_id: tenant.id,
            type: "baptism",
            content: {
                subject: "Inscription Baptême",
                sessionDate: sessionDate,
                gender,
                lastName,
                firstName,
                birthYear,
                email,
                phone,
                salvationPrayer,
                confirmed,
                formations,
                consent_rgpd: consent,
                requester: user,
            },
        });

        setSubmitting(false);

        if (error) {
            alert("Erreur lors de l'inscription. Veuillez réessayer.");
        } else {
            setSuccess(true);
            setTimeout(onSuccess, 3000);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    if (leaderStatus === "not_found") {
        return <ServiceUnavailable />;
    }

    if (leaderStatus === "closed") {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
                    <Droplets className="text-red-400" size={32} />
                </div>
                <h3 className="text-xl font-bold text-white">Session fermée</h3>
                <p className="text-white/60">
                    Les inscriptions au baptême sont fermées pour le moment. Revenez plus tard !
                </p>
            </div>
        );
    }

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center h-full">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 rounded-full bg-accent-success/20 flex items-center justify-center mb-4"
                >
                    <CheckCircle2 size={32} className="text-accent-success" />
                </motion.div>
                <h3 className="text-xl font-bold text-white mb-2">Inscription Validée !</h3>
                <p className="text-white/60">
                    Vous serez contacté prochainement pour la prochaine session.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center mb-6">
                <div className="inline-flex p-4 rounded-full bg-primary/10 mb-2">
                    <Droplets size={32} className="text-primary" />
                </div>
                <h3 className="text-xl font-bold text-white">Je souhaite me faire baptiser</h3>
                {sessionDate && (
                    <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/20 border border-primary/30">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="text-sm font-semibold text-primary">Session : {sessionDate}</span>
                    </div>
                )}
                <p className="text-sm text-white/60 mt-3">
                    Celui qui croira et qui sera baptisé sera sauvé, mais celui qui ne croira pas sera condamné. (Marc 16:16)
                </p>
            </div>

            <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Genre</label>
                <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl bg-white/5 border border-white/10 flex-1 hover:bg-white/10 transition">
                        <input
                            type="radio"
                            name="gender"
                            value="Homme"
                            className="w-4 h-4 text-gold border-white/30 focus:ring-gold bg-white/5"
                            checked={gender === "Homme"}
                            onChange={(e) => setGender(e.target.value)}
                            required
                        />
                        <span className="text-white text-sm">Homme</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl bg-white/5 border border-white/10 flex-1 hover:bg-white/10 transition">
                        <input
                            type="radio"
                            name="gender"
                            value="Femme"
                            className="w-4 h-4 text-gold border-white/30 focus:ring-gold bg-white/5"
                            checked={gender === "Femme"}
                            onChange={(e) => setGender(e.target.value)}
                            required
                        />
                        <span className="text-white text-sm">Femme</span>
                    </label>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Nom de famille</label>
                    <div className="relative">
                        <User className="absolute left-4 top-3.5 text-white/40" size={20} />
                        <input
                            type="text"
                            required
                            placeholder="Dos Santos"
                            className="w-full py-3 pl-12 pr-4 rounded-xl bg-white/5 border border-white/10 focus:border-gold outline-none text-white placeholder-white/20 transition"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Prénom</label>
                    <div className="relative">
                        <User className="absolute left-4 top-3.5 text-white/40" size={20} />
                        <input
                            type="text"
                            required
                            placeholder="Jean"
                            className="w-full py-3 pl-12 pr-4 rounded-xl bg-white/5 border border-white/10 focus:border-gold outline-none text-white placeholder-white/20 transition"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Année de naissance</label>
                <div className="relative">
                    <Calendar className="absolute left-4 top-3.5 text-white/40" size={20} />
                    <input
                        type="number"
                        min="1900"
                        max={new Date().getFullYear()}
                        required
                        placeholder="2000"
                        className="w-full py-3 pl-12 pr-4 rounded-xl bg-white/5 border border-white/10 focus:border-gold outline-none text-white placeholder-white/20 transition"
                        value={birthYear}
                        onChange={(e) => setBirthYear(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Téléphone</label>
                    <div className="relative">
                        <Phone className="absolute left-4 top-3.5 text-white/40" size={20} />
                        <input
                            type="tel"
                            required
                            placeholder="06 12 34 56 78"
                            className="w-full py-3 pl-12 pr-4 rounded-xl bg-white/5 border border-white/10 focus:border-gold outline-none text-white placeholder-white/20 transition"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Email</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-3.5 text-white/40" size={20} />
                        <input
                            type="email"
                            required
                            placeholder="votre@email.com"
                            className="w-full py-3 pl-12 pr-4 rounded-xl bg-white/5 border border-white/10 focus:border-gold outline-none text-white placeholder-white/20 transition"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Avez-vous déjà fait la prière du salut ?</label>
                <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl bg-white/5 border border-white/10 flex-1 hover:bg-white/10 transition">
                        <input
                            type="radio"
                            name="salvationPrayer"
                            value="Oui"
                            className="w-4 h-4 text-gold border-white/30 focus:ring-gold bg-white/5"
                            checked={salvationPrayer === "Oui"}
                            onChange={(e) => setSalvationPrayer(e.target.value)}
                            required
                        />
                        <span className="text-white text-sm">Oui</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl bg-white/5 border border-white/10 flex-1 hover:bg-white/10 transition">
                        <input
                            type="radio"
                            name="salvationPrayer"
                            value="Non"
                            className="w-4 h-4 text-gold border-white/30 focus:ring-gold bg-white/5"
                            checked={salvationPrayer === "Non"}
                            onChange={(e) => setSalvationPrayer(e.target.value)}
                            required
                        />
                        <span className="text-white text-sm">Non</span>
                    </label>
                </div>
            </div>


            <div className="space-y-4">
                <label className="block text-sm font-medium text-white/70">Formations suivies</label>
                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => setFormations(["Aucune"])}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${formations.includes("Aucune")
                            ? 'bg-[var(--gold)] border-[var(--gold)] text-black shadow-glow'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/30'
                            }`}
                    >
                        Aucune
                    </button>
                    {FORMATIONS.map(f => (
                        <button
                            key={f}
                            type="button"
                            onClick={() => {
                                setFormations(prev => {
                                    const next = prev.filter(v => v !== "Aucune");
                                    if (next.includes(f)) {
                                        return next.filter(v => v !== f);
                                    }
                                    return [...next, f];
                                });
                            }}
                            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${formations.includes(f)
                                ? 'bg-[var(--gold)] border-[var(--gold)] text-black shadow-glow'
                                : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/30'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                    <input type="hidden" required value={formations.length > 0 ? "selected" : ""} />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Confirmez-vous votre demande de baptême ?</label>
                <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl bg-white/5 border border-white/10 flex-1 hover:bg-white/10 transition">
                        <input
                            type="radio"
                            name="confirmed"
                            value="Oui"
                            className="w-4 h-4 text-gold border-white/30 focus:ring-gold bg-white/5"
                            checked={confirmed === "Oui"}
                            onChange={(e) => setConfirmed(e.target.value)}
                            required
                        />
                        <span className="text-white text-sm">Oui</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl bg-white/5 border border-white/10 flex-1 hover:bg-white/10 transition">
                        <input
                            type="radio"
                            name="confirmed"
                            value="Non"
                            className="w-4 h-4 text-gold border-white/30 focus:ring-gold bg-white/5"
                            checked={confirmed === "Non"}
                            onChange={(e) => setConfirmed(e.target.value)}
                            required
                        />
                        <span className="text-white text-sm">Non</span>
                    </label>
                </div>
            </div>

            <div className="pt-6 border-t border-white/5">
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
                        <p className="text-xs text-white/40 leading-relaxed">
                            J'accepte que mes données personnelles soient collectées et traitées par Impact Centre Chrétien dans le cadre de ma demande de baptême. Pour en savoir plus, consultez notre politique de confidentialité.
                        </p>
                    </div>
                </label>
            </div>

            <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 btn-primary font-bold text-lg flex items-center justify-center gap-2"
            >
                {submitting ? (
                    <Loader2 className="animate-spin" />
                ) : (
                    <>
                        S'inscrire <Send size={20} />
                    </>
                )}
            </button>
        </form>
    );
}
