
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const env = {};
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        if (value.startsWith('"') && value.endsWith('"')) {
            value = value.slice(1, -1);
        }
        env[key] = value;
    }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

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
const tempPassword = 'ImpactHub!2025';

async function assignSuperAdmin(userId) {
    const { error: insertError } = await supabase
        .from('super_admins')
        .insert([{ user_id: userId }])
        .select();

    if (insertError) {
        if (insertError.code === '23505') {
            console.log('Success! User is ALREADY a Super Admin.');
        } else {
            console.error('Error inserting into super_admins:', insertError);
        }
    } else {
        console.log('Success! User has been granted Super Admin privileges.');
    }
}

async function makeSuperAdmin() {
    console.log(`Looking up user: ${targetEmail}...`);

    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
        console.error('Error listing users:', listError);
        return;
    }

    let user = users.find(u => u.email === targetEmail);

    if (!user) {
        console.log(`User not found. Creating user ${targetEmail}...`);

        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            email: targetEmail,
            password: tempPassword,
            email_confirm: true
        });

        if (createError) {
            console.error('Error creating user:', createError);
            return;
        }

        console.log(`User created successfully! ID: ${newUser.user.id}`);
        console.log(`Temporary Password: ${tempPassword}`);
        user = newUser.user;
    } else {
        console.log(`Found user ID: ${user.id}`);
    }

    await assignSuperAdmin(user.id);
}

makeSuperAdmin();
