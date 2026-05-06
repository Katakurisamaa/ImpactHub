"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Loader2, Plus, Trash2, Building, Mail, Link as LinkIcon, AlertCircle, Key, UserCog } from "lucide-react";
import BottomSheet from "@/components/ui/BottomSheet";
import Link from "next/link";

type Tenant = {
    id: string;
    name: string;
    slug: string;
    church_code: string;
    created_at: string;
};

const slugify = (text: string) => {
    return text
        .toString()
        .normalize('NFD')                   // split accented characters into their base characters and diacritical marks
        .replace(/[\u0300-\u036f]/g, '')   // remove all the accents, which happen to be all in the \u03xx UNICODE block.
        .trim()                            // trim leading or trailing whitespace
        .toLowerCase()                     // convert to lowercase
        .replace(/[^a-z0-9 -]/g, '')       // remove non-alphanumeric characters
        .replace(/\s+/g, '-')              // replace spaces with hyphens
        .replace(/-+/g, '-');              // remove consecutive hyphens
};

const generateChurchCode = (name: string) => {
    // Take first 3 letters of each word, up to 10 chars, uppercase
    return name
        .split(/\s+/)
        .map(word => word.substring(0, 3).toUpperCase())
        .join('')
        .substring(0, 10);
};

export default function TenantsPage() {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    // Manage Manager State
    const [isManaging, setIsManaging] = useState<Tenant | null>(null);
    const [updateManagerEmail, setUpdateManagerEmail] = useState("");
    const [updateSecretWord, setUpdateSecretWord] = useState("");
    const [updateStatus, setUpdateStatus] = useState("");

    // New Tenant Form
    const [newName, setNewName] = useState("");
    const [newSlug, setNewSlug] = useState("");
    const [newChurchCode, setNewChurchCode] = useState("");
    const [managerEmail, setManagerEmail] = useState("");
    const [secretWord, setSecretWord] = useState("");
    const [createStatus, setCreateStatus] = useState("");
    const [currentIsRoot, setCurrentIsRoot] = useState(false);

    const fetchTenants = async () => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            // Check if current user is Root
            const { data: adminData } = await supabase
                .from('super_admins')
                .select('promoted_by')
                .eq('user_id', session.user.id)
                .maybeSingle();

            const isRoot = adminData?.promoted_by === null;
            setCurrentIsRoot(isRoot);

            // Fetch Tenants
            const query = supabase.from('tenants').select('*');

            // If not Root, filter by created_by
            if (!isRoot) {
                query.eq('created_by', session.user.id);
            }

            const { data } = await query.order('created_at', { ascending: false });
            if (data) setTenants(data);
        } catch (error) {
            console.error("Error fetching tenants:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleNameChange = (name: string) => {
        setNewName(name);
        setNewSlug(slugify(name));
    };

    useEffect(() => {
        fetchTenants();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreateStatus("creating_tenant");

        try {
            const { data: { user } } = await supabase.auth.getUser();
            const res = await fetch('/api/admin/create-tenant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newName,
                    slug: newSlug,
                    churchCode: newChurchCode,
                    managerEmail: managerEmail,
                    secretWord: secretWord,
                    creatorId: user?.id
                })
            });

            let data;
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                data = await res.json();
            } else {
                const text = await res.text();
                throw new Error("Server Error (Not JSON): " + text.substring(0, 50));
            }

            if (!res.ok) {
                setCreateStatus("error: " + (data.error || "Unknown error"));
                return;
            }

            setCreateStatus("success");
            setNewName("");
            setNewSlug("");
            setNewChurchCode("");
            setManagerEmail("");
            setSecretWord("");
            fetchTenants();
            setTimeout(() => setIsCreating(false), 2000); // Close after delay
        } catch (err: any) {
            setCreateStatus("error: " + err.message);
        }
    };

    const handleUpdateManager = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isManaging) return;
        setUpdateStatus("updating");

        try {
            const { data: { user } } = await supabase.auth.getUser();
            const res = await fetch('/api/admin/update-tenant-manager', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tenantId: isManaging.id,
                    managerEmail: updateManagerEmail,
                    secretWord: updateSecretWord,
                    creatorId: user?.id
                })
            });

            let data;
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                data = await res.json();
            } else {
                const text = await res.text();
                throw new Error("Server Error: " + text.substring(0, 50));
            }

            if (!res.ok) {
                setUpdateStatus("error: " + (data.error || "Unknown error"));
                return;
            }

            setUpdateStatus("success");
            setUpdateManagerEmail("");
            setUpdateSecretWord("");
            setTimeout(() => {
                setIsManaging(null);
                setUpdateStatus("");
            }, 2000);
        } catch (err: any) {
            setUpdateStatus("error: " + err.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Attention: Cela supprimera tout (Membres, Demandes, etc). Continuer ?")) return;

        const { error } = await supabase.from('tenants').delete().eq('id', id);
        if (error) alert("Erreur: " + error.message);
        else fetchTenants();
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <div className="p-4 md:p-8 pb-24 md:pb-8">
            <div className="flex justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">Églises & Managers</h1>
                    <p className="text-muted-foreground mt-1 flex flex-wrap items-center gap-2">
                        {currentIsRoot
                            ? "Gérez l'ensemble des campus de l'écosystème."
                            : "Gérez les églises que vous avez créées."}
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${currentIsRoot
                            ? 'bg-success/10 text-success border-success/20'
                            : 'bg-primary/10 text-primary border-primary/20'
                            }`}>
                            {currentIsRoot ? "Vue Globale" : "Vue Restreinte"}
                        </span>
                    </p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-bold hover:bg-primary/90 shadow-glow transition shrink-0"
                >
                    <Plus size={20} /> <span className="hidden sm:inline">Nouvelle Église</span><span className="sm:hidden">Ajouter</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tenants.map((tenant) => (
                    <div key={tenant.id} className="relative group">
                        <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-xl group-hover:bg-primary/10 transition duration-500" />
                        <div className="relative p-6 rounded-2xl bg-surface border border-white/5 group-hover:border-primary/50 transition cursor-pointer">

                            {/* Header: Icon + Title + Actions */}
                            <div className="flex justify-between items-start mb-4">
                                <Link href={`/admin/super/tenants/${tenant.id}`} className="flex items-start gap-4 hover:opacity-80 transition w-full">
                                    <div className="p-3 rounded-xl bg-primary/20 text-primary">
                                        <Building size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-foreground leading-tight">{tenant.name}</h3>
                                        <p className="text-muted-foreground font-mono text-sm">/{tenant.slug}</p>
                                    </div>
                                </Link>

                                <div className="flex flex-col items-end gap-2 ml-4">
                                    <div className="flex gap-1">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setIsManaging(tenant); }}
                                            className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-primary transition"
                                            title="Changer Manager"
                                        >
                                            <UserCog size={18} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDelete(tenant.id); }}
                                            className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-error transition"
                                            title="Supprimer"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    {tenant.church_code && (
                                        <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded font-mono border border-primary/20 whitespace-nowrap">
                                            {tenant.church_code}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2 pt-4 border-t border-white/5 text-xs text-muted-foreground flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <LinkIcon size={12} />
                                    <span className="font-mono">ID: {tenant.id.substring(0, 8)}...</span>
                                </div>
                                <Link
                                    href={`/admin/super/tenants/${tenant.id}`}
                                    className="text-primary hover:underline flex items-center gap-1"
                                >
                                    Voir Détails &rarr;
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* CREATE MODAL */}
            <BottomSheet
                isOpen={isCreating}
                onClose={() => setIsCreating(false)}
                title="Nouvelle Église + Manager"
            >
                <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                        <label className="block text-sm text-muted-foreground mb-1">Nom de l'église</label>
                        <input
                            type="text"
                            required
                            placeholder="Impact Centre Chrétien..."
                            value={newName}
                            onChange={e => handleNameChange(e.target.value)}
                            className="w-full bg-surface-highlight border border-white/10 rounded-xl p-3 text-foreground focus:border-primary outline-none transition"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-muted-foreground mb-1">Slug (URL)</label>
                            <input
                                type="text"
                                required
                                readOnly
                                placeholder="paris"
                                value={newSlug}
                                className="w-full bg-surface-highlight/50 border border-white/5 rounded-xl p-3 text-muted-foreground outline-none cursor-not-allowed font-mono text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-muted-foreground mb-1">Code Église</label>
                            <input
                                type="text"
                                required
                                placeholder="PARIS75"
                                value={newChurchCode}
                                onChange={e => setNewChurchCode(e.target.value.toUpperCase().replace(/\s+/g, ''))}
                                className="w-full bg-surface-highlight border border-white/10 rounded-xl p-3 text-foreground focus:border-primary outline-none font-mono transition"
                            />
                        </div>
                    </div>

                    <div className="border-t border-white/10 my-4 pt-4">
                        <p className="text-primary text-sm font-bold mb-3 flex items-center gap-2">
                            <Key size={16} /> Compte Manager
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-muted-foreground mb-1">Email Manager</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="manager@eglise.com"
                                    value={managerEmail}
                                    onChange={e => setManagerEmail(e.target.value)}
                                    className="w-full bg-surface-highlight border border-white/10 rounded-xl p-3 text-foreground focus:border-primary outline-none transition"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-muted-foreground mb-1">Mot Secret</label>
                                <div className="flex flex-col">
                                    <input
                                        type="text"
                                        required
                                        placeholder="jesus"
                                        value={secretWord}
                                        onChange={e => setSecretWord(e.target.value)}
                                        className="w-full bg-surface-highlight border border-white/10 rounded-xl p-3 text-foreground focus:border-primary outline-none transition"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Mot de passe final : <span className="text-primary font-mono">{newChurchCode || 'CODE'}{secretWord || 'SECRET'}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={createStatus === 'creating_tenant'}
                        className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:bg-primary/90 shadow-glow transition flex justify-center"
                    >
                        {createStatus === 'creating_tenant' ? <Loader2 className="animate-spin" /> : "Créer l'église & Manager"}
                    </button>

                    {createStatus === 'success' && (
                        <div className="p-3 bg-success/20 text-success rounded-xl text-center text-sm border border-success/20">
                            Succès ! Le compte manager a été créé.
                        </div>
                    )}
                    {createStatus.startsWith('error') && <p className="text-error text-xs text-center">{createStatus}</p>}
                </form>
            </BottomSheet>

            {/* UPDATE MANAGER MODAL */}
            <BottomSheet
                isOpen={!!isManaging}
                onClose={() => { setIsManaging(null); setUpdateStatus(""); }}
                title={`Manager: ${isManaging?.name}`}
            >
                <form onSubmit={handleUpdateManager} className="space-y-4 pb-8">
                    <div className="bg-orange-500/10 p-3 rounded-xl flex gap-3 items-start mb-4 border border-orange-500/20">
                        <AlertCircle className="text-orange-400 shrink-0 mt-0.5" size={16} />
                        <p className="text-xs text-orange-200">
                            Attention: Cette action va <b>révoquer l'accès</b> de l'ancien manager et créer/lier ce nouveau compte.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm text-muted-foreground mb-1">Nouveau Email Manager</label>
                        <input
                            type="email"
                            required
                            placeholder="nouveau.manager@eglise.com"
                            value={updateManagerEmail}
                            onChange={e => setUpdateManagerEmail(e.target.value)}
                            className="w-full bg-surface-highlight border border-white/10 rounded-xl p-3 text-foreground focus:border-primary outline-none transition"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-muted-foreground mb-1">Nouveau Mot Secret</label>
                        <div className="flex flex-col">
                            <input
                                type="text"
                                required
                                placeholder="secret"
                                value={updateSecretWord}
                                onChange={e => setUpdateSecretWord(e.target.value)}
                                className="w-full bg-surface-highlight border border-white/10 rounded-xl p-3 text-foreground focus:border-primary outline-none transition"
                            />
                            {isManaging?.church_code && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    Nouveau mot de passe : <span className="text-primary font-mono">{isManaging.church_code}{updateSecretWord || 'SECRET'}</span>
                                </p>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={updateStatus === 'updating'}
                        className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:bg-primary/90 shadow-glow transition flex justify-center"
                    >
                        {updateStatus === 'updating' ? <Loader2 className="animate-spin" /> : "Remplacer le Manager"}
                    </button>

                    {updateStatus === 'success' && (
                        <div className="p-3 bg-success/20 text-success rounded-xl text-center text-sm border border-success/20">
                            Manager mis à jour avec succès !
                        </div>
                    )}
                    {updateStatus.startsWith('error') && <p className="text-error text-xs text-center">{updateStatus}</p>}
                </form>
            </BottomSheet>
        </div>
    );
}
