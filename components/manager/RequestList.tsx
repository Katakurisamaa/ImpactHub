"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase/client";
import { Loader2, Calendar, Heart, User, Phone, Mail, Clock, MessageSquareQuote, Droplets, CheckCircle2, MessageCircle, MoreVertical, ShieldAlert, ArrowRight, Download } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import * as XLSX from "xlsx";

type Request = {
    id: string;
    type: string;
    created_at: string;
    status: string;
    content: any;
};

interface RequestListProps {
    moduleFilter?: string;
    tenantId?: string;
    subFilter?: string;
    onDataChange?: (data: Request[]) => void;
}

export default function RequestList({ moduleFilter, tenantId, subFilter, onDataChange }: RequestListProps) {
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);
    const [resolvedTenantId, setResolvedTenantId] = useState<string | null>(tenantId || null);

    useEffect(() => {
        if (tenantId) {
            setResolvedTenantId(tenantId);
            return;
        }

        const resolveTenant = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: tenantAdmin } = await supabase
                .from('tenant_admins')
                .select('tenant_id')
                .eq('user_id', user.id)
                .single();

            if (tenantAdmin) {
                setResolvedTenantId(tenantAdmin.tenant_id);
            } else {
                setLoading(false);
            }
        };
        resolveTenant();
    }, [tenantId]);

    useEffect(() => {
        if (!resolvedTenantId) return;

        const fetchRequests = async () => {
            const { data } = await supabase
                .from('requests')
                .select('*')
                .eq('tenant_id', resolvedTenantId)
                .order('created_at', { ascending: false });

            if (data) setRequests(data);
            setLoading(false);
        };

        fetchRequests();

        const channel = supabase
            .channel('request-list-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'requests',
                    filter: `tenant_id=eq.${resolvedTenantId}`
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setRequests(prev => [payload.new as Request, ...prev]);
                    } else if (payload.eventType === 'UPDATE') {
                        setRequests(prev => prev.map(r => r.id === payload.new.id ? { ...r, ...payload.new } : r));
                    } else if (payload.eventType === 'DELETE') {
                        setRequests(prev => prev.filter(r => r.id !== payload.old.id));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [resolvedTenantId]);

    const handleStatusChange = async (requestId: string, newStatus: string) => {
        const { error } = await supabase
            .from('requests')
            .update({ status: newStatus })
            .eq('id', requestId);

        if (!error) {
            setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: newStatus } : r));
        } else {
            alert("Erreur mise à jour statut");
        }
    };

    const handleToggleVisibility = async (request: any) => {
        const updatedContent = { ...request.content, can_share_publicly: !request.content.can_share_publicly };
        const { error } = await supabase
            .from('requests')
            .update({ content: updatedContent })
            .eq('id', request.id);

        if (!error) {
            setRequests(prev => prev.map(r => r.id === request.id ? { ...r, content: updatedContent } : r));
        } else {
            console.error("Error updating visibility:", error);
            alert("Erreur lors de la mise à jour de la visibilité.");
        }
    };

    const handleDelete = async (requestId: string) => {
        if (!confirm("Supprimer cette demande définitivement ?")) return;

        const { error } = await supabase
            .from('requests')
            .delete()
            .eq('id', requestId);

        if (!error) {
            setRequests(prev => prev.filter(r => r.id !== requestId));
        } else {
            alert("Erreur suppression");
        }
    };

    const [filter, setFilter] = useState(moduleFilter || 'all');
    const [sessionFilter, setSessionFilter] = useState('all');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const handleExportExcel = () => {
        const pendingRequests = filteredRequests.filter(r => !r.status || r.status === 'pending');
        
        if (pendingRequests.length === 0) {
            alert("Aucune nouvelle demande à traiter pour cet export.");
            return;
        }

        // Prepare data for Excel
        const excelData = pendingRequests.map(req => {
            const row: any = {
                "Date de demande": format(new Date(req.created_at), "dd/MM/yyyy HH:mm"),
                "Module": req.type === 'appointment' ? `RDV ${req.content.appointment_type || ''}` : req.type,
                "Statut actuel": getStatusLabel(req.status || 'pending'),
            };

            // Common Identity Fields first for better Excel layout
            const firstName = req.content.firstName || req.content.personal?.firstName || req.content.requester?.firstName || "";
            const lastName = req.content.lastName || req.content.personal?.lastName || req.content.requester?.lastName || "";
            const fullName = req.content.full_name || req.content.fullName || (firstName && lastName ? `${firstName} ${lastName}` : "");
            
            row["Nom Complet"] = fullName;
            row["Email"] = req.content.email || req.content.personal?.email || req.content.requester?.email || "";
            row["Téléphone"] = req.content.phone || req.content.personal?.phone || req.content.requester?.phone || "";

            // Add dynamic fields based on labels, excluding already added common fields
            const excludedKeys = ['firstName', 'lastName', 'full_name', 'fullName', 'email', 'phone', 'consent_rgpd', 'requester_key', 'timestamp', 'requester'];
            
            Object.entries(req.content).forEach(([key, value]) => {
                const label = getLabel(key);
                if (label && !excludedKeys.includes(key)) {
                    if (Array.isArray(value)) {
                        row[label] = value.join(", ");
                    } else if (typeof value === 'boolean') {
                        row[label] = value ? 'Oui' : 'Non';
                    } else if (value && typeof value === 'object') {
                        // Skip complex nested objects to avoid Excel mess
                    } else {
                        row[label] = value;
                    }
                }
            });

            return row;
        });

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Requêtes");
        
        const fileName = `export_${filter}_${format(new Date(), "yyyy-MM-dd")}.xlsx`;
        XLSX.writeFile(workbook, fileName);
    };

    const getLabel = (key: string): string | null => {
        const labels: Record<string, string | null> = {
            birthYear: "Année de naissance",
            dateOfBirth: "Date de naissance",
            gender: "Genre / Sexe",
            address: "Adresse",
            postalCode: "Code postal",
            city: "Ville",
            role: "Rôle",
            salvationPrayer: "A déjà fait la prière du salut",
            confirmed: "Confirmation de la demande",
            details: "Détails",
            story: "Témoignage",
            reason: "Motif de la demande",
            message: "Message",
            appointment_type: "Type de RDV",
            age_range: "Tranche d'âge",
            marital_status: "Situation matrimoniale",
            church_duration: "Ancienneté dans l'église",
            is_cell_member: "Membre d'une cellule",
            formations: "Formations suivies",
            formations_followed: "Formations S.T.A.R suivies",
            appointment_reason: "Motif du RDV",
            had_previous_appointment: "A déjà eu un RDV pastoral",
            previous_appointment_details: "Détails RDV précédent",
            additional_notes: "Notes additionnelles",
            requested_date: "Date souhaitée",
            cell_name: "Cellule de maison",
            subject: "Objet",
            sessionDate: "Date de la session",
            consent_rgpd: "Consentement RGPD",
            // Common keys
            first_name: "Prénom",
            last_name: "Nom",
            full_name: "Nom Complet",
            firstName: "Prénom",
            lastName: "Nom",
            phone: "Téléphone",
            email: "Email",
            // STAR Specific
            civility: "Civilité",
            familyStatus: "Situation Familiale",
            birthDate: "Date de Naissance",
            profession: "Profession",
            howKnown: "Comment a connu ICC",
            sinceWhen: "Fréquente ICC depuis",
            homeGroup: "En Groupe d'Impact",
            homeGroupName: "Nom du Groupe",
            pcncFollowed: "A suivi PCNC",
            pcncDetails: "Détails PCNC",
            departments: "Départements souhaités",
            comments: "Commentaires/Précisions",
            motivation: "Motivations",
            consent: "Consentement"
        };
        return labels[key] || null;
    };

    useEffect(() => {
        if (moduleFilter) setFilter(moduleFilter);
    }, [moduleFilter]);

    useEffect(() => {
        setSessionFilter('all');
    }, [filter]);

    const requestsByModule = useMemo(() => requests.filter(r => {
        if (filter !== 'all' && r.type !== filter) return false;
        if (subFilter && r.type === 'appointment' && r.content?.appointment_type !== subFilter) {
            return false;
        }
        return true;
    }), [requests, filter, subFilter]);

    const uniqueSessions = useMemo(() => Array.from(new Set(requestsByModule.map(r => r.content?.sessionDate).filter(Boolean))), [requestsByModule]) as string[];

    const filteredRequests = useMemo(() => requestsByModule.filter(r => {
        if (sessionFilter !== 'all' && r.content?.sessionDate !== sessionFilter) {
            return false;
        }
        return true;
    }), [requestsByModule, sessionFilter]);
    
    useEffect(() => {
        if (onDataChange) {
            onDataChange(filteredRequests);
        }
    }, [filteredRequests, onDataChange]);

    const TABS = [
        { id: 'all', label: 'Tout' },
        { id: 'prayer', label: 'Prière' },
        { id: 'appointment', label: 'RDV' },
        { id: 'testimony', label: 'Témoignage' },
        { id: 'baptism', label: 'Inscriptions' },
        { id: 'feedback', label: 'Retour' },
        { id: 'star', label: 'S.T.A.R' },
    ];

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'done': return 'Terminé';
            case 'processing': return 'En cours';
            default: return 'À traiter';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'prayer': return <Heart className="text-accent-pink w-5 h-5" />;
            case 'testimony': return <MessageSquareQuote className="text-gold w-5 h-5" />;
            case 'baptism': return <Droplets className="text-blue-400 w-5 h-5" />;
            case 'feedback': return <MessageCircle className="text-slate-300 w-5 h-5" />;
            case 'star': return <ShieldAlert className="text-primary w-5 h-5" />;
            default: return <Calendar className="text-primary w-5 h-5" />;
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;

    const groupedRequests = {
        pending: filteredRequests.filter(r => !r.status || r.status === 'pending'),
        processing: filteredRequests.filter(r => r.status === 'processing'),
        done: filteredRequests.filter(r => r.status === 'done' || r.status === 'confirmed')
    };

    const Column = ({ title, status, items, glowClass }: { title: string, status: string, items: Request[], glowClass: string }) => (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-2 mb-2">
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                    {title} <span className="text-xs bg-white/10 px-2.5 py-1 rounded-full text-slate-300 font-medium">{items.length}</span>
                </h3>
            </div>
            <div className={`flex flex-col gap-4 min-h-[400px] p-3 rounded-3xl bg-[#0a0f1c]/40 border border-white/5 shadow-inner`}>
                {items.length === 0 ? (
                    <div className="text-slate-500 text-center py-12 text-sm italic border border-dashed border-white/10 rounded-2xl mx-1 flex items-center justify-center bg-white/[0.01]">
                        Aucune tâche
                    </div>
                ) : (
                    items.map(request => {
                        const isExpanded = expandedId === request.id;
                        return (
                        <div key={request.id} className={`p-6 rounded-2xl bg-[#0a0f1c]/80 border border-white/5 hover:border-white/20 transition-all duration-300 shadow-xl group ${glowClass}`}>
                            <div className="flex justify-between items-start mb-5">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-white/[0.03] flex items-center justify-center border border-white/10 shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] group-hover:scale-105 transition-transform duration-300">
                                        {getTypeIcon(request.type)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white capitalize text-base tracking-wide flex items-center gap-2">
                                            {request.type === 'appointment' ? 'RDV ' + (request.content.appointment_type || '') : request.type}
                                            {status === 'pending' && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                                        </h4>
                                        <span className="text-xs text-slate-400 flex items-center gap-1.5 mt-1 font-medium">
                                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                                            {format(new Date(request.created_at), "d MMM yyyy, HH:mm", { locale: fr })}
                                        </span>
                                    </div>
                                </div>
                                {request.type === 'testimony' ? (
                                    <button
                                        onClick={() => handleToggleVisibility(request)}
                                        className={`text-[10px] font-black tracking-wider uppercase outline-none cursor-pointer rounded-lg px-3 py-2 border transition-all ${
                                            request.content.can_share_publicly 
                                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30' 
                                            : 'bg-black/60 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white'
                                        }`}
                                    >
                                        {request.content.can_share_publicly ? 'Publié' : 'Masqué'}
                                    </button>
                                ) : request.type === 'feedback' ? null : (
                                    <select
                                        value={request.status || "pending"}
                                        onChange={(e) => handleStatusChange(request.id, e.target.value)}
                                        className="bg-black/60 text-[10px] font-black tracking-wider uppercase outline-none cursor-pointer rounded-lg px-3 py-2 text-slate-300 border border-white/10 hover:bg-white/10 hover:text-white transition-all appearance-none"
                                    >
                                        <option value="pending" className="bg-slate-900 text-white">À TRAITER</option>
                                        <option value="processing" className="bg-slate-900 text-white">EN COURS</option>
                                        <option value="done" className="bg-slate-900 text-white">TERMINÉ</option>
                                    </select>
                                )}
                            </div>

                            <div className="mb-5">
                                {request.content.subject && <h5 className="text-slate-200 font-semibold text-sm mb-1">{request.content.subject}</h5>}
                                {request.content.sessionDate && (
                                    <div className="mb-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/10">
                                        <Calendar className="w-3.5 h-3.5 text-primary" />
                                        <span className="text-xs font-medium text-slate-300">Session : {request.content.sessionDate}</span>
                                    </div>
                                )}
                                {!isExpanded && (
                                    <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">
                                        {request.type === 'prayer' ? request.content.details :
                                            request.type === 'testimony' ? `"${request.content.story}"` :
                                                request.content.reason || request.content.message || "Consultation de dossier"}
                                    </p>
                                )}
                                {isExpanded && (
                                    <div className="mt-4 p-4 rounded-xl bg-black/40 border border-white/5 text-sm space-y-3">
                                        {/* Recursive or flattened display for nested content */}
                                        {(() => {
                                            const flattenContent = (obj: any, prefix = ''): [string, any][] => {
                                                return Object.entries(obj).reduce((acc: [string, any][], [key, value]) => {
                                                    if (value && typeof value === 'object' && !Array.isArray(value)) {
                                                        return [...acc, ...flattenContent(value, `${key}.`)];
                                                    }
                                                    return [...acc, [key, value]];
                                                }, []);
                                            };

                                            const contentToDisplay = flattenContent(request.content);
                                            
                                            // For legacy or non-nested requests, we still show top-level fields
                                            return contentToDisplay.map(([key, value]) => {
                                                const label = getLabel(key);
                                                if (!label) return null;
                                                if (value === undefined || value === null || value === '') return null;
                                                
                                                let displayValue = "";
                                                if (Array.isArray(value)) {
                                                    displayValue = value.join(", ");
                                                } else if (typeof value === 'boolean') {
                                                    displayValue = value ? 'Oui' : 'Non';
                                                } else {
                                                    displayValue = String(value);
                                                }

                                                return (
                                                    <div key={key}>
                                                        <span className="text-white/50 block text-[10px] uppercase tracking-wider font-bold mb-0.5">{label}</span>
                                                        <span className="text-slate-200 font-medium">{displayValue}</span>
                                                    </div>
                                                );
                                            });
                                        })()}
                                    </div>
                                )}
                            </div>

                            {/* No profile pictures, just an elegant tag for the user */}
                            <div className="pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 flex items-center gap-2">
                                        <User className="w-3.5 h-3.5 text-primary" />
                                        <span className="text-xs font-medium text-slate-200">
                                            {request.content.firstName || request.content.personal?.firstName || request.content.requester?.firstName || "Anonyme"} {request.content.lastName || request.content.personal?.lastName || request.content.requester?.lastName || ""}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setExpandedId(isExpanded ? null : request.id)}
                                        className="text-xs font-bold text-primary hover:text-primary-hover transition-colors px-2 py-1"
                                    >
                                        {isExpanded ? "Voir moins" : "Tout voir"}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(request.id)}
                                        className="text-xs text-slate-500 hover:text-red-400 transition-colors px-2 py-1"
                                    >
                                        Supprimer
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })
                )}
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            {!moduleFilter && (
                <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setFilter(tab.id)}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-300 border ${filter === tab.id
                                ? 'bg-emerald-500 border-emerald-400 text-[#020617] shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]'
                                : 'bg-[#0a0f1c]/80 backdrop-blur-md text-slate-400 hover:text-white border-white/5 hover:border-white/20 hover:bg-white/5'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
                {uniqueSessions.length > 0 ? (
                    <div className="flex items-center gap-3 bg-surface border border-white/5 rounded-2xl p-4 shadow-card inline-flex">
                        <Calendar className="text-primary w-5 h-5 shrink-0" />
                        <span className="text-white/80 font-medium whitespace-nowrap">Session :</span>
                        <select
                            value={sessionFilter}
                            onChange={(e) => setSessionFilter(e.target.value)}
                            className="bg-black/60 text-sm font-medium outline-none cursor-pointer rounded-xl px-4 py-2 text-white border border-white/10 hover:bg-white/10 transition-all"
                        >
                            <option value="all" className="bg-slate-900 text-white">Toutes (Historique complet)</option>
                            {uniqueSessions.map(session => (
                                <option key={session} value={session} className="bg-slate-900 text-white">
                                    {session}
                                </option>
                            ))}
                        </select>
                    </div>
                ) : (
                    <div></div>
                )}

                {/* Excel Export Button - Only for authorized modules */}
                {(filter === 'appointment' || filter === 'baptism' || filter === 'rdv_pastoral' || filter === 'rdv_social' || filter === 'registrations_baptism') && (
                    <button
                        onClick={handleExportExcel}
                        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30 transition-all font-bold text-sm shadow-lg hover:shadow-emerald-500/10"
                    >
                        <Download className="w-4 h-4" />
                        Exporter Excel
                    </button>
                )}
            </div>

            {filter === 'testimony' || filter === 'feedback' ? (
                <div className="max-w-4xl mx-auto">
                    <Column 
                        title={filter === 'testimony' ? "Tous les Témoignages" : "Tous les Retours"} 
                        status="all" 
                        items={filteredRequests} 
                        glowClass={filter === 'testimony' ? "hover:border-emerald-500/30 hover:shadow-[0_10px_30px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/10" : "hover:border-slate-400/30 hover:shadow-[0_10px_30px_rgba(148,163,184,0.15)] ring-1 ring-slate-400/10"} 
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                    <Column title="Requêtes Reçues" status="pending" items={groupedRequests.pending} glowClass="hover:border-red-500/30 hover:shadow-[0_10px_30px_rgba(239,68,68,0.15)]" />
                    <Column title="En cours de Traitement" status="processing" items={groupedRequests.processing} glowClass="hover:border-amber-500/30 hover:shadow-[0_10px_30px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/10" />
                    <Column title="Terminé & Résolu" status="done" items={groupedRequests.done} glowClass="hover:border-emerald-500/30 hover:shadow-[0_10px_30px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/10 opacity-70 hover:opacity-100" />
                </div>
            )}
        </div>
    );
}
