
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing Supabase URL or Service Role Key in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const targetEmail = 'minkojunior400@gmail.com';

async function makeSuperAdmin() {
    console.log(`Looking up user: ${targetEmail}...`);

    // 1. Find the user ID
    // Note: auth.admin.listUsers is the way to search users with service role
    // But strictly speaking, listUsers doesn't filter by email directly in all versions, 
    // but we can assume modern lib. Actually listUsers() returns a list, simpler to just use 
    // generateLink or just brute force check? 
    // Better: create a client with the user's email? No.
    // Actually, we can just query the auth.users table if we had SQL access, but we don't via JS client easily.
    // Wait, `supabase.auth.admin.getUserByEmail(email)` exists? No.
    // We can use `listUsers` and filter? Or `supabase.auth.admin.createUser` (which fails if exists but returns ID? No).

    // Let's try `listUsers`? It might be paginated.
    // However, `supabase.rpc` to `get_user_id_by_email` (which we used in other places) might be available 
    // IF the function was defined. We removed it in the TeamManager refactor?
    // Actually, wait. We can just TRY to insert into super_admins with a subquery if we had SQL execution...
    // but here we are using the JS client.

    // Alternative: Use `supabase.auth.admin.listUsers()` 
    // It returns a page of users. If the project is new, the list is short.

    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
        console.error('Error listing users:', listError);
        return;
    }

    const user = users.find(u => u.email === targetEmail);

    if (!user) {
        console.error(`User with email ${targetEmail} NOT FOUND.`);
        console.log("Please ensure the user has signed up first.");
        return;
    }

    console.log(`Found user ID: ${user.id}`);

    // 2. Insert into super_admins
    const { error: insertError } = await supabase
        .from('super_admins')
        .insert([{ user_id: user.id }])
        .select();

    if (insertError) {
        if (insertError.code === '23505') { // Unique violation
            console.log('Success! User is ALREADY a Super Admin.');
        } else {
            console.error('Error inserting into super_admins:', insertError);
        }
    } else {
        console.log('Success! User has been granted Super Admin privileges.');
    }
}

makeSuperAdmin();
