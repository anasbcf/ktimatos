import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { Resend } from 'resend';

// NOTE: Ensure RESEND_API_KEY is properly set in Vercel env
const resend = new Resend(process.env.RESEND_API_KEY || 're_fallback');
const FROM_EMAIL = 'Elena from KtimatOS <elena@ktimatos.com>'; // Update with verified sender if needed

const SUPPORTED_PREFIXES = ['+357', '+30', '+44', '+7', '+972', '+1', '+971'];

// Thresholds in milliseconds
const MIN_5 = 5 * 60 * 1000;
const MIN_10 = 10 * 60 * 1000;
const HOUR_2 = 2 * 60 * 60 * 1000;
const HOUR_24 = 24 * 60 * 60 * 1000;
const HOUR_48 = 48 * 60 * 60 * 1000;
const HOUR_72 = 72 * 60 * 60 * 1000;

export async function GET(req: Request) {
    // Vercel Cron Security Check
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Cron: Fallback Email] Initiating scan...');

    try {
        const supabase = createAdminClient();

        // Fetch all pending/voicemail leads that haven't finished the fallback sequence (step < 3)
        // We only target leads that haven't booked (status != 'booked', status != 'completed')
        const { data: leads, error } = await supabase
            .from('saas_leads')
            .select('*')
            .in('status', ['pending', 'action_required', 'contacted'])
            .lt('fallback_step', 3);

        if (error) {
            console.error('[Cron: Fallback Email] Error fetching leads', error);
            return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }

        if (!leads || leads.length === 0) {
            return NextResponse.json({ message: 'No eligible leads found.' }, { status: 200 });
        }

        const now = Date.now();
        let emailsSent = 0;

        for (const lead of leads) {
            const timeSinceCreation = now - new Date(lead.created_at).getTime();
            const isWhitelisted = SUPPORTED_PREFIXES.some(prefix => lead.phone?.startsWith(prefix));
            const callStatus = lead.call_status || 'pending';
            const step = lead.fallback_step || 0;

            let shouldSend = false;
            let emailSubject = '';
            let emailHtml = '';
            let newStep = step;

            const name = lead.full_name?.split(' ')[0] || 'there';
            const agency = lead.agency_name || 'your agency';
            const calendarLink = `https://cal.com/anas-ktimatos/discovery?name=${encodeURIComponent(name)}&email=${encodeURIComponent(lead.email)}`;
            const signature = `<br><br>Best,<br><strong>Elena</strong><br><em>AI Onboarding at KtimatOS</em>`;

            // === FLOW 1: Whitelisted (AI Called them) ===
            if (isWhitelisted) {
                // Only send fallback if the call actually failed or went to voicemail
                const callFailed = ['failed', 'voicemail', 'missed', 'unanswered'].includes(callStatus.toLowerCase());

                if (callFailed) {
                    if (step === 0 && timeSinceCreation >= MIN_10) {
                        shouldSend = true;
                        newStep = 1;
                        emailSubject = `Tied up at ${agency}?`;
                        emailHtml = `Hi ${name}, Elena here.<br><br>I just tried calling you regarding your KtimatOS access, but I assume you're out taking viewings or closing deals.<br><br>Since I know how chaotic a broker's schedule can be, let's avoid playing phone tag all week. I've left my calendar open below.<br><br>Click the link and grab the 10-minute slot that works best for you so we can get your software activated today or tomorrow.<br><br><a href="${calendarLink}"><strong>[ Book your 10-min Setup ]</strong></a>${signature}`;
                    }
                    else if (step === 1 && timeSinceCreation >= HOUR_24) {
                        shouldSend = true;
                        newStep = 2;
                        emailSubject = `What we're seeing in agencies like yours...`;
                        emailHtml = `Hi ${name},<br><br>I still haven't been able to reach you. Meanwhile, I wanted to share a quick insight you might find interesting.<br><br>The real estate agencies already connected to our AI phone system in Cyprus are capturing a completely new segment of buyers. Because the AI answers the phone, qualifies, and engages leads from Idealista/Bazaraki at 11 PM when the office is closed, brokers are waking up to pre-qualified buyers ready for viewings.<br><br>I'd love to see if we can replicate these numbers at ${agency}. If you're still interested in accessing the platform, find a slot here and we'll review it together:<br><br><a href="${calendarLink}"><strong>[ Book your 10-min Setup ]</strong></a>${signature}`;
                    }
                    else if (step === 2 && timeSinceCreation >= HOUR_72) {
                        shouldSend = true;
                        newStep = 3;
                        emailSubject = `Closing your file (for now)`;
                        emailHtml = `Hi ${name},<br><br>This will be the last time I reach out on this thread.<br><br>I completely understand if ${agency} doesn't have the bandwidth right now to deploy an AI infrastructure. That makes total sense (selling current inventory is always the number one priority).<br><br>I'm going to pause your access request so we can allocate the server bandwidth and the AI phone number we reserved for you to another agency on our waitlist.<br><br>If things settle down in a few months and you decide to take the leap, keep my link and book directly when you're ready to upgrade:<br><br><a href="${calendarLink}"><strong>[ Save Calendar Link ]</strong></a><br><br>Wishing you a strong quarter of closings!${signature}`;
                    }
                }
            }
            // === FLOW 2: Non-Whitelisted (Redirected directly heavily to Cal.com) ===
            else {
                if (step === 0 && timeSinceCreation >= MIN_5) {
                    shouldSend = true;
                    newStep = 1;
                    emailSubject = `Your KtimatOS Access (Next Steps)`;
                    emailHtml = `Hi ${name},<br><br>I noticed you just requested access to the KtimatOS platform for ${agency}, but you didn't get a chance to pick a time on the calendar to connect.<br><br>Since we manually enable accounts to ensure our AI perfectly adapts to your specific market, we need to have a quick setup call first.<br><br>I'm leaving the direct link here again so you can book your slot whenever you have a quiet moment:<br><br><a href="${calendarLink}"><strong>[ Book your 10-min Setup ]</strong></a>${signature}`;
                }
                else if (step === 1 && timeSinceCreation >= HOUR_2) {
                    shouldSend = true;
                    newStep = 2;
                    emailSubject = `The cost of the WhatsApp "back and forth"`;
                    emailHtml = `Hi ${name},<br><br>I was just thinking about your request earlier. A study by the Harvard Business Review found that responding to a new lead within 5 minutes directly impacts the number of deals you close, increasing conversion rates by nearly 400%.<br><br>However, we've seen that the average real estate agency in Cyprus takes over 3 hours to respond to inquiries because brokers are stuck in endless WhatsApp "back-and-forth" trying to organize viewings or answer basic property questions.<br><br>We built KtimatOS so your AI handles that initial friction. It answers questions, qualifies the lead, and books viewings for you autonomously, eliminating the manual WhatsApp chase.<br><br>I'd love to show you exactly how this looks like. Book a slot in the next few days here and I'll show you a live demo:<br><br><a href="${calendarLink}"><strong>[ Book your 10-min Setup ]</strong></a>${signature}`;
                }
                else if (step === 2 && timeSinceCreation >= HOUR_48) {
                    shouldSend = true;
                    newStep = 3;
                    emailSubject = `Pausing your application temporarily`;
                    emailHtml = `Hi ${name},<br><br>I assume you have too many moving parts at ${agency} right now to implement a new Artificial Intelligence infrastructure. I completely understand.<br><br>Because we actively monitor and fine-tune the AI during the initial stages, we only handle the onboarding for 5 new agencies per month. Therefore, I'm going to pass your setup slot to the next real estate agency in the queue.<br><br>If you have more room to innovate later in the year and want to delegate your client triage to our AI, just save my calendar link and we can activate it then:<br><br><a href="${calendarLink}"><strong>[ Save Calendar Link ]</strong></a><br><br>Thank you for your interest in KtimatOS.${signature}`;
                }
            }

            if (shouldSend && emailHtml && emailSubject) {
                console.log(`[Cron: Fallback Email] Sending Step ${newStep} to ${lead.email} (Flow ${isWhitelisted ? '1' : '2'})`);

                try {
                    const res = await resend.emails.send({
                        from: FROM_EMAIL,
                        to: lead.email,
                        subject: emailSubject,
                        html: emailHtml
                    });

                    if (res.error) {
                        console.error('[Cron: Fallback Email] Resend generic error:', res.error);
                        continue;
                    }

                    // Update Supabase
                    const { error: updateError } = await supabase
                        .from('saas_leads')
                        .update({ fallback_step: newStep })
                        .eq('id', lead.id);

                    if (updateError) {
                        console.error('[Cron] Failed to update lead step:', updateError);
                    } else {
                        emailsSent++;
                    }

                } catch (e) {
                    console.error('[Cron] Mail sending failed:', e);
                }
            }
        }

        return NextResponse.json({ message: 'Cron scan complete', emailsSent: emailsSent }, { status: 200 });

    } catch (error: any) {
        console.error('[Cron: Fallback Email] Unhandled Exception:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
