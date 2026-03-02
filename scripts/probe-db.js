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

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function testInsert() {
    console.log('[Test] Attempting to insert a dummy lead...');
    try {
        const { data, error } = await supabase
            .from('saas_leads')
            .insert({
                full_name: 'Test Setup',
                email: `test_setup_${Date.now()}@example.com`,
                agency_name: 'Test Agency',
                agents_count: '1-5',
                language: 'English',
                phone: `+357000${Date.now().toString().slice(-6)}`,
                status: 'pending',
                call_status: 'pending'
            })
            .select()
            .single();

        if (error) {
            console.error('❌ Insertion failed:', JSON.stringify(error, null, 2));
        } else {
            console.log('✅ Insertion successful:', data.id);

            // Cleanup
            await supabase.from('saas_leads').delete().eq('id', data.id);
        }
    } catch (e) {
        console.error('Exception during insert:', e);
    }
}

testInsert();
