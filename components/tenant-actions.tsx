'use client'

import { Button } from "@/components/ui/button"
import { setupTenantAction, sendTenantInviteAction } from "@/app/admin/actions"
import { enableImpersonationAction } from '@/lib/impersonation'
import { toast } from "sonner"
import { Loader2, KeyRound, Mail, ExternalLink, VenetianMask } from "lucide-react"
import { useState } from "react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"

export function TenantActions({ orgId, email }: { orgId: string, email?: string }) {
    const [loadingSetup, setLoadingSetup] = useState(false)
    const [loadingInvite, setLoadingInvite] = useState(false)
    const [loadingImpersonate, setLoadingImpersonate] = useState(false)

    async function handleImpersonate() {
        setLoadingImpersonate(true)
        try {
            await enableImpersonationAction(orgId)
            // The action will automatically redirect to /dashboard
        } catch (err) {
            console.error(err)
            toast.error("Failed to assume identity. Check logs.")
            setLoadingImpersonate(false) // Only stop loading if error, redirect handles success
        }
    }

    async function handleSetup() {
        setLoadingSetup(true)
        try {
            const result = await setupTenantAction(orgId)
            if (result.error) {
                toast.error(result.error)
            } else if (result.url) {
                toast.success("Setup link generated. Copying to clipboard...")
                navigator.clipboard.writeText(result.url)
                // Optionally open in a new incognito window if possible (browsers block this from JS, so just copy and alert)
                setTimeout(() => {
                    toast("Link copied. Open it in an Incognito window to configure the tenant.", {
                        duration: 5000,
                        action: {
                            label: "Open Normal",
                            onClick: () => window.open(result.url, '_blank')
                        }
                    })
                }, 1000)
            }
        } catch (err) {
            console.error(err)
            toast.error("An unexpected error occurred")
        } finally {
            setLoadingSetup(false)
        }
    }

    async function handleInvite() {
        setLoadingInvite(true)
        try {
            const result = await sendTenantInviteAction(orgId)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success(result.message || "Invite sent successfully.")
            }
        } catch (err) {
            console.error(err)
            toast.error("An unexpected error occurred")
        } finally {
            setLoadingInvite(false)
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 text-neutral-400 hover:text-white">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-neutral-900 border-neutral-800 text-neutral-200">
                <DropdownMenuItem onClick={handleImpersonate} disabled={loadingImpersonate} className="hover:bg-neutral-800 focus:bg-neutral-800 cursor-pointer text-yellow-500 font-medium">
                    {loadingImpersonate ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <VenetianMask className="mr-2 h-4 w-4" />}
                    <span>Impersonate Agency</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSetup} disabled={loadingSetup} className="hover:bg-neutral-800 focus:bg-neutral-800 cursor-pointer">
                    {loadingSetup ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4 text-blue-400" />}
                    <span>Generate Setup Link</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleInvite} disabled={loadingInvite} className="hover:bg-neutral-800 focus:bg-neutral-800 cursor-pointer">
                    {loadingInvite ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4 text-green-400" />}
                    <span>Send Onboarding Invite</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
