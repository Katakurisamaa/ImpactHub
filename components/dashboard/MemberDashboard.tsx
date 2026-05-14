"use client";

import { useEffect, useState } from "react";
import { Tenant } from "@/types";
import { supabase } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import {
    Calendar, ClipboardList, MapPin, Bus, Heart,
    MessageSquareQuote, MessageCircle, ListTodo, Loader2, Sparkles, ChevronRight,
    Users2, UserCheck, Church, ArrowLeft
} from "lucide-react";
import Shell from "@/components/layout/Shell";

// Modules Definition
const MODULES_DEF = [
    { id: 'appointments', label: 'RDV', description: 'Pastoral & Social', icon: Calendar, color: 'from-primary/20 to-primary/10', border: 'border-primary/20' },
    { id: 'registrations', label: 'Inscriptions', description: 'Baptême & PCNC', icon: ClipboardList, color: 'from-accent-success/20 to-accent-success/10', border: 'border-accent-success/20' },
    { id: 'home_cells', label: 'Cellules de maison', description: 'Trouver une cellule', icon: MapPin, color: 'from-gold-500/20 to-gold-600/10', border: 'border-gold-500/20' },
    { id: 'shuttle', label: 'Navette', description: 'Transport cultes', icon: Bus, color: 'from-gold-400/20 to-gold-500/10', border: 'border-gold-400/20' },
    { id: 'prayer', label: 'Prière', description: 'Partager un sujet', icon: Heart, color: 'from-accent-pink/20 to-accent-pink/10', border: 'border-accent-pink/20' },
    { id: 'testimonies', label: 'Témoignages', description: 'Partager un miracle', icon: MessageSquareQuote, color: 'from-primary/20 to-primary/10', border: 'border-primary/20' },
    { id: 'feedback', label: 'Retour', description: 'Donner votre avis', icon: MessageCircle, color: 'from-accent-success/20 to-accent-success/10', border: 'border-accent-success/20' },
    { id: 'star', label: 'Devenir S.T.A.R', description: 'Rejoindre une équipe', icon: Sparkles, color: 'from-accent-pink/20 to-accent-pink/10', border: 'border-accent-pink/20' },
    { id: 'women_impact', label: "Femmes d'Impact", description: 'Groupe WhatsApp', icon: Users2, color: 'from-accent-pink/20 to-accent-pink/10', border: 'border-accent-pink/20' },
    { id: 'men_impact', label: "Hommes d'Impact", description: 'Groupe WhatsApp', icon: UserCheck, color: 'from-primary/20 to-primary/10', border: 'border-primary/20' },
    { id: 'church_group', label: "Groupe de l'Église", description: 'Toute l\'actualité', icon: Church, color: 'from-gold-500/20 to-gold-600/10', border: 'border-gold-500/20' },
];

// Import forms (Lazy load or direct)
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
import BottomSheet from "@/components/ui/BottomSheet";

export default function MemberDashboard({ tenant, onReplayVideo }: { tenant: Tenant, onReplayVideo?: () => void }) {
    const [user, setUser] = useState<{ firstName: string; lastName: string } | null>(null);
    const [activeTab, setActiveTab] = useState("dashboard"); // 'dashboard', 'requests', 'profile'
    const [availableModules, setAvailableModules] = useState<typeof MODULES_DEF>([]);
    const [loading, setLoading] = useState(true);

    // Module Interaction State
    const [activeModule, setActiveModule] = useState<any>(null);
    const [registrationType, setRegistrationType] = useState<"baptism" | "pcnc" | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem(`impact_member_${tenant.slug}`);
        if (stored) setUser(JSON.parse(stored));

        // Fetch active modules
        const fetchModules = async () => {
            const { data } = await supabase
                .from('tenant_modules')
                .select('module_key')
                .eq('tenant_id', tenant.id)
                .eq('is_active', true);

            if (data) {
                const activeKeys = data.map(d => d.module_key);
                const filtered = MODULES_DEF.filter(m => activeKeys.includes(m.id));
                setAvailableModules(filtered);
            }
            setLoading(false);
        };
        fetchModules();
    }, [tenant.id, tenant.slug]);

    if (loading) return <div className="h-screen flex items-center justify-center text-gold"><Loader2 className="animate-spin" /></div>;

    const renderContent = () => {
        if (activeTab === 'requests') {
            return (
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white mb-6">Mes Demandes</h2>
                    <MyRequestsList tenant={tenant} onSuccess={() => { }} />
                </div>
            );
        }

        if (activeTab === 'profile') {
            return (
                <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-4xl font-bold text-white border border-white/10">
                        {user?.firstName?.charAt(0)}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">{user?.firstName} {user?.lastName}</h2>
                        <p className="text-white/60 mb-6">Membre - {tenant.name}</p>

                        <button
                            onClick={onReplayVideo}
                            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all font-medium"
                        >
                            <Sparkles className="w-5 h-5 text-gold" />
                            Revoir la vidéo de bienvenue
                        </button>
                    </div>
                </div>
            );
        }

        // Dashboard View
        return (
            <div className="space-y-8">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative rounded-3xl overflow-hidden p-8 bg-gradient-to-br from-gold-500/20 to-purple-900/40 border border-white/10"
                >
                    <div className="relative z-10">
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                            Bonjour, <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 to-gold-500">{user?.firstName}</span>
                        </h1>
                        <p className="text-white/70">Prêt à impacter votre génération aujourd'hui ?</p>
                    </div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
                </motion.div>

                {/* Modules Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {availableModules.map((module, i) => (
                        <motion.button
                            key={module.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 + 0.2 }}
                            onClick={() => setActiveModule(module)}
                            className={`relative h-40 md:h-40 rounded-3xl p-4 md:p-6 flex flex-col items-start justify-between bg-gradient-to-br ${module.color} backdrop-blur-md border ${module.border} md:hover:scale-[1.02] active:scale-[0.98] hover:border-white/30 transition-all duration-300 group overflow-hidden`}
                        >
                            <div className="p-3 rounded-2xl bg-white/10 text-white group-hover:bg-white/20 transition-colors">
                                <module.icon size={22} />
                            </div>
                            <div className="relative z-10 w-full text-left">
                                <div className="flex justify-between items-start gap-2">
                                    <div className="flex-1">
                                        <span className="font-bold text-white text-sm md:text-lg tracking-wide leading-tight block">{module.label}</span>
                                        {module.description && (
                                            <span className="text-[10px] md:text-xs text-white/50 block mt-1 line-clamp-1">
                                                {module.description}
                                            </span>
                                        )}
                                    </div>
                                    <ChevronRight size={16} className="text-white/40 mt-1 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </motion.button>
                    ))}
                </div>
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
                        title="Groupe de l'Église"
                        description="Restez connecté à toute l'actualité et la vie de votre église locale."
                        icon={Church}
                    />
                ) : (
                    <div className="text-white/80 text-center py-10">
                        <p>Module en développement...</p>
                    </div>
                )}
            </BottomSheet>
        </Shell>
    );
}
