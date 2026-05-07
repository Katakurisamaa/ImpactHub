import { supabase } from "@/lib/supabase/client";
import { notFound } from "next/navigation";
import { Metadata } from "next";

type Props = {
    params: Promise<{ slug: string }>;
    children: React.ReactNode;
};

// Generate Metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const { data: tenant } = await supabase
        .from("tenants")
        .select("name")
        .eq("slug", slug)
        .single();

    return {
        title: tenant ? `${tenant.name} - ImpactHub` : "Campus Introuvable",
    };
}

export default async function CampusLayout({ params, children }: Props) {
    const { slug } = await params;
    // Validate Tenant Existence
    const { data: tenant, error } = await supabase
        .from("tenants")
        .select("*")
        .eq("slug", slug)
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
