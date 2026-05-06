"use client";

import { useState, useEffect } from "react";
import { Tenant } from "@/types";
import { supabase } from "@/lib/supabase/client";
import { Calendar, Loader2, CheckCircle2, User, Phone, MessageSquare, Sparkles, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ServiceUnavailable from "./ServiceUnavailable";

const AGE_RANGES = ["Moins de 18 ans", "18-25 ans", "26-30 ans", "31-35 ans", "36-40 ans", "41-45 ans", "46-50 ans", "51-55 ans", "56+ ans"];
const GENDERS = ["Masculin", "Féminin"];
const FORMATIONS_LIST = ["Aucune", "001", "101", "201", "301"];
const MARITAL_STATUSES = ["Célibataire", "Marié(e)", "Divorcé(e)", "Veuf/Veuve"];
const CHURCH_DURATIONS = [
    "Moins d'1 mois",
    "1-3 mois",
    "4-7 mois",
    "8-10 mois",
    "Depuis 1 an",
    "Depuis plus d'1 an",
];
const APPOINTMENT_REASONS = [
    "Soutien spirituel",
    "Conseil familial",
    "Problème affectif, émmotionnels...",
    "Troubles physiques (maladies, etc...)",
    "Autre"
];

const inputClass =
    "w-full py-3.5 px-4 rounded-xl bg-[#0d1117] border border-white/10 focus:border-primary outline-none text-white text-base transition-all placeholder:text-white/20";
const labelClass = "block text-[10px] font-black uppercase tracking-widest text-white/40 mb-1.5 ml-1";
const selectClass =
    "w-full py-3.5 px-4 rounded-xl bg-[#0d1117] border border-white/10 focus:border-primary outline-none text-white text-base transition shadow-inner [color-scheme:dark]";

interface LeaderStatus {
    pastoral: 'open' | 'closed' | 'not_found' | 'loading';
    social: 'open' | 'closed' | 'not_found' | 'loading';
}

export default function AppointmentForm({ tenant, onSuccess }: { tenant: Tenant; onSuccess: () => void }) {
    const [status, setStatus] = useState<LeaderStatus>({
        pastoral: 'loading',
        social: 'loading'
    });
    const [type, setType] = useState<"pastoral" | "social">("pastoral");
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");

    // Pastoral specific fields
    const [gender, setGender] = useState("");
    const [ageRange, setAgeRange] = useState("");
    const [maritalStatus, setMaritalStatus] = useState("");
    const [churchDuration, setChurchDuration] = useState("");
    const [isCellMember, setIsCellMember] = useState<"oui" | "non" | "">("");
    const [formations, setFormations] = useState("");
    const [appointmentReason, setAppointmentReason] = useState("");
    const [otherReason, setOtherReason] = useState("");
    const [hadPreviousAppointment, setHadPreviousAppointment] = useState<"oui" | "non" | "">("");
    const [previousAppointmentDetails, setPreviousAppointmentDetails] = useState("");
    const [date, setDate] = useState("");
    const [additionalNotes, setAdditionalNotes] = useState("");

    // Social specific fields
    const [socialReason, setSocialReason] = useState("");

    const [loading, setLoading] = useState(false);
    const [consent, setConsent] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        async function checkLeadership() {
            try {
                const [pRes, sRes] = await Promise.all([
                    fetch(`/api/leader/status?tenantId=${tenant.id}&moduleKey=rdv_pastoral`),
                    fetch(`/api/leader/status?tenantId=${tenant.id}&moduleKey=rdv_social`)
                ]);

                const pData = await pRes.json();
                const sData = await sRes.json();

                setStatus({
                    pastoral: pData.status,
                    social: sData.status
                });
            } catch (err) {
                console.error("Error checking leadership:", err);
                setStatus({ pastoral: 'not_found', social: 'not_found' });
            }
        }
        checkLeadership();
    }, [tenant.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!consent) {
            alert("Vous devez accepter la politique de confidentialité pour continuer.");
            return;
        }
        setLoading(true);

        const content: any = {
            appointment_type: type,
            full_name: fullName,
            phone: phone,
        };

        if (type === "pastoral") {
            Object.assign(content, {
                email,
                gender,
                age_range: ageRange,
                marital_status: maritalStatus,
                church_duration: churchDuration,
                is_cell_member: isCellMember,
                formations_followed: formations,
                appointment_reason: appointmentReason === "Autre" ? otherReason : appointmentReason,
                had_previous_appointment: hadPreviousAppointment,
                previous_appointment_details: hadPreviousAppointment === "oui" ? previousAppointmentDetails : "",
                requested_date: date,
                additional_notes: additionalNotes,
            });
        } else {
            Object.assign(content, {
                reason: socialReason,
                subject: "Demande RDV Social",
            });
        }

        const { error } = await supabase.from("requests").insert({
            tenant_id: tenant.id,
            type: "appointment",
            content: {
                ...content,
                consent_rgpd: consent,
            }
        });

        setLoading(false);

        if (error) {
            alert("Erreur lors de la demande. Veuillez réessayer.");
        } else {
            setSuccess(true);
            setTimeout(() => {
                onSuccess();
            }, 2500);
        }
    };

    if (success) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="flex flex-col items-center justify-center p-12 text-center space-y-4"
            >
                <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl flex items-center justify-center mb-2 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                    <CheckCircle2 className="text-emerald-400" size={40} />
                </div>
                <div>
                    <h3 className="text-2xl font-black text-white mb-2 italic uppercase tracking-tight">Demande envoyée !</h3>
                    <p className="text-white/40 text-sm max-w-[240px] leading-relaxed">
                        Ta demande de rendez-vous {type} a bien été transmise. Nous reviendrons vers toi très vite !
                    </p>
                </div>
            </motion.div>
        );
    }
    if (status.pastoral === 'loading' || status.social === 'loading') {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    const currentStatus = type === 'pastoral' ? status.pastoral : status.social;

    if (currentStatus !== 'open') {
        return (
            <div className="space-y-6">
                <div className="flex p-1.5 bg-[#0d1117] rounded-2xl mb-2 border border-white/5 relative shadow-inner">
                    <button
                        type="button"
                        onClick={() => setType("pastoral")}
                        className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 relative z-10 ${type === 'pastoral' ? 'text-white' : 'text-white/30 hover:text-white/50'}`}
                    >
                        Pastoral
                    </button>
                    <button
                        type="button"
                        onClick={() => setType("social")}
                        className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 relative z-10 ${type === 'social' ? 'text-white' : 'text-white/30 hover:text-white/50'}`}
                    >
                        Social
                    </button>
                    <motion.div
                        layoutId="appointment-toggle-unavailable"
                        className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-primary rounded-xl shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]"
                        initial={false}
                        animate={{ x: type === 'pastoral' ? 0 : '100%' }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                </div>
                <ServiceUnavailable
                    title={type === 'pastoral' ? "RDV Pastoral Indisponible" : "RDV Social Indisponible"}
                    message={`Le service de rendez-vous ${type} n'est pas encore activé ou n'a pas de responsable assigné pour le moment.`}
                />
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Toggle Pastoral / Social */}
            <div className="flex p-1.5 bg-[#0d1117] rounded-2xl mb-2 border border-white/5 relative shadow-inner">
                <button
                    type="button"
                    onClick={() => setType("pastoral")}
                    className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 relative z-10 ${type === 'pastoral' ? 'text-white' : 'text-white/30 hover:text-white/50'}`}
                >
                    Pastoral
                </button>
                <button
                    type="button"
                    onClick={() => setType("social")}
                    className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 relative z-10 ${type === 'social' ? 'text-white' : 'text-white/30 hover:text-white/50'}`}
                >
                    Social
                </button>
                <motion.div
                    layoutId="appointment-toggle"
                    className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-primary rounded-xl shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]"
                    initial={false}
                    animate={{ x: type === 'pastoral' ? 0 : '100%' }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
            </div>

            <div className="space-y-4">
                {/* Common fields: Name and Phone */}
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className={labelClass}>Nom et prénom</label>
                        <div className="relative group">
                            <input
                                type="text"
                                required
                                className={`${inputClass} pl-11`}
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Jean Dupont"
                            />
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={18} />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className={labelClass}>Téléphone</label>
                        <div className="relative group">
                            <input
                                type="tel"
                                required
                                className={`${inputClass} pl-11`}
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="06..."
                            />
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={18} />
                        </div>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {type === 'social' ? (
                        <motion.div
                            key="social-form"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            <div className="space-y-1.5">
                                <label className={labelClass}>Raison de votre demande</label>
                                <div className="relative group">
                                    <textarea
                                        required
                                        rows={5}
                                        className={`${inputClass} resize-none pt-4`}
                                        value={socialReason}
                                        onChange={(e) => setSocialReason(e.target.value)}
                                        placeholder="Décrivez brièvement le motif de votre demande sociale..."
                                    />
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="pastoral-form"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            <div className="space-y-1.5">
                                <label className={labelClass}>Email</label>
                                <div className="relative group">
                                    <input
                                        type="email"
                                        required
                                        className={`${inputClass}`}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="votre@email.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className={labelClass}>Genre</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {GENDERS.map((g) => (
                                        <button
                                            key={g}
                                            type="button"
                                            onClick={() => setGender(g)}
                                            className={`py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${gender === g
                                                ? "bg-primary/10 border-primary text-white shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]"
                                                : "bg-white/[0.02] border-white/5 text-white/30 hover:border-white/20"
                                                }`}
                                        >
                                            {g}
                                        </button>
                                    ))}
                                </div>
                                <input type="hidden" required value={gender} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className={labelClass}>Tranche d'âge</label>
                                    <select required className={selectClass} value={ageRange} onChange={(e) => setAgeRange(e.target.value)}>
                                        <option value="" disabled>Choisir...</option>
                                        {AGE_RANGES.map((range) => <option key={range} value={range}>{range}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className={labelClass}>Situation</label>
                                    <select required className={selectClass} value={maritalStatus} onChange={(e) => setMaritalStatus(e.target.value)}>
                                        <option value="" disabled>Choisir...</option>
                                        {MARITAL_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className={labelClass}>Ancienneté dans l&apos;église</label>
                                <select required className={selectClass} value={churchDuration} onChange={(e) => setChurchDuration(e.target.value)}>
                                    <option value="" disabled>Sélectionnez la durée</option>
                                    {CHURCH_DURATIONS.map((duration) => <option key={duration} value={duration}>{duration}</option>)}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className={labelClass}>Êtes-vous membre d&apos;une cellule de maison?</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {(["oui", "non"] as const).map((val) => (
                                        <button
                                            key={val}
                                            type="button"
                                            onClick={() => setIsCellMember(val)}
                                            className={`py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${isCellMember === val
                                                ? "bg-primary/10 border-primary text-white shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]"
                                                : "bg-white/[0.02] border-white/5 text-white/30 hover:border-white/20"
                                                }`}
                                        >
                                            {val}
                                        </button>
                                    ))}
                                </div>
                                <input type="hidden" required value={isCellMember} />
                            </div>

                            <div className="space-y-1.5">
                                <label className={labelClass}>Formations S.T.A.R suivies</label>
                                <select
                                    required
                                    className={selectClass}
                                    value={formations}
                                    onChange={(e) => setFormations(e.target.value)}
                                >
                                    <option value="" disabled>Choisir la dernière formation...</option>
                                    {FORMATIONS_LIST.map((f) => <option key={f} value={f}>{f}</option>)}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className={labelClass}>Motif du rendez-vous</label>
                                <select required className={selectClass} value={appointmentReason} onChange={(e) => setAppointmentReason(e.target.value)}>
                                    <option value="" disabled>Sélectionnez le motif</option>
                                    {APPOINTMENT_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                                </select>
                                {appointmentReason === "Autre" && (
                                    <input
                                        type="text"
                                        required
                                        className={`${inputClass} mt-2`}
                                        placeholder="Détails du motif..."
                                        value={otherReason}
                                        onChange={(e) => setOtherReason(e.target.value)}
                                    />
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className={labelClass}>Déjà eu un RDV pastoral ?</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {(["oui", "non"] as const).map((val) => (
                                        <button
                                            key={val}
                                            type="button"
                                            onClick={() => setHadPreviousAppointment(val)}
                                            className={`py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${hadPreviousAppointment === val
                                                ? "bg-primary/10 border-primary text-white shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]"
                                                : "bg-white/[0.02] border-white/5 text-white/30 hover:border-white/20"
                                                }`}
                                        >
                                            {val}
                                        </button>
                                    ))}
                                </div>
                                <input type="hidden" required value={hadPreviousAppointment} />
                            </div>

                            <div className="space-y-1.5">
                                <label className={labelClass}>Date souhaitée</label>
                                <div className="relative group">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={18} />
                                    <input
                                        type="date"
                                        required
                                        className={`${inputClass} pl-11`}
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className={labelClass}>Notes additionnelles</label>
                                <textarea
                                    required
                                    rows={3}
                                    placeholder="Compléments utiles..."
                                    className={`${inputClass} resize-none`}
                                    value={additionalNotes}
                                    onChange={(e) => setAdditionalNotes(e.target.value)}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
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
                            J'accepte que mes données personnelles soient collectées et traitées par Impact Centre Chrétien dans le cadre de ma demande de rendez-vous. Pour en savoir plus, consultez notre politique de confidentialité.
                        </p>
                    </div>
                </label>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-5 btn-primary font-black text-lg flex items-center justify-center gap-3 mt-4"
            >
                {loading ? <Loader2 className="animate-spin" /> : (
                    <>
                        Demander un RDV <Sparkles size={20} />
                    </>
                )}
            </button>
        </form>
    );
}
