"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2, ShieldCheck } from "lucide-react"

export default function UpdatePasswordPage() {
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState<'checking' | 'ready' | 'error'>('checking')
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        // Verify we have a session (the recovery link automatically signs the user in)
        async function checkSession() {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                setStatus('error')
            } else {
                setStatus('ready')
            }
        }
        checkSession()
    }, [])

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (password !== confirmPassword) {
            toast.error("Passwords do not match")
            return
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters")
            return
        }

        setLoading(true)
        const { error } = await supabase.auth.updateUser({ password })

        if (error) {
            toast.error(error.message)
            setLoading(false)
        } else {
            toast.success("Password set successfully! Welcome aboard.")
            // Redirect to dashboard
            setTimeout(() => {
                router.push("/dashboard")
            }, 1500)
        }
    }

    if (status === 'checking') {
        return (
            <div className="flex h-screen items-center justify-center bg-black">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
        )
    }

    if (status === 'error') {
        return (
            <div className="flex h-screen items-center justify-center bg-black text-white p-6">
                <Card className="max-w-md bg-neutral-900 border-neutral-800">
                    <CardHeader>
                        <CardTitle className="text-red-500 text-xl text-white">Invalid or Expired Link</CardTitle>
                        <CardDescription className="text-neutral-400">
                            The link you used is invalid or has already been used. Please contact your administrator.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" className="w-full border-neutral-700 hover:bg-neutral-800 text-white" onClick={() => router.push("/")}>
                            Return to Homepage
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex h-screen items-center justify-center bg-black p-6">
            <Card className="max-w-md w-full bg-neutral-900 border-neutral-800 text-white shadow-2xl">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-blue-500/10 rounded-full">
                            <ShieldCheck className="h-8 w-8 text-blue-500" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">Secure Your Account</CardTitle>
                    <CardDescription className="text-neutral-400">
                        Please set a strong password to complete your account setup.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleUpdate} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">New Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-neutral-950 border-neutral-700 text-white"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="bg-neutral-950 border-neutral-700 text-white"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full bg-white text-black hover:bg-neutral-200" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Finalizing Setup...
                                </>
                            ) : (
                                "Complete Onboarding"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
