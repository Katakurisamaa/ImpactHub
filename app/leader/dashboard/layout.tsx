"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

export default function LeaderLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push("/leader/login");
                return;
            }

            // Verify if user is a leader
            console.log("Leader Layout: Checking leader status for user:", session.user.id);
            const { data: leader, error: leaderLayoutError } = await supabase
                .from('module_leaders')
                .select('id')
                .eq('user_id', session.user.id)
                .single();

            if (leaderLayoutError) console.error("Leader Layout Query Error:", leaderLayoutError);
            console.log("Leader Layout Result:", leader);

            if (!leader) {
                // Determine if they are manager or tenant admin to redirect appropriately or just denial?
                // For simplicity, just kick out to login.
                await supabase.auth.signOut();
                router.push("/leader/login?error=unauthorized");
            } else {
                setLoading(false);
            }
        };

        checkAuth();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            {children}
        </div>
    );
}
