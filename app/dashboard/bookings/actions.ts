
'use server'

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import twilio from "twilio";
import { createServiceClient } from "@/lib/supabase/service";

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID || 'dummy_sid', process.env.TWILIO_AUTH_TOKEN || 'dummy_token');

export async function updateBookingStatus(bookingId: string, status: 'confirmed' | 'rejected') {
    const supabase = await createClient();
    // Verify auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    try {
        // Update Status
        const { error } = await supabase
            .from('bookings')
            .update({ status })
            .eq('id', bookingId);

        if (error) throw error;

        // If Confirmed, notify Lead via WhatsApp
        if (status === 'confirmed') {
            // Fetch Booking Details (Need lead phone and property location)
            // Use Service Client for reliable joins if RLS is tricky, but standard client should work if policy allows user to see bookings
            const adminClient = createServiceClient();

            const { data: booking } = await adminClient
                .from('bookings')
                .select('time_slot, lead_id, properties(parsed_data)')
                .eq('id', bookingId)
                .single();

            if (booking) {
                const { data: lead } = await adminClient.from('leads').select('phone').eq('id', booking.lead_id).single();

                if (lead) {
                    const props: any = booking.properties;
                    const propData = props?.parsed_data || props?.[0]?.parsed_data;
                    const location = propData?.location_area || 'the property';

                    await twilioClient.messages.create({
                        from: process.env.TWILIO_PHONE_NUMBER,
                        to: lead.phone,
                        body: `✅ Your viewing for ${booking.time_slot} at ${location} has been manually CONFIRMED by the agent.`
                    });
                }
            }
        }

        revalidatePath('/dashboard/bookings');
        return { success: true };
    } catch (e) {
        console.error("Update Booking Error", e);
        return { success: false, error: "Failed to update booking" };
    }
}
