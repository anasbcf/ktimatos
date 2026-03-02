import { createClient } from "@/lib/supabase/server";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { InviteAgentDialog } from "@/components/invite-agent-dialog";
import { EditAgentDialog } from "@/components/edit-agent-dialog";
import { Badge } from "@/components/ui/badge";

import { EmptyState } from "@/components/empty-state";
import { Users, UserPlus, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

export const metadata = { title: "Agents Factory - KtimatOS" }

export default async function AgentsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    const { data: profile } = await supabase
        .from('profiles')
        .select('org_id, role')
        .eq('id', user.id)
        .single();

    if (!profile || !profile.org_id) redirect('/login');

    const { data: agents } = await supabase
        .from('profiles')
        .select('*')
        .eq('org_id', profile.org_id);

    const isAuthorized = ['admin', 'super_admin', 'broker'].includes(profile.role);

    return (
        <div className="flex flex-col gap-8 p-4 md:p-8 max-w-5xl mx-auto w-full">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight text-white">Agent Factory</h1>
                    <p className="text-neutral-400">
                        Gestiona los miembros de tu equipo. Sus números de WhatsApp determinan quién puede enviar comandos de voz al Cerebro Ejecutivo.
                    </p>
                </div>
                {isAuthorized && agents && agents.length > 0 && <InviteAgentDialog />}
            </div>

            {!isAuthorized && (
                <div className="rounded-md bg-red-900/20 p-4 border border-red-900/50 flex items-center gap-3">
                    <ShieldAlert className="h-5 w-5 text-red-500" />
                    <p className="text-sm text-red-400">No tienes permisos de Administrador o Broker para reclutar nuevos agentes.</p>
                </div>
            )}

            {(!agents || agents.length === 0) ? (
                <EmptyState
                    icon={Users}
                    title="No hay Agentes registrados"
                    description="Invita a tu equipo para que la IA sepa en quién delegar los clientes VIP o quién puede actualizar el CRM por voz."
                    action={isAuthorized ? <InviteAgentDialog trigger={<Button size="lg" className="font-semibold bg-white text-black hover:bg-neutral-200 gap-2"><UserPlus className="h-4 w-4" /> Registrar Agente</Button>} /> : undefined}
                />
            ) : (
                <div className="border border-neutral-800 rounded-xl overflow-hidden shadow-sm bg-neutral-900">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-neutral-950/50 border-neutral-800 hover:bg-neutral-950/50">
                                <TableHead className="text-neutral-400 font-medium h-12">Agente</TableHead>
                                <TableHead className="text-neutral-400 font-medium h-12">Rol</TableHead>
                                <TableHead className="text-neutral-400 font-medium h-12">WhatsApp Enlazado</TableHead>
                                <TableHead className="text-neutral-400 font-medium h-12">Conexión IA</TableHead>
                                {isAuthorized && <TableHead className="text-neutral-400 font-medium h-12 text-right">Settings</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {agents?.map((agent) => (
                                <TableRow key={agent.id} className="border-neutral-800 hover:bg-neutral-800/50 transition-colors">
                                    <TableCell className="flex items-center gap-3 py-4">
                                        <Avatar className="h-10 w-10 border border-neutral-700 bg-neutral-800">
                                            <AvatarFallback className="bg-neutral-800 text-neutral-300 font-bold">{agent.full_name?.[0] || 'A'}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-neutral-200">{agent.full_name || 'Agente Sin Nombre'}</span>
                                            {agent.email && <span className="text-xs text-neutral-500">{agent.email}</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell className="capitalize text-neutral-300">
                                        <Badge variant="outline" className={`
                                            ${agent.role === 'admin' || agent.role === 'broker' ? 'border-amber-500/30 text-amber-500 bg-amber-500/10' : 'border-neutral-700 text-neutral-400'}
                                        `}>
                                            {agent.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-emerald-400/90 font-mono text-xs tracking-wider">
                                        {agent.whatsapp_number ? `+${agent.whatsapp_number}` : <span className="text-neutral-600">No vinculado</span>}
                                    </TableCell>
                                    <TableCell>
                                        {agent.whatsapp_number ? (
                                            <div className="flex items-center gap-2">
                                                <span className="relative flex h-2 w-2">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                                </span>
                                                <span className="text-xs font-medium text-neutral-400">Escuchando</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <span className="relative flex h-2 w-2">
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-neutral-600"></span>
                                                </span>
                                                <span className="text-xs font-medium text-neutral-600">Offline</span>
                                            </div>
                                        )}
                                    </TableCell>
                                    {isAuthorized && (
                                        <TableCell className="text-right">
                                            <EditAgentDialog agent={agent} />
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
