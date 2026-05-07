"use client";

import Link from "next/link";
import { ArrowRight, Building, Activity, Search, MapPin, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type Tenant = {
  id: string;
  name: string;
  slug: string;
  church_code: string;
};

function TenantCard({ tenant, index }: { tenant: Tenant; index: number }) {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://impacthub.icc";
  // The official campus URL is /campus/[slug]
  const campusUrl = `${baseUrl}/campus/${tenant.slug}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(campusUrl)}&bgcolor=ffffff&color=020617&margin=4`;

  return (
    <div className="h-full">
      <div className="glass-card p-7 flex flex-col items-center gap-6 h-full text-center group transition-all duration-400">
        
        <div className="card-icon-container">
          <Building className="w-6 h-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-5deg]" />
        </div>

        <div className="flex-1">
          <h3 className="text-xl font-bold mb-2" style={{ color: "var(--text)", letterSpacing: "0.05em" }}>
            {tenant.name}
          </h3>
          <div className="flex items-center justify-center gap-2 text-sm font-light" style={{ color: "var(--text-muted)" }}>
            <MapPin size={14} className="text-[var(--gold-light)]" />
            <span className="uppercase tracking-widest">{tenant.slug}</span>
          </div>
        </div>

        {/* QR Code */}
        <div className="mt-2">
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 group-hover:border-[var(--gold)] transition-colors">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrUrl}
              alt={`QR Code ${tenant.name}`}
              className="w-24 h-24 rounded-lg mix-blend-screen opacity-90 group-hover:opacity-100 transition-opacity"
              loading="lazy"
            />
          </div>
        </div>

        <Link href={`/campus/${tenant.slug}`} className="w-full py-3 mt-auto rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all duration-300 border border-[var(--glass-border)] bg-[rgba(255,255,255,0.02)] group-hover:bg-[var(--gold-pale)] group-hover:border-[var(--gold)] text-[var(--text)] group-hover:text-[var(--gold)]">
          Visiter le Campus
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}

export default function Home() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchTenants();
  }, []);

  async function fetchTenants() {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('id, name, slug, church_code')
        .order('name');
      
      if (error) throw error;
      setTenants(data || []);
    } catch (err) {
      console.error("Error fetching tenants:", err);
    } finally {
      setLoading(false);
    }
  }

  const normalize = (str: string) => 
    str ? str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";

  const filteredTenants = tenants.filter(t => {
    if (!search.trim()) return true;
    const searchTerms = normalize(search).split(/\s+/).filter(term => term.length > 0);
    const targetStr = normalize(`${t.name} ${t.slug} ${t.church_code || ""}`);
    
    return searchTerms.every(term => targetStr.includes(term));
  });

  return (
    <div className="min-h-screen">
      {/* Navigation Fixe */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-4 flex items-center justify-between transition-all duration-300"
        style={{
          background: "rgba(6, 6, 26, 0.6)",
          backdropFilter: "blur(20px)",
          borderBottom: "0.5px solid var(--glass-border)",
        }}>
        <div className="flex items-center gap-3">
          <span className="text-2xl font-semibold tracking-wide" style={{ fontFamily: "var(--font-cormorant)", color: "var(--gold-light)" }}>
            ImpactHub
          </span>
        </div>
        <nav className="flex items-center gap-4 md:gap-8 text-sm">
          <Link href="/access" className="flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--glass-border)] bg-white/5 hover:bg-white/10 transition-all text-[var(--text-muted)] hover:text-[var(--gold-light)]">
            <Settings size={16} />
            <span className="hidden sm:inline uppercase tracking-widest text-[10px] font-bold">Accès Gestion</span>
          </Link>
        </nav>
      </header>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-32 pb-24">

        {/* Hero */}
        <section className="flex flex-col items-center text-center space-y-10 py-12 reveal visible">
          <div className="tag-badge">
            <Activity className="w-3 h-3 inline-block mr-2" />
            Portail des Campus Officiel
          </div>

          <h1 className="section-title max-w-5xl leading-[1.05]"
            style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", color: "var(--text)" }}>
            Trouvez votre <br className="hidden md:block" />
            <em style={{ color: "var(--gold)" }}>Communauté.</em>
          </h1>

          <p className="text-lg md:text-xl max-w-2xl leading-relaxed font-light text-[var(--text-muted)]">
            Explorez l'écosystème <strong style={{ color: "var(--gold-light)" }}>ImpactHub</strong> et connectez-vous au campus de votre région pour accéder à tous les services dédiés.
          </p>

          {/* Search Bar */}
          <div className="w-full max-w-xl relative mt-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-5 h-5" />
            <input 
              type="text"
              placeholder="Rechercher une église, une ville..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[rgba(255,255,255,0.03)] border border-[var(--glass-border)] rounded-2xl py-4 pl-12 pr-4 text-[var(--text)] focus:outline-none focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)] transition-all placeholder:text-[var(--text-muted)]/50"
            />
            {search && (
              <p className="text-xs text-[var(--gold-light)] mt-2 font-light opacity-80">
                {filteredTenants.length} campus trouvé(s) pour "{search}"
              </p>
            )}
          </div>
        </section>

        {/* Grid or Loading */}
        <section className="mt-12 min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-12 h-12 border-4 border-[var(--gold)] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[var(--text-muted)] font-light animate-pulse">Chargement des campus...</p>
            </div>
          ) : filteredTenants.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {mounted && filteredTenants.map((tenant, i) => (
                <div key={tenant.id} className="h-full">
                  <TenantCard tenant={tenant} index={i} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border border-dashed border-[var(--glass-border)] rounded-3xl">
              <Building className="w-12 h-12 mx-auto mb-4 text-[var(--text-muted)] opacity-20" />
              <p className="text-[var(--text-muted)]">Aucun campus ne correspond à votre recherche.</p>
              <button 
                onClick={() => setSearch("")}
                className="mt-4 text-[var(--gold-light)] hover:underline"
              >
                Voir toutes les églises
              </button>
            </div>
          )}
        </section>

        {/* Footer Link for Admins */}
        <footer className="mt-40 pt-12 text-center flex flex-col items-center gap-6 reveal">
          <div className="section-divider max-w-[200px]" />
          <div className="flex flex-col items-center gap-2">
            <p className="font-medium text-lg" style={{ color: "var(--gold-light)" }}>
              © 2026 ImpactHub.
            </p>
            <p className="font-light text-sm tracking-wide text-[var(--text-muted)]">
              Propulsé par la vision ICC.
            </p>
          </div>
          
          <Link href="/access" className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors mt-8 opacity-50 hover:opacity-100">
            Administration du Portail
          </Link>
        </footer>
      </div>
    </div>
  );
}
