const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function listTables() {
    const { data, error } = await supabase.rpc('get_tables');

    if (error) {
        // If RPC is not available, try a raw query via a known table if possible
        // or just try to select from likely names.
        console.log('RPC get_tables failed. Trying direct query...');
        const { data: tables, error: queryError } = await supabase
            .from('pg_tables') // Usually not accessible via Supabase client, but worth a shot for debugging
            .select('tablename')
            .eq('schemaname', 'public');

        if (queryError) {
            console.error('All methods failed. Table "marketing_leads" is definitely missing.');
        } else {
            console.log('Tables:', tables);
        }
    } else {
        console.log('Tables:', data);
    }
}

listTables();
