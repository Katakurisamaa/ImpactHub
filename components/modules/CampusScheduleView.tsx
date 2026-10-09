"use client";

import { useState } from "react";
import { Tenant } from "@/types";
import { Calendar, Clock, MapPin, CalendarPlus, Check, Share2, Sparkles, Church, Users, HeartHandshake } from "lucide-react";

interface ScheduleEvent {
  id: string;
  title: string;
  day: string;
  time: string;
  location: string;
  category: "culte" | "priere" | "jeunesse" | "etude";
  description: string;
}

const DEFAULT_EVENTS: ScheduleEvent[] = [
  {
    id: "culte-dimanche-1",
    title: "Culte de Célébration (1er Service)",
    day: "Tous les dimanches",
    time: "09:00 - 11:00",
    location: "Sanctuaire Principal",
    category: "culte",
    description: "Louange vivante, adoration et message d'édification pour toute la famille.",
  },
  {
    id: "culte-dimanche-2",
    title: "Culte de Célébration (2ème Service)",
    day: "Tous les dimanches",
    time: "11:30 - 13:30",
    location: "Sanctuaire Principal",
    category: "culte",
    description: "Louange, prédication de la parole et service dédié aux enfants (Impact Kids).",
  },
  {
    id: "priere-mercredi",
    title: "Midi & Soir de Prière",
    day: "Mercredi",
    time: "19:00 - 20:30",
    location: "En présentiel & En ligne",
    category: "priere",
    description: "Temps d'intercession, prière fervente et recherche de la face de Dieu.",
  },
  {
    id: "cellules-jeudi",
    title: "Cellules de Maison (Impact Groupes)",
    day: "Jeudi",
    time: "19:30 - 21:00",
    location: "Dans les foyers de votre région",
    category: "etude",
    description: "Partage fraternel de la parole en petits groupes et communion intime.",
  },
];

export default function CampusScheduleView({ tenant }: { tenant: Tenant }) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Helper to generate Google Calendar link
  const createGoogleCalendarLink = (event: ScheduleEvent) => {
    const text = encodeURIComponent(`${event.title} - ${tenant.name}`);
    const details = encodeURIComponent(`${event.description}\n\nLieu: ${event.location}\nCampus: ${tenant.name}`);
    const location = encodeURIComponent(`${tenant.name}, ${event.location}`);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&details=${details}&location=${location}`;
  };

  // Helper to generate and download ICS file
  const downloadIcs = (event: ScheduleEvent) => {
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
      "END:VCALENDAR"
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

  const handleShare = (event: ScheduleEvent) => {
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

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--gold)]">Horaires Officiels</span>
          <h3 className="text-lg font-bold text-white">Cultes & Rassemblements</h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5 font-light">
            Tous les rendez-vous hebdomadaires du campus de {tenant.name}.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {DEFAULT_EVENTS.map((event) => (
          <div
            key={event.id}
            className="p-5 rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/10 hover:border-[var(--gold)]/40 transition-all space-y-4 shadow-lg group"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[var(--gold-pale)] text-[var(--gold)] border border-[var(--gold)]/20">
                    {event.day}
                  </span>
                  <span className="text-xs font-semibold text-white/70 flex items-center gap-1">
                    <Clock size={12} className="text-[var(--gold)]" />
                    {event.time}
                  </span>
                </div>
                <h4 className="text-base font-bold text-white group-hover:text-[var(--gold-light)] transition-colors">
                  {event.title}
                </h4>
              </div>

              {/* Action Buttons */}
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
                  <span>Apple / .ics</span>
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

            <div className="pt-3 border-t border-white/5 flex items-center gap-2 text-xs text-white/50">
              <MapPin size={13} className="text-[var(--gold)]" />
              <span>{event.location}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
