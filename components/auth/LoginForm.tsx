"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Tenant } from "@/types";

export default function LoginForm({ tenant, onLogin }: { tenant: Tenant; onLogin: () => void }) {
    const router = useRouter();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [churchCode, setChurchCode] = useState("");
    const [error, setError] = useState("");

    const handleLogin = () => {
        if (churchCode !== tenant.church_code) {
            setError("Code église incorrect");
            return;
        }

        if (!firstName || !lastName) {
            setError("Veuillez remplir tous les champs");
            return;
        }

        // Save to LocalStorage
        const memberData = {
            firstName,
            lastName,
            tenantId: tenant.id,
            loggedInAt: new Date().toISOString(),
        };
        localStorage.setItem(`impact_member_${tenant.slug}`, JSON.stringify(memberData));

        // Update parent state directly
        onLogin();
        router.refresh();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full mx-auto p-8 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl relative"
        >
            <Link href="/" className="absolute top-6 left-6 p-2 rounded-full text-muted-foreground hover:text-white hover:bg-white/10 transition">
                <ArrowLeft size={20} />
            </Link>
            <h2 className="text-2xl font-bold text-center mb-6 text-foreground">
                Bienvenue à {tenant.name}
            </h2>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1 text-muted-foreground">Prénom</label>
                    <input
                        type="text"
                        className="w-full p-3 rounded-xl bg-surface border border-white/5 focus:border-primary outline-none transition text-foreground placeholder-muted-foreground"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 text-muted-foreground">Nom</label>
                    <input
                        type="text"
                        className="w-full p-3 rounded-xl bg-surface border border-white/5 focus:border-primary outline-none transition text-foreground placeholder-muted-foreground"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 text-muted-foreground">Code Église</label>
                    <input
                        type="password"
                        className="w-full p-3 rounded-xl bg-surface border border-white/5 focus:border-primary outline-none transition text-foreground placeholder-muted-foreground"
                        value={churchCode}
                        onChange={(e) => setChurchCode(e.target.value)}
                    />
                </div>

                {error && <p className="text-accent-error text-sm text-center">{error}</p>}

                <button
                    onClick={handleLogin}
                    className="w-full py-3 mt-4 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary-hover shadow-glow transition transform active:scale-95"
                >
                    Entrer
                </button>
            </div>
        </motion.div>
    );
}
