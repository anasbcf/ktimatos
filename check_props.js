require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function check() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { data: cols, error } = await supabase.rpc('get_table_columns', { table_name: 'properties' });
    if (error) {
        const { data } = await supabase.from('properties').select('*').limit(1);
        console.log("Cols:", data && data[0] ? Object.keys(data[0]) : "No data to infer cols");
    } else {
        console.log("Cols:", cols);
    }
}
check();
