"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Tenant } from "@/types";
import { Loader2, User, Phone, MapPin, Clock, Search, ArrowRight, CheckCircle2, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type HomeCell = {
    id: string;
    name: string;
    address: string;
    leader_name: string;
    phone: string;
    meeting_time: string;
    distance?: number;
};

export default function HomeCellsList({ tenant, onSuccess }: { tenant: Tenant; onSuccess: () => void }) {
    const [cells, setCells] = useState<HomeCell[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCell, setSelectedCell] = useState<HomeCell | null>(null);

    // Search State
    const [userAddress, setUserAddress] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState("");
    const [filteredCells, setFilteredCells] = useState<HomeCell[]>([]);

    // Join Request Form
    const [joinFirstName, setJoinFirstName] = useState("");
    const [joinLastName, setJoinLastName] = useState("");
    const [joinPhone, setJoinPhone] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [alreadyRequested, setAlreadyRequested] = useState(false);

    useEffect(() => {
        const fetchCells = async () => {
            // Fetch active pilots to avoid showing orphaned cells
            const { data: activePilots } = await supabase
                .from('module_leaders')
                .select('full_name')
                .eq('tenant_id', tenant.id)
                .in('module_key', ['home_cells', 'home_cells_pilot']);

            const validLeaders = activePilots?.map(l => l.full_name) || [];

            const { data } = await supabase
                .from('home_cells')
                .select('*')
                .eq('tenant_id', tenant.id);

            if (data) {
                const validCells = data.filter(cell => validLeaders.includes(cell.leader_name));
                setCells(validCells);
                setFilteredCells(validCells);
            }
            setLoading(false);
        };

        fetchCells();
    }, [tenant.id]);

    // Pre-fill user info if available
    useEffect(() => {
        const stored = localStorage.getItem(`impact_member_${tenant.slug}`);
        if (stored) {
            const user = JSON.parse(stored);
            if (user.firstName) setJoinFirstName(user.firstName);
            if (user.lastName) setJoinLastName(user.lastName);
            if (user.phone) setJoinPhone(user.phone);
        }
    }, [tenant.slug]);

    // Check if user already requested this cell
    useEffect(() => {
        const checkExistingRequest = async () => {
            if (!selectedCell) { setAlreadyRequested(false); return; }
            const stored = localStorage.getItem(`impact_member_${tenant.slug}`);
            if (!stored) return;
            const user = JSON.parse(stored);

            const { data } = await supabase
                .from('requests')
                .select('id')
                .eq('type', 'home_cells')
                .contains('content', { cell_id: selectedCell.id, sub_type: 'join_request', requester_key: `${user.firstName}_${user.lastName}` })
                .single();

            setAlreadyRequested(!!data);
        };
        checkExistingRequest();
    }, [selectedCell, tenant.slug]);

    const geocodeAddress = async (address: string) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
            const data = await response.json();
            if (data && data.length > 0) {
                return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
            }
            return null;
        } catch (error) {
            console.error("Geocoding error:", error);
            return null;
        }
    };

    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userAddress.trim()) return;

        setIsSearching(true);
        setSearchError("");

        const userCoords = await geocodeAddress(userAddress);
        if (!userCoords) {
            setSearchError("Adresse non trouvée. Essayez d'être plus précis.");
            setIsSearching(false);
            return;
        }

        const cellsWithDistance = await Promise.all(cells.map(async (cell) => {
            const cellCoords = await geocodeAddress(cell.address);
            if (cellCoords) {
                const dist = calculateDistance(userCoords.lat, userCoords.lon, cellCoords.lat, cellCoords.lon);
                return { ...cell, distance: dist };
            }
            return { ...cell, distance: 9999 };
        }));

        const sorted = cellsWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        setFilteredCells(sorted);
        setIsSearching(false);
    };

    const handleJoinRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCell) return;
        setSubmitting(true);

        const stored = localStorage.getItem(`impact_member_${tenant.slug}`);
        const user = stored ? JSON.parse(stored) : {};

        const { error } = await supabase.from('requests').insert({
            tenant_id: tenant.id,
            type: 'home_cells',
            status: 'pending',
            content: {
                sub_type: 'join_request',
                cell_id: selectedCell.id,
                cell_name: selectedCell.name,
                first_name: joinFirstName,
                last_name: joinLastName,
                phone: joinPhone,
                requester_key: `${joinFirstName}_${joinLastName}`,
                timestamp: new Date().toISOString()
            }
        });

        setSubmitting(false);

        if (error) {
            alert("Erreur lors de l'envoi. Veuillez réessayer.");
        } else {
            setSubmitted(true);
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-gold" /></div>;

    if (cells.length === 0) return <div className="text-white/50 text-center p-8">Aucune cellule de maison disponible pour le moment.</div>;

    return (
        <div className="space-y-4">
            <AnimatePresence mode="wait">
                {selectedCell ? (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        key="detail"
                    >
                        {submitted ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center p-8 text-center"
                            >
                                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                                    <CheckCircle2 className="text-green-400" size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Demande envoyée !</h3>
                                <p className="text-white/60">Le responsable de la cellule vous contactera bientôt.</p>
                                <button
                                    onClick={() => { setSelectedCell(null); setSubmitted(false); }}
                                    className="mt-6 px-6 py-2 text-white/50 hover:text-white transition"
                                >
                                    Retour à la liste
                                </button>
                            </motion.div>
                        ) : (
                            <div className="space-y-4">
                                {/* Cell Info */}
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                    <h3 className="text-xl font-bold text-white mb-3">{selectedCell.name}</h3>
                                    <div className="space-y-2.5 mb-4">
                                        <div className="flex items-start gap-2 text-white/80">
                                            <MapPin className="text-gold shrink-0 mt-0.5" size={18} />
                                            <span>{selectedCell.address}</span>
                                        </div>
                                        {selectedCell.meeting_time && (
                                            <div className="flex items-center gap-2 text-white/80">
                                                <Clock className="text-gold shrink-0" size={18} />
                                                <span>{selectedCell.meeting_time}</span>
                                            </div>
                                        )}
                                        {selectedCell.distance && selectedCell.distance < 1000 && (
                                            <div className="flex items-center gap-2 text-green-400 font-bold">
                                                <ArrowRight size={18} />
                                                <span>À {selectedCell.distance.toFixed(1)} km de chez vous</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Pilot Info */}
                                    <div className="p-3 rounded-lg bg-white/5">
                                        <h4 className="text-xs text-white/50 uppercase font-bold mb-2">Infos du responsable</h4>
                                        <div className="flex items-center gap-2 text-white mb-1.5">
                                            <User size={16} className="text-primary" />
                                            <span className="font-medium">{selectedCell.leader_name}</span>
                                        </div>
                                        {selectedCell.phone && (
                                            <div className="flex items-center gap-2 text-white/80">
                                                <Phone size={16} className="text-green-400" />
                                                <span>{selectedCell.phone}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Join Request Form */}
                                {alreadyRequested ? (
                                    <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-center">
                                        <CheckCircle2 className="mx-auto text-primary mb-2" size={24} />
                                        <p className="text-white font-bold">Demande déjà envoyée</p>
                                        <p className="text-white/50 text-sm mt-1">Vous avez déjà fait une demande pour cette cellule. Le responsable vous contactera bientôt.</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleJoinRequest} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                                        <h4 className="font-bold text-white text-sm">Demander à rejoindre cette cellule</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs text-white/50 mb-1">Prénom</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={joinFirstName}
                                                    onChange={e => setJoinFirstName(e.target.value)}
                                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2.5 text-white text-base"
                                                    placeholder="Votre prénom"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-white/50 mb-1">Nom</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={joinLastName}
                                                    onChange={e => setJoinLastName(e.target.value)}
                                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2.5 text-white text-base"
                                                    placeholder="Votre nom"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-white/50 mb-1">Téléphone</label>
                                            <input
                                                type="tel"
                                                required
                                                value={joinPhone}
                                                onChange={e => setJoinPhone(e.target.value)}
                                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2.5 text-white text-base"
                                                placeholder="06..."
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2 hover:bg-primary/90 shadow-glow transition active:scale-95 disabled:opacity-50"
                                        >
                                            {submitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                                            Envoyer ma demande
                                        </button>
                                    </form>
                                )}

                                <button
                                    onClick={() => { setSelectedCell(null); setSubmitted(false); setAlreadyRequested(false); }}
                                    className="w-full py-3 text-white/50 hover:text-white transition text-sm"
                                >
                                    ← Retour à la liste
                                </button>
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        key="list"
                        className="space-y-3"
                    >
                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                            <input
                                type="text"
                                placeholder="Votre adresse (ex: 10 rue de la Paix, Charleroi)"
                                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-white/30 text-sm focus:border-gold outline-none"
                                value={userAddress}
                                onChange={(e) => setUserAddress(e.target.value)}
                            />
                            <button
                                type="submit"
                                disabled={isSearching}
                                className="bg-gold text-black rounded-lg px-3 py-2.5 flex items-center justify-center disabled:opacity-50"
                            >
                                {isSearching ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
                            </button>
                        </form>

                        {searchError && <p className="text-red-400 text-xs px-1">{searchError}</p>}

                        <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
                            {filteredCells.map((cell) => (
                                <div
                                    key={cell.id}
                                    onClick={() => setSelectedCell(cell)}
                                    className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-gold/30 transition cursor-pointer flex justify-between items-center group active:scale-[0.98]"
                                >
                                    <div>
                                        <h4 className="text-white font-bold">{cell.name}</h4>
                                        <p className="text-xs text-white/50 mt-1 flex items-center gap-1">
                                            <MapPin size={12} /> {cell.address.split(',')[0]}
                                        </p>
                                        {cell.distance !== undefined && cell.distance < 1000 && (
                                            <p className="text-xs text-green-400 mt-1 font-bold">
                                                {cell.distance.toFixed(1)} km
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-gold opacity-0 group-hover:opacity-100 transition">
                                        →
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
