const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function wipeAuthUsers() {
    console.log("Analyzing Auth Users to wipe...");

    // 1. Fetch Super Admins from Profiles
    const { data: superAdmins } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('role', 'super_admin');

    const adminIds = superAdmins?.map(sa => sa.id).filter(Boolean) || [];
    const adminEmails = superAdmins?.map(sa => sa.email).filter(Boolean) || [];

    // Hardcode the known super admin email just in case profiles are wiped
    if (!adminEmails.includes('anasbcf@gmail.com')) {
        adminEmails.push('anasbcf@gmail.com');
    }

    console.log(`Protected Super Admin IDs:`, adminIds);
    console.log(`Protected Super Admin Emails:`, adminEmails);

    // 2. Fetch all Auth Users
    let allUsers = [];
    let hasMore = true;
    let page = 1;

    while (hasMore) {
        const { data, error } = await supabase.auth.admin.listUsers({
            page: page,
            perPage: 100
        });

        if (error) {
            console.error("Error fetching auth users:", error);
            break;
        }

        if (data && data.users && data.users.length > 0) {
            allUsers = allUsers.concat(data.users);
            page++;
        } else {
            hasMore = false;
        }
    }

    console.log(`Found ${allUsers.length} total Auth users.`);

    let deletedCount = 0;
    for (const user of allUsers) {
        if (!adminIds.includes(user.id) && !adminEmails.includes(user.email)) {
            console.log(`Deleting Auth User: ${user.email} (${user.id})`);
            const { error } = await supabase.auth.admin.deleteUser(user.id);
            if (error) {
                console.error(`Failed to delete user ${user.email}:`, error);
            } else {
                deletedCount++;
            }
        } else {
            console.log(`[SAFEGUARDED] Skipping Super Admin: ${user.email}`);
        }
    }

    console.log(`✅ Successfully deleted ${deletedCount} Auth users.`);
}

wipeAuthUsers();
