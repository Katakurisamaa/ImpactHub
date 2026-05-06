"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2, LogOut, ShieldCheck } from "lucide-react";
import HomeCellLeaderView from "@/components/leader/HomeCellLeaderView";
import HomeCellPilotView from "@/components/leader/HomeCellPilotView";
import GroupLeaderView from "@/components/leader/GroupLeaderView";
import PCNCLeaderView from "@/components/leader/PCNCLeaderView";
import BaptismLeaderView from "@/components/leader/BaptismLeaderView";
import ShuttleLeaderView from "@/components/leader/ShuttleLeaderView";
import RequestList from "@/components/manager/RequestList";
import PremiumLoader from "@/components/ui/PremiumLoader";

export default function LeaderDashboard() {
    const router = useRouter();
    const [leader, setLeader] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [moduleLabel, setModuleLabel] = useState("");

    useEffect(() => {
        const getLeaderInfo = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) {
                console.log("Dashboard Page: No session found, redirecting.");
                router.push("/leader/login");
                return;
            }

            const user = session.user;
            console.log("Dashboard Page: User found:", user.id);

            const { data: leaderData } = await supabase
                .from('module_leaders')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (leaderData) {
                setLeader(leaderData);
                setModuleLabel(getModuleLabel(leaderData.module_key));
            } else {
                // Should be caught by layout, but double check
                router.push("/leader/login");
            }
            setLoading(false);
        };
        getLeaderInfo();
    }, [router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/leader/login");
    };

    // deleted line

    if (loading) return <PremiumLoader text="Connexion Responsable..." />;

    if (!leader) return null;

    return (
        <div className="min-h-screen bg-[var(--navy)] text-[var(--text)] p-4 md:p-12 pb-24 md:pb-12">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 md:mb-12 max-w-5xl mx-auto border-b border-white/5 pb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3 text-[var(--text)]" style={{ fontFamily: "var(--font-heading)" }}>
                        <ShieldCheck className="text-[var(--gold)]" /> Espace Responsable
                    </h1>
                    <p className="text-[var(--text-muted)] mt-1">
                        Bienvenue, <span className="text-[var(--text)] font-bold">{leader.full_name}</span>
                    </p>
                    <div className="mt-2 inline-block px-3 py-1 bg-surface-highlight rounded-full text-xs text-[var(--gold-light)] border border-[var(--gold-pale)]">
                        Module : {moduleLabel}
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full md:w-auto p-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition flex items-center justify-center md:justify-start gap-2 border border-red-500/10"
                >
                    <LogOut size={20} />
                    <span>Déconnexion</span>
                </button>
            </header>

            <main className="max-w-5xl mx-auto">
                {renderModuleView(leader.module_key, leader.tenant_id)}
            </main>
        </div>
    );
}

function getModuleLabel(key: string) {
    const map: Record<string, string> = {
        'home_cells': 'Cellules de Maison',
        'home_cells_pilot': 'Cellules de Maison',
        'registrations_baptism': 'Inscriptions (Baptême)',
        'registrations_pcnc': 'Inscriptions (PCNC)',
        'rdv_pastoral': 'RDV Pastoral',
        'rdv_social': 'RDV Social',
        'prayer': 'Prière',
        'testimonies': 'Témoignages',
        'shuttle': 'Navette',
        'feedback': 'Retour',
        'women_impact': "Femmes d'Impact",
        'men_impact': "Hommes d'Impact",
        'star': 'Devenir S.T.A.R',
    };
    return map[key] || key;
}

function renderModuleView(key: string, tenantId: string) {
    switch (key) {
        case 'home_cells':
            return <HomeCellLeaderView tenantId={tenantId} />;

        case 'home_cells_pilot':
            return <HomeCellPilotView tenantId={tenantId} />;

        case 'registrations_baptism':
            return <BaptismLeaderView tenantId={tenantId} />;

        case 'registrations_pcnc':
            return <PCNCLeaderView tenantId={tenantId} />;

        case 'rdv_pastoral':
            return <RequestList moduleFilter="appointment" tenantId={tenantId} subFilter="pastoral" />;

        case 'rdv_social':
            return <RequestList moduleFilter="appointment" tenantId={tenantId} subFilter="social" />;

        case 'prayer':
            return <RequestList moduleFilter="prayer" tenantId={tenantId} />;

        case 'testimonies':
            return <RequestList moduleFilter="testimony" tenantId={tenantId} />;

        case 'shuttle':
            return <ShuttleLeaderView tenantId={tenantId} />;

        case 'feedback':
            return <RequestList moduleFilter="feedback" tenantId={tenantId} />;

        case 'star':
            return <RequestList moduleFilter="star" tenantId={tenantId} />;

        case 'women_impact':
        case 'men_impact':
            return <GroupLeaderView tenantId={tenantId} moduleKey={key} />;

        default:
            return (
                <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
                    <p className="text-white/50">Module non supporté ou en développement : {key}</p>
                </div>
            );
    }
}
