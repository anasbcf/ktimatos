'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireActiveOrg } from '@/lib/impersonation'

export async function updateAgencySettingsAction(formData: FormData) {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return { error: 'Unauthorized' }
    }

    let activeContext;
    try {
        activeContext = await requireActiveOrg();
    } catch (e: any) {
        return { error: e.message || 'Error resolving organization context.' }
    }

    const { activeOrgId, role } = activeContext;

    // Solo admins, brokers o el super_admin_impersonating pueden editar el Core de la agencia
    if (!['admin', 'super_admin', 'broker', 'super_admin_impersonating'].includes(role)) {
        return { error: 'You do not have permission to update agency settings.' }
    }

    const agencyName = formData.get('agencyName') as string
    const whatsappStr = formData.get('whatsappNumber') as string
    const vipThresholdStr = formData.get('vipThreshold') as string

    // Novedades Fase 3: Integraciones
    const telnyxPhoneStr = formData.get('telnyxNumber') as string
    const metaWabaId = formData.get('metaWabaId') as string
    const metaAccessToken = formData.get('metaAccessToken') as string
    const elevenlabsAgentId = formData.get('elevenlabsAgentId') as string
    const aiGreeting = formData.get('aiGreeting') as string
    const businessHoursStr = formData.get('businessHours') as string

    if (!agencyName) return { error: 'Agency Name is required' }

    // Limpieza estricta: solo números, sin '+' ni espacios
    const whatsappNumber = whatsappStr ? whatsappStr.replace(/\+/g, '').replace(/[^0-9]/g, '') : null;
    const telnyxPhoneNumber = telnyxPhoneStr ? telnyxPhoneStr.replace(/\+/g, '').replace(/[^0-9]/g, '') : null;
    const vipThreshold = vipThresholdStr ? parseFloat(vipThresholdStr) : 2000000;

    let parsedBusinessHours = null;
    if (businessHoursStr && businessHoursStr.trim() !== '') {
        try {
            parsedBusinessHours = JSON.parse(businessHoursStr);
        } catch (e) {
            return { error: 'Business Hours must be valid JSON object. e.g {"monday":"09:00-18:00"}' }
        }
    }

    const { error: updateError } = await supabase
        .from('organizations')
        .update({
            name: agencyName,
            whatsapp_business_number: whatsappNumber,
            vip_budget_threshold: vipThreshold,
            telnyx_phone_number: telnyxPhoneNumber,
            meta_waba_id: metaWabaId || null,
            meta_access_token: metaAccessToken || null,
            elevenlabs_agent_id: elevenlabsAgentId || null,
            ai_greeting: aiGreeting || null,
            business_hours: parsedBusinessHours
        })
        .eq('id', activeOrgId)

    if (updateError) {
        console.error('[Settings Server Action] Update Error:', updateError);
        if (updateError.code === '23505') { // Unique violation Postgres code
            return { error: 'That WhatsApp Business number is already registered to another Agency.' }
        }
        return { error: 'Failed to update organization settings.' }
    }

    revalidatePath('/dashboard/settings')
    return { success: true }
}
