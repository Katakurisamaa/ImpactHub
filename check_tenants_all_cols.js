const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

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

async function checkTenantsColumns() {
    console.log("Fetching one row from tenants to see all columns...");
    try {
        const { data, error } = await supabase
            .from('tenants')
            .select('*')
            .limit(1);

        if (error) {
            console.error("Error:", error.message);
        } else if (data && data.length > 0) {
            console.log("Available Columns:", Object.keys(data[0]).join(', '));
            console.log("Full Sample Data:", JSON.stringify(data[0], null, 2));
        } else {
            console.log("No tenants found.");
        }
    } catch (e) {
        console.error("Catch error:", e.message);
    }
}

checkTenantsColumns();
