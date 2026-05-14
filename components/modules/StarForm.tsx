"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Tenant } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Send, Loader2, CheckCircle2, User, Phone, Sparkles, Mail, 
    MessageSquare, MapPin, Briefcase, Calendar, Info, Heart, 
    ShieldCheck
} from "lucide-react";
import ServiceUnavailable from "./ServiceUnavailable";
import { GlassCard } from "@/components/ui/glass-card";

const COUNTRIES = [
    "Belgique", "France", "Luxembourg", "Pays-Bas", "Suisse", "RDC", "Congo", "Côte d'Ivoire", "Sénégal", "Cameroun", "Autre"
];

const FORMATIONS = ["001", "101", "201", "301", "IEBI"];

interface ApplicantData {
    civility: string;
    lastName: string;
    firstName: string;
    familyStatus: string;
    gender: string;
    birthDate: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    zipCode: string;
    country: string;
    profession: string;
    formations: string[];
    howKnown: string;
    sinceWhen: string;
    homeGroup: string;
    homeGroupName: string;
    pcncFollowed: string;
    pcncDetails: string[];
    departments: string[];
    comments: string;
    consent: boolean;
}

const INITIAL_APPLICANT: ApplicantData = {
    civility: "",
    lastName: "",
    firstName: "",
    familyStatus: "",
    gender: "",
    birthDate: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
    country: "Belgique",
    profession: "",
    formations: [],
    howKnown: "",
    sinceWhen: "",
    homeGroup: "",
    homeGroupName: "",
    pcncFollowed: "",
    pcncDetails: [],
    departments: [],
    comments: "",
    consent: false
};

