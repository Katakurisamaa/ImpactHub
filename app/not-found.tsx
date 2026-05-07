"use client";

import Link from "next/link";
import { Home, ArrowLeft, AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="glass-card max-w-lg w-full p-12 text-center flex flex-col items-center gap-8 reveal visible">
        <div className="card-icon-container bg-error/10 border border-error/20">
          <AlertTriangle className="w-6 h-6 text-error" />
        </div>

        <div className="space-y-4">
          <h1 className="text-6xl font-bold font-heading" style={{ color: "var(--gold)" }}>
            404
          </h1>
          <h2 className="text-2xl font-semibold text-[var(--text)]">
            Page introuvable
          </h2>
          <p className="text-[var(--text-muted)] font-light leading-relaxed">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <Link 
            href="/"
            className="flex-1 py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow transition-all"
          >
            <Home size={18} />
            Retour à l'accueil
          </Link>
          
          <button 
            onClick={() => window.history.back()}
            className="flex-1 py-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 border border-[var(--glass-border)] bg-white/5 hover:bg-white/10 text-[var(--text)] transition-all"
          >
            <ArrowLeft size={18} />
            Page précédente
          </button>
        </div>
      </div>
    </div>
  );
}
