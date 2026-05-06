"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    glowColor?: "green" | "gold";
}

export function GlassCard({ children, className, glowColor }: GlassCardProps) {
    return (
        <motion.div
            className={cn(
                "glass p-6 rounded-3xl relative overflow-hidden group transition-all duration-300 md:hover:-translate-y-1 md:hover:scale-[1.02]",
                glowColor === "green" && "glow-green",
                glowColor === "gold" && "glow-gold",
                className
            )}
        >
            {/* Subtle hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10">{children}</div>
        </motion.div>
    );
}
