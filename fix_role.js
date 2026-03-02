const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf-8');
const supabaseUrl = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const supabaseKey = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim();
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const { data: user, error: userError } = await supabase.from('profiles').select('id, role').eq('id', (await supabase.auth.admin.listUsers()).data.users.find(u => u.email === 'anasbcf@gmail.com').id).single();
    if (user) {
        await supabase.from('profiles').update({ role: 'super_admin' }).eq('id', user.id);
        console.log('Role upgraded to super_admin for anasbcf@gmail.com');
    } else {
        console.log('User not found in profiles', userError);
    }
}
run();
