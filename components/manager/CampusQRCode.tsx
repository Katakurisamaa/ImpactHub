"use client";

import { QrCode, Download, ExternalLink } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { useState, useEffect } from "react";

export default function CampusQRCode({ slug, tenantName }: { slug: string; tenantName?: string }) {
    const [baseUrl, setBaseUrl] = useState("");

    useEffect(() => {
        setBaseUrl(window.location.origin);
    }, []);

    if (!slug) return null;

    const campusUrl = `${baseUrl}/campus/${slug.toLowerCase()}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(campusUrl)}`;

    const handleDownload = async () => {
        try {
            const response = await fetch(qrCodeUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `QR_Code_ImpactHub_${slug}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Error downloading QR code:", error);
        }
    };

    return (
        <GlassCard className="p-8 flex flex-col items-center bg-[#0a0f1c]/80 border-white/5 hover:border-primary/30 transition-all duration-500 shadow-2xl relative overflow-hidden" glowColor="gold">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            
            <div className="w-full flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                        <QrCode className="text-primary" size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-white uppercase tracking-wider text-sm">Accès Campus</h3>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">QR CODE OFFICIEL</p>
                    </div>
                </div>
                {tenantName && (
                    <span className="text-[10px] font-black py-1 px-3 rounded-full bg-white/5 border border-white/10 text-slate-400">
                        {tenantName}
                    </span>
                )}
            </div>

            <div className="relative group mb-8">
                {/* QR Code Container */}
                <div className="p-4 bg-white rounded-3xl shadow-[0_0_50px_rgba(255,255,255,0.1)] group-hover:shadow-[0_0_70px_rgba(var(--primary-rgb),0.2)] transition-all duration-700">
                    <img 
                        src={qrCodeUrl} 
                        alt={`QR Code for ${slug}`} 
                        className="w-48 h-48 md:w-56 md:h-56"
                    />
                </div>
                
                {/* Decorative particles (CSS only) */}
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-primary/20 rounded-full blur-2xl animate-pulse" />
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-primary/10 rounded-full blur-3xl animate-pulse delay-700" />
            </div>

            <div className="w-full space-y-4">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between group/link cursor-default">
                    <div className="overflow-hidden">
                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">URL du Campus</p>
                        <p className="text-sm font-medium text-slate-300 truncate max-w-[180px]">{campusUrl}</p>
                    </div>
                    <a 
                        href={campusUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-transparent hover:border-white/10"
                    >
                        <ExternalLink size={16} />
                    </a>
                </div>

                <button
                    onClick={handleDownload}
                    className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-black text-sm flex items-center justify-center gap-3 hover:opacity-90 shadow-[0_10px_30px_rgba(var(--primary-rgb),0.3)] transition-all transform active:scale-[0.98]"
                >
                    <Download size={18} /> Télécharger le QR Code
                </button>
                
                <p className="text-center text-[10px] text-slate-500 font-medium">
                    Imprimez ce QR Code pour vos affiches, écrans géants <br /> et supports de communication.
                </p>
            </div>
        </GlassCard>
    );
}
