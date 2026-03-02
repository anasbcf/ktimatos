const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function wipeData() {
    console.log("Analyzing data to wipe (Pass 2)...");

    // 1. Fetch Super Admins to protect them
    const { data: superAdmins } = await supabase
        .from('profiles')
        .select('id, org_id')
        .eq('role', 'super_admin');

    const adminIds = superAdmins?.map(sa => sa.id).filter(Boolean) || [];
    const masterOrgIds = superAdmins?.map(sa => sa.org_id).filter(Boolean) || [];

    console.log(`Protected Super Admin IDs:`, adminIds);
    console.log(`Protected Master Org IDs:`, masterOrgIds);

    // 4. Delete Profiles (except Super Admins)
    if (adminIds.length > 0) {
        const { error: pError } = await supabase
            .from('profiles')
            .delete()
            .not('id', 'in', `(${adminIds.join(',')})`);
        if (pError) console.error("Error deleting profiles:", pError);
        else console.log("✅ Agency Profiles wiped (Super Admin safeguarded).");
    } else {
        await supabase.from('profiles').delete().not('id', 'is', null);
        console.log("✅ All Profiles wiped (no super admins found).");
    }

    // 5. Delete Organizations (except Master Orgs)
    if (masterOrgIds.length > 0) {
        const { error: oError } = await supabase
            .from('organizations')
            .delete()
            .not('id', 'in', `(${masterOrgIds.join(',')})`);
        if (oError) console.error("Error deleting organizations:", oError);
        else console.log("✅ Agency Organizations wiped.");
    } else {
        const { error: oError } = await supabase.from('organizations').delete().not('id', 'is', null);
        if (oError) console.error("Error deleting organizations:", oError);
        else console.log("✅ All Organizations completely wiped.");
    }

    console.log("🧼 Pass 2 Wipe complete!");
}

wipeData();
