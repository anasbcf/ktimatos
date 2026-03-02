import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ProvisionAgencyDialog } from "@/components/provision-agency-dialog";
import { Building2 } from "lucide-react";

export const metadata = { title: "Admin Floor - KtimatOS" }

export default async function AdminAgenciesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!profile || profile.role !== 'super_admin') {
        // Fallback a dashboard normal si un Agente intenta hackear el path principal
        redirect('/dashboard');
    }

    const { data: organizations } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });

    return (
        <div className="flex flex-col gap-8 p-4 md:p-8 max-w-6xl mx-auto w-full">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                        <Building2 className="h-8 w-8 text-neutral-400" /> Factory Floor
                    </h1>
                    <p className="text-neutral-400">
                        Global Tenant Provisioning. Escala KtimatOS creando instancias SaaS para Agencias Inmobiliarias.
                    </p>
                </div>
                <ProvisionAgencyDialog />
            </div>

            <div className="border border-neutral-800 rounded-xl overflow-hidden shadow-sm bg-neutral-900">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-neutral-950/50 border-neutral-800 hover:bg-neutral-950/50">
                            <TableHead className="text-neutral-400 font-medium h-12">Nombre de la Agencia</TableHead>
                            <TableHead className="text-neutral-400 font-medium h-12">Línea Meta (WhatsApp)</TableHead>
                            <TableHead className="text-neutral-400 font-medium h-12">AI Wallet Balance</TableHead>
                            <TableHead className="text-neutral-400 font-medium h-12">VIP Threshold</TableHead>
                            <TableHead className="text-neutral-400 font-medium h-12 text-right">Fecha de Creación</TableHead>
                            <TableHead className="text-neutral-400 font-medium h-12 text-center">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {organizations?.map((org) => (
                            <TableRow key={org.id} className="border-neutral-800 hover:bg-neutral-800/50 transition-colors">
                                <TableCell className="font-semibold text-neutral-200 py-4">
                                    {org.name || 'Agencia Temporal'}
                                </TableCell>
                                <TableCell className="text-emerald-400/90 font-mono tracking-wider text-sm">
                                    {org.whatsapp_business_number ? `+${org.whatsapp_business_number}` : <span className="text-neutral-600">Off-Grid</span>}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 bg-indigo-500/10">
                                        € {Number(org.ai_wallet_balance || 0).toFixed(2)}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-amber-500/90 font-mono text-sm">
                                    € {Number(org.vip_budget_threshold || 2000000).toLocaleString('es-ES')}
                                </TableCell>
                                <TableCell className="text-right text-neutral-500 font-mono text-sm">
                                    {new Date(org.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-center">
                                    <form action={async () => {
                                        "use server";
                                        const { enableImpersonationAction } = await import('@/lib/impersonation');
                                        await enableImpersonationAction(org.id);
                                        const { redirect } = await import('next/navigation');
                                        redirect('/dashboard');
                                    }}>
                                        <button type="submit" className="text-xs font-bold uppercase tracking-widest text-indigo-400 hover:text-white border border-indigo-500/30 hover:border-indigo-400 bg-indigo-500/10 hover:bg-indigo-600 px-4 py-2 rounded shadow-md transition-all">
                                            Impersonate
                                        </button>
                                    </form>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
