'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function submitLeadAction(formData: FormData) {
    const supabase = createAdminClient()

    const fullName = formData.get('full_name') as string
    const email = formData.get('email') as string
    const agencyName = formData.get('agency_name') as string
    const phone = formData.get('phone') as string
    const agentsCount = formData.get('agents_count') as string
    const language = formData.get('language') as string || 'English'

    if (!fullName || !email || !agencyName) {
        return { error: 'Please fill in all required fields.' }
    }

    // Check Whitelist before DB insertion
    const SUPPORTED_PREFIXES = ['+357', '+30', '+44', '+7', '+972', '+1', '+971']
    const isSupported = SUPPORTED_PREFIXES.some(prefix => phone.startsWith(prefix))

    try {
        const { data: newLead, error } = await supabase
            .from('saas_leads')
            .insert({
                full_name: fullName,
                email,
                agency_name: agencyName,
                agents_count: agentsCount,
                language: language,
                phone,
                status: 'pending',
                call_status: isSupported ? 'pending' : 'not_supported'
            })
            .select()
            .single()

        if (error) {
            if (error.code === '23505') {
                if (error.message.includes('phone')) {
                    return { error: 'This phone number has already been registered.' }
                }
                return { error: 'This email has already requested access.' }
            }
            throw error
        }

        if (!isSupported) {
            console.log(`[Routing Shield] Phone ${phone} is not in white-listed prefixes. Redirecting to manual booking.`)
            revalidatePath('/admin')
            return { redirect: `/book?name=${encodeURIComponent(fullName)}&email=${encodeURIComponent(email)}` }
        }

        const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY
        const agentId = process.env.ELEVENLABS_AGENT_ID
        const phoneNumberId = process.env.ELEVENLABS_PHONE_ID

        if (elevenLabsApiKey && agentId && phoneNumberId) {
            try {
                // Determine First Message Translation
                const now = new Date();
                const currentDate = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                const currentTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Nicosia' });

                console.log(`[ElevenLabs] Date Context: ${currentDate} | Time Context: ${currentTime}`);

                let firstMessage = `Hello ${fullName}, this is Elena from Ktimat OS. I saw you requested a demo of our real estate platform and I just wanted to personally welcome you. How are things running at ${agencyName} these days?`
                if (language === 'Spanish') firstMessage = `Hola ${fullName}, soy Elena de Ktimat OS. Vi que solicitaste una demo de nuestra plataforma inmobiliaria y quería darte la bienvenida personalmente. ¿Qué tal van las cosas por ${agencyName} últimamente?`

                console.log(`[ElevenLabs] Triggering outbound call to ${phone} from ${phoneNumberId}...`)

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
                        max_duration_seconds: 600,
                        dynamic_variables: {
                            lead_name: fullName,
                            agency_name: agencyName,
                            lead_language: language,
                            agents_count: agentsCount,
                            lead_email: email,
                            lead_phone: phone,
                            current_date: currentDate,
                            current_time: currentTime,
                            dynamic_first_message: firstMessage,
                            lead_id: newLead.id
                        },
                        custom_data: {
                            lead_id: newLead.id
                        }
                    })
                })

                if (!response.ok) {
                    const errText = await response.text();
                    console.error('[ElevenLabs] Failed to initiate call:', errText);
                } else {
                    const callResult = await response.json();
                    console.log('[ElevenLabs] Outbound call initiated successfully! Call ID:', callResult.call_id);
                }
            } catch (elError) {
                console.error('[ElevenLabs] Exception triggering call:', elError)
            }
        } else {
            console.warn('[ElevenLabs] Skipping outbound call: Missing ELEVENLABS_API_KEY, ELEVENLABS_AGENT_ID, or ELEVENLABS_PHONE_ID in .env.local')
        }

        revalidatePath('/admin')
        return { success: true, message: 'Your request has been sent! We will contact you soon.' }
    } catch (error: any) {
        console.error('Lead Submission Error (Full):', error)
        return { error: 'System Error: ' + (error.message || JSON.stringify(error)) }
    }
}
