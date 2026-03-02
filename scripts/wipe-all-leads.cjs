const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function wipeLeads() {
    console.log("Wiping all saas_leads...");
    const { error } = await supabase.from('saas_leads').delete().not('id', 'is', null);
    if (error) {
        console.error("Error deleting saas_leads:", error);
    } else {
        console.log("✅ All saas_leads wiped.");
    }
}

wipeLeads();
