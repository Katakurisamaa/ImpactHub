"use client";

import { useEffect, useState, useMemo } from "react";
import { Tenant } from "@/types";
import { supabase } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar, ClipboardList, MapPin, Bus, Heart,
    MessageSquareQuote, MessageCircle, ListTodo, Loader2, ChevronRight,
    Users2, UserCheck, Church, ArrowLeft, Search, Filter, PlayCircle, ShieldCheck
} from "lucide-react";
import Shell from "@/components/layout/Shell";
import ImpactHubLogo from "@/components/ui/ImpactHubLogo";

// Definition of categories
type CategoryKey = "all" | "spiritual" | "community" | "service";

interface CategoryMeta {
    id: CategoryKey;
    label: string;
    description: string;
}

const CATEGORIES: CategoryMeta[] = [
    { id: "all", label: "Tous", description: "L'ensemble des services disponibles" },
    { id: "spiritual", label: "Spiritualité & Foi", description: "RDV, prière, baptêmes et témoignages" },
    { id: "community", label: "Vie de Communauté", description: "Cellules de maison et groupes de partage" },
    { id: "service", label: "Service & Pratique", description: "Navettes, bénévolat S.T.A.R et retours" },
];

// Modules Definition with categories and semantic themes
const MODULES_DEF = [
    { 
        id: 'appointments', 
        category: 'spiritual' as CategoryKey,
        label: 'RDV Pastoral & Social', 
        description: 'Écoute, conseil et accompagnement spirituel', 
        icon: Calendar, 
        color: 'from-amber-500/15 via-amber-950/20 to-transparent', 
        border: 'border-amber-500/25 hover:border-amber-400/50',
        badge: 'Pastorale'
    },
    { 
        id: 'registrations', 
        category: 'spiritual' as CategoryKey,
        label: 'Inscriptions & Parcours', 
        description: 'Baptême d’eau & Affermissement (PCNC)', 
        icon: ClipboardList, 
        color: 'from-emerald-500/15 via-emerald-950/20 to-transparent', 
        border: 'border-emerald-500/25 hover:border-emerald-400/50',
        badge: 'Parcours'
    },
    { 
        id: 'prayer', 
        category: 'spiritual' as CategoryKey,
        label: 'Sujets de Prière', 
        description: 'Déposer une requête pour l’intercession', 
        icon: Heart, 
        color: 'from-rose-500/15 via-rose-950/20 to-transparent', 
        border: 'border-rose-500/25 hover:border-rose-400/50',
        badge: 'Intercession'
    },
    { 
        id: 'testimonies', 
        category: 'spiritual' as CategoryKey,
        label: 'Témoignages', 
        description: 'Partager ce que Dieu a accompli pour vous', 
        icon: MessageSquareQuote, 
        color: 'from-amber-400/15 via-amber-900/20 to-transparent', 
        border: 'border-amber-400/25 hover:border-amber-300/50',
        badge: 'Édification'
    },
    { 
        id: 'home_cells', 
        category: 'community' as CategoryKey,
        label: 'Cellules de maison', 
        description: 'Trouver un groupe de partage près de chez vous', 
        icon: MapPin, 
        color: 'from-gold-500/15 via-gold-950/20 to-transparent', 
        border: 'border-gold-500/25 hover:border-gold-400/50',
        badge: 'Proximité'
    },
    { 
        id: 'church_group', 
        category: 'community' as CategoryKey,
        label: "Canal de l'Église", 
        description: 'Annonces officielles et actualité du campus', 
        icon: Church, 
        color: 'from-yellow-500/15 via-yellow-950/20 to-transparent', 
        border: 'border-yellow-500/25 hover:border-yellow-400/50',
        badge: 'WhatsApp'
    },
    { 
        id: 'women_impact', 
        category: 'community' as CategoryKey,
        label: "Femmes d'Impact", 
        description: 'Communauté d’encouragement et de foi', 
        icon: Users2, 
        color: 'from-pink-500/15 via-pink-950/20 to-transparent', 
        border: 'border-pink-500/25 hover:border-pink-400/50',
        badge: 'WhatsApp'
    },
    { 
        id: 'men_impact', 
        category: 'community' as CategoryKey,
        label: "Hommes d'Impact", 
        description: 'Fraternité, vision et affermissement', 
        icon: UserCheck, 
        color: 'from-blue-500/15 via-blue-950/20 to-transparent', 
        border: 'border-blue-500/25 hover:border-blue-400/50',
        badge: 'WhatsApp'
    },
    { 
        id: 'star', 
        category: 'service' as CategoryKey,
        label: 'Devenir S.T.A.R', 
        description: 'Serviteur d’impact : rejoindre un département', 
        icon: ShieldCheck, 
        color: 'from-violet-500/15 via-violet-950/20 to-transparent', 
        border: 'border-violet-500/25 hover:border-violet-400/50',
        badge: 'Engagement'
    },
    { 
        id: 'shuttle', 
        category: 'service' as CategoryKey,
        label: 'Navettes de culte', 
        description: 'Lignes, horaires et transport du dimanche', 
        icon: Bus, 
        color: 'from-cyan-500/15 via-cyan-950/20 to-transparent', 
        border: 'border-cyan-500/25 hover:border-cyan-400/50',
        badge: 'Transport'
    },
    { 
        id: 'feedback', 
        category: 'service' as CategoryKey,
        label: 'Vos Retours & Avis', 
        description: 'Partager une suggestion avec l’équipe pastorale', 
        icon: MessageCircle, 
        color: 'from-teal-500/15 via-teal-950/20 to-transparent', 
        border: 'border-teal-500/25 hover:border-teal-400/50',
        badge: 'Écoute'
    },
    { 
        id: 'schedule', 
        category: 'community' as CategoryKey,
        label: 'Agenda & Cultes', 
        description: 'Horaires des célébrations et réunions de la semaine', 
        icon: Church, 
        color: 'from-amber-500/15 via-amber-950/20 to-transparent', 
        border: 'border-amber-500/25 hover:border-amber-400/50',
        badge: 'Horaires'
    },
];

