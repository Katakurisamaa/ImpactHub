"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Tenant } from "@/types";
import LoginForm from "@/components/auth/LoginForm";
import MemberDashboard from "@/components/dashboard/MemberDashboard";
import WelcomeVideo from "@/components/ui/WelcomeVideo";
import { useParams } from "next/navigation";

export default function CampusPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showVideo, setShowVideo] = useState(false);
    const [isReplay, setIsReplay] = useState(false);

    useEffect(() => {
        async function init() {
            try {
                const { data } = await supabase
                    .from("tenants")
                    .select("*")
                    .eq("slug", slug)
                    .single();

                if (data) setTenant(data);

                const stored = localStorage.getItem(`impact_member_${slug}`);
                if (stored) {
                    setIsAuthenticated(true);
                    const videoSeen = localStorage.getItem(`impact_video_seen_${slug}`);
                    if (!videoSeen) setShowVideo(true);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        init();
    }, [slug]);

    const handleLogin = () => {
        setIsAuthenticated(true);
        setShowVideo(true);
    };

    const handleVideoComplete = () => {
        setShowVideo(false);
        setIsReplay(false);
        localStorage.setItem(`impact_video_seen_${slug}`, "true");
    };

    const handleReplay = () => {
        setIsReplay(true);
        setShowVideo(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading) return <div className="flex h-screen items-center justify-center text-gold">Chargement...</div>;
    if (!tenant) return <div className="text-white">Campus introuvable</div>;

    return (
        <main className="min-h-screen py-10 px-4">
            {showVideo && <WelcomeVideo onComplete={handleVideoComplete} isReplay={isReplay} />}
            {isAuthenticated ? (
                <MemberDashboard tenant={tenant} onReplayVideo={handleReplay} />
            ) : (
                <div className="flex h-[80vh] items-center justify-center">
                    <LoginForm tenant={tenant} onLogin={handleLogin} />
                </div>
            )}
        </main>
    );
}
