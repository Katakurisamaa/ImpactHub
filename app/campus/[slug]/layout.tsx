import { supabase } from "@/lib/supabase/client";
import { notFound } from "next/navigation";
import { Metadata } from "next";

type Props = {
    params: { slug: string };
    children: React.ReactNode;
};

// Generate Metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { data: tenant } = await supabase
        .from("tenants")
        .select("name")
        .eq("slug", params.slug)
        .single();

    return {
        title: tenant ? `${tenant.name} - ImpactHub` : "Campus Introuvable",
    };
}

export default async function CampusLayout({ params, children }: Props) {
    // Validate Tenant Existence
    const { data: tenant, error } = await supabase
        .from("tenants")
        .select("*")
        .eq("slug", params.slug)
        .single();

    if (error || !tenant) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-transparent text-foreground">
            {/* We can wrap a provider here if needed */}
            {children}
        </div>
    );
}
