import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export default function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
    const [mounted, setMounted] = useState(false);
    const [content, setContent] = useState({ title, children });

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isOpen) {
            setContent({ title, children });
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
            document.body.style.pointerEvents = "";
        }
        return () => {
            document.body.style.overflow = "";
            document.body.style.pointerEvents = "";
        };
    }, [isOpen, title, children]);

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="backdrop"
                    initial={{ opacity: 0, pointerEvents: "none" }}
                    animate={{ opacity: 1, pointerEvents: "auto" }}
                    exit={{ opacity: 0, pointerEvents: "none" }}
                    transition={{ duration: 0.2 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
                />
            )}
            {isOpen && (
                <motion.div
                    key="sheet"
                    initial={{ opacity: 0, scale: 0.95, y: "-50%", x: "-50%", pointerEvents: "none" }}
                    animate={{ opacity: 1, scale: 1, y: "-50%", x: "-50%", pointerEvents: "auto" }}
                    exit={{ opacity: 0, scale: 0.95, y: "-50%", x: "-50%", pointerEvents: "none" }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="fixed top-1/2 left-1/2 z-[100] w-[calc(100%-2rem)] md:w-[600px] flex flex-col bg-surface border border-white/10 rounded-[32px] max-h-[85vh] shadow-2xl origin-center"
                >
                    {/* Header */}
                    <div className="px-6 py-4 flex items-center justify-between border-b border-white/5 bg-surface/50 backdrop-blur-md rounded-t-[32px]">
                        <h2 className="text-xl font-bold text-white">{content.title}</h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-white/10 transition text-white/60 hover:text-white"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content - Scrollable */}
                    <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 pb-6 safe-area-bottom custom-scrollbar">
                        {content.children}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}
