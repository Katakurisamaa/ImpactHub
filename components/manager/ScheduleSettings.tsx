"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { 
  Church, 
  Calendar, 
  Megaphone, 
  Plus, 
  Trash2, 
  Save, 
  Loader2, 
  RotateCcw, 
  Clock, 
  MapPin, 
  Check, 
  Sparkles,
  Tag
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";

export interface ChurchEventItem {
  id: string;
  title: string;
  day: string;
  time: string;
  location: string;
  category: "culte" | "programme";
  description: string;
}

export interface ChurchAnnouncementItem {
  id: string;
  title: string;
  date: string;
  badge: string;
  badgeColor?: "gold" | "emerald" | "rose" | "blue";
  content: string;
}

const DEFAULT_CULTES: ChurchEventItem[] = [
  {
    id: "culte-1",
    title: "Culte de Célébration (1er Service)",
    day: "Tous les dimanches",
    time: "09:00 - 11:00",
    location: "Sanctuaire Principal",
    category: "culte",
    description: "Louange vivante, adoration et message d'édification spirituelle pour toute la famille.",
  },
  {
    id: "culte-2",
    title: "Culte de Célébration (2ème Service)",
    day: "Tous les dimanches",
    time: "11:30 - 13:30",
    location: "Sanctuaire Principal & Impact Kids",
    category: "culte",
    description: "Louange, prédication de la parole et service dédié aux enfants au département Impact Kids.",
  },
];

const DEFAULT_PROGRAMMES: ChurchEventItem[] = [
  {
    id: "prog-1",
    title: "Midi & Soir de Prière",
    day: "Tous les mercredis",
    time: "19:00 - 20:30",
    location: "En présentiel & En ligne",
    category: "programme",
    description: "Temps d'intercession, prière fervente et recherche de la face de Dieu.",
  },
  {
    id: "prog-2",
    title: "Cellules de Maison (Impact Groupes)",
    day: "Tous les jeudis",
    time: "19:30 - 21:00",
    location: "Dans les foyers de votre secteur",
    category: "programme",
    description: "Partage fraternel de la parole en petits groupes et communion intime.",
  },
  {
    id: "prog-3",
    title: "Grande Nuit d'Impact (Veillée)",
    day: "Dernier vendredi du mois",
    time: "22:00 - 05:00",
    location: "Sanctuaire Principal",
    category: "programme",
    description: "Nuit entière de percée, de proclamations prophétiques et d'adoration.",
  },
];

const DEFAULT_ANNOUNCEMENTS: ChurchAnnouncementItem[] = [
  {
    id: "ann-1",
    title: "Inscriptions aux Baptêmes d'eau",
    date: "Session en cours",
    badge: "Inscription",
    badgeColor: "emerald",
    content: "Les cours de préparation aux baptêmes sont ouverts. Rapprochez-vous du pôle pastoral pour valider votre inscription.",
  },
  {
    id: "ann-2",
    title: "Navettes de transport du Dimanche",
    date: "Chaque dimanche",
    badge: "Transport",
    badgeColor: "blue",
    content: "Des navettes gratuites desservent les principales gares pour les deux cultes de 09h00 et 11h30.",
  },
];

