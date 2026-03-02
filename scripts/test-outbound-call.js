import fetch from 'node-fetch';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testCall() {
    const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
    const agentId = process.env.ELEVENLABS_AGENT_ID;
    const phoneNumberId = process.env.ELEVENLABS_PHONE_ID;

    // Extracted from user's submission
    const phone = '+35799763682'; // User's number

    console.log('[Check] ELEVENLABS_API_KEY present:', !!elevenLabsApiKey);
    console.log('[Check] ELEVENLABS_AGENT_ID:', agentId);
    console.log('[Check] ELEVENLABS_PHONE_ID:', phoneNumberId);

    if (!elevenLabsApiKey || !agentId || !phoneNumberId) {
        console.error('Missing env vars.');
        return;
    }

    console.log(`[ElevenLabs] Triggering test outbound call to ${phone} from ${phoneNumberId}...`);

    try {
        const response = await fetch(`https://api.elevenlabs.io/v1/convai/sip-trunk/outbound-call`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'xi-api-key': elevenLabsApiKey
            },
            body: JSON.stringify({
                agent_id: agentId,
                to_number: phone,
                agent_phone_number_id: phoneNumberId,
                dynamic_variables: {
                    lead_name: 'Anas Test',
                    agency_name: 'NODEX',
                    lead_language: 'Spanish',
                    dynamic_first_message: 'Hola, probando llamada desde diagnóstico.',
                    lead_id: 'test-123'
                },
                custom_data: {
                    lead_id: 'test-123'
                }
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error('❌ [ElevenLabs] Failed to initiate call. Status:', response.status);
            console.error('Error Body:', errText);
        } else {
            const callResult = await response.json();
            console.log('✅ [ElevenLabs] Outbound call initiated successfully! Call ID:', callResult.call_id);
        }
    } catch (e) {
        console.error('Exception during fetch:', e);
    }
}

testCall();
