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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit2 } from "lucide-react"
import { editAgentAction } from "@/app/dashboard/agents/actions"
import { toast } from "sonner"
import { useState } from "react"

export function EditAgentDialog({ agent, trigger }: { agent: any, trigger?: React.ReactNode }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [role, setRole] = useState(agent.role || 'agent')

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        formData.append('agent_id', agent.id)
        formData.append('role', role)

        const result = await editAgentAction(formData)
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
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600">
                        <Edit2 className="h-4 w-4" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Agent</DialogTitle>
                    <DialogDescription>
                        Update details for {agent.full_name}.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="whatsapp" className="text-right font-medium text-slate-700">
                            WhatsApp
                        </Label>
                        <div className="col-span-3 space-y-1">
                            <Input id="whatsapp" name="whatsapp_number" type="tel" defaultValue={agent.whatsapp_number || ''} placeholder="35799123456" required className="font-mono text-slate-900 focus-visible:ring-blue-500" />
                            <p className="text-[10px] text-slate-500 font-medium ml-1">Must include country code (e.g. 357). No + symbol.</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right font-medium text-slate-700">Role</Label>
                        <div className="col-span-3">
                            <Select value={role} onValueChange={setRole}>
                                <SelectTrigger className="text-slate-900 focus:ring-blue-500">
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent className="bg-white text-slate-900">
                                    <SelectItem value="agent">Agent (CRM & AI Access)</SelectItem>
                                    <SelectItem value="broker">Broker (Manager Access)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
