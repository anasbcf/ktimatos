import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanup() {
    const phone = '+35799763682';
    const email = 'nodexaima@gmail.com';
    console.log(`[Cleanup] Removing leads with phone ${phone} or email ${email}...`);

    const { error } = await supabase
        .from('saas_leads')
        .delete()
        .or(`phone.eq.${phone},email.eq.${email}`);

    if (error) {
        console.error('Cleanup failed:', error);
    } else {
        console.log('✅ Leads removed. Ready for a fresh test.');
    }
}

cleanup();
