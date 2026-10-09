"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  ArrowRight, 
  Sparkles 
} from "lucide-react";

interface WelcomeVideoProps {
  onComplete: () => void;
  isReplay?: boolean;
}

export default function WelcomeVideo({ onComplete, isReplay = false }: WelcomeVideoProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [feedbackIcon, setFeedbackIcon] = useState<"play" | "pause" | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-hide controls after inactivity
  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3800);
  }, []);

  // Safe Autoplay with sound fallback
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = 0.4;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          // Fallback if browser enforces autoplay without sound
          video.muted = true;
          setIsMuted(true);
          video.play().catch(() => {});
        });
    }

    resetHideTimer();

    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, [resetHideTimer]);

  // Keyboard accessibility (Space: Play/Pause, Esc: Skip, M: Mute)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.code === "Escape") {
        e.preventDefault();
        handleClose();
      } else if (e.code === "KeyM") {
        e.preventDefault();
        toggleSound();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const handleClose = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsVisible(false);
    setTimeout(onComplete, 650);
  };

  const togglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    resetHideTimer();

    if (video.paused) {
      video.play();
      setIsPlaying(true);
      setFeedbackIcon("play");
    } else {
      video.pause();
      setIsPlaying(false);
      setFeedbackIcon("pause");
      setShowControls(true);
    }

    setTimeout(() => setFeedbackIcon(null), 600);
  };

  const toggleSound = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    resetHideTimer();
    const nextMuted = !video.muted;
    video.muted = nextMuted;
    if (!nextMuted && video.volume === 0) {
      video.volume = 0.4;
    }
    setIsMuted(nextMuted);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));

    if (videoRef.current && duration > 0) {
      videoRef.current.currentTime = pct * duration;
      setCurrentTime(pct * duration);
    }
    resetHideTimer();
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs <= 0) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ 
            opacity: 0, 
            scale: 1.04, 
            filter: "blur(12px)",
            transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } 
          }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black overflow-hidden select-none cursor-pointer"
          onClick={togglePlay}
          onMouseMove={resetHideTimer}
        >
          {/* Native Video Layer */}
          <motion.div 
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 w-full h-full"
          >
            <video
              ref={videoRef}
              src="/intro.mp4"
              autoPlay
              playsInline
              preload="auto"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => handleClose()}
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Cinematic Vignette & Letterbox Gradients */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/95 via-transparent to-black/80" />
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_transparent_45%,_rgba(0,0,0,0.7)_100%)]" />

          {/* Optical Play/Pause Feedback Ripple */}
          <AnimatePresence>
            {feedbackIcon && (
              <motion.div
                key={feedbackIcon}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.3 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="absolute z-40 pointer-events-none w-20 h-20 rounded-full bg-black/60 border border-[var(--gold)]/40 backdrop-blur-xl flex items-center justify-center shadow-[0_0_40px_rgba(212,168,67,0.3)]"
              >
                {feedbackIcon === "play" ? (
                  <Play className="w-8 h-8 text-[var(--gold-light)] fill-[var(--gold-light)] ml-1" />
                ) : (
                  <Pause className="w-8 h-8 text-[var(--gold-light)] fill-[var(--gold-light)]" />
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Top HUD: Sound Status & Skip Action */}
          <motion.div
            animate={{ opacity: showControls ? 1 : 0, y: showControls ? 0 : -10 }}
            transition={{ duration: 0.3 }}
            className="absolute top-6 left-6 right-6 z-50 flex items-center justify-between pointer-events-none"
          >
            {/* Audio Toggle Pill */}
            <button
              onClick={toggleSound}
              className="pointer-events-auto flex items-center gap-2.5 px-4 py-2 rounded-full bg-black/50 hover:bg-black/80 border border-white/10 hover:border-[var(--gold)]/40 backdrop-blur-md text-xs tracking-wider transition-all shadow-lg group active:scale-95"
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-white/60 group-hover:text-[var(--gold)]" />
                  <span className="text-white/70 group-hover:text-white font-medium">Activer le son</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-[var(--gold-light)]" />
                  <span className="text-white/90 font-medium">Son immersif</span>
                  {/* Subtle Audio Wave Bars */}
                  <span className="flex items-center gap-0.5 ml-1 h-3">
                    <span className="w-0.5 h-2 bg-[var(--gold)] rounded-full animate-pulse" />
                    <span className="w-0.5 h-3 bg-[var(--gold)] rounded-full animate-pulse delay-75" />
                    <span className="w-0.5 h-1.5 bg-[var(--gold)] rounded-full animate-pulse delay-150" />
                  </span>
                </>
              )}
            </button>

            {/* Skip Button with Circular Ring Progress */}
            <button
              onClick={handleClose}
              className="pointer-events-auto flex items-center gap-2.5 px-4 py-2 rounded-full bg-black/50 hover:bg-black/80 border border-white/10 hover:border-[var(--gold)]/50 backdrop-blur-md text-xs font-medium text-white/80 hover:text-white transition-all shadow-lg group active:scale-95"
            >
              <span>{isReplay ? "Quitter" : "Passer l'intro"}</span>
              <div className="relative w-4 h-4 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 24 24">
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    className="stroke-white/15 fill-none"
                    strokeWidth="2"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    className="stroke-[var(--gold)] fill-none transition-all duration-200"
                    strokeWidth="2"
                    strokeDasharray={56.5}
                    strokeDashoffset={56.5 - (56.5 * progressPct) / 100}
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </button>
          </motion.div>

          {/* Bottom HUD: Typography, Action Button & Interactive Timeline */}
          <div className="absolute bottom-0 inset-x-0 z-50 flex flex-col items-center px-6 pb-6 pointer-events-none">
            {/* Center Copy & Main Button */}
            <AnimatePresence>
              {showControls && (
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="flex flex-col items-center text-center gap-3 mb-8 max-w-xl"
                >
                  {/* Subtle Badge */}
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-[10px] tracking-[0.25em] uppercase text-[var(--gold-light)] font-medium">
                    <Sparkles className="w-3 h-3 text-[var(--gold)]" />
                    Impact Centre Chrétien
                  </div>

                  {/* Title in Cormorant Garamond */}
                  <h1 
                    className="text-3xl md:text-5xl font-normal tracking-wide text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    Bienvenue à la Maison
                  </h1>

                  {/* Subtitle */}
                  <p className="text-white/70 text-sm md:text-base font-light max-w-md drop-shadow">
                    Une famille pour t'accueillir, une vision pour t'inspirer.
                  </p>

                  {/* Enter Campus Primary CTA */}
                  <button
                    onClick={handleClose}
                    className="pointer-events-auto mt-3 group relative inline-flex items-center gap-3 px-8 py-3.5 rounded-full overflow-hidden border border-[var(--gold)]/50 bg-gradient-to-r from-[rgba(212,168,67,0.25)] via-[rgba(212,168,67,0.12)] to-[rgba(212,168,67,0.25)] hover:from-[rgba(212,168,67,0.4)] hover:to-[rgba(212,168,67,0.2)] text-[var(--gold-light)] text-sm font-semibold tracking-wider uppercase backdrop-blur-xl shadow-[0_0_30px_rgba(212,168,67,0.25)] hover:shadow-[0_0_45px_rgba(212,168,67,0.45)] transition-all duration-300 active:scale-95"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      {isReplay ? "Fermer la vidéo" : "Entrer dans le campus"}
                      <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                    {/* Subtle Shimmer Ray */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Interactive Timeline Bar */}
            <motion.div
              animate={{ opacity: showControls ? 1 : 0.3 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-4xl flex items-center gap-4 pointer-events-auto"
            >
              {/* Mini Play / Pause Trigger */}
              <button
                onClick={togglePlay}
                className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                title={isPlaying ? "Mettre en pause (Espace)" : "Lire (Espace)"}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              </button>

              {/* Progress Slider Track */}
              <div 
                className="flex-1 h-5 flex items-center cursor-pointer group"
                onClick={handleSeek}
              >
                <div className="w-full h-1 group-hover:h-2 bg-white/15 rounded-full overflow-hidden transition-all duration-200 relative">
                  <div
                    className="h-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-light)] rounded-full transition-all duration-100 shadow-[0_0_10px_rgba(212,168,67,0.7)]"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              {/* Timecode */}
              <div className="text-[11px] font-mono tracking-wider text-white/60 tabular-nums">
                <span>{formatTime(currentTime)}</span>
                <span className="mx-1 text-white/30">/</span>
                <span>{formatTime(duration)}</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
