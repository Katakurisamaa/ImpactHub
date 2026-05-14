"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Tenant } from "@/types";
import { Loader2, Calendar, Heart, MessageSquareQuote, MessageCircle, Sparkles, Clock, CheckCircle2, XCircle, Droplets, Trash2, Archive, GraduationCap, MapPin } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type Request = {
    id: string;
    type: string;
    created_at: string;
    status: string; // pending, approved, rejected, archived
    content: any;
};

export default function MyRequestsList({ tenant, onSuccess }: { tenant: Tenant; onSuccess: () => void }) {
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [filter, setFilter] = useState('all');
    const [debugLog, setDebugLog] = useState<any>(null);

    useEffect(() => {
        let channel: any;

        const init = async () => {
            const userStr = localStorage.getItem(`impact_member_${tenant.slug}`);
            if (!userStr) {
                setLoading(false);
                return;
            }
            const user = JSON.parse(userStr);
            const normalize = (s: any) => String(s || "").trim().toLowerCase();

            // 1. Initial Fetch
            const { data } = await supabase
                .from('requests')
                .select('*')
                .eq('tenant_id', tenant.id)
                .order('created_at', { ascending: false });

            if (data) {
                // Debug logging
                setDebugLog({
                    totalRaw: data.length,
                    firstRequester: data[0]?.content?.requester,
                    currentUser: user
                });
                console.log("DEBUG MyRequests:", { fetched: data.length, user });

                const myRequests = data.filter(r => {
                    if (!r.content) return false;
                    const content = r.content || {};
                    const requester = content.requester || {};
            
                    // Check multiple potential name locations for robustness
                    const first = requester.firstName || content.firstName || content.prenom || "";
                    const last = requester.lastName || content.lastName || content.nom || "";
                    const full = content.fullName || "";

                    const matchesFirstLast = 
                        normalize(first) === normalize(user.firstName) && 
                        normalize(last) === normalize(user.lastName);
            
                    const matchesFull = full && normalize(full).includes(normalize(user.firstName)) && normalize(full).includes(normalize(user.lastName));

                    return matchesFirstLast || matchesFull;
                });
                setRequests(myRequests);
            }
            setLoading(false);

            // 2. Realtime Subscription
            channel = supabase
                .channel(`my-requests-${tenant.id}`)
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'requests',
                        filter: `tenant_id=eq.${tenant.id}`
                    },
                    (payload) => {
                        console.log("Realtime event:", payload);

                        if (payload.eventType === 'INSERT') {
                            const newReq = payload.new as Request;
                            // Check if this new request belongs to me
                            const req = newReq.content?.requester;
                            if (req && typeof req !== 'string') {
                                if (normalize(req.firstName) === normalize(user.firstName) &&
                                    normalize(req.lastName) === normalize(user.lastName)) {
                                    setRequests(prev => [newReq, ...prev]);
                                }
                            }
                        } else if (payload.eventType === 'UPDATE') {
                            // Update if it's already in our list (we only care if status/content changes for existing visible requests)
                            setRequests(prev => prev.map(r => r.id === payload.new.id ? { ...r, ...payload.new } : r));
                        } else if (payload.eventType === 'DELETE') {
                            // Remove if it's in our list
                            setRequests(prev => prev.filter(r => r.id !== payload.old.id));
                        }
                    }
                )
                .subscribe();
        };

        init();

        return () => {
            if (channel) supabase.removeChannel(channel);
        };
    }, [tenant.id, tenant.slug]);

    const handleDelete = async (id: string) => {
        if (!confirm("Voulez-vous vraiment supprimer cette demande ?")) return;

        setDeletingId(id);
        const { error } = await supabase.from('requests').delete().eq('id', id);

        if (error) {
            alert("Erreur lors de la suppression.");
        } else {
            setRequests(prev => prev.filter(r => r.id !== id));
        }
        setDeletingId(null);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved': case 'done': return <CheckCircle2 size={16} className="text-accent-success" />;
            case 'processing': return <Loader2 size={16} className="text-primary animate-spin" />;
            case 'rejected': return <XCircle size={16} className="text-accent-error" />;
            case 'archived': return <Archive size={16} className="text-muted-foreground" />;
            case 'pending': default: return <Clock size={16} className="text-yellow-500" />;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'approved': case 'done': return 'Clôturée';
            case 'processing': return 'En cours';
            case 'rejected': return 'Refusée';
            case 'archived': return 'Archivée';
            case 'pending': default: return 'En attente';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'prayer': return <Heart size={18} className="text-purple-400" />;
            case 'testimony': return <MessageSquareQuote size={18} className="text-pink-400" />;
            case 'feedback': return <MessageCircle size={18} className="text-orange-400" />;
            case 'star': return <Sparkles size={18} className="text-yellow-400" />;
            case 'baptism': return <Droplets size={18} className="text-primary" />;
            case 'pcnc': return <GraduationCap size={18} className="text-primary" />;
            case 'appointment': return <Calendar size={18} className="text-primary" />;
            case 'home_cells': return <MapPin size={18} className="text-gold" />;
            default: return <Calendar size={18} className="text-primary" />;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'prayer': return 'Prière';
            case 'testimony': return 'Témoignage';
            case 'feedback': return 'Retour d\'expérience';
            case 'star': return 'Candidature S.T.A.R';
            case 'baptism': return 'Demande de Baptême';
            case 'pcnc': return 'Inscription Formation PCNC';
            case 'appointment': return 'Rendez-vous';
            case 'home_cells': return 'Cellule de maison';
            default: return 'Demande';
        }
    };

    const filteredRequests = requests.filter(r => {
        if (filter === 'all') return true;
        if (filter === 'registrations') return r.type === 'baptism' || r.type === 'pcnc';
        return r.type === filter;
    });

    const TABS = [
        { id: 'all', label: 'Tout' },
        { id: 'prayer', label: 'Prière' },
        { id: 'appointment', label: 'RDV' },
        { id: 'testimony', label: 'Témoignage' },
        { id: 'registrations', label: 'Inscriptions' },
        { id: 'feedback', label: 'Retour' },
        { id: 'star', label: 'S.T.A.R' },
        { id: 'home_cells', label: 'Cellules' },
    ];

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-gold" /></div>;

    if (requests.length === 0) return <div className="text-white/50 text-center p-8">Vous n'avez fait aucune demande pour le moment.</div>;

    return (
        <div className="space-y-4">
            <div className="flex gap-2 overflow-x-auto pb-2 border-b border-white/10 custom-scrollbar">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setFilter(tab.id)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-300 ${filter === tab.id
                            ? 'bg-primary text-primary-foreground shadow-glow'
                            : 'bg-surface text-muted-foreground hover:bg-white/5 hover:text-foreground'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {filteredRequests.length === 0 ? (
                <div className="text-white/50 text-center p-8 text-sm">Aucune demande dans cette catégorie.</div>
            ) : (
                filteredRequests.map((request) => (
                    <div key={request.id} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-gold/30 transition relative group">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                {getTypeIcon(request.type)}
                                <span className="font-bold text-white capitalize">
                                    {getTypeLabel(request.type)}
                                </span>
                            </div>
                            <div className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${request.status === 'approved' || request.status === 'done' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
                                request.status === 'processing' ? 'bg-primary/10 border-primary/30 text-primary' :
                                    request.status === 'rejected' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                                        request.status === 'archived' ? 'bg-white/5 border-white/20 text-white/50' :
                                            'bg-yellow-500/10 border-yellow-500/30 text-yellow-500'
                                }`}>
                                {getStatusIcon(request.status)}
                                <span>{getStatusLabel(request.status)}</span>
                            </div>
                        </div>

                        <div className="mb-2 pr-8">
                            <h4 className="text-white font-medium text-sm">{request.content.subject}</h4>
                            <p className="text-white/60 text-xs mt-1 line-clamp-2">
                                {request.content.details || request.content.reason || request.content.story || request.content.message || "Aucun détail"}
                            </p>
                        </div>

                        <div className="text-xs text-white/40 flex justify-end items-center gap-3">
                            {format(new Date(request.created_at), "d MMMM yyyy à HH:mm", { locale: fr })}

                            {(request.status === 'pending' || request.status === 'done' || request.status === 'archived') && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(request.id);
                                    }}
                                    disabled={deletingId === request.id}
                                    className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition disabled:opacity-50"
                                    title="Supprimer la demande"
                                >
                                    {deletingId === request.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                </button>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
