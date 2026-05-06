import LeaderLoginForm from "@/components/auth/LeaderLoginForm";
import { Suspense } from "react";

export default function LeaderLoginPage() {
    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-black">
            {/* Background Elements */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-600/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[120px]" />

            <div className="relative z-10 w-full flex justify-center">
                <Suspense fallback={<div>Loading...</div>}>
                    <LeaderLoginForm />
                </Suspense>
            </div>
        </div>
    );
}
