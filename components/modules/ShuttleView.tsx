"use client";

import { useEffect, useState } from "react";
import { Bus, User, Phone, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { Tenant } from "@/types";
import ServiceUnavailable from "./ServiceUnavailable";

interface Leader {
    full_name: string;
    phone: string;
}

export default function ShuttleView({ tenant }: { tenant: Tenant }) {
    const [leader, setLeader] = useState<Leader | null>(null);
    const [leaderStatus, setLeaderStatus] = useState<'loading' | 'open' | 'not_found'>('loading');

    useEffect(() => {
        if (!tenant?.id) return;

        async function fetchLeader() {
            try {
                const res = await fetch(`/api/leader/status?tenantId=${tenant.id}&moduleKey=shuttle`);
                const data = await res.json();
                
                if (data.status === 'open') {
                    setLeader({
                        full_name: data.leader.full_name,
                        phone: data.leader.phone
                    });
                    setLeaderStatus('open');
                } else {
                    setLeaderStatus(data.status);
                }
            } catch (err) {
                console.error("Error fetching shuttle leader:", err);
                setLeaderStatus('not_found');
            }
        }

        fetchLeader();
    }, [tenant?.id]);

    if (!tenant?.id) return null;

    if (leaderStatus === 'loading') {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    if (leaderStatus !== 'open' || !leader) {
        return <ServiceUnavailable 
            title="Service Navette Indisponible"
            message="Le service de navette n'a pas encore de responsable assigné pour votre église."
        />;
    }

    return (
        <div className="space-y-6 text-center">
            <div className="inline-flex p-4 rounded-full bg-gold/10 mb-2">
                <Bus size={40} className="text-gold" />
            </div>

            <div>
                <h3 className="text-xl font-bold text-white mb-2">Service Navette</h3>
                <p className="text-white/60 text-sm px-4 mb-4">
                    Service de navette disponible pour les cultes du Dimanche.
                </p>
            </div>

            <div className="p-5 rounded-2xl bg-surface border border-white/5 text-left shadow-card">
                <h4 className="text-xs uppercase font-bold text-muted-foreground mb-4">Responsable Navette</h4>

                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-foreground">
                        <div className="p-2 rounded-xl bg-primary/10">
                            <User className="text-primary" size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Prénom & Nom</p>
                            <p className="font-bold text-lg">{leader.full_name}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-foreground">
                        <div className="p-2 rounded-xl bg-accent-success/10">
                            <Phone className="text-accent-success" size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Téléphone</p>
                            <p className="font-bold text-lg">{leader.phone}</p>
                        </div>
                    </div>
                </div>
            </div>

            <a
                href={`tel:${leader.phone.replace(/\s/g, '')}`}
                className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2 transition hover:bg-primary-hover shadow-glow transform active:scale-95"
            >
                <Phone size={20} /> Appeler le responsable
            </a>
        </div>
    );
}

