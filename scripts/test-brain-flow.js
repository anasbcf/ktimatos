
// Scripts/test-brain-flow.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Mock imports since we are running in node script outside of Next.js context
// We need to bypass the brain.ts import issues by mocking the function call or reconstructing it here for the test
// OR better, we use the Next.js environment if possible. 
// Given the complexity of TS imports in standalone scripts, we will write a script that INTERACTS with the running app via the Webhook.

const API_ENDPOINT = "http://localhost:3000/api/webhooks/twilio";

async function runTest() {
    console.log(`🧠 Testing AI Brain Flow via Webhook: ${API_ENDPOINT}`);

    const formData = new URLSearchParams();
    formData.append('From', 'whatsapp:+35799000000'); // Test Lead
    formData.append('To', 'whatsapp:+14155238886');

    // SIMULATE AUDIO INPUT
    // Short audio saying "Hello" or similar
    const SAMPLE_AUDIO_URL = "https://www2.cs.uic.edu/~i101/SoundFiles/Hello.wav";

    formData.append('Body', ''); // Empty body for voice note
    formData.append('MediaUrl0', SAMPLE_AUDIO_URL);
    formData.append('MediaContentType0', 'audio/wav');

    try {
        const response = await fetch(API_ENDPOINT, {
            method: "POST",
            body: formData,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        console.log("Webhook Response Status:", response.status);
        console.log("Check server logs for: 'Transcribed', 'AI Reply', and 'Voice Note URL'");

    } catch (error) {
        console.error("Test Failed:", error);
    }
}

runTest();
