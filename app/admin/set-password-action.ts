'use server'

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function setUserPasswordAction(orgId: string, newPassword: string) {
    const supabase = createAdminClient()

    try {
        // 1. Find User by Org
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('org_id', orgId)
            .eq('role', 'broker')
            .limit(1)
            .single()

        let userId = profile?.id

        if (!userId) {
            const { data: agent } = await supabase.from('profiles').select('id').eq('org_id', orgId).limit(1).single()
            userId = agent?.id
        }

        if (!userId) return { error: "No user found in this organization." }

        // 2. Set Password & Force Confirm Email
        const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
            password: newPassword,
            email_confirm: true
        })

        if (updateError) throw new Error(updateError.message)

        return { success: true, message: "Password updated successfully." }

    } catch (error: any) {
        console.error("Set Password Error:", error)
        return { error: error.message }
    }
}
