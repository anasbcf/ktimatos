require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function verifyColumns() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    console.log("🧐 Verifying 'profiles' table columns...");

    const { data: cols, error } = await supabase.rpc('get_table_columns', { table_name: 'profiles' });

    if (error) {
        // Fallback: raw query if RPC not available
        console.log("RPC failed, trying raw select...");
        const { data, error: selError } = await supabase.from('profiles').select('*').limit(1);
        if (selError) {
            console.error("❌ Select Error:", selError.message);
        } else {
            console.log("Columns found in first row:", data[0] ? Object.keys(data[0]) : "No rows found");
        }
    } else {
        console.log("Columns found:", cols);
    }
}

verifyColumns();
