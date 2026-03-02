'use server'

import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const IMPERSONATE_COOKIE_KEY = 'ktimatos_impersonate_org_id';

// Helper estricto interno: Valida que la sesión JWT le pertenezca a un Super Admin
async function isSuperAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    return profile?.role === 'super_admin';
}

// 1. Activar Suplantación (Llamado desde el Panel Admin)
export async function enableImpersonationAction(targetOrgId: string) {
    if (!(await isSuperAdmin())) {
        return { error: 'Acceso Denegado: Sólo los Super Administradores pueden suplantar identidades.' };
    }

    // Inyectamos el Cookie Override asegurado
    const cookieStore = await cookies();
    cookieStore.set(IMPERSONATE_COOKIE_KEY, targetOrgId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 8 // Válido por 8 horas máximo
    });

    revalidatePath('/', 'layout');
    return { success: true };
}

// 2. Escape Hatch: Salir del Modo Suplantación (Llamado desde el Banner Global)
export async function exitImpersonationAction() {
    const cookieStore = await cookies();
    cookieStore.delete(IMPERSONATE_COOKIE_KEY);

    revalidatePath('/', 'layout');
    redirect('/admin'); // Catapulta al admin de vuelta segura al panel unificado
}

// 3. Helper Central de Auth (Sustituto de profile.org_id en el Servidor)
// IMPORTANTE: Se usará en settings/actions y properties/actions en la Fase 2
export async function requireActiveOrg() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Unauthorized User');

    const { data: profile } = await supabase
        .from('profiles')
        .select('org_id, role')
        .eq('id', user.id)
        .single();

    if (!profile) throw new Error('Profile Not Found');

    const cookieStore = await cookies();
    const impersonatedOrgId = cookieStore.get(IMPERSONATE_COOKIE_KEY)?.value;

    // VALIDACIÓN CRUZADA DE ALTA SEGURIDAD:
    // Sólo si la cookie existe Y a la vez eres super_admin en BD, te dejamos engañar al sistema.
    if (impersonatedOrgId && profile.role === 'super_admin') {
        return { activeOrgId: impersonatedOrgId, role: 'super_admin_impersonating' };
    }

    // Retorno de identidad real
    return { activeOrgId: profile.org_id, role: profile.role };
}

// 4. Helper UI: Extraemos Metadatos para el Layout (Sólo Render)
export async function getImpersonationContextUI() {
    const cookieStore = await cookies();
    const impersonatedOrgId = cookieStore.get(IMPERSONATE_COOKIE_KEY)?.value;

    if (!impersonatedOrgId) return null;

    if (!(await isSuperAdmin())) return null;

    // Obtener el nombre de la víctima para el Escape Hatch Banner
    const supabase = await createClient();
    const { data: org } = await supabase
        .from('organizations')
        .select('name')
        .eq('id', impersonatedOrgId)
        .single();

    return {
        isImpersonating: true,
        targetOrgId: impersonatedOrgId,
        targetOrgName: org?.name || 'Agencia Desconocida'
    };
}
