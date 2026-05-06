"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, ListTodo, UserCircle, LogOut, Menu } from "lucide-react";
import Link from "next/link";
import { Tenant } from "@/types";

interface ShellProps {
    children: React.ReactNode;
    tenant: Tenant;
    user: any;
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

export default function Shell({ children, tenant, user, activeTab, setActiveTab }: ShellProps) {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navItems = [
        { id: "dashboard", label: "Accueil", icon: LayoutDashboard },
        { id: "requests", label: "Mes Demandes", icon: ListTodo },
        { id: "profile", label: "Profil", icon: UserCircle },
    ];

    const handleLogout = () => {
        localStorage.removeItem(`impact_member_${tenant.slug}`);
        window.location.reload();
    };

    return (
        <div className="min-h-screen font-sans pb-32 md:pb-0 md:pl-64 transition-all duration-300 bg-transparent relative text-foreground">
            {/* Desktop Sidebar */}
            <aside className="fixed left-0 top-0 h-full w-64 glass-card border-l-0 border-y-0 rounded-none hidden md:flex flex-col p-6 z-50">
                <div className="mb-10 flex items-center gap-3">
                    <h1 className="text-xl font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)", color: "var(--gold-light)" }}>{tenant.name}</h1>
                </div>

                <nav className="flex-1 space-y-2">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group ${activeTab === item.id
                                ? "bg-[var(--gold-pale)] border border-[var(--gold)] text-[var(--gold)] font-semibold shadow-[0_0_15px_rgba(212,168,67,0.2)]"
                                : "text-[var(--text-muted)] hover:text-[var(--gold-light)] hover:bg-white/5 border border-transparent"
                                }`}
                        >
                            <item.icon size={20} className={activeTab === item.id ? "text-[var(--gold)]" : "text-[var(--text-muted)] group-hover:text-[var(--gold-light)] transition-colors"} />
                            <span className="font-medium">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="pt-6 border-t border-white/5">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-8 h-8 rounded-full bg-surface-highlight flex items-center justify-center text-xs font-bold text-foreground border border-white/10">
                            {user?.firstName?.substring(0, 1)}{user?.lastName?.substring(0, 1)}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium text-[var(--text)] truncate">{user?.firstName} {user?.lastName}</p>
                            <p className="text-xs text-[var(--text-muted)] truncate">Membre</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-accent-error hover:text-red-200 hover:bg-accent-error/10 rounded-xl transition"
                    >
                        <LogOut size={16} /> Déconnexion
                    </button>
                </div>
            </aside>

            {/* Mobile Header (Sticky) */}
            <header className={`md:hidden fixed top-0 left-0 right-0 z-40 transition-all duration-300 px-6 py-4 flex justify-between items-center ${scrolled ? "fixed-nav shadow-lg" : "bg-transparent"}`}>
                <div className="flex items-center gap-2">
                    <span className="text-lg font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)", color: "var(--gold-light)" }}>{tenant.name}</span>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={handleLogout}
                        className="p-2 rounded-full bg-surface-highlight border border-white/5 text-accent-error hover:bg-accent-error/10 transition"
                        title="Déconnexion"
                    >
                        <LogOut size={18} />
                    </button>

                    <div className="w-8 h-8 rounded-full bg-surface-highlight border border-white/10 overflow-hidden">
                        {/* Placeholder Avatar */}
                        <div className="w-full h-full flex items-center justify-center text-xs text-foreground font-bold">
                            {user?.firstName?.charAt(0)}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="pt-24 md:pt-10 px-6 md:px-10 max-w-7xl mx-auto min-h-[calc(100vh-80px)]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10, filter: "blur(10px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: -10, filter: "blur(10px)" }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="h-full"
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Mobile Bottom Navigation (Floating & Fixed) */}
            <nav className="md:hidden fixed bottom-6 left-6 right-6 h-16 glass-card border-[var(--glass-border)] z-50 flex items-center justify-around px-2">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className="relative flex flex-col items-center justify-center w-16 h-full group"
                    >
                        <div className={`relative z-10 p-2 rounded-xl transition-all duration-300 ${activeTab === item.id ? "bg-[var(--gold-pale)] -translate-y-4 shadow-[0_0_15px_rgba(212,168,67,0.3)] scale-110" : "group-hover:bg-white/5"}`}>
                            <item.icon
                                size={22}
                                className={`transition-colors duration-300 ${activeTab === item.id ? "text-[var(--gold)] drop-shadow-[0_0_8px_rgba(212,168,67,0.5)]" : "text-[var(--text-muted)] group-hover:text-[var(--text)]"}`}
                            />
                        </div>
                        {activeTab === item.id && (
                            <motion.span
                                layoutId="nav-label"
                                className="absolute bottom-2 text-[10px] font-bold text-primary tracking-wide"
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                {item.label}
                            </motion.span>
                        )}
                        {/* Active Dot indicator */}
                        {activeTab === item.id && (
                            <motion.div
                                layoutId="nav-dot"
                                className="absolute bottom-1 w-1 h-1 rounded-full bg-[var(--gold)] shadow-[0_0_4px_#d4a843]"
                            />
                        )}
                    </button>
                ))}
            </nav>
        </div>
    );
}
