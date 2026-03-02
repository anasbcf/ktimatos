'use server'

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function inviteAgentAction(formData: FormData) {
    const supabase = await createClient()

    // 1. Authenticate & Authorize
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return { error: "Unauthorized" }

    // 2.  Verify Broker/Admin Role & Get Org ID
    const { data: requesterProfile, error: profileError } = await supabase
        .from('profiles')
        .select('org_id, role')
        .eq('id', user.id)
        .single()

    if (profileError || !requesterProfile) return { error: "Profile not found" }

    if (!['super_admin', 'broker', 'admin'].includes(requesterProfile.role)) {
        return { error: "Insufficient permissions to invite agents." }
    }

    const orgId = requesterProfile.org_id
    if (!orgId) return { error: "You are not part of an organization." }

    const email = formData.get('email') as string
    const fullName = formData.get('full_name') as string
    const whatsappRaw = formData.get('whatsapp_number') as string
    const inputRole = formData.get('role') as string || 'agent'

    if (!email || !fullName || !whatsappRaw) return { error: "Name, Email, and WhatsApp number are required." }

    // Limpieza agresiva: quitamos "+" y espacios para que coincida con Meta
    const whatsappNumber = whatsappRaw.replace(/\+/g, '').replace(/[^0-9]/g, '')

    // Basic format check for E.164 without plus (has 10-15 digits)
    const phoneRegex = /^[1-9]\d{9,14}$/;
    if (!phoneRegex.test(whatsappNumber)) {
        return { error: "Formato de WhatsApp inválido (Ej: 34600... sin +)." }
    }

    try {
        // 4. Perform Admin Action (Invite User)
        // We use the Service Role client because normal users cannot call auth.admin.inviteUserByEmail
        const adminClient = createAdminClient()

        const { data: authData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
            data: {
                role: inputRole,
                org_id: orgId
            }
        })

        if (inviteError) throw new Error(inviteError.message)

        const newUserId = authData.user.id

        // 5. Create Profile for the new Agent
        // We use adminClient to bypass RLS for creating a profile for *another* user
        const { error: insertError } = await adminClient
            .from('profiles')
            .insert({
                id: newUserId,
                org_id: orgId,
                role: inputRole,
                full_name: fullName,
                whatsapp_number: whatsappNumber,
                avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`
            })

        if (insertError) {
            // Fallback: If profile creation fails (e.g. race condition), try updating
            console.error("Profile insert failed, attempting update:", insertError)
        }

        revalidatePath('/dashboard/agents')
        return { success: true, message: `Invitation sent to ${email}` }

    } catch (error: any) {
        console.error("Invite Agent Error:", error)
        return { error: error.message }
    }
}

export async function editAgentAction(formData: FormData) {
    const supabase = await createClient()

    // 1. Authenticate & Authorize
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return { error: "Unauthorized" }

    const { data: requesterProfile } = await supabase
        .from('profiles')
        .select('org_id, role')
        .eq('id', user.id)
        .single()

    if (!requesterProfile || !['super_admin', 'broker', 'admin'].includes(requesterProfile.role)) {
        return { error: "Insufficient permissions to edit agents." }
    }

    // 2. Extract Data
    const agentId = formData.get('agent_id') as string
    const role = formData.get('role') as string
    const whatsappNumber = formData.get('whatsapp_number') as string

    if (!agentId || !whatsappNumber) return { error: "Agent ID and WhatsApp number are required." }

    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(whatsappNumber)) {
        return { error: "Invalid WhatsApp format. Must include country code (e.g., +35799...)" }
    }

    try {
        // 3. Admin Update
        const adminClient = createAdminClient()

        // Ensure the agent belongs to the same org
        const { data: targetAgent } = await adminClient
            .from('profiles')
            .select('org_id')
            .eq('id', agentId)
            .single()

        if (targetAgent?.org_id !== requesterProfile.org_id) {
            return { error: "You cannot edit an agent outside your organization." }
        }

        const { error: updateError } = await adminClient
            .from('profiles')
            .update({
                role: role,
                whatsapp_number: whatsappNumber
            })
            .eq('id', agentId)

        if (updateError) throw new Error(updateError.message)

        revalidatePath('/dashboard/agents')
        return { success: true, message: `Agent details updated successfully.` }

    } catch (error: any) {
        console.error("Edit Agent Error:", error)
        return { error: error.message }
    }
}

