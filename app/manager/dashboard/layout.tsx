"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";
import PremiumLoader from "@/components/ui/PremiumLoader";

export default function ManagerLayout({
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
                router.push("/manager/login");
            } else {
                setLoading(false);
            }
        };

        checkAuth();
    }, [router]);

    // deleted line

    if (loading) {
        return <PremiumLoader text="Chargement Manager..." />;
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            {children}
        </div>
    );
}
