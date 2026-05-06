import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function DELETE(request: Request) {
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
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')
        const userId = searchParams.get('userId')

        if (!id) {
            return NextResponse.json({ error: 'Missing leader ID' }, { status: 400 })
        }

        // Delete from module_leaders
        const { error: deleteError } = await supabaseAdmin
            .from('module_leaders')
            .delete()
            .eq('id', id);

        if (deleteError) {
            return NextResponse.json({ error: "Erreur lors de la suppression: " + deleteError.message }, { status: 500 })
        }

        // Delete user auth account if available
        if (userId) {
            await supabaseAdmin.auth.admin.deleteUser(userId);
        }

        return NextResponse.json({ success: true })

    } catch (err: any) {
        console.error("API Delete Leader Error:", err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
