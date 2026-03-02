'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createTenantAction(formData: FormData) {
    const supabase = createAdminClient()

    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const twilioNumber = formData.get('twilio_number') as string
    const leadId = formData.get('lead_id') as string

    if (!name || !email || !twilioNumber) {
        return { error: 'Missing required fields' }
    }

    try {
        // 1. Create Organization in Supabase
        const { data: org, error: orgError } = await supabase
            .from('organizations')
            .insert({
                name,
                settings: { twilio_number: twilioNumber },
                billing_status: 'active'
            })
            .select()
            .single()

        if (orgError) throw new Error(`Org Creation Failed: ${orgError.message}`)

        // 2. Create User Silently in Supabase Auth
        // We generate a secure random password so the account is created but they can't log in yet.
        // We auto-confirm the email so they can do a password reset later to "claim" the account.
        const randomPassword = crypto.randomUUID() + 'A1!'
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: email,
            password: randomPassword,
            email_confirm: true,
            user_metadata: {
                role: 'broker',
                org_id: org.id
            }
        })

        if (authError) {
            // Handle edge case where user already exists
            if (authError.message.includes('already registered')) {
                return { error: 'A user with this email already exists in the system.' }
            }
            throw new Error(`Auth Creation Failed: ${authError.message}`)
        }

        const newUserId = authData.user.id

        // 3. Create Profile
        const { error: profileError } = await supabase
            .from('profiles')
            .insert({
                id: newUserId,
                org_id: org.id,
                role: 'broker',
                full_name: name + ' Broker',
                avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
            })

        if (profileError) {
            console.error("Profile creation failed (might already exist via triggers):", profileError)
        }

        // 4. Update Lead Status if applicable
        if (leadId) {
            await supabase.from('saas_leads').update({ status: 'provisioned' }).eq('id', leadId)
        }

        revalidatePath('/admin')
        return { success: true, message: `Tenant '${name}' provisioned successfully without sending email.` }

    } catch (error: any) {
        console.error("Provisioning Error:", error)
        return { error: error.message }
    }
}

export async function sendTenantInviteAction(orgId: string) {
    // 1. Security Check
    const userClient = await createClient()
    const { data: { user } } = await userClient.auth.getUser()
    if (!user) return { error: "Unauthorized" }

    const { data: requesterProfile } = await userClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (requesterProfile?.role !== 'super_admin') {
        return { error: "Unauthorized. Level super_admin required." }
    }

    try {
        const supabase = createAdminClient()

        // Find broker for this org
        const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('org_id', orgId)
            .eq('role', 'broker')
            .limit(1)
            .single()

        if (!profile) return { error: "No broker found for this agency." }

        // Get user email
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(profile.id)

        if (userError || !userData.user) return { error: "Could not fetch user details." }

        // Send Password Reset Email (Acts as Invite/Setup)
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(userData.user.email!, {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/update-password`
        })

        if (resetError) return { error: resetError.message }

        return { success: true, message: `Setup email sent to ${userData.user.email}` }

    } catch (error: any) {
        console.error("Invite Error:", error)
        return { error: error.message }
    }
}

export async function setupTenantAction(orgId: string) {
    // Replaces Impersonate: Generates a link the admin can use to log in as the broker
    const userClient = await createClient()
    const { data: { user } } = await userClient.auth.getUser()
    if (!user) return { error: "Unauthorized" }

    const { data: requesterProfile } = await userClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (requesterProfile?.role !== 'super_admin') {
        return { error: "Unauthorized. Level super_admin required." }
    }

    try {
        const supabase = createAdminClient()

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('org_id', orgId)
            .limit(1)
            .single()

        if (profileError || !profile) {
            return { error: "No user found for this agency." }
        }

        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(profile.id)
        if (userError || !userData.user) return { error: "Could not fetch user details." }

        // Generate a recovery link
        const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
            type: 'recovery',
            email: userData.user.email!,
            options: {
                redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/update-password`
            }
        })

        if (linkError) return { error: linkError.message }

        return {
            success: true,
            url: linkData.properties.action_link
        }

    } catch (error: any) {
        console.error("Setup Link Error:", error)
        return { error: error.message }
    }
}
