"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Save, Loader2, AlertCircle, ExternalLink } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export default function GroupLeaderView({ tenantId, moduleKey }: { tenantId: string; moduleKey: string }) {
    const [leader, setLeader] = useState<any>(null);
    const [whatsappLink, setWhatsappLink] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    useEffect(() => {
        async function fetchLeader() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from('module_leaders')
                .select('*')
                .eq('user_id', user.id)
                .eq('module_key', moduleKey)
                .single();

            if (data) {
                setLeader(data);
                setWhatsappLink(data.whatsapp_link || "");
            }
            setLoading(false);
        }
        fetchLeader();
    }, [moduleKey]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setStatus(null);

        try {
            const { error } = await supabase
                .from('module_leaders')
                .update({
                    whatsapp_link: whatsappLink
                })
                .eq('id', leader.id);

            if (error) throw error;
            setStatus({ type: 'success', message: "Lien WhatsApp mis à jour avec succès !" });
        } catch (err: any) {
            setStatus({ type: 'error', message: err.message || "Une erreur est survenue" });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" size={32} /></div>;

    if (!leader) return <div className="text-white/40 text-center py-20 border border-dashed border-white/10 rounded-3xl">Responsable non trouvé.</div>;

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="bg-surface border border-white/5 rounded-3xl p-8 shadow-card overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent-success/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />

                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <MessageCircle className="text-accent-success" size={28} />
                    Gestion du lien WhatsApp
                </h2>

                <p className="text-white/60 mb-8">
                    Le lien que vous saisissez ici sera visible par tous les membres de votre campus.
                    Ils pourront l'utiliser pour rejoindre directement votre groupe.
                </p>

                <form onSubmit={handleSave} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Lien du Groupe WhatsApp</label>
                        <div className="relative group">
                            <input
                                type="url"
                                value={whatsappLink}
                                onChange={(e) => setWhatsappLink(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 pl-12 text-white focus:border-accent-success outline-none transition-all placeholder:text-white/10"
                                placeholder="https://chat.whatsapp.com/..."
                            />
                            <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-accent-success transition-colors" size={20} />
                        </div>
                        {whatsappLink === "" && (
                            <p className="text-[10px] text-red-400/60 ml-1 italic">
                                * L'absence de lien désactivera l'accès pour les membres.
                            </p>
                        )}
                    </div>

                    {whatsappLink && (
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group overflow-hidden">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <ExternalLink size={16} className="text-white/40 shrink-0" />
                                <span className="text-sm text-white/60 truncate">{whatsappLink}</span>
                            </div>
                            <a
                                href={whatsappLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-bold text-accent-success hover:underline shrink-0 ml-4"
                            >
                                Tester le lien
                            </a>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full py-4 rounded-2xl bg-accent-success text-white font-bold flex items-center justify-center gap-2 transition hover:opacity-90 shadow-glow disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
                    >
                        {saving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Enregistrer le lien</>}
                    </button>

                    {status && (
                        <div className={`p-4 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${status.type === 'success' ? 'bg-accent-success/10 text-accent-success border border-accent-success/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                            {status.type === 'error' && <AlertCircle size={20} className="shrink-0 mt-0.5" />}
                            <p className="text-sm font-medium">{status.message}</p>
                        </div>
                    )}
                </form>
            </div>

            <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10">
                <h4 className="text-white font-bold mb-2 flex items-center gap-2 text-sm">
                    <AlertCircle size={16} className="text-primary" />
                    Conseil
                </h4>
                <p className="text-xs text-white/40 leading-relaxed">
                    Assurez-vous que le lien est bien un lien "d'invitation au groupe" généré officiellement par WhatsApp pour qu'il fonctionne correctement sur tous les appareils des membres.
                </p>
            </div>
        </div >
    );
}
