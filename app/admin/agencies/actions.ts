'use server'

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function provisionAgencyAction(formData: FormData) {
    const supabase = await createClient()

    // 1. Authenticate & Authorize Super Admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return { error: "No autorizado." }

    const { data: requesterProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!requesterProfile || requesterProfile.role !== 'super_admin') {
        return { error: "Violación de Seguridad: Rol insuficiente para aprovisionar agencias." }
    }

    // 2. Extraer datos del Tenant
    const agencyName = formData.get('agencyName') as string
    const whatsappRaw = formData.get('whatsapp_number') as string
    const brokerEmail = formData.get('brokerEmail') as string

    if (!agencyName || !whatsappRaw || !brokerEmail) {
        return { error: "Faltan datos obligatorios para aprovisionar el nodo." }
    }

    // Limpieza agresiva de WhatsApp (sin símbolos '+' ni espacios)
    const whatsappNumber = whatsappRaw.replace(/\+/g, '').replace(/[^0-9]/g, '')
    const phoneRegex = /^[1-9]\d{9,14}$/;
    if (!phoneRegex.test(whatsappNumber)) {
        return { error: "Formato de WhatsApp inválido. El sistema requiere números puros con extensión geográfica." }
    }

    try {
        const adminClient = createAdminClient()

        // 3. Crear Organización (Bypass RLS vía Admin Client)
        const { data: newOrg, error: orgError } = await adminClient
            .from('organizations')
            .insert({
                name: agencyName,
                whatsapp_business_number: whatsappNumber,
                ai_wallet_balance: 10.00 // AI Wallet inicial de prueba (Grant de SaaS)
            })
            .select('id')
            .single()

        if (orgError) {
            if (orgError.code === '23505') return { error: "Colisión: Ese número de WhatsApp ya pertenece a otra organización en la red." }
            throw new Error("Fallo crítico insertando la organización en PostgreSQL.")
        }

        const orgId = newOrg.id

        // 4. Invitar al Broker vinculándolo a la nueva org
        const { data: authData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(brokerEmail, {
            data: {
                role: 'broker',
                org_id: orgId
            }
        })

        if (inviteError) {
            // Rollback manual de la organización para no dejar huérfanos de memoria
            await adminClient.from('organizations').delete().eq('id', orgId);
            throw new Error(inviteError.message)
        }

        const newUserId = authData.user.id

        // 5. Crear Perfil del Broker
        const { error: profileError } = await adminClient
            .from('profiles')
            .insert({
                id: newUserId,
                org_id: orgId,
                role: 'broker',
                full_name: 'Director ' + agencyName.split(' ')[0], // Nombre temporal limpio
                email: brokerEmail,
                avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(agencyName)}&background=random`
            })

        if (profileError) {
            console.error("[God Mode] Error attaching Broker profile:", profileError)
        }

        revalidatePath('/admin/agencies')
        return { success: true, message: `Tenant [${agencyName}] desplegado. Link de Setup enviado al Broker.` }

    } catch (error: any) {
        console.error("Provision Tenant Error:", error)
        return { error: error.message || "Error interno del servidor SQL." }
    }
}
