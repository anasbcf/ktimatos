const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function checkRLS() {
    const url = `${supabaseUrl}/rest/v1/`;
    const res = await fetch(url, { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } });

    if (!res.ok) {
        console.error('Failed to fetch OpenAPI spec', res.status, await res.text());
        return;
    }

    const text = await res.text();
    console.log('OpenAPI schema check returned. Vulnerabilities usually mean RLS is disabled on public newly created tables. The new tables are whatsapp_conversations and whatsapp_messages. Did you run ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY?');
}
checkRLS();
