"use client";

import { useEffect, useState } from "react";
import { Droplets, Loader2, Power, Download } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import RequestList from "@/components/manager/RequestList";
import { GlassCard } from "@/components/ui/glass-card";

export default function BaptismLeaderView({ tenantId }: { tenantId: string }) {
    const [leader, setLeader] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [filteredRequests, setFilteredRequests] = useState<any[]>([]);

    useEffect(() => {
        async function fetchLeader() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from('module_leaders')
                .select('*')
                .eq('user_id', user.id)
                .eq('module_key', 'registrations_baptism')
                .single();

            if (data) {
                setLeader(data);
            }
            setLoading(false);
        }
        fetchLeader();
    }, []);

    const [sessionDate, setSessionDate] = useState("");
    const [showDateInput, setShowDateInput] = useState(false);

    const toggleSession = async () => {
        if (!leader) return;

        if (!leader.is_active && !showDateInput) {
            setShowDateInput(true);
            return;
        }

        if (!leader.is_active && showDateInput && !sessionDate.trim()) {
            alert("Veuillez saisir une date ou une période pour la session.");
            return;
        }

        setUpdating(true);
        try {
            const newStatus = !leader.is_active;
            const updatePayload: any = { is_active: newStatus };
            
            if (newStatus) {
                updatePayload.whatsapp_link = sessionDate;
            } else {
                updatePayload.whatsapp_link = null;
                setSessionDate("");
                setShowDateInput(false);
            }

            const { error } = await supabase
                .from('module_leaders')
                .update(updatePayload)
                .eq('id', leader.id);

            if (error) throw error;
            setLeader({ ...leader, is_active: newStatus, whatsapp_link: updatePayload.whatsapp_link });
            setShowDateInput(false);
        } catch (err: any) {
            console.error("Error toggling Baptism session:", err);
            alert("Erreur lors de la modification du statut.");
        } finally {
            setUpdating(false);
        }
    };

    const handleExportCsv = async () => {
        if (!leader || !tenantId) return;
        if (filteredRequests.length === 0) {
            alert("Aucune donnée à exporter avec les filtres actuels.");
            return;
        }

        setUpdating(true);
        try {
            // Define CSV Headers
            const headers = [
                "Date Inscription",
                "Session",
                "Statut",
                "Genre",
                "Nom",
                "Prénom",
                "Année Naissance",
                "Email",
                "Téléphone",
                "Prière Salut",
                "Demande Confirmée",
                "Formations suivies"
            ];

            // Map data to rows
            const rows = filteredRequests.map(req => {
                const c = req.content || {};
                return [
                    new Date(req.created_at).toLocaleDateString('fr-FR'),
                    c.sessionDate || "N/A",
                    req.status || "pending",
                    c.gender || "",
                    c.lastName || "",
                    c.firstName || "",
                    c.birthYear || "",
                    c.email || "",
                    c.phone || "",
                    c.salvationPrayer || "",
                    c.confirmed || "",
                    Array.isArray(c.formations) ? c.formations.join(", ") : (c.formations || "")
                ].map(val => String(val).replace(/\t/g, " ")).join("\t");
            });

            const csvString = [headers.join("\t"), ...rows].join("\r\n");
            
            // Create a UTF-16LE Blob with BOM (0xFF, 0xFE)
            // This is the most reliable format for Excel on Windows for accents + columns
            const buffer = new ArrayBuffer(csvString.length * 2);
            const view = new Uint16Array(buffer);
            for (let i = 0; i < csvString.length; i++) {
                view[i] = csvString.charCodeAt(i);
            }
            const bom = new Uint8Array([0xFF, 0xFE]);
            const blob = new Blob([bom, buffer], { type: 'text/csv;charset=utf-16le;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            const fileName = `Export_Baptemes_${leader.whatsapp_link || 'Global'}_${new Date().toISOString().split('T')[0]}.csv`;
            
            link.setAttribute("href", url);
            link.setAttribute("download", fileName);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err: any) {
            console.error("Export error:", err);
            alert("Erreur lors de l'export.");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" size={32} /></div>;

    if (!leader) return <div className="text-white/40 text-center py-20 border border-dashed border-white/10 rounded-3xl">Responsable non trouvé.</div>;

    return (
        <div className="space-y-8">
            <GlassCard className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6" glowColor="gold">
                <div className="flex items-center gap-4">
                    <div className="p-4 rounded-full bg-[var(--gold)]/10">
                        <Droplets className="text-[var(--gold)]" size={32} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white leading-tight">Inscriptions au Baptême</h2>
                        <p className="text-white/60 text-sm">Gérez les demandes de baptême des membres.</p>
                        {leader.is_active && leader.whatsapp_link && (
                            <p className="text-[var(--gold)]/80 text-sm mt-1 font-medium">Session en cours : {leader.whatsapp_link}</p>
                        )}
                    </div>
                </div>

                <div className="flex flex-col items-end gap-3 text-right">
                    {showDateInput && !leader.is_active && (
                        <div className="flex flex-col gap-2 w-full md:w-auto animate-in fade-in slide-in-from-top-2">
                            <label className="text-xs text-white/60 text-left">Date ou période (ex: Août 2024)</label>
                            <input 
                                type="text" 
                                value={sessionDate}
                                onChange={(e) => setSessionDate(e.target.value)}
                                placeholder="ex: 15 Août 2024"
                                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-primary w-full"
                                autoFocus
                            />
                            <div className="flex gap-2 justify-end mt-1">
                                <button onClick={() => setShowDateInput(false)} className="px-3 py-1.5 text-xs text-white/50 hover:text-white transition-colors">Annuler</button>
                                <button onClick={toggleSession} disabled={!sessionDate.trim() || updating} className="px-3 py-1.5 text-xs bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors disabled:opacity-50">Confirmer</button>
                            </div>
                        </div>
                    )}

                    {!showDateInput && (
                        <>
                            <button
                                onClick={toggleSession}
                                disabled={updating}
                                className={`relative overflow-hidden group px-6 py-3 rounded-2xl flex items-center justify-center gap-3 transition-all duration-500 w-full md:w-auto ${leader.is_active
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                                    : 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                                    }`}
                            >
                                {updating ? <Loader2 className="animate-spin" size={20} /> : <Power size={20} className={leader.is_active ? "animate-[pulse_2s_ease-in-out_infinite]" : ""} />}
                                <span className="font-bold tracking-wide">
                                    {leader.is_active ? "Session Ouverte (Désactiver)" : "Session Fermée (Ouvrir)"}
                                </span>
                            </button>

                            <button
                                onClick={handleExportCsv}
                                disabled={updating}
                                className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2 font-bold w-full md:w-auto"
                            >
                                <Download size={20} />
                                Exporter Excel (CSV)
                            </button>

                            <p className={`text-xs ${leader.is_active ? 'text-emerald-400/60' : 'text-red-400/60'}`}>
                                {leader.is_active ? "Les membres peuvent s'inscrire." : "Les inscriptions sont fermées au public."}
                            </p>
                        </>
                    )}
                </div>
            </GlassCard>

            {/* List of registrations below the header */}
            <div className="mt-8">
                <RequestList moduleFilter="baptism" tenantId={tenantId} onDataChange={setFilteredRequests} />
            </div>
        </div>
    );
}
