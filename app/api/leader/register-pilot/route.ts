import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        return NextResponse.json({ error: 'Server Configuration Error' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    });

    try {
        const body = await request.json();
        const { email, password, fullName, phone, tenantId } = body;

        if (!email || !password || !fullName || !tenantId) {
            return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
        }

        // Verify tenant exists (campus validation)
        const { data: tenant, error: tenantError } = await supabaseAdmin
            .from('tenants')
            .select('id, name')
            .eq('id', tenantId)
            .single();

        if (tenantError || !tenant) {
            return NextResponse.json({ error: 'Campus invalide ou introuvable' }, { status: 400 });
        }

        // Create user in Supabase Auth
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: fullName }
        });

        if (userError) {
            if (userError.message.includes("already registered")) {
                return NextResponse.json({ error: "Cet email est déjà utilisé." }, { status: 400 });
            }
            return NextResponse.json({ error: "Erreur création compte: " + userError.message }, { status: 500 });
        }

        const newUserId = userData.user.id;

        // Create module_leaders entry tied to this tenant (campus)
        const { error: insertError } = await supabaseAdmin
            .from('module_leaders')
            .insert({
                user_id: newUserId,
                tenant_id: tenantId,
                module_key: 'home_cells_pilot',
                full_name: fullName,
                civility: 'M.',
                phone: phone || '',
                is_active: true
            });

        if (insertError) {
            return NextResponse.json({ error: "Erreur assignation rôle: " + insertError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, userId: newUserId, campusName: tenant.name });

    } catch (err: any) {
        console.error("API Register Pilot Error:", err);
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
    }
}
