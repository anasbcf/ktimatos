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
            <DialogContent className="sm:max-w-[450px] bg-neutral-900 border-neutral-800 text-white">
                <DialogHeader>
                    <DialogTitle className="text-xl">Vincular Nuevo Agente</DialogTitle>
                    <DialogDescription className="text-neutral-400">
                        Añade un miembro a tu organización. El Cerebro Ejecutivo autenticará su número para permitirle comandos de voz.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit} className="grid gap-5 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="full_name" className="text-neutral-300">
                            Nombre del Agente
                        </Label>
                        <Input id="full_name" name="full_name" placeholder="Ej: Elena Rodríguez" required className="bg-neutral-950 border-neutral-800 text-white focus-visible:ring-indigo-500" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email" className="text-neutral-300">
                            Correo Electrónico
                        </Label>
                        <Input id="email" name="email" type="email" placeholder="elena@agencia.com" required className="bg-neutral-950 border-neutral-800 text-white focus-visible:ring-indigo-500" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="role" className="text-neutral-300">
                            Nivel de Acceso (Rol)
                        </Label>
                        <Select name="role" defaultValue="agent" required>
                            <SelectTrigger className="bg-neutral-950 border-neutral-800 text-white focus:ring-indigo-500">
                                <SelectValue placeholder="Selecciona un Rol" />
                            </SelectTrigger>
                            <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                                <SelectItem value="agent" className="focus:bg-neutral-800 focus:text-white">
                                    <div className="flex items-center gap-2">
                                        <BadgeCheck className="h-4 w-4 text-emerald-500" />
                                        <span>Agent (Solo BBDD e IA)</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="broker" className="focus:bg-neutral-800 focus:text-white">
                                    <div className="flex items-center gap-2">
                                        <ShieldAlert className="h-4 w-4 text-amber-500" />
                                        <span>Broker (Acceso VIP y Config)</span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="whatsapp" className="text-neutral-300">
                            Línea WhatsApp (Auth)
                        </Label>
                        <div className="space-y-2">
                            <Input id="whatsapp" name="whatsapp_number" type="tel" placeholder="34600123456" required className="bg-neutral-950 border-neutral-800 font-mono text-emerald-400 focus-visible:ring-emerald-500" />
                            <div className="p-2.5 bg-rose-500/10 border-l-2 border-rose-500 rounded-r-md">
                                <p className="text-xs text-rose-400 font-medium">
                                    ⚠️ No uses el símbolo '+' ni espacios. Incluye el código del país (ej: 34 para España, 357 para Chipre).
                                </p>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="mt-2">
                        <Button type="submit" disabled={loading} className="w-full bg-white text-black hover:bg-neutral-200">
                            {loading ? "Reclutando Agente..." : "Enviar Invitación Oficial"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
