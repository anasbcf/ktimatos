
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const full_name = formData.get('full_name') as string
    const org_name = formData.get('org_name') as string

    // 1. Sign up user
    console.log("🚀 Attempting Signup for:", email);
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name,
            }
        }
    })

    if (authError) {
        console.error("❌ Auth Error:", authError.message);
        return { error: authError.message }
    }
    if (!authData.user) return { error: 'Signup failed' }

    console.log("✅ Auth User Created:", authData.user.id);

    // 2. Create Organization (SaaS flow)
    const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({ name: org_name })
        .select()
        .single()

    if (orgError) {
        console.error("❌ Org Creation Error:", orgError.message);
        return { error: orgError.message }
    }

    console.log("✅ Organization Created:", org.id);

    // 3. Update Profile with Org ID and Role
    const { error: profileError } = await supabase
        .from('profiles')
        .update({
            org_id: org.id,
            role: 'broker',
            full_name: full_name
        })
        .eq('id', authData.user.id)

    if (profileError) {
        console.error("❌ Profile Update Error:", profileError.message);
        return { error: profileError.message }
    }

    console.log("✅ Profile Linked. Redirecting...");
    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

export async function signOut() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
}
