"use client";

import { useState, useEffect } from "react";
import { Tenant } from "@/types";
import { supabase } from "@/lib/supabase/client";
import { 
  Church, 
  Calendar, 
  Clock, 
  MapPin, 
  CalendarPlus, 
  Share2, 
  Check, 
  Megaphone, 
  Sparkles,
  Loader2
} from "lucide-react";

export interface ChurchEvent {
  id: string;
  title: string;
  day: string;
  time: string;
  location: string;
  category: "culte" | "programme";
  description: string;
  isSpecial?: boolean;
}

export interface ChurchAnnouncement {
  id: string;
  title: string;
  date: string;
  badge: string;
  badgeColor?: "gold" | "emerald" | "rose" | "blue";
  content: string;
}

const DEFAULT_CULTES: ChurchEvent[] = [
  {
    id: "culte-dimanche-1",
    title: "Culte de Célébration (1er Service)",
    day: "Tous les dimanches",
    time: "09:00 - 11:00",
    location: "Sanctuaire Principal",
    category: "culte",
    description: "Louange vivante, adoration et message d'édification spirituelle pour toute la famille.",
  },
  {
    id: "culte-dimanche-2",
    title: "Culte de Célébration (2ème Service)",
    day: "Tous les dimanches",
    time: "11:30 - 13:30",
    location: "Sanctuaire Principal & Impact Kids",
    category: "culte",
    description: "Louange, prédication de la parole et service dédié aux enfants au département Impact Kids.",
  },
  {
    id: "culte-jeunesse",
    title: "Impact Jeunes (Culte de la Jeunesse)",
    day: "Samedi (1 fois sur 2)",
    time: "17:00 - 19:30",
    location: "Espace Jeunesse & Créatif",
    category: "culte",
    description: "Rassemblement pour les lycéens, étudiants et jeunes pros : foi authentique, louange et connexion.",
    isSpecial: true,
  },
];

const DEFAULT_PROGRAMMES: ChurchEvent[] = [
  {
    id: "priere-mercredi",
    title: "Midi & Soir de Prière",
    day: "Tous les mercredis",
    time: "19:00 - 20:30",
    location: "En présentiel & Retransmission en ligne",
    category: "programme",
    description: "Temps d'intercession, prière fervente en assemblée et recherche de la face de Dieu.",
  },
  {
    id: "cellules-jeudi",
    title: "Cellules de Maison (Impact Groupes)",
    day: "Tous les jeudis",
    time: "19:30 - 21:00",
    location: "Dans les foyers de votre secteur",
    category: "programme",
    description: "Partage fraternel en petits groupes de proximité, étude biblique pratique et prières d'intimité.",
  },
  {
    id: "formation-disciples",
    title: "Académie des Disciples & Affermissement",
    day: "Samedi matin",
    time: "10:00 - 12:00",
    location: "Salles de formation pastorale",
    category: "programme",
    description: "Fondements de la foi chrétienne, affermissement des nouveaux convertis et découverte des dons.",
  },
  {
    id: "veillee-impact",
    title: "Grande Nuit d'Impact (Veillée)",
    day: "Dernier vendredi du mois",
    time: "22:00 - 05:00",
    location: "Sanctuaire Principal",
    category: "programme",
    description: "Nuit entière de percée, de proclamations prophétiques et d'adoration sans limite.",
    isSpecial: true,
  },
];

const DEFAULT_ANNOUNCEMENTS: ChurchAnnouncement[] = [
  {
    id: "annonce-baptemes",
    title: "Inscriptions ouvertes pour les Baptêmes d'eau",
    date: "Session en cours",
    badge: "Inscription",
    badgeColor: "emerald",
    content: "Vous souhaitez sceller publiquement votre foi par le baptême par immersion ? Les cours préparatoires débutent prochainement. Rapprochez-vous du pôle pastoral ou de l'accueil.",
  },
  {
    id: "annonce-navettes",
    title: "Navettes de culte gratuites ce Dimanche",
    date: "Tous les dimanches",
    badge: "Transport",
    badgeColor: "blue",
    content: "Des navettes gratuites sont mises à disposition depuis les gares et stations principales pour les deux services de 09h00 et 11h30. Consultez le module Navettes pour voir les arrêts.",
  },
  {
    id: "annonce-star",
    title: "Appel aux Bénévoles : Rejoignez l'équipe S.T.A.R",
    date: "Recrutement continu",
    badge: "Bénévolat",
    badgeColor: "gold",
    content: "Mettez vos compétences au service de l'église : pôle accueil, technique & son, médias, sécurité, chorale ou encadrement des enfants (Impact Kids).",
  },
];

