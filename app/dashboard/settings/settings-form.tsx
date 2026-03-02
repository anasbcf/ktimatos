'use client'

import { useState } from 'react'
import { updateAgencySettingsAction } from './actions'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Phone, Building2, Bot, Fingerprint, Mic, Clock, BrainCircuit, Key, MessagesSquare } from 'lucide-react'

export function SettingsForm({ initialData, disabled }: { initialData: any, disabled: boolean }) {
    const [loading, setLoading] = useState(false)

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)

        const formData = new FormData(event.currentTarget)
        const result = await updateAgencySettingsAction(formData)

        setLoading(false)
        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success('Configuración Mutada', {
                description: 'Los cerebros de la IA han absorbido los nuevos parámetros de tu Agencia.',
            })
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-8 pb-12">

            {/* 1. SECCIÓN CORE */}
            <Card className="bg-[#0e0e11] border-neutral-800 shadow-2xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white font-medium tracking-wide">
                        <Building2 className="h-5 w-5 text-indigo-400" />
                        Perfil Corporativo
                    </CardTitle>
                    <CardDescription className="text-neutral-500">
                        La identidad base que los cerebros utilizarán para referirse a la empresa.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3">
                        <Label htmlFor="agencyName" className="text-neutral-400 uppercase text-[10px] tracking-widest font-bold">Nombre Legal de Inmobiliaria</Label>
                        <Input
                            id="agencyName"
                            name="agencyName"
                            placeholder="Ej: KtimatOS Real Estate"
                            defaultValue={initialData?.name || ''}
                            disabled={disabled || loading}
                            required
                            className="bg-[#16161a] border-neutral-800 focus-visible:ring-indigo-500/50 text-white shadow-inner"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* 2. SECCIÓN INTEGRACIÓN META & TELNYX */}
            <Card className="bg-[#0e0e11] border-neutral-800 shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none"></div>

                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white font-medium tracking-wide">
                        <MessagesSquare className="h-5 w-5 text-emerald-400" />
                        WhatsApp & Telnyx Integration
                    </CardTitle>
                    <CardDescription className="text-neutral-500">
                        Credenciales críticas de comunicaciones. Conecta el WhatsApp B2C con Meta y Telnyx.
                        <strong className="block mt-3 text-rose-400/90 border-l-2 border-rose-500/50 pl-3 py-1.5 bg-rose-500/5 text-xs font-normal">
                            ATENCIÓN: Introduce todos los números de teléfono en formato internacional **SIN el símbolo '+' y SIN espacios**.
                        </strong>
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="grid gap-3">
                            <Label htmlFor="whatsappNumber" className="text-neutral-400 uppercase text-[10px] tracking-widest font-bold">WhatsApp Business OFICIAL</Label>
                            <Input
                                id="whatsappNumber"
                                name="whatsappNumber"
                                placeholder="Ej: 34600123456"
                                defaultValue={initialData?.whatsapp_business_number || ''}
                                disabled={disabled || loading}
                                className="bg-[#16161a] font-mono tracking-widest border-neutral-800 text-emerald-100 placeholder:text-neutral-700 focus-visible:ring-emerald-500/30"
                            />
                        </div>

                        <div className="grid gap-3">
                            <Label htmlFor="telnyxNumber" className="text-neutral-400 uppercase text-[10px] tracking-widest font-bold flex items-center gap-1.5"><Phone className="w-3 h-3" /> Telnyx SIP Number</Label>
                            <Input
                                id="telnyxNumber"
                                name="telnyxNumber"
                                placeholder="Ej: 35799123456"
                                defaultValue={initialData?.telnyx_phone_number || ''}
                                disabled={disabled || loading}
                                className="bg-[#16161a] font-mono tracking-widest border-neutral-800 text-emerald-100 placeholder:text-neutral-700 focus-visible:ring-emerald-500/30"
                            />
                        </div>
                    </div>

                    <div className="grid gap-3 pt-2">
                        <Label htmlFor="metaWabaId" className="text-neutral-400 uppercase text-[10px] tracking-widest font-bold flex items-center gap-1.5"><Fingerprint className="w-3 h-3" /> Meta WABA ID (WhatsApp Business Account)</Label>
                        <Input
                            id="metaWabaId"
                            name="metaWabaId"
                            placeholder="Ej: 123456789012345"
                            defaultValue={initialData?.meta_waba_id || ''}
                            disabled={disabled || loading}
                            className="bg-[#16161a] border-neutral-800 text-white placeholder:text-neutral-700 focus-visible:ring-emerald-500/30"
                        />
                    </div>

                    <div className="grid gap-3">
                        <Label htmlFor="metaAccessToken" className="text-neutral-400 uppercase text-[10px] tracking-widest font-bold flex items-center gap-1.5"><Key className="w-3 h-3" /> Meta System User Access Token</Label>
                        <Input
                            id="metaAccessToken"
                            name="metaAccessToken"
                            type="password"
                            placeholder="EAAI..."
                            defaultValue={initialData?.meta_access_token || ''}
                            disabled={disabled || loading}
                            className="bg-[#16161a] font-mono text-xs border-neutral-800 text-white placeholder:text-neutral-700 focus-visible:ring-emerald-500/30"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* 3. SECCIÓN AI VOICE (ELEVENLABS) */}
            <Card className="bg-[#0e0e11] border-neutral-800 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/5 blur-[80px] rounded-full pointer-events-none"></div>

                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white font-medium tracking-wide">
                        <Mic className="h-5 w-5 text-blue-400" />
                        AI Voice Agent Setting
                    </CardTitle>
                    <CardDescription className="text-neutral-500">
                        Vinculación directa con ElevenLabs para clonación y gestión de la voz.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3">
                        <Label htmlFor="elevenlabsAgentId" className="text-neutral-400 uppercase text-[10px] tracking-widest font-bold">ElevenLabs Agent ID</Label>
                        <Input
                            id="elevenlabsAgentId"
                            name="elevenlabsAgentId"
                            placeholder="21m00Tcm4TlvDq8ikWAM"
                            defaultValue={initialData?.elevenlabs_agent_id || ''}
                            disabled={disabled || loading}
                            className="bg-[#16161a] font-mono tracking-wider border-neutral-800 focus-visible:ring-blue-500/50 text-blue-100"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* 4. SECCIÓN CEREBROS Y PREFERENCIAS */}
            <Card className="bg-[#0e0e11] border-neutral-800 shadow-2xl relative overflow-hidden">
                <div className="absolute bottom-0 right-0 w-48 h-48 bg-amber-500/5 blur-[100px] rounded-full pointer-events-none"></div>

                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white font-medium tracking-wide">
                        <BrainCircuit className="h-5 w-5 text-amber-400" />
                        AI Brain Preferences
                    </CardTitle>
                    <CardDescription className="text-neutral-500">
                        Ajusta el tono de la IA, horarios de operación automática y parámetros de escalada VIP.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-3">
                        <Label htmlFor="aiGreeting" className="text-neutral-400 uppercase text-[10px] tracking-widest font-bold">Respuesta Inicial Automática (AI Greeting)</Label>
                        <Textarea
                            id="aiGreeting"
                            name="aiGreeting"
                            placeholder="Ej: ¡Hola! Soy el asistente virtual de [Agencia]. ¿En qué puedo ayudarte hoy?"
                            defaultValue={initialData?.ai_greeting || ''}
                            disabled={disabled || loading}
                            rows={3}
                            className="bg-[#16161a] resize-none border-neutral-800 focus-visible:ring-amber-500/30 text-neutral-300"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="grid gap-3">
                            <Label htmlFor="vipThreshold" className="text-neutral-400 uppercase text-[10px] tracking-widest font-bold">Umbral de Lead VIP (€)</Label>
                            <Input
                                id="vipThreshold"
                                name="vipThreshold"
                                type="number"
                                min="0"
                                step="50000"
                                placeholder="2000000"
                                defaultValue={initialData?.vip_budget_threshold || 2000000}
                                disabled={disabled || loading}
                                className="bg-[#16161a] font-mono border-neutral-800 focus-visible:ring-amber-500/30 text-amber-100"
                            />
                            <p className="text-[10px] text-neutral-500">Si Cerebro 1 o 2 detectan este presupuesto, el humano asume el control.</p>
                        </div>

                        <div className="grid gap-3">
                            <Label htmlFor="businessHours" className="text-neutral-400 uppercase text-[10px] tracking-widest font-bold flex items-center gap-1.5"><Clock className="w-3 h-3" /> Horarios de Oficina (JSON)</Label>
                            <Input
                                id="businessHours"
                                name="businessHours"
                                placeholder='{"monday":"09:00-18:00"}'
                                defaultValue={initialData?.business_hours ? JSON.stringify(initialData.business_hours) : ''}
                                disabled={disabled || loading}
                                className="bg-[#16161a] font-mono text-xs border-neutral-800 focus-visible:ring-amber-500/30 text-neutral-400 placeholder:text-neutral-700"
                            />
                            <p className="text-[10px] text-neutral-500">JSON estricto. La IA usará esto para derivar las llamadas o activar Fallbacks.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ACTION BUTTON */}
            {!disabled && (
                <div className="flex justify-end pt-4 sticky bottom-4 z-10 drop-shadow-2xl">
                    <Button
                        type="submit"
                        disabled={loading}
                        size="lg"
                        className="bg-white hover:bg-neutral-200 text-black font-semibold tracking-wide shadow-xl min-w-[200px]"
                    >
                        {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Bot className="mr-2 h-5 w-5" />}
                        Sincronizar Cerebros
                    </Button>
                </div>
            )}
        </form>
    )
}
