
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service'; // Use service client for agent lookup?
import twilio from 'twilio'; // Needed for sending confirmation to lead

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

import fs from 'fs';
import path from 'path';

function logToFile(msg: string) {
    console.log(`[${new Date().toISOString()}] ${msg}`);
}

export async function POST(req: NextRequest) {
    try {
        logToFile("🔌 [TWILIO WEBHOOK] Incoming request...");
        logToFile(`📦 [TWILIO WEBHOOK] Headers: ${JSON.stringify(Object.fromEntries(req.headers))}`);
        const formData = await req.formData();
        logToFile("📦 [TWILIO WEBHOOK] formData received");
        const body: Record<string, any> = {};
        formData.forEach((value, key) => {
            body[key] = value;
        });
        logToFile(`📦 [TWILIO WEBHOOK] Form Data parsed: ${JSON.stringify(body)}`);

        const from_number = body.From; // e.g., "whatsapp:+1234567890"
        const message_body = (body.Body || "").trim();
        const media_url = body.MediaUrl0;
        const is_voice_note = !!media_url;

        const supabaseAdmin = createServiceClient(); // Full access for logic
        logToFile(`🔎 [TWILIO WEBHOOK] Checking for Agent: ${from_number}`);
        const { data: agentProfile, error: agentError } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('whatsapp_number', from_number)
            .single();

        if (agentError && agentError.code !== 'PGRST116') { // PGRST116 is "not found"
            logToFile(`⚠️ [TWILIO WEBHOOK] Agent check error: ${agentError.message}`);
        }
        logToFile(`🔎 [TWILIO WEBHOOK] Agent found? ${!!agentProfile}`);

        if (agentProfile) {
            // HANDLE AGENT REPLY
            // Expected format: "YES <BookingID>" or "NO"
            // Simple logic for MVP
            if (message_body.toUpperCase().startsWith('YES')) {
                // Extract ID if possible, or assume latest pending for this agent?
                // "YES 123" -> confirm booking 123
                const parts = message_body.split(' ');
                const bookingId = parts[1]; // simplified

                if (bookingId) {
                    // Confirm Booking
                    await supabaseAdmin.from('bookings').update({ status: 'confirmed' }).eq('id', bookingId);

                    // Fetch Lead Info to notify
                    const { data: booking } = await supabaseAdmin.from('bookings').select('lead_id, time_slot, properties(parsed_data)').eq('id', bookingId).single();

                    if (booking) {
                        const { data: lead } = await supabaseAdmin.from('leads').select('phone').eq('id', booking.lead_id).single();
                        if (lead) {
                            // Supabase join returns an array or object depending on query.
                            // If it's single object due to config or array
                            const props: any = booking.properties; // properties is singular relation but returns standard shape
                            const propData = props?.parsed_data || props?.[0]?.parsed_data;
                            await twilioClient.messages.create({
                                from: process.env.TWILIO_PHONE_NUMBER,
                                to: lead.phone,
                                body: `✅ Great news! Your viewing for ${booking.time_slot} at ${propData?.location_area || 'the property'} is CONFIRMED. See you there!`
                            });
                        }
                    }
                }
                return new NextResponse('<Response></Response>', { headers: { 'Content-Type': 'text/xml' } });

            } else if (message_body.toUpperCase().startsWith('NO')) {
                // Reject Logic
                return new NextResponse('<Response></Response>', { headers: { 'Content-Type': 'text/xml' } });
            }
            // If not a command, treat as normal message? probably ignore for now or log.
            return new NextResponse('<Response></Response>', { headers: { 'Content-Type': 'text/xml' } });
        }

        // --- STANDARD LEAD FLOW BELOW ---

        const content_type = media_url ? 'audio' : 'text';

        const to_number = body.To || ""; // The Twilio number receiving the message
        logToFile(`🔎 [TWILIO WEBHOOK] Identifying Org for: ${to_number}`);

        // 0. Identify Organization (The Silo)
        // We handle both "whatsapp:+1..." and "+1..." formats
        const cleanNumber = to_number.replace('whatsapp:', '');

        const { data: org, error: orgErr } = await supabaseAdmin
            .from('organizations')
            .select('id, name, settings')
            .or(`settings->>twilio_number.eq."${to_number}",settings->>twilio_number.eq."${cleanNumber}"`)
            .single();

        if (orgErr || !org) {
            logToFile(`❌ [TWILIO WEBHOOK] CRITICAL: No Organization found for number ${to_number}. Error: ${orgErr?.message}`);
            return new NextResponse('<Response></Response>', { headers: { 'Content-Type': 'text/xml' } });
        }

        const orgId = org.id;
        logToFile(`✅ [TWILIO WEBHOOK] Organization Identified: ${org.name} (${orgId})`);

        // 1. Identify Lead (Scoped to Org)
        let leadId = null;

        logToFile(`🔎 [TWILIO WEBHOOK] Looking for lead in Org ${orgId}...`);
        const { data: existingLead, error: leadSearchErr } = await supabaseAdmin
            .from('leads')
            .select('id')
            .eq('org_id', orgId) // STRICT SCOPING
            .eq('phone', from_number)
            .single();

        if (existingLead) {
            leadId = existingLead.id;
        } else {
            // Create new lead for THIS Org
            const { data: newLead } = await supabaseAdmin
                .from('leads')
                .insert({
                    org_id: orgId,
                    phone: from_number,
                    source: 'whatsapp',
                    name: 'Unknown Lead', // Will be enriched later potentially
                    compliance_status: 'pending'
                })
                .select('id')
                .single();
            if (newLead) leadId = newLead.id;
        }

        if (!leadId) {
            logToFile(`⚠️ [TWILIO WEBHOOK] Failed to find or create lead.`);
            return new NextResponse('<Response></Response>', { headers: { 'Content-Type': 'text/xml' } });
        }

        logToFile(`👤 [TWILIO WEBHOOK] Lead identified: ${leadId}, Org: ${orgId}`);

        // 2. Identify Conversation
        let conversationId = null;
        logToFile(`🔎 [TWILIO WEBHOOK] Looking for open conversation for lead: ${leadId}`);
        const { data: openConvo, error: convoErr } = await supabaseAdmin
            .from('conversations')
            .select('id')
            .eq('lead_id', leadId)
            .eq('status', 'open')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (convoErr && convoErr.code !== 'PGRST116') {
            logToFile(`⚠️ [TWILIO WEBHOOK] Conversation search error: ${convoErr.message}`);
        }

        if (openConvo) {
            conversationId = openConvo.id;
            logToFile(`✅ [TWILIO WEBHOOK] Open conversation found: ${conversationId}`);
        } else {
            logToFile(`🏗️ [TWILIO WEBHOOK] Creating new conversation...`);
            const { data: newConvo, error: createConvoErr } = await supabaseAdmin
                .from('conversations')
                .insert({ lead_id: leadId, status: 'open' })
                .select('id')
                .single();
            if (createConvoErr) {
                logToFile(`❌ [TWILIO WEBHOOK] Conversation creation failed: ${createConvoErr.message}`);
            } else if (newConvo) {
                conversationId = newConvo.id;
                logToFile(`✅ [TWILIO WEBHOOK] New conversation created: ${conversationId}`);
            }
        }

        // 3. Store Message
        let messageId = null;
        if (conversationId) {
            logToFile(`🏗️ [TWILIO WEBHOOK] Storing message in conversation: ${conversationId}`);
            const { data: storedMsg, error: msgErr } = await supabaseAdmin.from('messages').insert({
                conversation_id: conversationId,
                sender_type: 'lead',
                content: message_body || (media_url ? '[Media Attachment]' : ''),
                content_type: content_type,
                metadata: media_url ? { media_url: media_url } : {}
            }).select('id, created_at').single();

            if (msgErr) {
                logToFile(`❌ [TWILIO WEBHOOK] Message storage failed: ${msgErr.message}`);
            } else if (storedMsg) {
                messageId = storedMsg.id;
                logToFile(`✅ [TWILIO WEBHOOK] Message stored: ${messageId}`);
            }

            // 4. Trigger AI Response Logic (Async with Debounce)
            // PATIENT AGENT LOGIC: Wait 15 seconds to group messages
            logToFile(`⏳ [TWILIO WEBHOOK] Starting 15s debounce for message: ${messageId}`);
            await new Promise(resolve => setTimeout(resolve, 15000));

            // Check if a newer message has arrived for this conversation
            if (storedMsg) {
                const { data: newerMessages, error: checkErr } = await supabaseAdmin
                    .from('messages')
                    .select('id')
                    .eq('conversation_id', conversationId)
                    .eq('sender_type', 'lead')
                    .gt('created_at', storedMsg.created_at) // Check for messages created AFTER this one
                    .limit(1);

                if (newerMessages && newerMessages.length > 0) {
                    logToFile(`🛑 [TWILIO WEBHOOK] Debounce: Newer message found. Aborting processing for ${messageId}.`);
                    return new NextResponse('<Response></Response>', { headers: { 'Content-Type': 'text/xml' } });
                }
            } else {
                logToFile(`⚠️ [TWILIO WEBHOOK] storedMsg is null, skipping debounce check.`);
            }

            logToFile(`🧠 [TWILIO WEBHOOK] No newer messages. Triggering AI Brain...`);
            const { processMessage } = await import('@/lib/ai/brain');

            // Note: We pass the *last* message ID (this one), but the Brain should probably look at the whole context.
            // brain.ts logic fetches the whole conversation history now, so it will see all previous messages too.
            // We pass this messageBody as 'finalUserText', but strictly speaking, if there are multiple, 
            // the Brain might want to aggregate them or just use the history.
            // Current Brain implementation uses 'messageBody' as the prompt input and history as context.
            // To make it perfect, we should probably aggregate the last few unreplied messages here or in Brain.
            // For now, Brain uses history (last 10 messages), so it WILL see the previous "Hi" even if we trigger clear.
            // The only issue is 'finalUserText' in Brain is just THIS message.
            // Let's rely on the Brain's history fetching to see the full picture.

            await processMessage({
                leadId,
                orgId,
                conversationId,
                messageId: messageId || undefined,
                messageBody: message_body || '',
                mediaUrl: media_url,
                isVoiceNote: is_voice_note,
                senderPhone: from_number,
                orgPhone: to_number // Pass the Org's number for the reply FROM field
            });

            logToFile(`✅ [TWILIO WEBHOOK] Brain processing completed.`);

        } else {
            logToFile(`⚠️ [TWILIO WEBHOOK] Skip message storage because no conversationId.`);
        }

        return new NextResponse('<Response></Response>', {
            headers: {
                'Content-Type': 'text/xml',
            },
        });

    } catch (error: any) {
        logToFile(`❌ Webhook Error: ${error.message} \n ${error.stack}`);
        console.error("Webhook Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