export default function CampusScheduleView({ tenant }: { tenant: Tenant }) {
  const [activeTab, setActiveTab] = useState<"cultes" | "programmes" | "annonces">("cultes");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [cultes, setCultes] = useState<ChurchEvent[]>(DEFAULT_CULTES);
  const [programmes, setProgrammes] = useState<ChurchEvent[]>(DEFAULT_PROGRAMMES);
  const [announcements, setAnnouncements] = useState<ChurchAnnouncement[]>(DEFAULT_ANNOUNCEMENTS);

  // Load configured events & announcements from Supabase module_configs
  useEffect(() => {
    if (!tenant?.id) {
      setLoading(false);
      return;
    }

    async function fetchCampusSchedule() {
      try {
        const { data, error } = await supabase
          .from("module_configs")
          .select("config")
          .eq("tenant_id", tenant.id)
          .eq("module_key", "schedule")
          .maybeSingle();

        if (data?.config) {
          if (Array.isArray(data.config.cultes) && data.config.cultes.length > 0) {
            setCultes(data.config.cultes);
          }
          if (Array.isArray(data.config.programmes) && data.config.programmes.length > 0) {
            setProgrammes(data.config.programmes);
          }
          if (Array.isArray(data.config.announcements) && data.config.announcements.length > 0) {
            setAnnouncements(data.config.announcements);
          }
        }
      } catch (err) {
        console.error("Error fetching campus schedule for members:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCampusSchedule();
  }, [tenant?.id]);

  // Google Calendar Link generator
  const createGoogleCalendarLink = (event: ChurchEvent) => {
    const text = encodeURIComponent(`${event.title} - ${tenant.name}`);
    const details = encodeURIComponent(`${event.description}\n\nLieu: ${event.location}\nCampus: ${tenant.name}`);
    const location = encodeURIComponent(`${tenant.name}, ${event.location}`);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&details=${details}&location=${location}`;
  };

  // ICS calendar download generator
  const downloadIcs = (event: ChurchEvent) => {
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//ImpactHub//Event Schedule//FR",
      "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      `SUMMARY:${event.title} - ${tenant.name}`,
      `DESCRIPTION:${event.description}`,
      `LOCATION:${event.location}, ${tenant.name}`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${event.title.replace(/\s+/g, "_")}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Share handler
  const handleShare = (event: ChurchEvent) => {
    const shareText = `Rejoignez-nous à ${tenant.name} pour le "${event.title}" (${event.day} de ${event.time}) !`;
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: shareText,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      setCopiedId(event.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
        <Loader2 className="animate-spin text-[var(--gold)]" size={24} />
        <span className="text-xs font-light">Chargement des programmes et annonces...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-950/20 to-transparent border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--gold)]">
              Vie du Campus
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)]" />
            <span className="text-xs text-white/50">{tenant.name}</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white mt-1">
            Programmes & Annonces
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1 font-light max-w-xl">
            Tous les horaires des cultes, les programmes de la semaine et les communications officielles de l'église.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab("cultes")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs md:text-sm transition-all whitespace-nowrap ${
            activeTab === "cultes"
              ? "bg-white/10 text-white border border-[var(--gold)]/40 shadow-sm"
              : "text-white/60 hover:text-white hover:bg-white/5"
          }`}
        >
          <Church size={16} className={activeTab === "cultes" ? "text-[var(--gold)]" : "text-white/40"} />
          <span>Cultes & Célébrations</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/10 text-white/80 font-mono">
            {cultes.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("programmes")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs md:text-sm transition-all whitespace-nowrap ${
            activeTab === "programmes"
              ? "bg-white/10 text-white border border-[var(--gold)]/40 shadow-sm"
              : "text-white/60 hover:text-white hover:bg-white/5"
          }`}
        >
          <Calendar size={16} className={activeTab === "programmes" ? "text-[var(--gold)]" : "text-white/40"} />
          <span>Autres Programmes</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/10 text-white/80 font-mono">
            {programmes.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("annonces")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs md:text-sm transition-all whitespace-nowrap ${
            activeTab === "annonces"
              ? "bg-white/10 text-white border border-[var(--gold)]/40 shadow-sm"
              : "text-white/60 hover:text-white hover:bg-white/5"
          }`}
        >
          <Megaphone size={16} className={activeTab === "annonces" ? "text-[var(--gold)]" : "text-white/40"} />
          <span>Annonces Officielles</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/10 text-white/80 font-mono">
            {announcements.length}
          </span>
        </button>
      </div>

      {/* ──────── TAB 1: CULTES ──────── */}
      {activeTab === "cultes" && (
        <div className="space-y-4">
          {cultes.map((event) => (
            <div
              key={event.id}
              className="p-5 rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/10 hover:border-[var(--gold)]/40 transition-all space-y-4 shadow-lg group relative"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[var(--gold-pale)] text-[var(--gold)] border border-[var(--gold)]/20">
                      {event.day}
                    </span>
                    <span className="text-xs font-semibold text-white/90 flex items-center gap-1">
                      <Clock size={12} className="text-[var(--gold)]" />
                      {event.time}
                    </span>
                    {event.isSpecial && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        Spécial
                      </span>
                    )}
                  </div>
                  <h4 className="text-base md:text-lg font-bold text-white group-hover:text-[var(--gold-light)] transition-colors">
                    {event.title}
                  </h4>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <a
                    href={createGoogleCalendarLink(event)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-[var(--gold-light)] hover:border-[var(--gold)]/30 transition-all flex items-center gap-1.5"
                    title="Ajouter à Google Agenda"
                  >
                    <CalendarPlus size={14} />
                    <span className="hidden sm:inline">Google Agenda</span>
                  </a>

                  <button
                    onClick={() => downloadIcs(event)}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/80 hover:text-white transition-all flex items-center gap-1.5"
                    title="Télécharger l'événement pour Apple / Outlook"
                  >
                    <span>.ics</span>
                  </button>

                  <button
                    onClick={() => handleShare(event)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-all"
                    title="Partager"
                  >
                    {copiedId === event.id ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
                  </button>
                </div>
              </div>

              <p className="text-xs text-[var(--text-muted)] font-light leading-relaxed">
                {event.description}
              </p>

              <div className="pt-3 border-t border-white/5 flex items-center gap-2 text-xs text-white/60">
                <MapPin size={13} className="text-[var(--gold)]" />
                <span>{event.location}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ──────── TAB 2: AUTRES PROGRAMMES ──────── */}
      {activeTab === "programmes" && (
        <div className="space-y-4">
          {programmes.map((event) => (
            <div
              key={event.id}
              className="p-5 rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/10 hover:border-[var(--gold)]/40 transition-all space-y-4 shadow-lg group relative"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-white/10 text-white/90 border border-white/10">
                      {event.day}
                    </span>
                    <span className="text-xs font-semibold text-white/90 flex items-center gap-1">
                      <Clock size={12} className="text-[var(--gold)]" />
                      {event.time}
                    </span>
                    {event.isSpecial && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/20 text-[var(--gold)] border border-amber-500/30">
                        Mensuel
                      </span>
                    )}
                  </div>
                  <h4 className="text-base md:text-lg font-bold text-white group-hover:text-[var(--gold-light)] transition-colors">
                    {event.title}
                  </h4>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <a
                    href={createGoogleCalendarLink(event)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-[var(--gold-light)] hover:border-[var(--gold)]/30 transition-all flex items-center gap-1.5"
                    title="Ajouter à Google Agenda"
                  >
                    <CalendarPlus size={14} />
                    <span className="hidden sm:inline">Google Agenda</span>
                  </a>

                  <button
                    onClick={() => downloadIcs(event)}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/80 hover:text-white transition-all flex items-center gap-1.5"
                    title="Télécharger l'événement"
                  >
                    <span>.ics</span>
                  </button>

                  <button
                    onClick={() => handleShare(event)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-all"
                    title="Partager"
                  >
                    {copiedId === event.id ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
                  </button>
                </div>
              </div>

              <p className="text-xs text-[var(--text-muted)] font-light leading-relaxed">
                {event.description}
              </p>

              <div className="pt-3 border-t border-white/5 flex items-center gap-2 text-xs text-white/60">
                <MapPin size={13} className="text-[var(--gold)]" />
                <span>{event.location}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ──────── TAB 3: ANNONCES OFFICIELLES ──────── */}
      {activeTab === "annonces" && (
        <div className="space-y-4">
          {announcements.map((announce) => {
            const badgeClasses =
              announce.badgeColor === "emerald"
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                : announce.badgeColor === "blue"
                ? "bg-sky-500/20 text-sky-300 border-sky-500/30"
                : announce.badgeColor === "rose"
                ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                : "bg-amber-500/20 text-amber-300 border-amber-500/30";

            return (
              <div
                key={announce.id}
                className="p-5 rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/10 hover:border-white/20 transition-all space-y-3 shadow-lg relative group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${badgeClasses}`}>
                      {announce.badge}
                    </span>
                    <span className="text-xs text-white/50">{announce.date}</span>
                  </div>
                  <h4 className="text-base font-bold text-white mt-1">
                    {announce.title}
                  </h4>
                </div>

                <p className="text-xs text-[var(--text-muted)] font-light leading-relaxed">
                  {announce.content}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
