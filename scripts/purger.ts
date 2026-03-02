import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function globalPurge() {
    const emails = ['nodexaima@gmail.com', 'tniesqq@gmail.com'];
    const phone = '+35799763682';

    console.log(`[Purge] Targeting: ${emails.join(', ')} and ${phone}`);

    // Delete from saas_leads
    const { error: err1 } = await supabase
        .from('saas_leads')
        .delete()
        .or(`email.in.("${emails.join('","')}"),phone.eq.${phone}`);

    if (err1) console.error('Error in saas_leads:', err1);
    else console.log('✅ Purged from saas_leads');

    // Delete from marketing_leads (just in case)
    const { error: err2 } = await supabase
        .from('marketing_leads')
        .delete()
        .or(`email.in.("${emails.join('","')}"),phone.eq.${phone}`);

    if (err2) console.error('Error in marketing_leads:', err2);
    else console.log('✅ Purged from marketing_leads');
}

globalPurge();
