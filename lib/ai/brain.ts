
import { createServiceClient } from '@/lib/supabase/service';
import OpenAI from 'openai';
import twilio from 'twilio';
import fs from 'fs';
import path from 'path';

function logToFile(msg: string) {
    console.log(`[${new Date().toISOString()}] 🧠 [BRAIN] ${msg}`);
}

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

interface ProcessMessageParams {
    leadId: string;
    orgId: string;
    conversationId: string;
    messageId?: string; // If we processed an incoming message
    messageBody: string;
    mediaUrl?: string; // Incoming media
    isVoiceNote: boolean;
    senderPhone: string;
    orgPhone: string;
}

export async function processMessage(params: ProcessMessageParams) {
    logToFile(`Processing Lead: ${params.leadId}, Msg: "${params.messageBody}"`);
    const supabase = createServiceClient();

    try {
        let finalUserText = params.messageBody;

        // 1. The Ear (Whisper) - NO CHANGE, KEEP TRANSCRIPTION
        if (params.isVoiceNote && params.mediaUrl) {
            console.log('🎤 Voice Note detected. Transcribing...');
            try {
                const audioResponse = await fetch(params.mediaUrl);
                const arrayBuffer = await audioResponse.arrayBuffer();
                const file = new File([arrayBuffer], 'voice_note.ogg', { type: 'audio/ogg' });

                const transcription = await openai.audio.transcriptions.create({
                    file: file,
                    model: 'whisper-1',
                });

                finalUserText = transcription.text;
                console.log(`📝 Transcribed: "${finalUserText}"`);

                if (params.messageId) {
                    await supabase.from('messages').update({
                        content: `[Voice Note]: ${finalUserText}`,
                        metadata: { transcription: finalUserText, original_media: params.mediaUrl }
                    }).eq('id', params.messageId);
                }
            } catch (err) {
                console.error("Transcription Failed:", err);
                finalUserText = "[Audio could not be transcribed]";
            }
        }

        // 2. The Memory (Context)
        // Fetch last 10 messages for context
        const { data: history } = await supabase
            .from('messages')
            .select('sender_type, content')
            .eq('conversation_id', params.conversationId)
            .order('created_at', { ascending: false })
            .limit(10); // Last 10

        const conversationHistory = history?.reverse().map(m =>
            `${m.sender_type === 'ai' ? 'Assistant' : 'User'}: ${m.content}`
        ).join('\n') || "";

        // 3. The Context (Property Awareness)
        // 3. The Context (Property Awareness + Org Persona)
        const { data: org } = await supabase
            .from('organizations')
            .select('name, settings')
            .eq('id', params.orgId)
            .single();

        const orgName = org?.name || "Real Estate Agency";
        // const orgSettings = org?.settings || {};

        const { data: properties } = await supabase
            .from('properties')
            .select('id, parsed_data, status')
            .eq('org_id', params.orgId)
            .eq('status', 'active');

        const propertiesContext = properties?.map(p => {
            const d = p.parsed_data as any;
            return `- ID: ${p.id}, Location: ${d.location_area}, Price: ${d.currency} ${d.price_value}, Bed: ${d.bedrooms}`;
        }).join('\n');

        const systemPrompt = `
    You are an AI assistant for ${orgName}, a Real Estate Agency in Cyprus.
    Your goal is to qualify leads and schedule viewings.
    
    Active Properties:\n${propertiesContext}

    Conversation History:
    ${conversationHistory}

    Instructions:
    - Generate a natural, professional, and friendly response in the "reply_text" field.
    - If the user greets you (e.g., "Hola"), welcome them to ${orgName} and ask what they are looking for.
    - If the user asks about a property, identify "property_id" from the list above.
    - If the user wants to book a viewing, extract the approximate date/time into "booking_intent".
    - If booking intent is present, your "reply_text" must confirm you are checking availability with the agent.
    - KEEP RESPONSES CONCISE (WhatsApp style). No long paragraphs.
    
    Return your response as a JSON object:
    {
        "reply_text": "string (the actual text response to the user)",
        "identified_property_id": "uuid or null",
        "booking_intent": { "requested_date": "string", "requested_time": "string" } | null
    }
    `;

        logToFile("Calling OpenAI...");
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: finalUserText }
            ],
            response_format: { type: "json_object" }
        });

        const aiResult = JSON.parse(completion.choices[0].message.content || '{}');
        logToFile(`AI Response: ${JSON.stringify(aiResult)}`);
        let replyText = aiResult.reply_text || "Lo siento, no te he entendido bien.";
        const identifiedPropertyId = aiResult.identified_property_id;
        const bookingIntent = aiResult.booking_intent;

        console.log(`🤖 AI Reply: "${replyText}"`);

        if (identifiedPropertyId) {
            await supabase.from('conversations')
                .update({ property_id: identifiedPropertyId })
                .eq('id', params.conversationId);
        }

        // 4. Booking Logic with Fallback
        if (bookingIntent) {
            console.log("📅 Booking Intent Detected:", bookingIntent);

            const targetPropertyId = identifiedPropertyId ||
                (await supabase.from('conversations').select('property_id').eq('id', params.conversationId).single()).data?.property_id;

            if (targetPropertyId) {
                const { data: booking } = await supabase.from('bookings').insert({
                    property_id: targetPropertyId,
                    lead_id: params.leadId,
                    agent_id: null,
                    time_slot: `${bookingIntent.requested_date} ${bookingIntent.requested_time}`,
                    status: 'pending_agent_review'
                }).select('id').single();

                // FALLBACK AGENT LOGIC
                // 1. Try assigned agent
                const { data: assignment } = await supabase
                    .from('assignments')
                    .select('user_id')
                    .eq('property_id', targetPropertyId)
                    .limit(1)
                    .single();

                let agentPhone = null;
                if (assignment) {
                    const { data: profile } = await supabase.from('profiles').select('whatsapp_number').eq('id', assignment.user_id).single();
                    if (profile) agentPhone = profile.whatsapp_number;
                }

                // 2. Fallback to Owner if no agent or agent has no phone
                if (!agentPhone) {
                    console.log("⚠️ No specific agent found. Falling back to Org Owner.");
                    const { data: owner } = await supabase.from('profiles')
                        .select('whatsapp_number')
                        .eq('org_id', params.orgId)
                        .eq('role', 'broker') // Assuming 'broker' is the owner role
                        .limit(1)
                        .single();
                    if (owner) agentPhone = owner.whatsapp_number;
                }

                if (agentPhone) {
                    // Send alert TO the agent FROM the Org Number
                    const agentMsg = `🔔 NEW REQUEST: Lead wants to view Property ID ${targetPropertyId} at ${bookingIntent.requested_time}. Reply 'YES ${booking?.id}' to confirm or 'NO' to reject.`;
                    await twilioClient.messages.create({
                        from: params.orgPhone, // Use Dynamic Org Phone
                        to: agentPhone,
                        body: agentMsg
                    });
                    replyText = "He enviado tu solicitud al agente. Te confirmaré la cita en breve.";
                } else {
                    console.warn("❌ CRITICAL: No Agent and No Owner phone found.");
                    replyText = "He anotado tu solicitud, pero nuestros agentes están ocupados. Te contactaremos pronto.";
                }
            }
        }

        // 5. Store AI Message
        await supabase.from('messages').insert({
            conversation_id: params.conversationId,
            sender_type: 'ai',
            content: replyText,
            content_type: 'text'
        });

        // 6. Randomized "Typing" Delay (Simulation)
        // Range: 3000ms to 5000ms (Optimized for Demos)
        const typingDelay = Math.floor(Math.random() * (5000 - 3000 + 1) + 3000);
        logToFile(`⏳ [BRAIN] Simulating typing for ${typingDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, typingDelay));

        // 7. Send Reply via Twilio (Text Only)
        logToFile(`Sending reply to ${params.senderPhone} from ${params.orgPhone}: "${replyText}"`);
        await twilioClient.messages.create({
            from: params.orgPhone, // Use Dynamic Org Phone
            to: params.senderPhone,
            body: replyText
        });
        logToFile("Reply sent via Twilio.");

    } catch (error: any) {
        console.error("Brain Failure:", error);
        logToFile(`❌ Brain Error: ${error.message}`);
    }
}
