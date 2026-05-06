"use client";
import { motion } from "framer-motion";

export function AnimatedHero() {
    return (
        <div className="relative mb-12 text-center md:text-left">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-highlight border border-white/10 text-primary text-xs font-semibold mb-6"
            >
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                ImpactHub Beta
            </motion.div>

            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground mb-4"
            >
                Connectez. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent-pink">
                    Impactez.
                </span>
            </motion.h1>

            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-muted-foreground text-lg md:text-xl max-w-lg mx-auto md:mx-0 font-medium"
            >
                La plateforme tout-en-un pour gérer votre vie d'église, déléguer efficacement et grandir ensemble.
            </motion.p>
        </div>
    );
}
