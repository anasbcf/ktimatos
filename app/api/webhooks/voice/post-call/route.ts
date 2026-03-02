import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
    try {
        // 1. Verify Webhook Secret (Security)
        const signature = req.headers.get('elevenlabs-signature');
        // TODO: In production, verify this against ELEVENLABS_WEBHOOK_SECRET

        // 2. Parse Payload
        const payload = await req.json();
        console.log('[ElevenLabs Post-Call Webhook] Received payload:', JSON.stringify(payload, null, 2));

        // The exact structure depends on ElevenLabs, but typically:
        const callId = payload.call_id || payload.conversation_id;
        const status = payload.status || 'completed'; // e.g., 'completed', 'voicemail', 'failed'
        const transcript = payload.transcript || '';
        const summary = payload.analysis?.summary || payload.summary || '';
        const duration = payload.duration_seconds || 0;

        // Custom data passed during call initiation (we passed lead_id)
        const leadId = payload.custom_data?.lead_id || payload.metadata?.custom_data?.lead_id;

        if (!leadId) {
            console.error('[ElevenLabs Webhook] Error: lead_id missing from custom_data.');
            return NextResponse.json({ error: 'Missing lead_id' }, { status: 400 });
        }

        const supabase = createAdminClient();

        // 3. Map ElevenLabs status to our DB status
        let dbStatus = 'completed';
        let isFallbackTriggered = false;

        if (status === 'voicemail' || status === 'failed' || status === 'unanswered' || duration < 10) {
            // If the call dropped immediately or hit voicemail, we mark it and trigger fallback
            dbStatus = 'voicemail'; // or 'action_required'
            isFallbackTriggered = true;
            console.log(`[ElevenLabs Webhook] Lead ${leadId} unreachable. Triggering Fallback Protocol...`);

            // TODO: Trigger Email/SMS Fallback here using Resend or Telnyx
            // await sendFallbackEmail({ email: lead.email, name: lead.full_name });
        }

        // 4. Update the saas_leads table
        const { error: updateError } = await supabase
            .from('saas_leads')
            .update({
                call_status: dbStatus,
                transcript: typeof transcript === 'string' ? transcript : JSON.stringify(transcript),
                call_summary: summary,
                fallback_triggered: isFallbackTriggered,
                // Automatically tag short calls as 'Cold' or 'Unreachable'
                tags: isFallbackTriggered ? ['Unreachable'] : ['Connected']
            })
            .eq('id', leadId);

        if (updateError) {
            console.error('[ElevenLabs Webhook] Supabase Update Error:', updateError);
            return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
        }

        console.log(`[ElevenLabs Webhook] Successfully processed call for Lead ${leadId}. Status: ${dbStatus}`);
        return NextResponse.json({ success: true, message: 'Processed successfully' }, { status: 200 });

    } catch (error) {
        console.error('[ElevenLabs Webhook] Unhandled Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
