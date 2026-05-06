"use client";

import { useTheme } from "@/components/ui/ThemeProvider";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label="Basculer le thème"
      className={`group relative flex items-center justify-center w-10 h-10 rounded-xl border transition-all duration-300 
        ${theme === "dark"
          ? "bg-white/5 border-white/10 hover:border-emerald-500/40 hover:bg-emerald-500/10"
          : "bg-slate-900/10 border-slate-300/30 hover:border-emerald-500/40 hover:bg-emerald-500/10"
        } ${className}`}
    >
      <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
      {theme === "dark" ? (
        <Sun className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform duration-300" />
      ) : (
        <Moon className="w-5 h-5 text-slate-600 group-hover:scale-110 transition-transform duration-300" />
      )}
    </button>
  );
}
