"use client"

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Plus, ShieldAlert, BadgeCheck } from "lucide-react"
import { inviteAgentAction } from "@/app/dashboard/agents/actions"
import { toast } from "sonner"
import { useState } from "react"

export function InviteAgentDialog({ trigger }: { trigger?: React.ReactNode }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        const result = await inviteAgentAction(formData)
        setLoading(false)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success(result.message)
            setOpen(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ? trigger : (
                    <Button size="sm" className="bg-white text-black hover:bg-neutral-200 gap-2 font-medium">
                        <Plus className="h-4 w-4" /> Add Agent
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px] bg-white border-slate-200 text-slate-900 shadow-xl">
                <DialogHeader>
                    <DialogTitle className="text-xl">Add New Agent</DialogTitle>
                    <DialogDescription className="text-slate-500">
                        Add a member to your organization. Their linked WhatsApp number will grant them access to voice commands.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit} className="grid gap-5 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="full_name" className="text-slate-700 font-medium">
                            Agent Name
                        </Label>
                        <Input id="full_name" name="full_name" placeholder="E.g: Elena Rodriguez" required className="bg-slate-50 border-slate-200 text-slate-900 focus-visible:ring-blue-500" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email" className="text-slate-700 font-medium">
                            Email Address
                        </Label>
                        <Input id="email" name="email" type="email" placeholder="elena@agency.com" required className="bg-slate-50 border-slate-200 text-slate-900 focus-visible:ring-blue-500" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="role" className="text-slate-700 font-medium">
                            Access Level (Role)
                        </Label>
                        <Select name="role" defaultValue="agent" required>
                            <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-900 focus:ring-blue-500">
                                <SelectValue placeholder="Select a Role" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-slate-200 text-slate-900">
                                <SelectItem value="agent" className="focus:bg-slate-100">
                                    <div className="flex items-center gap-2">
                                        <BadgeCheck className="h-4 w-4 text-emerald-500" />
                                        <span>Agent (CRM & AI Access)</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="broker" className="focus:bg-slate-100">
                                    <div className="flex items-center gap-2">
                                        <ShieldAlert className="h-4 w-4 text-amber-500" />
                                        <span>Broker (Manager Access)</span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="whatsapp" className="text-slate-700 font-medium">
                            WhatsApp Number
                        </Label>
                        <div className="space-y-2">
                            <Input id="whatsapp" name="whatsapp_number" type="tel" placeholder="35799123456" required className="bg-slate-50 border-slate-200 font-mono text-slate-900 focus-visible:ring-blue-500" />
                            <div className="p-2.5 bg-blue-50 border-l-2 border-blue-500 rounded-r-md">
                                <p className="text-xs text-blue-700 font-medium">
                                    Only numbers. Do not use the "+" symbol or spaces. Remember to include the country code (e.g. 357 for Cyprus).
                                </p>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="mt-2">
                        <Button type="submit" disabled={loading} className="w-full bg-blue-600 text-white hover:bg-blue-700 font-semibold shadow-sm">
                            {loading ? "Adding Agent..." : "Send Official Invitation"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
