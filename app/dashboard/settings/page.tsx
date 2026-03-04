import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { SettingsForm } from './settings-form'
import { requireActiveOrg } from '@/lib/impersonation'

export const metadata = { title: "Settings - KtimatOS" }

export default async function SettingsPage() {
    const { activeOrgId, role } = await requireActiveOrg().catch(() => ({ activeOrgId: null, role: null }));

    if (!activeOrgId) {
        redirect('/sign-in')
    }

    const supabase = await createAdminClient()

    const { data: orgData } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', activeOrgId)
        .single()

    if (!orgData) redirect('/dashboard')

    // Solo admins, brokers y super admins impersonando pueden ver/editar los settings de la agencia. 
    const isAuthorized = ['admin', 'super_admin', 'super_admin_impersonating', 'broker'].includes(role || '')

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
