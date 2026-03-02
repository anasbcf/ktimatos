"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Building2, Server } from "lucide-react"
import { provisionAgencyAction } from "@/app/admin/agencies/actions"
import { toast } from "sonner"
import { useState } from "react"

export function ProvisionAgencyDialog({ trigger }: { trigger?: React.ReactNode }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        const result = await provisionAgencyAction(formData)
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
                    <Button size="sm" className="bg-indigo-600 text-white hover:bg-indigo-700 gap-2 font-medium">
                        <Server className="h-4 w-4" /> Provisionar Inmobiliaria
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px] bg-neutral-900 border-neutral-800 text-white">
                <DialogHeader>
                    <DialogTitle className="text-xl flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-indigo-400" />
                        Crear Tenant (Agencia SaaS)
                    </DialogTitle>
                    <DialogDescription className="text-neutral-400">
                        Inyecta una nueva inmobiliaria en el núcleo de KtimatOS. Se asignará una AI Wallet de 10.00€ y se invitará a su Broker Oficial.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit} className="grid gap-5 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="agencyName" className="text-neutral-300">
                            Firma Comercial (Nombre de la Agencia)
                        </Label>
                        <Input id="agencyName" name="agencyName" placeholder="Ej: Luxury Villas Paphos" required className="bg-neutral-950 border-neutral-800 text-white focus-visible:ring-indigo-500" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="whatsapp" className="text-neutral-300">
                            Canal Oficial (Línea Meta)
                        </Label>
                        <div className="space-y-2">
                            <Input id="whatsapp" name="whatsapp_number" type="tel" placeholder="35799123456" required className="bg-neutral-950 border-neutral-800 font-mono text-emerald-400 focus-visible:ring-emerald-500" />
                            <div className="p-2.5 bg-rose-500/10 border-l-2 border-rose-500 rounded-r-md">
                                <p className="text-xs text-rose-400 font-medium">
                                    Vital para el Router Cognitivo. Código de país sin el símbolo '+' ni espacios.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="brokerEmail" className="text-neutral-300">
                            Email del Dueño (Broker)
                        </Label>
                        <Input id="brokerEmail" name="brokerEmail" type="email" placeholder="broker@luxuryvillas.com" required className="bg-neutral-950 border-neutral-800 text-white focus-visible:ring-indigo-500" />
                    </div>

                    <DialogFooter className="mt-2">
                        <Button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white hover:bg-indigo-700">
                            {loading ? "Aprovisionando Red..." : "Desplegar Tenant SaaS"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