export default function ScheduleSettings({ tenantId }: { tenantId: string }) {
  const [activeSubTab, setActiveSubTab] = useState<"cultes" | "programmes" | "annonces">("cultes");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [cultes, setCultes] = useState<ChurchEventItem[]>(DEFAULT_CULTES);
  const [programmes, setProgrammes] = useState<ChurchEventItem[]>(DEFAULT_PROGRAMMES);
  const [announcements, setAnnouncements] = useState<ChurchAnnouncementItem[]>(DEFAULT_ANNOUNCEMENTS);

  // New Event Form
  const [newEvent, setNewEvent] = useState({
    title: "",
    day: "",
    time: "",
    location: "",
    description: "",
  });

  // New Announcement Form
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    date: "",
    badge: "Annonce",
    badgeColor: "gold" as "gold" | "emerald" | "rose" | "blue",
    content: "",
  });

  useEffect(() => {
    if (!tenantId) return;

    async function fetchConfig() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("module_configs")
          .select("config")
          .eq("tenant_id", tenantId)
          .eq("module_key", "schedule")
          .maybeSingle();

        if (data?.config) {
          if (Array.isArray(data.config.cultes)) setCultes(data.config.cultes);
          if (Array.isArray(data.config.programmes)) setProgrammes(data.config.programmes);
          if (Array.isArray(data.config.announcements)) setAnnouncements(data.config.announcements);
        }
      } catch (err) {
        console.error("Error fetching schedule config:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchConfig();
  }, [tenantId]);

  const handleSaveToDb = async (
    updatedCultes = cultes,
    updatedProgrammes = programmes,
    updatedAnnouncements = announcements
  ) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("module_configs")
        .upsert(
          {
            tenant_id: tenantId,
            module_key: "schedule",
            config: {
              cultes: updatedCultes,
              programmes: updatedProgrammes,
              announcements: updatedAnnouncements,
            },
            updated_at: new Date().toISOString(),
          },
          { onConflict: "tenant_id, module_key" }
        );

      if (error) {
        console.error("Error saving schedule config:", error);
        alert("Erreur lors de la sauvegarde : " + error.message);
      } else {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddEvent = (category: "culte" | "programme") => {
    if (!newEvent.title.trim() || !newEvent.day.trim() || !newEvent.time.trim()) {
      alert("Veuillez renseigner au moins le titre, le jour et l'horaire.");
      return;
    }

    const item: ChurchEventItem = {
      id: `${category}-${Date.now()}`,
      title: newEvent.title.trim(),
      day: newEvent.day.trim(),
      time: newEvent.time.trim(),
      location: newEvent.location.trim() || "Sanctuaire Principal",
      description: newEvent.description.trim() || "Rendez-vous de l'église locale.",
      category,
    };

    if (category === "culte") {
      const next = [...cultes, item];
      setCultes(next);
      handleSaveToDb(next, programmes, announcements);
    } else {
      const next = [...programmes, item];
      setProgrammes(next);
      handleSaveToDb(cultes, next, announcements);
    }

    setNewEvent({
      title: "",
      day: "",
      time: "",
      location: "",
      description: "",
    });
  };

  const handleDeleteEvent = (id: string, category: "culte" | "programme") => {
    if (category === "culte") {
      const next = cultes.filter((c) => c.id !== id);
      setCultes(next);
      handleSaveToDb(next, programmes, announcements);
    } else {
      const next = programmes.filter((p) => p.id !== id);
      setProgrammes(next);
      handleSaveToDb(cultes, next, announcements);
    }
  };

  const handleAddAnnouncement = () => {
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) {
      alert("Veuillez renseigner au moins le titre et le contenu de l'annonce.");
      return;
    }

    const item: ChurchAnnouncementItem = {
      id: `ann-${Date.now()}`,
      title: newAnnouncement.title.trim(),
      date: newAnnouncement.date.trim() || "Actuel",
      badge: newAnnouncement.badge.trim() || "Information",
      badgeColor: newAnnouncement.badgeColor,
      content: newAnnouncement.content.trim(),
    };

    const next = [item, ...announcements];
    setAnnouncements(next);
    handleSaveToDb(cultes, programmes, next);

    setNewAnnouncement({
      title: "",
      date: "",
      badge: "Annonce",
      badgeColor: "gold",
      content: "",
    });
  };

  const handleDeleteAnnouncement = (id: string) => {
    const next = announcements.filter((a) => a.id !== id);
    setAnnouncements(next);
    handleSaveToDb(cultes, programmes, next);
  };

  const handleResetDefaults = () => {
    if (confirm("Réinitialiser tous les horaires et annonces aux valeurs par défaut de l'église ?")) {
      setCultes(DEFAULT_CULTES);
      setProgrammes(DEFAULT_PROGRAMMES);
      setAnnouncements(DEFAULT_ANNOUNCEMENTS);
      handleSaveToDb(DEFAULT_CULTES, DEFAULT_PROGRAMMES, DEFAULT_ANNOUNCEMENTS);
    }
  };

  if (loading) {
    return (
      <GlassCard className="p-8 bg-[#0a0f1c]/80 border-white/5">
        <div className="flex items-center justify-center gap-3 text-slate-400 py-8">
          <Loader2 className="animate-spin text-amber-400" size={24} />
          <span>Chargement de la configuration des cultes et annonces...</span>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6 md:p-8 bg-[#0a0f1c]/80 border-white/5 shadow-2xl relative overflow-hidden" glowColor="gold">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Module Central
            </span>
            <span className="text-xs text-slate-500">Programmes et Annonces</span>
          </div>
          <h3 className="text-2xl font-bold text-white flex items-center gap-3">
            <Church className="w-6 h-6 text-amber-400" />
            Gestion des Cultes, Programmes & Annonces
          </h3>
          <p className="text-slate-400 text-sm mt-1 font-light max-w-2xl">
            Définissez les horaires des cultes, les programmes de la semaine et publiez les annonces visibles par tous les membres sur le portail du campus.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleResetDefaults}
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white text-xs flex items-center gap-1.5 transition-colors"
            title="Rétablir les valeurs types ICC"
          >
            <RotateCcw size={13} />
            <span>Rétablir par défaut</span>
          </button>

          <button
            onClick={() => handleSaveToDb()}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] active:scale-95 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : saveSuccess ? (
              <Check size={14} />
            ) : (
              <Save size={14} />
            )}
            <span>{saveSuccess ? "Enregistré !" : "Sauvegarder"}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mt-6 border-b border-white/5 pb-3">
        <button
          onClick={() => setActiveSubTab("cultes")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === "cultes"
              ? "bg-amber-500 text-black shadow-lg"
              : "bg-white/5 text-slate-400 hover:text-white"
          }`}
        >
          <Church size={14} />
          <span>Cultes & Célébrations ({cultes.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("programmes")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === "programmes"
              ? "bg-amber-500 text-black shadow-lg"
              : "bg-white/5 text-slate-400 hover:text-white"
          }`}
        >
          <Calendar size={14} />
          <span>Autres Programmes ({programmes.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("annonces")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === "annonces"
              ? "bg-amber-500 text-black shadow-lg"
              : "bg-white/5 text-slate-400 hover:text-white"
          }`}
        >
          <Megaphone size={14} />
          <span>Annonces Officielles ({announcements.length})</span>
        </button>
      </div>

      {/* CONTENT: CULTES */}
      {activeSubTab === "cultes" && (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cultes.map((culte) => (
              <div
                key={culte.id}
                className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-amber-500/30 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {culte.day}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1 font-semibold">
                      <Clock size={12} className="text-amber-400" />
                      {culte.time}
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-base">{culte.title}</h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{culte.description}</p>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5 text-xs text-slate-500">
                  <span className="flex items-center gap-1 text-slate-400">
                    <MapPin size={12} className="text-amber-400" />
                    {culte.location}
                  </span>
                  <button
                    onClick={() => handleDeleteEvent(culte.id, "culte")}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Supprimer ce culte"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Form Add Culte */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Plus size={16} className="text-amber-400" />
              <span>Ajouter un horaire de culte</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <input
                type="text"
                placeholder="Titre (ex: Culte de Célébration 1er Service)"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
              />
              <input
                type="text"
                placeholder="Jour (ex: Tous les dimanches)"
                value={newEvent.day}
                onChange={(e) => setNewEvent({ ...newEvent, day: e.target.value })}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
              />
              <input
                type="text"
                placeholder="Horaires (ex: 09:00 - 11:00)"
                value={newEvent.time}
                onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <input
                type="text"
                placeholder="Lieu (ex: Sanctuaire Principal)"
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
              />
              <input
                type="text"
                placeholder="Description courte (ex: Louange, adoration et parole...)"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => handleAddEvent("culte")}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Plus size={14} />
                <span>Ajouter ce culte</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONTENT: AUTRES PROGRAMMES */}
      {activeSubTab === "programmes" && (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {programmes.map((prog) => (
              <div
                key={prog.id}
                className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-amber-500/30 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 text-slate-300 border border-white/10">
                      {prog.day}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1 font-semibold">
                      <Clock size={12} className="text-amber-400" />
                      {prog.time}
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-base">{prog.title}</h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{prog.description}</p>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5 text-xs text-slate-500">
                  <span className="flex items-center gap-1 text-slate-400">
                    <MapPin size={12} className="text-amber-400" />
                    {prog.location}
                  </span>
                  <button
                    onClick={() => handleDeleteEvent(prog.id, "programme")}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Supprimer ce programme"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Form Add Programme */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Plus size={16} className="text-amber-400" />
              <span>Ajouter un programme hebdomadaire ou mensuel</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <input
                type="text"
                placeholder="Titre (ex: Midi & Soir de Prière)"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
              />
              <input
                type="text"
                placeholder="Jour (ex: Mercredi soir)"
                value={newEvent.day}
                onChange={(e) => setNewEvent({ ...newEvent, day: e.target.value })}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
              />
              <input
                type="text"
                placeholder="Horaires (ex: 19:00 - 20:30)"
                value={newEvent.time}
                onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <input
                type="text"
                placeholder="Lieu (ex: En présentiel & En ligne)"
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
              />
              <input
                type="text"
                placeholder="Description (ex: Temps d'intercession et d'adoration)"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => handleAddEvent("programme")}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Plus size={14} />
                <span>Ajouter ce programme</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONTENT: ANNONCES */}
      {activeSubTab === "annonces" && (
        <div className="mt-6 space-y-6">
          <div className="space-y-3">
            {announcements.map((ann) => {
              const badgeClass =
                ann.badgeColor === "emerald"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : ann.badgeColor === "blue"
                  ? "bg-sky-500/10 text-sky-400 border-sky-500/20"
                  : ann.badgeColor === "rose"
                  ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/20";

              return (
                <div
                  key={ann.id}
                  className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${badgeClass}`}>
                        {ann.badge}
                      </span>
                      <span className="text-xs text-slate-500">{ann.date}</span>
                    </div>
                    <h4 className="font-bold text-white text-base mt-1">{ann.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed font-light">{ann.content}</p>
                  </div>

                  <button
                    onClick={() => handleDeleteAnnouncement(ann.id)}
                    className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0"
                    title="Supprimer cette annonce"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Form Add Annonce */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Megaphone size={16} className="text-amber-400" />
              <span>Publier une nouvelle annonce officielle</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <input
                type="text"
                placeholder="Titre de l'annonce"
                value={newAnnouncement.title}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
              />
              <input
                type="text"
                placeholder="Badge (ex: Inscription, Transport, Urgent)"
                value={newAnnouncement.badge}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, badge: e.target.value })}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
              />
              <input
                type="text"
                placeholder="Date / Période (ex: Ce dimanche)"
                value={newAnnouncement.date}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, date: e.target.value })}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <textarea
              rows={3}
              placeholder="Contenu complet de l'annonce..."
              value={newAnnouncement.content}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 resize-none"
            />
            <div className="flex justify-end">
              <button
                onClick={handleAddAnnouncement}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Plus size={14} />
                <span>Publier cette annonce</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
