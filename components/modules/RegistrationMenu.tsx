"use client";

import { motion } from "framer-motion";
import { Droplets, GraduationCap } from "lucide-react";

export default function RegistrationMenu({
    onSelect,
}: {
    onSelect: (type: "baptism" | "pcnc") => void;
}) {
    return (
        <div className="grid grid-cols-2 gap-4">
            <motion.div
                onClick={() => onSelect("baptism")}
                className="aspect-square rounded-2xl bg-primary/10 border border-white/10 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary/50 active:scale-95 transition-all duration-300 group"
            >
                <Droplets size={40} className="text-primary group-hover:scale-110 transition" />
                <span className="text-white font-bold text-center">Baptême</span>
            </motion.div>

            <motion.div
                onClick={() => onSelect("pcnc")}
                className="aspect-square rounded-2xl bg-primary/10 border border-white/10 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary/50 active:scale-95 transition-all duration-300 group"
            >
                <GraduationCap size={40} className="text-primary group-hover:scale-110 transition" />
                <span className="text-white font-bold text-center">Formation PCNC</span>
            </motion.div>
        </div>
    );
}
