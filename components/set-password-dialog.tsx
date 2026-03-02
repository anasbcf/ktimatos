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
import { KeyRound, RefreshCw } from "lucide-react"
import { setUserPasswordAction } from "@/app/admin/set-password-action"
import { toast } from "sonner"
import { useState } from "react"

export function SetPasswordDialog({ orgId, orgName }: { orgId: string, orgName: string }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [password, setPassword] = useState("")

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!password) return

        setLoading(true)
        const result = await setUserPasswordAction(orgId, password)
        setLoading(false)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success(`Password set for ${orgName}'s broker.`)
            setOpen(false)
            setPassword("")
        }
    }

    function generatePassword() {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
        let pass = "";
        for (let i = 0; i < 12; i++) {
            pass += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setPassword(pass);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-neutral-400 hover:text-white gap-2">
                    <KeyRound className="h-4 w-4" /> Set Password
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Set Broker Password</DialogTitle>
                    <DialogDescription>
                        Manually set a password for the main user of <strong>{orgName}</strong>.
                        This forces email confirmation.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="password" className="text-right">
                            Password
                        </Label>
                        <div className="col-span-3 flex gap-2">
                            <Input
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter new password"
                                required
                            />
                            <Button type="button" variant="outline" size="icon" onClick={generatePassword} title="Generate Random">
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading || !password}>
                            {loading ? "Updating..." : "Set Password"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