export default function StarForm({
    tenant,
    onSuccess,
}: {
    tenant: Tenant;
    onSuccess: () => void;
}) {
    const [applicant, setApplicant] = useState<ApplicantData>({ ...INITIAL_APPLICANT });
    const [departmentsList, setDepartmentsList] = useState<string[]>(["Accueil", "Intégration"]);
    
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [leaderStatus, setLeaderStatus] = useState<'loading' | 'open' | 'not_found'>('loading');

    useEffect(() => {
        if (!tenant?.id) return;

        async function initForm() {
            try {
                // 1. Fetch Leader Status
                const res = await fetch(`/api/leader/status?tenantId=${tenant.id}&moduleKey=star`);
                const data = await res.json();
                setLeaderStatus(data.status === 'open' ? 'open' : data.status);

                // 2. Fetch Departments Config
                const { data: configData } = await supabase
                    .from('module_configs')
                    .select('config')
                    .eq('tenant_id', tenant.id)
                    .eq('module_key', 'star')
                    .maybeSingle();

                if (configData?.config?.departments) {
                    setDepartmentsList(configData.config.departments);
                }
            } catch (err) {
                console.error("Error initializing STAR form:", err);
                setLeaderStatus('not_found');
            }
        }

        initForm();
    }, [tenant?.id]);

    const handleUpdateField = (field: keyof ApplicantData, value: any) => {
        setApplicant(prev => ({ ...prev, [field]: value }));
    };

    const handleToggleArray = (field: "formations" | "pcncDetails" | "departments", value: string) => {
        const arr = applicant[field];
        
        if (field === "departments" && !arr.includes(value) && arr.length >= 2) {
            return; // Max 2 choices for departments
        }

        let newArr;
        if (value === "Aucune") {
            newArr = arr.includes("Aucune") ? [] : ["Aucune"];
        } else {
            const temp = arr.filter(v => v !== "Aucune");
            if (temp.includes(value)) {
                newArr = temp.filter(v => v !== value);
            } else {
                newArr = [...temp, value];
            }
        }
        
        setApplicant(prev => ({ ...prev, [field]: newArr }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tenant?.id) return;
        setLoading(true);

        if (!applicant.consent) {
            alert("Veuillez accepter les conditions RGPD.");
            return;
        }

        if (applicant.departments.length === 0) {
            alert("Veuillez sélectionner au moins un département.");
            return;
        }
        
        try {
            const { error } = await supabase.from("requests").insert({
                tenant_id: tenant.id,
                type: "star",
                content: {
                    subject: "Nouvelle Candidature S.T.A.R",
                    ...applicant,
                    requester: { 
                        firstName: applicant.firstName, 
                        lastName: applicant.lastName 
                    }
                },
            });

            if (error) throw error;
            setSuccess(true);
        } catch (err) {
            console.error("Error submitting STAR form:", err);
            alert("Erreur lors de l'envoi. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    };

    if (leaderStatus === 'loading') {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    if (leaderStatus !== 'open') {
        return <ServiceUnavailable 
            title="Service S.T.A.R Indisponible"
            message="Le département S.T.A.R n'a pas encore de responsable assigné pour votre église."
        />;
    }

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center h-full space-y-6">
                <motion.div
                    initial={{ scale: 0, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", damping: 12 }}
                    className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.2)]"
                >
                    <CheckCircle2 size={40} className="text-emerald-400" />
                </motion.div>
                
                <div>
                    <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Candidature Envoyée !</h3>
                    <p className="text-white/70 text-sm leading-relaxed max-w-xs mx-auto">
                        Votre désir de servir a bien été transmis. Le responsable de l'intégration S.T.A.R reviendra vers vous très prochainement.
                    </p>
                </div>

                <button
                    onClick={onSuccess}
                    className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 hover:border-white/20 transition-all transform active:scale-[0.98]"
                >
                    Retour à l'accueil
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 p-1">
            <div className="text-center mb-10">
                <div className="inline-flex p-4 rounded-3xl bg-primary/10 border border-primary/20 mb-4 shadow-[0_10px_30px_rgba(var(--primary-rgb),0.1)]">
                    <Sparkles size={32} className="text-primary" />
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight">Fiche de Candidature S.T.A.R</h3>
                <p className="text-xs text-white/60 font-medium uppercase tracking-widest mt-1">
                    Serviteur Travaillant Activement pour le Royaume
                </p>
            </div>

            <GlassCard className="p-8 space-y-20">
                {/* SECTION 1: DONNÉES PERSONNELLES */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 pb-2 border-b border-white/5">
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                            <User size={18} />
                        </div>
                        <h5 className="font-black text-sm uppercase tracking-widest text-white">1. Données Personnelles</h5>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormSelect 
                            label="Civilité *" 
                            options={["Monsieur", "Madame", "Mademoiselle"]}
                            value={applicant.civility}
                            onChange={(v) => handleUpdateField("civility", v)}
                        />
                        <FormInput 
                            label="Nom *" 
                            value={applicant.lastName}
                            onChange={(v) => handleUpdateField("lastName", v)}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput 
                            label="Prénom *" 
                            value={applicant.firstName}
                            onChange={(v) => handleUpdateField("firstName", v)}
                        />
                        <FormSelect 
                            label="Situation Familiale *" 
                            options={["Célibataire", "Fiancé", "Marié", "Conjoint", "Veuf/ve", "Divorcé", "Séparé"]}
                            value={applicant.familyStatus}
                            onChange={(v) => handleUpdateField("familyStatus", v)}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormSelect 
                            label="Sexe *" 
                            options={["Masculin", "Féminin"]}
                            value={applicant.gender}
                            onChange={(v) => handleUpdateField("gender", v)}
                        />
                        <FormInput 
                            label="Date de naissance *" 
                            type="date"
                            value={applicant.birthDate}
                            onChange={(v) => handleUpdateField("birthDate", v)}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput 
                            label="Adresse email *" 
                            type="email"
                            icon={<Mail size={18} />}
                            value={applicant.email}
                            onChange={(v) => handleUpdateField("email", v)}
                        />
                        <FormInput 
                            label="Téléphone / GSM *" 
                            type="tel"
                            pattern="[0-9+ \-]*"
                            icon={<Phone size={18} />}
                            value={applicant.phone}
                            onChange={(v) => handleUpdateField("phone", v.replace(/[^0-9+ \-]/g, ""))}
                        />
                    </div>

                    <div className="space-y-4">
                        <FormInput 
                            label="Adresse (Lieu de résidence)" 
                            icon={<MapPin size={18} />}
                            value={applicant.address}
                            onChange={(v) => handleUpdateField("address", v)}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormInput 
                                label="Ville *" 
                                value={applicant.city}
                                onChange={(v) => handleUpdateField("city", v)}
                            />
                            <FormInput 
                                label="Code postal *" 
                                value={applicant.zipCode}
                                onChange={(v) => handleUpdateField("zipCode", v)}
                            />
                            <FormSelect 
                                label="Pays de résidence *" 
                                options={COUNTRIES}
                                value={applicant.country}
                                onChange={(v) => handleUpdateField("country", v)}
                            />
                        </div>
                    </div>

                    <FormInput 
                        label="Profession *" 
                        icon={<Briefcase size={18} />}
                        value={applicant.profession}
                        onChange={(v) => handleUpdateField("profession", v)}
                    />

                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/60 ml-1">Formations suivies</label>
                        <div className="flex flex-wrap gap-2">
                            <CheckboxBadge 
                                label="Aucune"
                                checked={applicant.formations.includes("Aucune")}
                                onToggle={() => handleToggleArray("formations", "Aucune")}
                            />
                            {FORMATIONS.map(f => (
                                <CheckboxBadge 
                                    key={f}
                                    label={f}
                                    checked={applicant.formations.includes(f)}
                                    onToggle={() => handleToggleArray("formations", f)}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* SECTION 2: ICC & VOUS */}
                <div className="space-y-8 pt-10 border-t border-white/5">
                    <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                        <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                            <Heart size={18} />
                        </div>
                        <h5 className="font-black text-sm uppercase tracking-widest text-white">2. ICC & Vous</h5>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormSelect 
                            label="Comment avez-vous connu ICC ? *" 
                            options={["Connaissance", "Famille", "Médias", "Campagne d'Évangélisation", "Autres"]}
                            value={applicant.howKnown}
                            onChange={(v) => handleUpdateField("howKnown", v)}
                        />
                        <FormSelect 
                            label="Depuis quand fréquentez-vous ICC ? *" 
                            options={["- de 6 mois", "+ de 6 mois", "- de 1 an", "+ de 1 an"]}
                            value={applicant.sinceWhen}
                            onChange={(v) => handleUpdateField("sinceWhen", v)}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormSelect 
                            label="Fréquentez-vous un Groupe d'Impact ? *" 
                            options={["OUI", "NON"]}
                            value={applicant.homeGroup}
                            onChange={(v) => handleUpdateField("homeGroup", v)}
                        />
                        {applicant.homeGroup === "OUI" && (
                            <FormInput 
                                label="Si OUI, lequel ?" 
                                placeholder="Nom de la cellule"
                                value={applicant.homeGroupName}
                                onChange={(v) => handleUpdateField("homeGroupName", v)}
                            />
                        )}
                    </div>

                    <div className="space-y-4">
                        <FormSelect 
                            label="Avez-vous suivi le PCNC à ICC ? *" 
                            options={["OUI", "NON"]}
                            value={applicant.pcncFollowed}
                            onChange={(v) => handleUpdateField("pcncFollowed", v)}
                        />
                        {applicant.pcncFollowed === "OUI" && (
                            <div className="space-y-3 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/60">Lesquelles :</label>
                                <div className="flex flex-wrap gap-2">
                                    <CheckboxBadge 
                                        label="Aucune"
                                        checked={applicant.pcncDetails.includes("Aucune")}
                                        onToggle={() => handleToggleArray("pcncDetails", "Aucune")}
                                    />
                                    {FORMATIONS.map(f => (
                                        <CheckboxBadge 
                                            key={f}
                                            label={f}
                                            checked={applicant.pcncDetails.includes(f)}
                                            onToggle={() => handleToggleArray("pcncDetails", f)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* SECTION 3: DEVENIR STAR */}
                <div className="space-y-8 pt-10 border-t border-white/5">
                    <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <Sparkles size={18} />
                        </div>
                        <h5 className="font-black text-sm uppercase tracking-widest text-white">3. Devenir S.T.A.R</h5>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/60 ml-1">
                                    Départements souhaités * (Max 2)
                                </label>
                                <span className="text-[10px] text-primary font-bold">{applicant.departments.length}/2</span>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                {departmentsList.map((dept, idx) => (
                                    <CheckboxBadge 
                                        key={idx}
                                        label={dept}
                                        checked={applicant.departments.includes(dept)}
                                        onToggle={() => handleToggleArray("departments", dept)}
                                        disabled={!applicant.departments.includes(dept) && applicant.departments.length >= 2}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/60 ml-1">Commentaires ou précisions</label>
                            <textarea
                                required
                                placeholder="Toute information complémentaire..."
                                rows={3}
                                className="w-full p-4 rounded-2xl bg-white/10 border border-white/20 focus:border-primary outline-none text-white placeholder:text-white/60 transition-all resize-none text-sm"
                                value={applicant.comments}
                                onChange={(e) => handleUpdateField("comments", e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* SECTION 4: RGPD */}
                <div className="pt-10 border-t border-white/5">
                    <label className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/20 cursor-pointer hover:bg-white/[0.08] transition-all group">
                        <div className={`mt-1 flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${applicant.consent ? 'bg-[var(--gold)] border-[var(--gold)]' : 'border-white/20 group-hover:border-[var(--gold)]/50'}`}>
                            <AnimatePresence>
                                {applicant.consent && (
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                        <ShieldCheck className="text-black" size={14} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <input 
                            type="checkbox" 
                            className="hidden" 
                            checked={applicant.consent}
                            onChange={(e) => handleUpdateField("consent", e.target.checked)}
                        />
                        <div className="text-[11px] text-white/60 leading-relaxed">
                            <p className="font-bold text-white/80 mb-1">Consentement RGPD *</p>
                            J&apos;accepte le traitement de mes données par ICC, l&apos;autorisation de prise et diffusion d&apos;images, 
                            et l&apos;acceptation de recevoir des informations de l&apos;église.
                        </div>
                    </label>
                </div>
            </GlassCard>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-5 btn-primary font-black text-lg flex items-center justify-center gap-3"
            >
                {loading ? (
                    <Loader2 className="animate-spin" />
                ) : (
                    <>
                        Soumettre ma candidature <Send size={22} />
                    </>
                )}
            </button>
        </form>
    );
}

function FormInput({ label, type = "text", placeholder = "", value, onChange, icon, required = true, pattern }: {
    label: string;
    type?: string;
    placeholder?: string;
    value: string;
    onChange: (v: string) => void;
    icon?: React.ReactNode;
    required?: boolean;
    pattern?: string;
}) {
    return (
        <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/80 ml-1">{label}</label>
            <div className="relative group">
                <input
                    type={type}
                    required={required}
                    pattern={pattern}
                    placeholder={placeholder}
                    className="w-full py-4 px-4 pl-12 rounded-2xl bg-white/10 border border-white/20 focus:border-primary outline-none text-white placeholder:text-white/60 transition-all text-sm"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                    {icon || <Info size={20} />}
                </div>
            </div>
        </div>
    );
}

function FormSelect({ label, options, value, onChange, required = true }: {
    label: string;
    options: string[];
    value: string;
    onChange: (v: string) => void;
    required?: boolean;
}) {
    return (
        <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/80 ml-1">{label}</label>
            <select
                required={required}
                className="w-full py-4 px-4 rounded-2xl bg-white/10 border border-white/20 focus:border-primary outline-none text-white transition-all text-sm appearance-none cursor-pointer"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            >
                <option value="" disabled className="bg-slate-900 text-white">Sélectionner...</option>
                {options.map((o: string) => (
                    <option key={o} value={o} className="bg-slate-900 text-white">{o}</option>
                ))}
            </select>
        </div>
    );
}

function CheckboxBadge({ label, checked, onToggle, disabled }: {
    label: string;
    checked: boolean;
    onToggle: () => void;
    disabled?: boolean;
}) {
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onToggle}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                checked 
                ? 'bg-[var(--gold)] border-[var(--gold)] text-black shadow-glow' 
                : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed'
            }`}
        >
            {label}
        </button>
    );
}
