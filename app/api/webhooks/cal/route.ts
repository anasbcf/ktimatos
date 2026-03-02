import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // 1. Validate payload structure (Cal.com format)
        if (!body.triggerEvent || body.triggerEvent !== 'BOOKING_CREATED') {
            return NextResponse.json({ message: 'Ignored: Not a booking created event' }, { status: 200 });
        }

        const payload = body.payload;
        if (!payload || !payload.attendees || payload.attendees.length === 0) {
            return NextResponse.json({ error: 'Invalid payload: No attendees found' }, { status: 400 });
        }

        // 2. Extract the customer's identity (email)
        const customerEmail = payload.attendees[0].email;
        const customerName = payload.attendees[0].name;

        console.log(`[Cal Webhook] Booking received for: ${customerEmail} (${customerName})`);

        // 3. Update Supabase
        const supabase = createAdminClient();

        // Find the lead by email and update to 'booked' to halt any fallback emails
        const { data, error } = await supabase
            .from('saas_leads')
            .update({ status: 'booked' })
            .eq('email', customerEmail)
            .select();

        if (error) {
            console.error('[Cal Webhook] Error updating lead status:', error);
            return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
        }

        if (data && data.length > 0) {
            console.log(`[Cal Webhook] Successfully marked lead ${customerEmail} as 'booked'. Fallback halted.`);
        } else {
            console.log(`[Cal Webhook] Warning: Lead with email ${customerEmail} not found in saas_leads.`);
        }

        return NextResponse.json({ success: true }, { status: 200 });

    } catch (error: any) {
        console.error('[Cal Webhook] Unhandled error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
