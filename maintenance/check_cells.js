const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkCells() {
  const { data, error } = await supabase.from('home_cells').select('*');
  if (error) {
    console.error("Error:", error);
  } else {
    fs.writeFileSync('cells_dump.json', JSON.stringify(data, null, 2));
    console.log("Saved to cells_dump.json");
  }
}

checkCells();
