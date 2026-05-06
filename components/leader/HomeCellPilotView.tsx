"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { Loader2, MapPin, Plus, Edit2, Check, X, Phone, User, Clock, MessageCircle, Trash2, Users, UserCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type HomeCell = {
    id: string;
    name: string;
    address: string;
    leader_name: string;
    phone: string;
    whatsapp_link?: string;
    meeting_time: string;
    latitude: number;
    longitude: number;
    is_active: boolean;
};

type JoinRequest = {
    id: string;
    content: {
        sub_type: string;
        first_name: string;
        last_name: string;
        phone: string;
        cell_id: string;
        cell_name: string;
        timestamp: string;
    };
    status: string;
    created_at: string;
};

export default function HomeCellPilotView({ tenantId }: { tenantId: string }) {
    const [cell, setCell] = useState<HomeCell | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [pilotName, setPilotName] = useState("");
    const [pilotPhone, setPilotPhone] = useState("");

    const [requests, setRequests] = useState<JoinRequest[]>([]);
    const [loadingRequests, setLoadingRequests] = useState(false);

    // Form state
    const [formName, setFormName] = useState("");
    const [formAddress, setFormAddress] = useState("");
    const [formPhone, setFormPhone] = useState("");
    const [formMeetingTime, setFormMeetingTime] = useState("");
    const [lat, setLat] = useState("");
    const [lng, setLng] = useState("");
    const [saving, setSaving] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoading(false); return; }

        // Get pilot info (check both pilot and leader roles)
        const { data: leaderData } = await supabase
            .from('module_leaders')
            .select('full_name, phone')
            .eq('user_id', user.id)
            .eq('tenant_id', tenantId)
            .in('module_key', ['home_cells_pilot', 'home_cells'])
            .single();

        if (leaderData) {
            setPilotName(leaderData.full_name);
            setPilotPhone(leaderData.phone || "");

            // Fetch THIS pilot's cell
            const { data: cellData } = await supabase
                .from('home_cells')
                .select('*')
                .eq('tenant_id', tenantId)
                .eq('leader_name', leaderData.full_name)
                .single();

            if (cellData) {
                setCell(cellData);
                // Fetch join requests for this cell
                fetchRequests(cellData.id);
            }
        }
        setLoading(false);
    };

    const fetchRequests = async (cellId: string) => {
        setLoadingRequests(true);
        const { data } = await supabase
            .from('requests')
            .select('*')
            .eq('type', 'home_cells')
            .contains('content', { cell_id: cellId, sub_type: 'join_request' })
            .order('created_at', { ascending: false });

        if (data) setRequests(data);
        setLoadingRequests(false);
    };

    const geocodeAddress = async (address: string) => {
        if (!address) return;
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
            const data = await response.json();
            if (data && data.length > 0) {
                setLat(data[0].lat);
                setLng(data[0].lon);
            }
        } catch (error) {
            console.error("Geocoding failed", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [tenantId]);

    const startEditing = () => {
        if (cell) {
            setFormName(cell.name);
            setFormAddress(cell.address);
            setFormPhone(cell.phone || "");
            setFormMeetingTime(cell.meeting_time || "");
            setLat(cell.latitude?.toString() || "");
            setLng(cell.longitude?.toString() || "");
        } else {
            setFormName("");
            setFormAddress("");
            setFormPhone(pilotPhone);
            setFormMeetingTime("");
            setLat("");
            setLng("");
        }
        setIsEditing(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const cellData = {
            tenant_id: tenantId,
            name: formName,
            address: formAddress,
            leader_name: pilotName,
            phone: formPhone,
            whatsapp_link: "",
            meeting_time: formMeetingTime,
            latitude: parseFloat(lat) || 0,
            longitude: parseFloat(lng) || 0,
            is_active: true
        };

        let error;
        if (cell) {
            const { error: updateError } = await supabase
                .from('home_cells')
                .update(cellData)
                .eq('id', cell.id);
            error = updateError;
        } else {
            const { error: insertError } = await supabase
                .from('home_cells')
                .insert([cellData]);
            error = insertError;
        }

        setSaving(false);
        if (!error) {
            setIsEditing(false);
            fetchData();
        } else {
            alert("Erreur : " + error.message);
        }
    };

    const updateRequestStatus = async (requestId: string, newStatus: string) => {
        await supabase.from('requests').update({ status: newStatus }).eq('id', requestId);
        setRequests(requests.map(r => r.id === requestId ? { ...r, status: newStatus } : r));
    };

    const deleteRequest = async (requestId: string) => {
        if (!confirm("Supprimer cette demande ?")) return;
        await supabase.from('requests').delete().eq('id', requestId);
        setRequests(requests.filter(r => r.id !== requestId));
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-gold" /></div>;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Ma Cellule de Maison</h2>
                    <p className="text-white/50 text-sm mt-1">Pilote : {pilotName}</p>
                </div>
                {!cell && !isEditing && (
                    <button
                        onClick={startEditing}
                        className="px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 bg-primary text-primary-foreground shadow-glow hover:bg-primary/90 transition"
                    >
                        <Plus size={20} /> Créer ma cellule
                    </button>
                )}
            </div>

            {/* Edit/Create Form */}
            <AnimatePresence>
                {isEditing && (
                    <motion.form
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        onSubmit={handleSubmit}
                        className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4"
                    >
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-bold text-white">
                                {cell ? "Modifier ma cellule" : "Créer ma cellule"}
                            </h3>
                            <button type="button" onClick={() => setIsEditing(false)} className="text-white/50 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-white/60 mb-1">Nom de la cellule</label>
                                <input
                                    value={formName}
                                    onChange={e => setFormName(e.target.value)}
                                    required
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2.5 text-white text-base"
                                    placeholder="Ex: Cellule Centre-Ville"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-white/60 mb-1">Téléphone de contact</label>
                                <input
                                    value={formPhone}
                                    onChange={e => setFormPhone(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2.5 text-white text-base"
                                    placeholder="06..."
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-white/60 mb-1">Adresse</label>
                                <div className="flex gap-2">
                                    <input
                                        value={formAddress}
                                        onChange={e => setFormAddress(e.target.value)}
                                        onBlur={() => geocodeAddress(formAddress)}
                                        required
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2.5 text-white text-base"
                                        placeholder="Adresse complète"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => geocodeAddress(formAddress)}
                                        className="px-3 bg-white/10 rounded-lg hover:bg-white/20 text-gold shrink-0"
                                        title="Trouver les coordonnées GPS"
                                    >
                                        <MapPin size={20} />
                                    </button>
                                </div>
                                {lat && lng ? (
                                    <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                                        <Check size={12} /> Coordonnées GPS trouvées
                                    </p>
                                ) : (
                                    <p className="text-xs text-white/40 mt-1">Saisissez l&apos;adresse pour la localisation.</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-white/60 mb-1">Jour & Heure</label>
                                <input
                                    value={formMeetingTime}
                                    onChange={e => setFormMeetingTime(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2.5 text-white text-base"
                                    placeholder="Ex: Mardi 19h30"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-6 py-2.5 bg-green-500/20 text-green-400 border border-green-500/50 rounded-xl hover:bg-green-500/30 transition flex items-center gap-2 disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                                {cell ? "Mettre à jour" : "Créer"}
                            </button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            {/* Cell Card */}
            {cell && !isEditing && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-5 rounded-2xl bg-white/5 border border-white/10"
                >
                    <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3">
                            <div className="p-2.5 bg-primary/20 text-primary rounded-xl">
                                <MapPin size={22} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">{cell.name}</h3>
                                <p className="text-sm text-white/60 mt-0.5">{cell.address}</p>
                                <div className="flex flex-wrap gap-3 mt-2 text-sm text-white/50">
                                    {cell.meeting_time && (
                                        <span className="flex items-center gap-1"><Clock size={14} /> {cell.meeting_time}</span>
                                    )}
                                    {cell.phone && (
                                        <span className="flex items-center gap-1"><Phone size={14} /> {cell.phone}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={startEditing}
                            className="p-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition"
                        >
                            <Edit2 size={16} />
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Stats */}
            {cell && (
                <div className="grid grid-cols-3 gap-3">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                        <Users size={20} className="mx-auto text-primary mb-1" />
                        <p className="text-2xl font-bold text-white">{requests.length}</p>
                        <p className="text-xs text-white/50">Demandes totales</p>
                    </div>
                    <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-center">
                        <MessageCircle size={20} className="mx-auto text-yellow-400 mb-1" />
                        <p className="text-2xl font-bold text-yellow-400">{requests.filter(r => r.status === 'pending' || !r.status).length}</p>
                        <p className="text-xs text-white/50">En attente</p>
                    </div>
                    <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
                        <UserCheck size={20} className="mx-auto text-green-400 mb-1" />
                        <p className="text-2xl font-bold text-green-400">{requests.filter(r => r.status === 'confirmed' || r.status === 'done').length}</p>
                        <p className="text-xs text-white/50">Contactés</p>
                    </div>
                </div>
            )}

            {/* Join Requests */}
            {cell && (
                <div>
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <MessageCircle size={20} className="text-primary" />
                        Demandes d&apos;adhésion
                        {requests.filter(r => r.status === 'pending' || !r.status).length > 0 && (
                            <span className="ml-2 px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full font-bold">
                                {requests.filter(r => r.status === 'pending' || !r.status).length} nouvelle{requests.filter(r => r.status === 'pending' || !r.status).length > 1 ? 's' : ''}
                            </span>
                        )}
                    </h3>

                    {loadingRequests ? (
                        <div className="flex justify-center p-4"><Loader2 className="animate-spin text-gold" /></div>
                    ) : requests.length === 0 ? (
                        <div className="p-8 rounded-xl bg-white/5 border border-white/10 text-center text-white/40">
                            Aucune demande pour le moment. Les membres pourront demander à rejoindre votre cellule depuis l&apos;espace membre.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {requests.map((req) => (
                                <motion.div
                                    key={req.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`p-4 rounded-xl border transition ${req.status === 'pending'
                                        ? 'bg-primary/5 border-primary/20'
                                        : 'bg-white/5 border-white/10'
                                        }`}
                                >
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                                        <div>
                                            <p className="font-bold text-white text-base">
                                                <User size={14} className="inline mr-1.5 text-primary" />
                                                {req.content?.first_name} {req.content?.last_name}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-3 text-xs text-white/60 mt-1.5">
                                                <span className="flex items-center gap-1">
                                                    <Phone size={12} /> {req.content?.phone || "Non renseigné"}
                                                </span>
                                                <span className="text-white/30">•</span>
                                                <span>
                                                    {new Date(req.created_at).toLocaleDateString('fr-FR', {
                                                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 w-full md:w-auto">
                                            <select
                                                value={req.status || "pending"}
                                                onChange={(e) => updateRequestStatus(req.id, e.target.value)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all appearance-none outline-none cursor-pointer ${req.status === 'done' || req.status === 'confirmed'
                                                        ? 'bg-green-500/20 text-green-400 border-green-500/50'
                                                        : req.status === 'processing'
                                                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                                                            : 'bg-white/5 text-white/50 border-white/10'
                                                    }`}
                                            >
                                                <option value="pending" className="bg-slate-900 text-white">EN ATTENTE</option>
                                                <option value="done" className="bg-slate-900 text-white">CONTACTÉ</option>
                                            </select>
                                            <button
                                                onClick={() => deleteRequest(req.id)}
                                                className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition"
                                                title="Supprimer"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* No cell yet message */}
            {!cell && !isEditing && (
                <div className="p-12 rounded-2xl bg-white/5 border border-white/10 text-center">
                    <MapPin size={40} className="mx-auto text-white/20 mb-4" />
                    <p className="text-white/50 text-lg">Vous n&apos;avez pas encore créé votre cellule de maison.</p>
                    <p className="text-white/30 text-sm mt-2">Cliquez sur &quot;Créer ma cellule&quot; pour commencer.</p>
                </div>
            )}
        </div>
    );
}
