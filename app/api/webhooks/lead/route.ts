import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const data = await request.json();

        // 1. Save Lead to Database (Status: Pending Boot)
        // Example: await prisma.lead.create({ data: { ...data, status: 'PENDING_BOOT' } })
        const leadId = "mock_lead_id_" + Date.now(); // Replace with actual DB insertion
        const language = data.preferredLanguage || "English";
        const phone = data.phone || "Unknown";

        console.log(`[Webhook/Lead] Received lead for ${phone}, Language: ${language}`);

        // 2. Fire-and-Forget Wake-Up Ping to Modal.com
        // We don't await the full boot, just the successful invocation/ping.
        const modalWebhookUrl = process.env.MODAL_WEBHOOK_URL;

        if (modalWebhookUrl) {
            // We fire it asynchronously without blocking the response
            fetch(modalWebhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: "boot_and_prepare",
                    leadId: leadId,
                    language: language,
                    payload: data // Pass full data to Modal so it knows the context for the agent
                })
            }).catch(err => {
                console.error("[Webhook/Lead] Failed to ping Modal:", err);
            });
            console.log(`[Webhook/Lead] Sent wake-up ping to Modal for Lead ${leadId}`);
        } else {
            console.warn("[Webhook/Lead] Warning: MODAL_WEBHOOK_URL not set in environment.");
        }

        // 3. Return success immediately so the UI can redirect to /booking
        return NextResponse.json({
            success: true,
            message: "Lead saved and GPU boot requested asynchronously",
            leadId: leadId
        });

    } catch (error) {
        console.error("[Webhook/Lead] Error processing lead:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
