"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Tenant } from "@/types";
import { Loader2, MessageSquareQuote, User, Clock } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type Testimony = {
    id: string;
    created_at: string;
    content: {
        story: string;
        subject: string;
        requester?: { firstName: string; lastName: string };
        is_anonymous: boolean;
    };
};

export default function PublicTestimoniesList({ tenant }: { tenant: Tenant }) {
    const [testimonies, setTestimonies] = useState<Testimony[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTestimonies = async () => {
            // Fetch testimonies where type is 'testimony'
            // AND content filter for shareable data is handled client-side or ideally via a secure view/function.
            // For MVP, we fetch request with type 'testimony' and filter in JS for 'can_share_publicly: true'
            // Note: RLS allows 'SELECT true' for all tenant members, so this is readable.

            const { data } = await supabase
                .from('requests')
                .select('*')
                .eq('tenant_id', tenant.id)
                .eq('type', 'testimony')
                .order('created_at', { ascending: false });

            if (data) {
                // Filter for those marked as public
                // Note: Supabase JSON filtering in query is possible but sometimes tricky with nested keys in 'content'
                // Simpler to filter client side for MVP with small data volume
                const publicItems = data.filter((t: any) => t.content.can_share_publicly === true);
                setTestimonies(publicItems);
            }
            setLoading(false);
        };

        fetchTestimonies();
    }, [tenant.id]);

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-gold" /></div>;

    if (testimonies.length === 0) return <div className="text-white/70 text-center p-8">Aucun témoignage partagé pour le moment.</div>;

    return (
        <div className="space-y-4">
            {testimonies.map((t) => (
                <div key={t.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-start gap-3 mb-3">
                        <div className="p-2 rounded-full bg-pink-500/20 text-pink-300">
                            <MessageSquareQuote size={20} />
                        </div>
                        <div>
                            <h4 className="text-white font-bold">{t.content.subject}</h4>
                            <span className="text-xs text-white/60 flex items-center gap-1 mt-1">
                                <Clock size={10} />
                                {format(new Date(t.created_at), "d MMMM yyyy", { locale: fr })}
                            </span>
                        </div>
                    </div>

                    <p className="text-white/80 text-sm italic mb-4">"{t.content.story}"</p>

                    <div className="flex items-center gap-2 text-xs text-white/70 border-t border-white/5 pt-2">
                        <User size={12} />
                        <span>
                            {t.content.is_anonymous ? "Anonyme" : `${t.content.requester?.firstName} ${t.content.requester?.lastName}`}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}
