"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { Loader2, MapPin, Plus, Trash2, Check, X, Phone, User, Eye, EyeOff, Users, UserCheck, Home, Mail, Share2, Link, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Pilot = {
    id: string;
    full_name: string;
    phone: string;
    email?: string;
    user_id: string;
    created_at: string;
    cellName?: string;
    cellAddress?: string;
};

import HomeCellPilotView from "./HomeCellPilotView";

export default function HomeCellLeaderView({ tenantId }: { tenantId: string }) {
    const [view, setView] = useState<"pilots" | "my_cell">("pilots");
    const [pilots, setPilots] = useState<Pilot[]>([]);
    const [loading, setLoading] = useState(true);
    // ... rest of state stays same ...
    const [isAdding, setIsAdding] = useState(false);
    const [activeCells, setActiveCells] = useState(0);
    const [confirmedContacts, setConfirmedContacts] = useState(0);

    // Form State
    const [formEmail, setFormEmail] = useState("");
    const [formPassword, setFormPassword] = useState("");
    const [formName, setFormName] = useState("");
    const [formPhone, setFormPhone] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [status, setStatus] = useState("");
    const [linkCopied, setLinkCopied] = useState(false);

    const fetchPilots = async () => {
        setLoading(true);

        // Fetch all pilots for this tenant
        const { data: pilotData } = await supabase
            .from('module_leaders')
            .select('*')
            .eq('tenant_id', tenantId)
            .eq('module_key', 'home_cells_pilot')
            .order('created_at', { ascending: false });

        if (pilotData) {
            // Fetch emails from public.users
            const userIds = pilotData.map(p => p.user_id);
            const { data: usersData } = await supabase
                .from('users')
                .select('id, email')
                .in('id', userIds);

            const emailMap = new Map(usersData?.map(u => [u.id, u.email]) || []);

            // For each pilot, check if they have a cell
            const pilotsWithCells = await Promise.all(pilotData.map(async (pilot) => {
                const { data: cellData } = await supabase
                    .from('home_cells')
                    .select('name, address')
                    .eq('tenant_id', tenantId)
                    .eq('leader_name', pilot.full_name)
                    .single();

                return {
                    ...pilot,
                    email: emailMap.get(pilot.user_id),
                    cellName: cellData?.name || undefined,
                    cellAddress: cellData?.address || undefined,
                };
            }));
            setPilots(pilotsWithCells);

            // Count active cells (Pilots + Leader's own cell)
            let cellCount = pilotsWithCells.filter(p => p.cellName).length;

            // Check for Leader's own cell
            const { data: { user } } = await supabase.auth.getUser();
            let leaderCellId = null;
            if (user) {
                const { data: leaderInfo } = await supabase
                    .from('module_leaders')
                    .select('full_name')
                    .eq('user_id', user.id)
                    .eq('module_key', 'home_cells')
                    .single();

                if (leaderInfo) {
                    const { data: leaderCell } = await supabase
                        .from('home_cells')
                        .select('id')
                        .eq('tenant_id', tenantId)
                        .eq('leader_name', leaderInfo.full_name)
                        .single();
                    if (leaderCell) {
                        cellCount++;
                        leaderCellId = leaderCell.id;
                    }
                }
            }
            setActiveCells(cellCount);

            // Count confirmed contacts across all cells
            const cellIds: string[] = leaderCellId ? [leaderCellId] : [];
            for (const pilot of pilotsWithCells) {
                if (pilot.cellName) {
                    const { data: cellData } = await supabase
                        .from('home_cells')
                        .select('id')
                        .eq('tenant_id', tenantId)
                        .eq('leader_name', pilot.full_name)
                        .single();
                    if (cellData) cellIds.push(cellData.id);
                }
            }

            if (cellIds.length > 0) {
                const { data: confirmedData } = await supabase
                    .from('requests')
                    .select('id, content')
                    .eq('type', 'home_cells')
                    .in('status', ['confirmed', 'done']);

                // Filter by cell_ids in content
                const confirmed = confirmedData?.filter(r => cellIds.includes(r.content?.cell_id)) || [];
                setConfirmedContacts(confirmed.length);
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchPilots();
    }, [tenantId]);

    const handleAddPilot = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("creating");

        try {
            const res = await fetch('/api/manager/create-leader', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formEmail,
                    password: formPassword,
                    fullName: formName,
                    phone: formPhone,
                    moduleKey: 'home_cells_pilot',
                    tenantId
                })
            });

            const contentType = res.headers.get("content-type");
            let data;
            if (contentType && contentType.includes("application/json")) {
                data = await res.json();
            } else {
                const text = await res.text();
                throw new Error("Erreur serveur: " + text.substring(0, 50));
            }

            if (!res.ok) {
                setStatus("error: " + (data.error || "Erreur inconnue"));
                return;
            }

            setStatus("success");
            setFormEmail("");
            setFormPassword("");
            setFormName("");
            setFormPhone("");
            setIsAdding(false);
            fetchPilots();
            setTimeout(() => setStatus(""), 3000);

        } catch (err: any) {
            setStatus("error: " + err.message);
        }
    };

    const handleDeletePilot = async (pilot: Pilot) => {
        if (!confirm(`Supprimer le pilote "${pilot.full_name}" ? Sa cellule de maison sera aussi supprimée.`)) return;

        // Delete associated cell
        await supabase.from('home_cells').delete()
            .eq('tenant_id', tenantId)
            .eq('leader_name', pilot.full_name);

        // Delete pilot entry
        await supabase.from('module_leaders').delete().eq('id', pilot.id);
        fetchPilots();
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-gold" /></div>;

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl w-fit mb-6">
                <button
                    onClick={() => setView("pilots")}
                    className={`px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${view === 'pilots' ? 'bg-primary text-primary-foreground shadow-glow' : 'text-white/60 hover:text-white'}`}
                >
                    <Users size={18} /> Gestion des Pilotes
                </button>
                <button
                    onClick={() => setView("my_cell")}
                    className={`px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${view === 'my_cell' ? 'bg-primary text-primary-foreground shadow-glow' : 'text-white/60 hover:text-white'}`}
                >
                    <Home size={18} /> Ma Propre Cellule de maison
                </button>
            </div>

            {view === 'my_cell' ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <HomeCellPilotView tenantId={tenantId} />
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-white">Gestion des Pilotes</h2>
                            <p className="text-white/50 text-sm mt-1">Créez des comptes ou partagez un lien d&apos;inscription</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Share signup link */}
                            <button
                                onClick={() => {
                                    const url = `${window.location.origin}/leader/signup?tenant=${tenantId}`;
                                    navigator.clipboard.writeText(url);
                                    setLinkCopied(true);
                                    setTimeout(() => setLinkCopied(false), 3000);
                                }}
                                className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition text-sm ${
                                    linkCopied
                                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                        : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                                }`}
                            >
                                {linkCopied ? <Check size={18} /> : <Link size={18} />}
                                {linkCopied ? 'Lien copié !' : "Copier le lien d'inscription"}
                            </button>
                            {/* WhatsApp share */}
                            <button
                                onClick={() => {
                                    const url = `${window.location.origin}/leader/signup?tenant=${tenantId}`;
                                    const text = `Bonjour ! Voici le lien pour créer votre compte pilote de cellule de maison : ${url}`;
                                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                                }}
                                className="px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition text-sm bg-green-600/20 text-green-400 hover:bg-green-600/30 border border-green-500/20"
                            >
                                <MessageCircle size={18} /> WhatsApp
                            </button>
                            {/* Add pilot manually */}
                            <button
                                onClick={() => { if (isAdding) { setIsAdding(false); setStatus(""); } else setIsAdding(true); }}
                                className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition text-sm ${isAdding
                                    ? "bg-white/10 text-white hover:bg-white/20"
                                    : "bg-primary text-primary-foreground shadow-glow hover:bg-primary/90"}`}
                            >
                                {isAdding ? <X size={20} /> : <Plus size={20} />}
                                {isAdding ? "Annuler" : "Ajouter manuellement"}
                            </button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                            <Users size={20} className="mx-auto text-primary mb-1" />
                            <p className="text-2xl font-bold text-white">{pilots.length}</p>
                            <p className="text-xs text-white/50">Pilotes</p>
                        </div>
                        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
                            <Home size={20} className="mx-auto text-green-400 mb-1" />
                            <p className="text-2xl font-bold text-green-400">{activeCells}</p>
                            <p className="text-xs text-white/50">Cellules actives</p>
                        </div>
                        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-center">
                            <UserCheck size={20} className="mx-auto text-primary mb-1" />
                            <p className="text-2xl font-bold text-primary">{confirmedContacts}</p>
                            <p className="text-xs text-white/50">Membres contactés</p>
                        </div>
                    </div>

                    {/* Status Messages */}
                    <AnimatePresence>
                        {status === "success" && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="p-3 rounded-xl bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-bold flex items-center gap-2"
                            >
                                <Check size={18} /> Compte créé avec succès !
                            </motion.div>
                        )}
                        {status.startsWith("error:") && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm"
                            >
                                {status.replace("error: ", "")}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Add Pilot Form */}
                    <AnimatePresence>
                        {isAdding && (
                            <motion.form
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                onSubmit={handleAddPilot}
                                className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4"
                            >
                                <h3 className="text-lg font-bold text-white">Nouveau Pilote</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-white/60 mb-1">Nom complet</label>
                                        <input
                                            value={formName}
                                            onChange={e => setFormName(e.target.value)}
                                            required
                                            className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2.5 text-white text-base"
                                            placeholder="Prénom Nom"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-white/60 mb-1">Téléphone</label>
                                        <input
                                            value={formPhone}
                                            onChange={e => setFormPhone(e.target.value)}
                                            className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2.5 text-white text-base"
                                            placeholder="06..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-white/60 mb-1">Email de connexion</label>
                                        <input
                                            type="email"
                                            value={formEmail}
                                            onChange={e => setFormEmail(e.target.value)}
                                            required
                                            className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2.5 text-white text-base"
                                            placeholder="responsable@email.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-white/60 mb-1">Mot de passe</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={formPassword}
                                                onChange={e => setFormPassword(e.target.value)}
                                                required
                                                minLength={6}
                                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2.5 text-white text-base pr-10"
                                                placeholder="Min. 6 caractères"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end pt-2">
                                    <button
                                        type="submit"
                                        disabled={status === "creating"}
                                        className="px-6 py-2.5 bg-green-500/20 text-green-400 border border-green-500/50 rounded-xl hover:bg-green-500/30 transition flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {status === "creating" ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                                        Valider
                                    </button>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    {/* Pilots List */}
                    {pilots.length === 0 ? (
                        <div className="p-12 rounded-2xl bg-white/5 border border-white/10 text-center text-white/40">
                            <User size={40} className="mx-auto mb-4 text-white/20" />
                            <p className="text-lg">Aucun pilote pour le moment</p>
                            <p className="text-sm mt-1">Ajoutez un pilote pour qu&apos;il puisse créer sa cellule de maison.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {pilots.map(pilot => (
                                <motion.div
                                    key={pilot.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary/30 transition group relative"
                                >
                                    {/* Delete button */}
                                    <button
                                        onClick={() => handleDeletePilot(pilot)}
                                        className="absolute top-3 right-3 p-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 opacity-0 group-hover:opacity-100 transition"
                                        title="Supprimer"
                                    >
                                        <Trash2 size={14} />
                                    </button>

                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold shrink-0">
                                            {pilot.full_name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-base leading-tight">{pilot.full_name}</h4>
                                            {pilot.phone && (
                                                <a href={`tel:${pilot.phone}`} className="text-sm text-white/50 hover:text-primary flex items-center gap-1.5 mt-1 transition">
                                                    <Phone size={12} className="text-primary/70" /> {pilot.phone}
                                                </a>
                                            )}
                                            {pilot.email && (
                                                <span className="text-xs text-primary/70 flex items-center gap-1.5 mt-1 font-medium italic">
                                                    <Mail size={12} /> {pilot.email}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {pilot.cellName ? (
                                        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                                            <div className="flex items-center gap-1.5 text-green-400 text-sm font-bold mb-1">
                                                <MapPin size={14} /> {pilot.cellName}
                                            </div>
                                            {pilot.cellAddress && (
                                                <p className="text-xs text-white/50 ml-5 leading-relaxed italic border-l-2 border-green-500/20 pl-2">
                                                    {pilot.cellAddress}
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                                            <p className="text-xs text-yellow-400 font-medium flex items-center gap-2">
                                                <Loader2 size={12} className="animate-spin" /> Cellule pas encore créée
                                            </p>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
