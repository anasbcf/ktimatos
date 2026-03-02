'use client'

import { Button } from "@/components/ui/button"
// import { impersonateUserAction } from "@/app/admin/actions"
import { toast } from "sonner"
import { Loader2, LogIn } from "lucide-react"
import { useState } from "react"

export function ImpersonateButton({ orgId }: { orgId: string }) {
    const [loading, setLoading] = useState(false)

    async function handleImpersonate() {
        setLoading(true)
        try {
            // const result = await impersonateUserAction(orgId)
            // if (result.error) {
            //     toast.error(result.error)
            // } else if (result.url) {
            //     toast.success("Identity verified. Redirecting...")
            //     window.location.href = result.url
            // }
            toast.info("Impersonation deprecated. Use Tenant Setup Links instead.");
        } catch (err) {
            console.error(err)
            toast.error("An unexpected error occurred")
        } finally {
            setLoading(false)
        }
    }


    return (
        <Button
            variant="ghost"
            size="sm"
            className="text-neutral-400 hover:text-white gap-2"
            onClick={handleImpersonate}
            disabled={loading}
        >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
            {loading ? "Accessing..." : "Log in as"}
        </Button>
    )
}
