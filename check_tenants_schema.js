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

async function checkTenantsSchema() {
    console.log("Checking tenants columns...");
    try {
        const { data, error } = await supabase
            .from('tenants')
            .select('*')
            .limit(1);

        if (error) {
            console.error("Error fetching tenants:", error.message);
        } else if (data && data.length > 0) {
            const columns = Object.keys(data[0]);
            console.log("Columns count:", columns.length);
            columns.forEach(col => console.log("COL:", col));
            console.log("Sample Data:");
            for (const [key, value] of Object.entries(data[0])) {
                console.log(`${key}: ${JSON.stringify(value)}`);
            }
        } else {
            console.log("tenants table is empty.");
        }
    } catch (e) {
        console.error("Catch error tenants:", e.message);
    }
}

checkTenantsSchema();
