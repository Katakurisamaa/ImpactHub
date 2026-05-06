"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Plus, MessageSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function FloatingDock() {
    const pathname = usePathname();

    const navItems = [
        { name: "Accueil", href: "/", icon: Home },
        { name: "Découvrir", href: "/explore", icon: Compass },
        { name: "Nouveau", href: "/create", icon: Plus, isAction: true },
        { name: "Messagerie", href: "/messages", icon: MessageSquare },
        { name: "Profil", href: "/profile", icon: User },
    ];

    return (
        <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4">
            <nav className="flex h-16 items-center gap-1 rounded-2xl border border-zinc-200 bg-white/80 p-2 shadow-2xl backdrop-blur-xl dark:border-zinc-800 dark:bg-black/80">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    if (item.isAction) {
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="group relative flex h-12 w-12 items-center justify-center rounded-xl bg-gold-500 text-white shadow-lg transition-transform active:scale-95 mx-2 hover:bg-gold-600"
                                aria-label={item.name}
                            >
                                <Icon className="h-6 w-6" />
                            </Link>
                        );
                    }

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            aria-label={item.name}
                            className={cn(
                                "relative flex h-12 w-12 flex-col items-center justify-center rounded-xl text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100",
                                isActive && "bg-zinc-100 text-gold-600 dark:bg-zinc-800 dark:text-gold-400"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="nav-indicator"
                                    className="absolute inset-0 rounded-xl bg-gold-500/10 dark:bg-gold-400/10"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                            <Icon className={cn("h-6 w-6", isActive && "stroke-[2.5px]")} />
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
