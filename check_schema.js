const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Simple parse of .env.local
const env = fs.readFileSync('.env.local', 'utf8')
    .split('\n')
    .reduce((acc, line) => {
        const [key, ...val] = line.split('=');
        if (key && val.length) acc[key.trim()] = val.join('=').trim();
        return acc;
    }, {});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log("Checking tenant_modules columns...");
    try {
        const { data, error } = await supabase
            .from('tenant_modules')
            .select('*')
            .limit(1);

        if (error) {
            console.error("Error fetching tenant_modules:", error.message);
        } else if (data && data.length > 0) {
            console.log("Columns in tenant_modules:", Object.keys(data[0]).join(', '));
        } else {
            console.log("tenant_modules table is empty, but accessible.");
        }
    } catch (e) {
        console.error("Catch error tenant_modules:", e.message);
    }

    console.log("\nChecking module_leaders columns...");
    try {
        const { data: data2, error: error2 } = await supabase
            .from('module_leaders')
            .select('*')
            .limit(1);

        if (error2) {
            console.error("Error fetching module_leaders:", error2.message);
        } else if (data2 && data2.length > 0) {
            console.log("Columns in module_leaders:", Object.keys(data2[0]).join(', '));
        } else {
            console.log("module_leaders table is empty, but accessible.");
        }
    } catch (e) {
        console.error("Catch error module_leaders:", e.message);
    }
}

checkSchema();
