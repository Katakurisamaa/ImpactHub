"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, MousePointer2, Touchpad } from "lucide-react";

export default function WelcomeVideo({ onComplete, isReplay = false }: { onComplete: () => void, isReplay?: boolean }) {
    const [isVisible, setIsVisible] = useState(true);
    const [showControls, setShowControls] = useState(true);
    const [hasInteracted, setHasInteracted] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.volume = 0.3;
        }
    }, []);

    const handleSkip = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setIsVisible(false);
        setTimeout(onComplete, 500);
    };

    const toggleControls = () => {
        setShowControls(!showControls);
        if (!hasInteracted) setHasInteracted(true);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                    transition={{ duration: 0.8 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black overflow-hidden cursor-pointer"
                    onClick={toggleControls}
                >
                    <video
                        ref={videoRef}
                        src="/pp.mp4?v=2"
                        autoPlay
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover opacity-80"
                        onEnded={() => handleSkip()}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40" />

                    {/* Interaction Hint - Enhanced Visibility */}
                    {!hasInteracted && isVisible && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none flex flex-col items-center gap-4 bg-black/40 backdrop-blur-md p-8 rounded-[40px] border border-white/10 shadow-2xl"
                        >
                            <motion.div
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.5, 1, 0.5]
                                }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center border border-white/30"
                            >
                                <MousePointer2 className="w-8 h-8 text-white drop-shadow-lg" />
                            </motion.div>
                            <span className="text-white text-sm font-bold tracking-widest uppercase text-center drop-shadow-xl">
                                Touchez l'écran pour<br />masquer le texte
                            </span>
                        </motion.div>
                    )}

                    <AnimatePresence>
                        {showControls && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                transition={{ duration: 0.3 }}
                                className="absolute bottom-32 md:bottom-20 w-full flex flex-col items-center gap-4 px-6 z-50"
                            >
                                <h1 className="text-3xl md:text-5xl font-bold text-center text-white drop-shadow-lg pointer-events-none">
                                    Bienvenue à la Maison
                                </h1>
                                <p className="text-white/80 text-center max-w-md pointer-events-none">
                                    Une famille pour t'accueillir, une vision pour t'inspirer.
                                </p>

                                <button
                                    onClick={handleSkip}
                                    className="mt-6 flex items-center gap-2 px-8 py-3 rounded-full bg-primary text-primary-foreground font-bold hover:bg-primary-hover shadow-glow transition-all hover:scale-105 active:scale-95 backdrop-blur-sm pointer-events-auto"
                                >
                                    {isReplay ? "Quitter" : "Entrer"}
                                    <ChevronRight size={20} />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
