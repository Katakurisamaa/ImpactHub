"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Users, Activity, Home } from "lucide-react";
import { useEffect, useState } from "react";

const SPACES = [
  {
    title: "Espace Manager",
    path: "/manager/login",
    icon: ShieldCheck,
    description: "Administration & supervision de l'église",
    gradient: "from-emerald-500 to-teal-600",
    glow: "rgba(16,185,129,0.3)",
    borderGlow: "rgba(16,185,129,0.4)",
    delay: "delay-100",
  },
  {
    title: "Espace Admin",
    path: "/admin/login",
    icon: ShieldCheck,
    description: "Gestion avancée des données et membres",
    gradient: "from-amber-500 to-orange-500",
    glow: "rgba(245,158,11,0.3)",
    borderGlow: "rgba(245,158,11,0.4)",
    delay: "delay-200",
  },
  {
    title: "Espace Responsable",
    path: "/leader/login",
    icon: Users,
    description: "Pilotage des modules et équipes",
    gradient: "from-violet-500 to-indigo-600",
    glow: "rgba(139,92,246,0.3)",
    borderGlow: "rgba(139,92,246,0.4)",
    delay: "delay-300",
  },
  {
    title: "Espace Pilote",
    path: "/leader/login",
    icon: Users,
    description: "Gestion des cellules de maison",
    gradient: "from-sky-500 to-blue-600",
    glow: "rgba(14,165,233,0.3)",
    borderGlow: "rgba(14,165,233,0.4)",
    delay: "delay-400",
  },
];

function SpaceCard({ space, index }: { space: typeof SPACES[0]; index: number }) {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://impacthub.icc";
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(baseUrl + space.path)}&bgcolor=ffffff&color=020617&margin=4`;

  return (
    <div className={`reveal delay-${(index % 4 + 1) * 100} h-full`}>
      <Link href={space.path} className="block h-full">
        <div className="glass-card p-7 flex flex-col items-center gap-6 h-full text-center group cursor-pointer transition-all duration-400">
          
          <div className="card-icon-container">
            <space.icon className="w-6 h-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-5deg]" />
          </div>

          <div className="flex-1">
            <h3 className="text-lg uppercase tracking-widest font-semibold mb-2" style={{ color: "var(--gold-light)", letterSpacing: "0.15em" }}>
              {space.title}
            </h3>
            <p className="text-sm font-light" style={{ color: "var(--text-muted)" }}>
              {space.description}
            </p>
          </div>

          <div className="mt-2">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20">
              <img
                src={qrUrl}
                alt={`QR Code ${space.title}`}
                className="w-24 h-24 rounded-lg mix-blend-screen opacity-90"
                loading="lazy"
              />
            </div>
          </div>

          <div className="w-full py-3 mt-auto rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all duration-300 border border-[var(--glass-border)] bg-[rgba(255,255,255,0.02)] group-hover:bg-[var(--gold-pale)] group-hover:border-[var(--gold)] text-[var(--text)] group-hover:text-[var(--gold)]">
            Accéder
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>
    </div>
  );
}

export default function AccessPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="min-h-screen">
      <header className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-4 flex items-center justify-between transition-all duration-300"
        style={{
          background: "rgba(6, 6, 26, 0.6)",
          backdropFilter: "blur(20px)",
          borderBottom: "0.5px solid var(--glass-border)",
        }}>
        <div className="flex items-center gap-3">
          <Link href="/" className="text-2xl font-semibold tracking-wide flex items-center gap-2" style={{ fontFamily: "var(--font-cormorant)", color: "var(--gold-light)" }}>
            <Home size={24} />
            ImpactHub
          </Link>
        </div>
      </header>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-32 pb-24">
        <section className="flex flex-col items-center text-center space-y-6 py-10 reveal">
          <div className="tag-badge">
            <Activity className="w-3 h-3 inline-block mr-2" />
            Accès Administratif
          </div>

          <h1 className="text-4xl md:text-5xl font-bold" style={{ color: "var(--text)" }}>
            Espaces de <span style={{ color: "var(--gold)" }}>Gestion</span>
          </h1>

          <p className="text-lg max-w-2xl font-light text-[var(--text-muted)]">
            Accédez aux outils d'administration et de pilotage pour votre campus.
          </p>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {mounted && SPACES.map((space, i) => (
            <SpaceCard key={i} space={space} index={i} />
          ))}
        </section>

        <div className="mt-20 text-center">
            <Link href="/" className="text-[var(--gold-light)] hover:underline flex items-center justify-center gap-2">
                &larr; Retour à l'accueil des campus
            </Link>
        </div>
      </div>
    </div>
  );
}
