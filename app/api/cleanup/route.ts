
import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { createClerkClient } from '@clerk/nextjs/server';

export async function GET() {
    const supabase = createServiceClient();
    const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

    try {
        // 1. Find Organization 'Villa Kings LTD' (Exact match from screenshot)
        // Also try 'Villa Kings' again just in case
        const { data: orgs, error: orgError } = await supabase
            .from('organizations')
            .select('id, name')
            .ilike('name', '%Villa Kings%');

        if (orgError) throw orgError;

        let deletedOrgs = [];

        if (orgs && orgs.length > 0) {
            for (const org of orgs) {
                // Delete dependent data (Profiles)
                // First get profiles to delete from Clerk if any exist that weren't caught
                const { data: profiles } = await supabase.from('profiles').select('id, calendar_token').eq('org_id', org.id);
                // Note: using calendar_token field or just relying on email if we had it. 
                // Since we don't have email easily here, we skip Clerk delete for these unless we know the email.
                // The user asked to delete 'nodexaima@gmail.com' which we did.

                // Delete Supabase Profiles (Cascade should handle this if configured, but let's be explicit)
                await supabase.from('profiles').delete().eq('org_id', org.id);

                // Delete Organization
                await supabase.from('organizations').delete().eq('id', org.id);
                deletedOrgs.push(org.name);
            }
        }

        // 2. Ensure Clerk User 'nodexaima@gmail.com' is definitely gone
        let clerkDeleted = false;
        try {
            const userList = await clerk.users.getUserList({ emailAddress: ['nodexaima@gmail.com'] });
            if (userList.data.length > 0) {
                for (const user of userList.data) {
                    await clerk.users.deleteUser(user.id);
                }
                clerkDeleted = true;
            }
        } catch (e) {
            console.error("Clerk delete error:", e);
        }

        return NextResponse.json({
            success: true,
            deletedOrganisations: deletedOrgs,
            clerkUserEnsureDeleted: clerkDeleted,
            message: "Cleanup run for Villa Kings variants"
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
