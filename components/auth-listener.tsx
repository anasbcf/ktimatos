'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function AuthListener() {
    const router = useRouter()

    useEffect(() => {
        const handleHash = async () => {
            // Check for implicit grant flow hash
            if (window.location.hash && window.location.hash.includes('access_token')) {
                const supabase = createClient()
                console.log("[AuthListener] Detected access_token in hash. Processing...")
                toast.info("Finalizing login...")

                // Supabase client automatically parses the hash if you initialize it and check session,
                // but explicit getSession usually triggers the recovery.
                // However, simply calling getSession() might not process the hash if it's already "handled" by the library init?
                // Actually, supabase-js handles the hash automatically on the client side.
                // We just need to wait for the session to be set.

                const { data: { session }, error } = await supabase.auth.getSession()

                if (session) {
                    console.log("[AuthListener] Session established.", session.user.id)
                    toast.success("Login verified.")

                    // Clear hash and redirect
                    window.history.replaceState(null, '', window.location.pathname)
                    router.refresh() // Force server refresh to pick up cookie
                    if (window.location.pathname === '/' || window.location.pathname === '/login') {
                        router.push('/dashboard')
                    }
                } else if (error) {
                    console.error("[AuthListener] Session error:", error)
                    toast.error("Login session failed.")
                }
            }
        }

        handleHash()

        // Setup listener for auth state changes
        const supabase = createClient()
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN') {
                console.log("[AuthListener] SIGNED_IN event.", session?.user.id)
                router.refresh()
            }
        })

        return () => subscription.unsubscribe()
    }, [router])

    return null
}
