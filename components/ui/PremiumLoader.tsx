"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function PremiumLoader({ text = "Chargement..." }: { text?: string }) {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-xl">
            <div className="relative flex items-center justify-center">
                {/* Outer pulsing ring */}
                <motion.div
                    className="absolute w-24 h-24 rounded-full border-2 border-primary/20"
                    animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 0, 0.5],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />

                {/* Middle rotating ring */}
                <motion.div
                    className="absolute w-16 h-16 rounded-full border-t-2 border-r-2 border-primary"
                    animate={{ rotate: 360 }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                />

                {/* Inner Icon */}
                <div className="z-10 bg-surface p-3 rounded-full shadow-glow">
                    <Loader2 className="text-white animate-spin" size={24} />
                </div>
            </div>

            <motion.p
                className="mt-8 text-white/50 font-medium tracking-widest uppercase text-xs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                {text}
            </motion.p>
        </div>
    );
}
