const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteLead() {
    const emailToDelete = "nodexaima@gmail.com";
    console.log(`Deleting lead with email: ${emailToDelete}`);

    const { data, error } = await supabase
        .from('saas_leads')
        .delete()
        .eq('email', emailToDelete)
        .select();

    if (error) {
        console.error("Error deleting lead:", error);
    } else {
        console.log("Deleted lead successfully:", data);
    }
}

deleteLead();
