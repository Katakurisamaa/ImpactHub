import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const moduleKey = searchParams.get('moduleKey');

    if (!tenantId || !moduleKey) {
        return NextResponse.json({ error: 'Missing tenantId or moduleKey' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        return NextResponse.json({ error: 'Server Configuration Error' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    try {
        // 1. Fetch Module Info (Global Link set by Manager)
        const { data: moduleData } = await supabaseAdmin
            .from('tenant_modules')
            .select('is_active, whatsapp_link')
            .eq('tenant_id', tenantId)
            .eq('module_key', moduleKey)
            .maybeSingle();

        // 2. Fetch Leader info if exists
        const { data: leaderData } = await supabaseAdmin
            .from('module_leaders')
            .select('full_name, phone, whatsapp_link, is_active')
            .eq('tenant_id', tenantId)
            .eq('module_key', moduleKey)
            .maybeSingle();

        // If module is explicitly inactive in tenant_modules, return closed
        if (moduleData && !moduleData.is_active) {
            return NextResponse.json({ status: 'closed' });
        }

        const isLeaderActive = !!(leaderData && leaderData.is_active);
        const managerLink = moduleData?.whatsapp_link;

        // The module is open if there is an active leader OR a manager-set link
        if (isLeaderActive || managerLink) {
             return NextResponse.json({
                status: 'open',
                leader: {
                    full_name: isLeaderActive ? leaderData.full_name : null,
                    phone: isLeaderActive ? leaderData.phone : null,
                    session_date: managerLink || (isLeaderActive ? leaderData.whatsapp_link : null)
                }
            });
        }

        return NextResponse.json({ status: 'not_found' });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
