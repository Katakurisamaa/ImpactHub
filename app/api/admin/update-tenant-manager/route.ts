import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        return NextResponse.json({ error: 'Server Configuration Error: Missing Service Key' }, { status: 500 });
    }

    const supabaseAdmin = createClient(
        supabaseUrl,
        supabaseServiceKey,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );

    try {
        // 1. SKIP AUTH CHECK (MVP matching create-tenant)
        // Ensure callers are trusted or add proper middleware check later.

        // 2. Parse Body
        const body = await request.json()
        const { tenantId, managerEmail, secretWord, creatorId } = body

        if (!tenantId || !managerEmail || !secretWord) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
        }

        // 3. Get Tenant for Church Code
        const { data: tenant, error: tenantError } = await supabaseAdmin
            .from('tenants')
            .select('church_code, slug')
            .eq('id', tenantId)
            .single();

        if (tenantError || !tenant) {
            return NextResponse.json({ error: "Tenant not found" }, { status: 404 })
        }

        const churchCode = tenant.church_code;
        if (!churchCode) {
            return NextResponse.json({ error: "Tenant has no Church Code defined. Cannot generate password." }, { status: 400 })
        }

        // 4. Create/Get Manager User
        const password = `${churchCode}${secretWord}`

        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
            email: managerEmail,
            password: password,
            email_confirm: true
        })

        if (userError) {
            return NextResponse.json({ error: "User creation failed: " + userError.message }, { status: 500 })
        }

        const userId = userData.user.id

        // 5. Unlink OLD Admins
        const { error: deleteError } = await supabaseAdmin
            .from('tenant_admins')
            .delete()
            .eq('tenant_id', tenantId);

        if (deleteError) {
            return NextResponse.json({ error: "Failed to remove old manager: " + deleteError.message }, { status: 500 })
        }

        // 6. Link NEW Admin
        const { error: linkError } = await supabaseAdmin
            .from('tenant_admins')
            .insert({
                tenant_id: tenantId,
                user_id: userId,
                created_by: creatorId
            })

        if (linkError) {
            return NextResponse.json({ error: "Link admin failed: " + linkError.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, userId })

    } catch (err: any) {
        console.error("API Error:", err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
