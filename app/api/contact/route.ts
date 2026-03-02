import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_fallback_for_build');

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, email, company, message } = body;

        if (!name || !email || !message) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const supabase = createAdminClient();

        // 1. Log en Supabase
        await supabase
            .from('marketing_leads')
            .insert([{
                full_name: name,
                email,
                company_name: company || 'Not Provided',
                notes: `Message: ${message}`,
                source: 'contact_form'
            }]);

        // 2. Notificación por Email
        const { data, error } = await resend.emails.send({
            from: "KtimatOS <system@ktimatos.com>",
            to: ["anas.b.k@ktimatos.com"],
            subject: `New Lead Request from ${name}`,
            replyTo: email, // Permite responder al lead dándole a "Responder" en Gmail
            html: `
                <div style="font-family: sans-serif; padding: 20px;">
                    <h2>New Lead Submission</h2>
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Company:</strong> ${company || "Not provided"}</p>
                    <hr />
                    <p><strong>Message:</strong></p>
                    <p>${message}</p>
                </div>
            `,
        });

        if (error) return NextResponse.json({ error }, { status: 500 });

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error("Resend Error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
