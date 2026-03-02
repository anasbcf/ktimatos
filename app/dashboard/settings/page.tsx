import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SettingsForm } from './settings-form'

export const metadata = { title: "Settings - KtimatOS" }

export default async function SettingsPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('org_id, role')
        .eq('id', user.id)
        .single()

    if (!profile) redirect('/login')

    const { data: orgData } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', profile.org_id)
        .single()

    if (!orgData) redirect('/login')

    // Solo admins y brokers pueden ver/editar los settings de la agencia. 
    // Agentes normales no deberían acceder a este menú, pero lo deshabilitamos por seguridad en la UI
    const isAuthorized = ['admin', 'super_admin', 'broker'].includes(profile.role)

    return (
        <div className="flex flex-col gap-8 p-4 md:p-8 max-w-3xl mx-auto w-full">
            <div className="flex flex-col gap-2 border-b border-neutral-800 pb-6">
                <h1 className="text-3xl font-bold tracking-tight text-white">Configuración Multi-Tenant</h1>
                <p className="text-neutral-400">
                    Gestiona la identidad de tu Agencia y los parámetros del Cerebro Ejecutivo de KtimatOS.
                </p>
            </div>

            {!isAuthorized && (
                <div className="rounded-md bg-red-900/20 p-4 border border-red-900/50">
                    <p className="text-sm text-red-400">No tienes permisos de Administrador o Broker para modificar esta configuración.</p>
                </div>
            )}

            <SettingsForm initialData={orgData} disabled={!isAuthorized} />
        </div>
    )
}
