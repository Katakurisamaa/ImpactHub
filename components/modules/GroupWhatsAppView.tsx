"use client";

import { useEffect, useState } from "react";
import { MessageCircle, User, Loader2, ExternalLink } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { Tenant } from "@/types";
import ServiceUnavailable from "./ServiceUnavailable";

interface Leader {
    full_name: string;
    whatsapp_link: string;
}

export default function GroupWhatsAppView({
    tenant,
    moduleKey,
    title,
    description,
    icon: Icon = MessageCircle
}: {
    tenant: Tenant;
    moduleKey: string;
    title: string;
    description: string;
    icon?: any;
}) {
    const [leader, setLeader] = useState<Leader | null>(null);
    const [leaderStatus, setLeaderStatus] = useState<'loading' | 'open' | 'not_found'>('loading');

    useEffect(() => {
        if (!tenant?.id) return;

        async function fetchLeader() {
            try {
                const res = await fetch(`/api/leader/status?tenantId=${tenant.id}&moduleKey=${moduleKey}`);
                const data = await res.json();
                
                if (data.status === 'open') {
                    setLeader({
                        full_name: data.leader.full_name,
                        whatsapp_link: data.leader.session_date // API maps link to session_date
                    });
                    setLeaderStatus('open');
                } else {
                    setLeaderStatus(data.status);
                }
            } catch (err) {
                console.error(`Error fetching group leader for ${moduleKey}:`, err);
                setLeaderStatus('not_found');
            }
        }

        fetchLeader();
    }, [tenant?.id, moduleKey]);

    if (!tenant?.id) return null;

    if (leaderStatus === 'loading') {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    if (leaderStatus !== 'open' || !leader?.whatsapp_link) {
        return <ServiceUnavailable
            title="Module Inactif"
            message="Ce groupe d'impact est temporairement indisponible."
        />;
    }

    return (
        <div className="space-y-6 text-center">
            <div className="inline-flex p-4 rounded-full bg-accent-success/10 mb-2">
                <Icon size={40} className="text-accent-success" />
            </div>

            <div>
                <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                <p className="text-white/60 text-sm px-4 mb-4">
                    {description}
                </p>
            </div>

            {leader.full_name && moduleKey !== 'church_group' && (
                <div className="p-5 rounded-2xl bg-surface border border-white/5 text-left shadow-card">
                    <h4 className="text-xs uppercase font-bold text-muted-foreground mb-4">Responsable du groupe</h4>

                    <div className="flex items-center gap-3 text-foreground">
                        <div className="p-2 rounded-xl bg-primary/10">
                            <User className="text-primary" size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Prénom & Nom</p>
                            <p className="font-bold text-lg">{leader.full_name}</p>
                        </div>
                    </div>
                </div>
            )}

            <a
                href={leader.whatsapp_link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 rounded-xl bg-accent-success text-white font-bold flex items-center justify-center gap-2 transition hover:opacity-90 shadow-glow transform active:scale-95"
            >
                <MessageCircle size={20} /> Rejoindre le groupe WhatsApp <ExternalLink size={16} />
            </a>
        </div>
    );
}
