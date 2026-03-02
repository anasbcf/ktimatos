import { NextResponse } from 'next/server';
import twilio from 'twilio';

export async function POST(request: Request) {
    try {
        const data = await request.json();

        // Payload sent back by the Modal Python app
        const { leadId, modalWebSocketUrl, status } = data;

        if (status !== 'ready' || !modalWebSocketUrl) {
            return NextResponse.json({ error: "Invalid payload from Modal. Expected status=ready and a WebSocket URL." }, { status: 400 });
        }

        console.log(`[Webhook/Modal-Ready] Received Ready signal for Lead ${leadId}`);

        // 1. Fetch Lead details from DB using leadId to get the phone number
        // Example: const lead = await prisma.lead.findUnique({ where: { id: leadId } });
        const leadPhone = "+1234567890"; // MOCK: Replace with lead.phone from DB

        // 2. Trigger Twilio API Call
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

        if (accountSid && authToken && twilioPhoneNumber) {
            const client = twilio(accountSid, authToken);

            // We use Twilio TwiML to instruct Twilio to connect the call to the Modal WebSocket
            // utilizing the <Connect> <Stream> verbs.
            const twiml = new twilio.twiml.VoiceResponse();
            const connect = twiml.connect();
            connect.stream({
                url: modalWebSocketUrl,
            });

            console.log(`[Webhook/Modal-Ready] Initiating call to ${leadPhone} -> Bridging to ${modalWebSocketUrl}`);

            const call = await client.calls.create({
                twiml: twiml.toString(),
                to: leadPhone,
                from: twilioPhoneNumber,
            });

            console.log(`[Webhook/Modal-Ready] Call initiated. Twilio Call SID: ${call.sid}`);

            // 3. Update Lead Status in DB (e.g. status: 'CALLING', currentCallSid: call.sid)
            // Example: await prisma.lead.update({ where: { id: leadId }, data: { status: 'CALLING' } });

        } else {
            console.warn("[Webhook/Modal-Ready] Twilio credentials missing. Cannot execute call.");
        }

        return NextResponse.json({ success: true, message: "Call triggered successfully" });

    } catch (error) {
        console.error("[Webhook/Modal-Ready] Error triggering Twilio call:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
