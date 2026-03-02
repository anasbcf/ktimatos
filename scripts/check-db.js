
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
    console.log("🔍 Checking Database Status...");

    const { data: profiles, error: pError } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(5);
    if (pError) console.error("Profiles Error:", pError);
    else console.log("Recent Profiles:", profiles.map(p => ({ id: p.id, name: p.full_name, org: p.org_id })));

    const { data: orgs, error: oError } = await supabase.from('organizations').select('*').order('created_at', { ascending: false }).limit(5);
    if (oError) console.error("Orgs Error:", oError);
    else console.log("Recent Organizations:", orgs.map(o => ({ id: o.id, name: o.name })));

    const { data: props, error: prError } = await supabase.from('properties').select('*').order('created_at', { ascending: false }).limit(5);
    if (prError) console.error("Properties Error:", prError);
    else console.log("Recent Properties:", props.length, props.map(p => ({ id: p.id, url: p.external_source_url })));

    // WRITE TEST (Proof of Life)
    const testId = '11111111-1111-1111-1111-111111111111';
    console.log("📝 Attempting WRITE test (Service Role)...");
    const { error: writeError } = await supabase.from('organizations').upsert({
        id: testId,
        name: 'Connection Test',
        billing_status: 'test'
    });

    if (writeError) {
        console.error("❌ WRITE FAILED:", writeError.message);
    } else {
        console.log("✅ WRITE SUCCESS! Database is CONNECTED and WRITABLE (Admin).");
        // Cleanup
        await supabase.from('organizations').delete().eq('id', testId);
    }
}

check();
