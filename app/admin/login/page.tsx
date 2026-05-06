"use client";

import { GlassCard } from "@/components/ui/glass-card";
import AdminLoginForm from "@/components/auth/AdminLoginForm";

export default function AdminLoginPage() {
    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-[#020617]">
            {/* Ambient Background Glows */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 mix-blend-screen opacity-70">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#f59e0b]/10 rounded-[100%] blur-[150px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#10b981]/10 rounded-[100%] blur-[150px]" />
            </div>

            <div className="relative z-10 w-full flex justify-center">
                <AdminLoginForm />
            </div>
        </div>
    );
}