// Import forms
import PrayerRequestForm from "@/components/modules/PrayerRequestForm";
import AppointmentForm from "@/components/modules/AppointmentForm";
import TestimonyForm from "@/components/modules/TestimonyForm";
import HomeCellsList from "@/components/modules/HomeCellsList";
import RegistrationMenu from "@/components/modules/RegistrationMenu";
import BaptismForm from "@/components/modules/BaptismForm";
import PCNCView from "@/components/modules/PCNCView";
import ShuttleView from "@/components/modules/ShuttleView";
import FeedbackForm from "@/components/modules/FeedbackForm";
import StarForm from "@/components/modules/StarForm";
import MyRequestsList from "@/components/modules/MyRequestsList";
import GroupWhatsAppView from "@/components/modules/GroupWhatsAppView";
import CampusScheduleView from "@/components/modules/CampusScheduleView";
import BottomSheet from "@/components/ui/BottomSheet";

export default function MemberDashboard({ tenant, onReplayVideo }: { tenant: Tenant, onReplayVideo?: () => void }) {
    const [user, setUser] = useState<{ firstName: string; lastName: string } | null>(null);
    const [activeTab, setActiveTab] = useState("dashboard"); // 'dashboard', 'requests', 'profile'
    const [availableModules, setAvailableModules] = useState<typeof MODULES_DEF>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<CategoryKey>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [pendingRequestsCount, setPendingRequestsCount] = useState<number>(0);

    // Module Interaction State
    const [activeModule, setActiveModule] = useState<any>(null);
    const [registrationType, setRegistrationType] = useState<"baptism" | "pcnc" | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem(`impact_member_${tenant.slug}`);
        if (stored) {
            try {
                setUser(JSON.parse(stored));
            } catch (err) {
                console.error("Erreur lecture données membre :", err);
            }
        }

        // Fetch active modules
        const fetchModules = async () => {
            try {
                const { data } = await supabase
                    .from('tenant_modules')
                    .select('module_key')
                    .eq('tenant_id', tenant.id)
                    .eq('is_active', true);

                if (data) {
                    const activeKeys = data.map(d => d.module_key);
                    const filtered = MODULES_DEF.filter(m => m.id === 'schedule' || activeKeys.includes(m.id));
                    setAvailableModules(filtered);
                }
            } catch (err) {
                console.error("Erreur chargement modules :", err);
            } finally {
                setLoading(false);
            }
        };

        // Fetch user's pending requests count
        const fetchRequestsCount = async () => {
            if (!stored) return;
            try {
                const parsedUser = JSON.parse(stored);
                const { data } = await supabase
                    .from('requests')
                    .select('id, content, status')
                    .eq('tenant_id', tenant.id)
                    .neq('status', 'archived');

                if (data) {
                    const normalize = (s: any) => String(s || "").trim().toLowerCase();
                    const mine = data.filter(r => {
                        const content = r.content || {};
                        const requester = content.requester || {};
                        const first = requester.firstName || content.firstName || content.prenom || "";
                        const last = requester.lastName || content.lastName || content.nom || "";
                        const full = content.fullName || "";
                        return (
                            (normalize(first) === normalize(parsedUser.firstName) && normalize(last) === normalize(parsedUser.lastName)) ||
                            (full && normalize(full).includes(normalize(parsedUser.firstName)) && normalize(full).includes(normalize(parsedUser.lastName)))
                        );
                    });
                    setPendingRequestsCount(mine.length);
                }
            } catch (e) {
                // Ignore count error silently
            }
        };

        fetchModules();
        fetchRequestsCount();
    }, [tenant.id, tenant.slug]);

    // Filter modules based on category and search
    const filteredModules = useMemo(() => {
        return availableModules.filter(module => {
            const matchesCategory = selectedCategory === "all" || module.category === selectedCategory;
            if (!matchesCategory) return false;

            if (!searchQuery.trim()) return true;
            const query = searchQuery.toLowerCase().trim();
            return (
                module.label.toLowerCase().includes(query) ||
                module.description.toLowerCase().includes(query) ||
                module.badge.toLowerCase().includes(query)
            );
        });
    }, [availableModules, selectedCategory, searchQuery]);

    // Count modules per category
    const categoryCounts = useMemo(() => {
        const counts: Record<CategoryKey, number> = {
            all: availableModules.length,
            spiritual: 0,
            community: 0,
            service: 0,
        };
        availableModules.forEach(m => {
            if (counts[m.category] !== undefined) {
                counts[m.category] += 1;
            }
        });
        return counts;
    }, [availableModules]);

    if (loading) {
        return (
            <div className="h-screen flex flex-col items-center justify-center gap-4 text-gold">
                <Loader2 className="animate-spin w-8 h-8 text-[var(--gold)]" />
                <p className="text-sm text-[var(--text-muted)] font-light">Chargement de votre espace...</p>
            </div>
        );
    }

    const renderContent = () => {
        if (activeTab === 'requests') {
            return (
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
                                Mes Demandes & Suivis
                            </h2>
                            <p className="text-sm text-[var(--text-muted)] mt-1">
                                Retrouvez l’historique et l'avancement de vos demandes au campus.
                            </p>
                        </div>
                    </div>
                    <MyRequestsList tenant={tenant} onSuccess={() => { }} />
                </div>
            );
        }

        if (activeTab === 'profile') {
            return (
                <div className="max-w-xl mx-auto py-8 space-y-6">
                    <div className="glass-card p-8 text-center flex flex-col items-center space-y-5">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--gold)]/20 to-[var(--gold)]/5 flex items-center justify-center text-3xl font-bold text-[var(--gold-light)] border border-[var(--gold)]/30 shadow-[0_0_20px_rgba(212,168,67,0.15)]">
                            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
                                {user?.firstName} {user?.lastName}
                            </h2>
                            <p className="text-sm text-[var(--gold-light)] mt-1 font-medium">Membre Connecté</p>
                            <p className="text-xs text-[var(--text-muted)] mt-0.5">{tenant.name}</p>
                        </div>

                        <div className="w-full pt-4 border-t border-white/10 flex flex-col gap-3">
                            {onReplayVideo && (
                                <button
                                    onClick={onReplayVideo}
                                    className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-[var(--gold)]/40 transition-all font-medium text-sm"
                                >
                                    <PlayCircle className="w-4 h-4 text-[var(--gold)]" />
                                    Revoir la vidéo de bienvenue
                                </button>
                            )}

                            <button
                                onClick={() => {
                                    localStorage.removeItem(`impact_member_${tenant.slug}`);
                                    window.location.reload();
                                }}
                                className="w-full py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all text-sm font-medium"
                            >
                                Déconnexion de cet appareil
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        // Dashboard View
        return (
            <div className="space-y-8">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="relative rounded-3xl overflow-hidden p-6 md:p-8 bg-gradient-to-br from-[rgba(212,168,67,0.12)] via-[rgba(14,14,46,0.6)] to-[rgba(6,6,26,0.9)] border border-[var(--glass-border)] shadow-2xl"
                >
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-[var(--gold-light)] font-medium">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    Campus {tenant.name}
                                </div>
                                {onReplayVideo && (
                                    <button
                                        onClick={onReplayVideo}
                                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/80 hover:text-[var(--gold-light)] transition-all cursor-pointer active:scale-95"
                                        title="Voir ou revoir la vidéo d'accueil"
                                    >
                                        <PlayCircle size={14} className="text-[var(--gold)]" />
                                        <span>Vidéo d'accueil</span>
                                    </button>
                                )}
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
                                Bonjour, <span className="text-[var(--gold-light)]">{user?.firstName || "Bienvenue"}</span>
                            </h1>
                            <p className="text-sm md:text-base text-[var(--text-muted)] max-w-xl font-light">
                                Accédez à tous les services, formulaires d'inscriptions et accompagnements de votre église locale.
                            </p>
                        </div>

                        {/* Quick Requests Badge */}
                        <div className="flex-shrink-0">
                            <button
                                onClick={() => setActiveTab('requests')}
                                className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-white/[0.04] border border-[var(--glass-border)] hover:border-[var(--gold)]/40 hover:bg-white/[0.08] transition-all flex items-center justify-between gap-4 group"
                            >
                                <div className="flex items-center gap-3 text-left">
                                    <div className="p-2.5 rounded-xl bg-[var(--gold-pale)] text-[var(--gold)]">
                                        <ListTodo size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-wider font-semibold text-[var(--text-muted)]">Suivi Personnel</p>
                                        <p className="text-sm font-bold text-white">
                                            {pendingRequestsCount > 0 ? `${pendingRequestsCount} demande(s) enregistrée(s)` : "Aucune demande en cours"}
                                        </p>
                                    </div>
                                </div>
                                <ChevronRight size={18} className="text-[var(--text-muted)] group-hover:text-[var(--gold)] group-hover:translate-x-1 transition-all" />
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Filter & Search Bar */}
                <div className="space-y-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Categories Pills */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                            {CATEGORIES.map(cat => {
                                const count = categoryCounts[cat.id];
                                if (cat.id !== "all" && count === 0) return null;
                                const isSelected = selectedCategory === cat.id;
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs md:text-sm font-medium whitespace-nowrap transition-all duration-200 border ${
                                            isSelected
                                                ? "bg-[var(--gold-pale)] border-[var(--gold)] text-[var(--gold-light)] shadow-[0_0_15px_rgba(212,168,67,0.2)]"
                                                : "bg-white/[0.03] border-white/5 text-[var(--text-muted)] hover:text-white hover:bg-white/[0.06]"
                                        }`}
                                    >
                                        <span>{cat.label}</span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isSelected ? "bg-[var(--gold)] text-navy font-bold" : "bg-white/10 text-[var(--text-muted)]"}`}>
                                            {count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Search Input */}
                        <div className="relative w-full lg:w-72">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Rechercher un service..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--gold)] transition-colors placeholder:text-[var(--text-muted)]/60"
                            />
                        </div>
                    </div>
                </div>

                {/* Modules Grid */}
                {filteredModules.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredModules.map((module, i) => (
                            <motion.button
                                key={module.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.03 }}
                                onClick={() => setActiveModule(module)}
                                className={`group relative rounded-2xl p-5 flex flex-col justify-between text-left bg-gradient-to-br ${module.color} bg-[rgba(14,14,46,0.35)] backdrop-blur-md border ${module.border} hover:bg-[rgba(14,14,46,0.6)] transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0`}
                            >
                                <div className="flex items-start justify-between w-full mb-4">
                                    <div className="p-3 rounded-xl bg-white/[0.08] text-[var(--gold-light)] group-hover:scale-105 group-hover:bg-[var(--gold-pale)] transition-all">
                                        <module.icon size={22} />
                                    </div>
                                    <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[var(--text-muted)]">
                                        {module.badge}
                                    </span>
                                </div>

                                <div className="space-y-1.5 w-full">
                                    <h3 className="font-bold text-white text-base tracking-wide leading-tight group-hover:text-[var(--gold-light)] transition-colors">
                                        {module.label}
                                    </h3>
                                    <p className="text-xs text-[var(--text-muted)] line-clamp-2 font-light leading-relaxed">
                                        {module.description}
                                    </p>
                                </div>

                                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-medium text-[var(--text-muted)] group-hover:text-[var(--gold-light)] transition-colors">
                                    <span>Accéder au service</span>
                                    <ChevronRight size={15} className="group-hover:translate-x-1 transition-transform" />
                                </div>
                            </motion.button>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 border border-dashed border-white/10 rounded-3xl space-y-3">
                        <Filter className="w-8 h-8 mx-auto text-[var(--text-muted)] opacity-40" />
                        <p className="text-sm text-[var(--text-muted)]">Aucun service ne correspond à votre recherche.</p>
                        <button
                            onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}
                            className="text-xs text-[var(--gold-light)] hover:underline font-medium"
                        >
                            Réinitialiser les filtres
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <Shell tenant={tenant} user={user} activeTab={activeTab} setActiveTab={setActiveTab}>
            {renderContent()}

            {/* Bottom Sheet for Module Content */}
            <BottomSheet
                isOpen={!!activeModule}
                onClose={() => { setActiveModule(null); setRegistrationType(null); }}
                title={activeModule?.label || ""}
            >
                {activeModule?.id === 'prayer' ? (
                    <PrayerRequestForm tenant={tenant} onSuccess={() => setActiveModule(null)} />
                ) : activeModule?.id === 'appointments' ? (
                    <AppointmentForm tenant={tenant} onSuccess={() => setActiveModule(null)} />
                ) : activeModule?.id === 'testimonies' ? (
                    <TestimonyForm tenant={tenant} onSuccess={() => setActiveModule(null)} />
                ) : activeModule?.id === 'home_cells' ? (
                    <HomeCellsList tenant={tenant} onSuccess={() => setActiveModule(null)} />
                ) : activeModule?.id === 'registrations' ? (
                    !registrationType ? (
                        <RegistrationMenu onSelect={setRegistrationType} />
                    ) : (
                        <div className="space-y-4">
                            <button
                                onClick={() => setRegistrationType(null)}
                                className="p-2 -ml-2 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition"
                                title="Retour"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            {registrationType === 'baptism' ? (
                                <BaptismForm tenant={tenant} onSuccess={() => { setRegistrationType(null); setActiveModule(null); }} />
                            ) : (
                                <PCNCView tenant={tenant} onSuccess={() => { setRegistrationType(null); setActiveModule(null); }} />
                            )}
                        </div>
                    )
                ) : activeModule?.id === 'shuttle' ? (
                    <ShuttleView tenant={tenant} />
                ) : activeModule?.id === 'feedback' ? (
                    <FeedbackForm tenant={tenant} onSuccess={() => setActiveModule(null)} />
                ) : activeModule?.id === 'star' ? (
                    <StarForm tenant={tenant} onSuccess={() => setActiveModule(null)} />
                ) : activeModule?.id === 'women_impact' ? (
                    <GroupWhatsAppView
                        tenant={tenant}
                        moduleKey="women_impact"
                        title="Femmes d'Impact"
                        description="Rejoignez la communauté des femmes d'impact pour grandir et partager ensemble."
                        icon={Users2}
                    />
                ) : activeModule?.id === 'men_impact' ? (
                    <GroupWhatsAppView
                        tenant={tenant}
                        moduleKey="men_impact"
                        title="Hommes d'Impact"
                        description="Un espace dédié aux hommes pour se fortifier et impacter leur entourage."
                        icon={UserCheck}
                    />
                ) : activeModule?.id === 'church_group' ? (
                    <GroupWhatsAppView
                        tenant={tenant}
                        moduleKey="church_group"
                        title="Canal de l'Église"
                        description="Restez connecté à toute l'actualité et la vie de votre église locale."
                        icon={Church}
                    />
                ) : activeModule?.id === 'schedule' ? (
                    <CampusScheduleView tenant={tenant} />
                ) : (
                    <div className="text-white/80 text-center py-10">
                        <p>Service temporairement indisponible.</p>
                    </div>
                )}
            </BottomSheet>
        </Shell>
    );
}
