'use client'

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import { createTenantAction } from '@/app/admin/actions'
import { useState } from "react"
import { toast } from "sonner" // Assuming sonner is installed, or use standard alert

// We need to install sonner via shadcn if not present. 
// For now, let's use a simple alert if toast is missing, but best to stick to plans.
// "Sprint 3.5: ... Setup Shadcn/UI components". Usually toast is key.
// I'll assume toast is not installed yet and use standard browser alert for MVP speed, then upgrade.


export function ProvisionTenantDialog({
    initialData,
    open,
    onOpenChange
}: {
    initialData?: { lead_id?: string; name?: string; email?: string; phone?: string },
    open?: boolean,
    onOpenChange?: (open: boolean) => void
}) {
    const [internalOpen, setInternalOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const isControlled = open !== undefined && onOpenChange !== undefined
    const isOpen = isControlled ? open : internalOpen
    const setIsOpen = isControlled ? onOpenChange : setInternalOpen

    async function handleSubmit(formData: FormData) {
        if (loading) return
        setLoading(true)

        try {
            const result = await createTenantAction(formData)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success(result.message)
                setIsOpen(false)
            }
        } catch (e: any) {
            toast.error("An unexpected error occurred.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            {!isControlled && (
                <DialogTrigger asChild>
                    <Button className="bg-white text-black hover:bg-neutral-200">
                        <Plus className="mr-2 h-4 w-4" /> Provision Tenant
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[425px] bg-neutral-900 text-white border-neutral-800">
                <DialogHeader>
                    <DialogTitle>Provision New Tenant</DialogTitle>
                    <DialogDescription className="text-neutral-400">
                        Create an organization and invite the broker via email.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit}>
                    {initialData?.lead_id && (
                        <input type="hidden" name="lead_id" value={initialData.lead_id} />
                    )}
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Org Name
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={initialData?.name}
                                placeholder="Villa Kings Ltd"
                                className="col-span-3 bg-neutral-950 border-neutral-700 text-white"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">
                                Broker Email
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                defaultValue={initialData?.email}
                                placeholder="broker@villakings.com"
                                className="col-span-3 bg-neutral-950 border-neutral-700 text-white"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="twilio_number" className="text-right text-xs">
                                Telnyx Virtual #
                            </Label>
                            <div className="col-span-3 space-y-1">
                                <Input
                                    id="twilio_number"
                                    name="twilio_number"
                                    defaultValue=""
                                    placeholder="+1234567890"
                                    className="bg-neutral-950 border-neutral-700 text-white"
                                    required
                                />
                                <p className="text-[10px] text-neutral-500 font-medium ml-1">The dedicated number assigned to them from Telnyx.</p>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading} className="bg-white text-black hover:bg-neutral-200">
                            {loading ? 'Provisioning...' : 'Provision Tenant'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
