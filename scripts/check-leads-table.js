const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkLeadsTable() {
    const { data, error } = await supabase
        .from('leads')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error fetching from leads:', error);
    } else {
        console.log('Success! Table "leads" exists and is accessible.');
        console.log('Columns found:', data.length > 0 ? Object.keys(data[0]) : 'No data yet.');
    }
}

checkLeadsTable();
