import fetch from 'node-fetch';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const agentId = process.env.ELEVENLABS_AGENT_ID;
const phoneId = process.env.ELEVENLABS_PHONE_ID;

const endpoints = [
    `v1/convai/phone/create-outbound-call`,
    `v1/convai/twilio/outbound-call`,
    `v1/convai/agents/${agentId}/outbound-call`,
    `v1/convai/phone-numbers/${phoneId}/outbound-call`,
    `v1/convai/outbound-calls`,
    `v1/agents/${agentId}/calls`,
    `v1/convai/calls`
];

async function scan() {
    for (const ep of endpoints) {
        try {
            const res = await fetch(`https://api.elevenlabs.io/${ep}`, { method: 'POST' });
            console.log(`[${res.status}] ${ep}`);
        } catch (e) {
            console.log(`[ERR] ${ep}`);
        }
    }
}
scan();
