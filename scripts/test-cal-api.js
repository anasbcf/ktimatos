import fetch from 'node-fetch';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testCal() {
    const apiKey = process.env.CAL_API_KEY;
    const eventTypeId = process.env.CAL_EVENT_TYPE_ID;

    console.log(`[Cal.com Test] Key: ${apiKey?.substring(0, 10)}..., EventType: ${eventTypeId}`);

    if (!apiKey || !eventTypeId) {
        console.error('Missing CAL_API_KEY or CAL_EVENT_TYPE_ID');
        return;
    }

    try {
        console.log('--- Checking Slots ---');
        const start = new Date();
        const end = new Date();
        end.setDate(end.getDate() + 3);

        const url = `https://api.cal.com/v1/slots?apiKey=${apiKey}&eventTypeId=${eventTypeId}&startTime=${start.toISOString()}&endTime=${end.toISOString()}`;
        console.log('Fetching:', url);

        const res = await fetch(url);
        const data = await res.json();

        console.log('Status:', res.status);
        if (res.ok) {
            console.log('Slots found:', Object.keys(data.slots || {}).length);
            console.log(JSON.stringify(data, null, 2).substring(0, 300) + '...');
        } else {
            console.error('Error fetching slots:', data);
        }

    } catch (e) {
        console.error('Exception:', e);
    }
}

testCal();
