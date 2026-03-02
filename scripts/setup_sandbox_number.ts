import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function injectPhoneNumber() {
    const cleanNumber = '17152270556'; // Telnyx Number without '+'

    console.log(`[Setup Sandbox] Injecting WhatsApp number ${cleanNumber} into the primary organization...`);

    // 1. Find the primary organization (let's assume the first one created, or named 'KtimatOS')
    const { data: orgs, error: fetchError } = await supabase
        .from('organizations')
        .select('id, name')
        .order('created_at', { ascending: true })
        .limit(1);

    if (fetchError || !orgs || orgs.length === 0) {
        console.error('Failed to find an organization. Error:', fetchError);
        process.exit(1);
    }

    const primaryOrg = orgs[0];
    console.log(`Found Primary Org: ${primaryOrg.name} (${primaryOrg.id})`);

    // 2. Update the organization with the new number
    const { error: updateError } = await supabase
        .from('organizations')
        .update({ whatsapp_business_number: cleanNumber })
        .eq('id', primaryOrg.id);

    if (updateError) {
        console.error('Failed to update organization number:', updateError);
        process.exit(1);
    }

    console.log(`✅ Successfully mapped ${cleanNumber} to ${primaryOrg.name}`);
    console.log(`The Cognitive Router is now ready to intercept Meta WhatsApp webhooks for this number.`);
}

injectPhoneNumber();
