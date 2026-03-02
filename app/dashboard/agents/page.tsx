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
    const { requireActiveOrg } = await import('@/lib/impersonation');
    const { createAdminClient } = await import('@/lib/supabase/admin');

    let activeOrgId;
    let currentRole;
    try {
        const ctx = await requireActiveOrg();
        activeOrgId = ctx.activeOrgId;
        currentRole = ctx.role;
    } catch (error) {
        redirect('/login');
    }

    if (!activeOrgId) redirect('/login');

    const supabase = createAdminClient();

    const { data: agents } = await supabase
        .from('profiles')
        .select('*')
        .eq('org_id', activeOrgId);

    const isAuthorized = ['admin', 'super_admin', 'super_admin_impersonating', 'broker'].includes(currentRole);

    return (
        <div className="flex flex-col gap-8 p-4 md:p-8 max-w-5xl mx-auto w-full">
            <div className="flex items-center justify-between border-b border-slate-200 pb-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Agents</h1>
                    <p className="text-slate-500">
                        Manage your team members. Their WhatsApp numbers specify who will have access to the AI assistant.
                    </p>
                </div>
                {isAuthorized && agents && agents.length > 0 && <InviteAgentDialog />}
            </div>

            {!isAuthorized && (
                <div className="rounded-md bg-red-900/20 p-4 border border-red-900/50 flex items-center gap-3">
                    <ShieldAlert className="h-5 w-5 text-red-500" />
                    <p className="text-sm text-red-400">You do not have Admin or Broker permissions to recruit new agents.</p>
                </div>
            )}

            {(!agents || agents.length === 0) ? (
                <EmptyState
                    icon={Users}
                    title="No Agents Registered"
                    description="Invite your team so they can access the CRM and the AI capabilities."
                    action={isAuthorized ? <InviteAgentDialog trigger={<Button size="lg" className="font-semibold bg-blue-600 text-white hover:bg-blue-700 gap-2"><UserPlus className="h-4 w-4" /> Add Agent</Button>} /> : undefined}
                />
            ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50 border-slate-200 hover:bg-slate-50/50">
                                <TableHead className="text-slate-500 font-medium h-12">Agent</TableHead>
                                <TableHead className="text-slate-500 font-medium h-12">Role</TableHead>
                                <TableHead className="text-slate-500 font-medium h-12">Linked WhatsApp</TableHead>
                                <TableHead className="text-slate-500 font-medium h-12">AI Connection</TableHead>
                                {isAuthorized && <TableHead className="text-slate-500 font-medium h-12 text-right">Settings</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {agents?.map((agent) => (
                                <TableRow key={agent.id} className="border-slate-100 hover:bg-slate-50 transition-colors">
                                    <TableCell className="flex items-center gap-3 py-4">
                                        <Avatar className="h-10 w-10 border border-slate-200 bg-slate-100">
                                            <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">{agent.full_name?.[0] || 'A'}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-slate-900">{agent.full_name || 'Unnamed Agent'}</span>
                                            {agent.email && <span className="text-xs text-slate-500">{agent.email}</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell className="capitalize text-slate-700">
                                        <Badge variant="outline" className={`
                                            ${agent.role === 'admin' || agent.role === 'broker' ? 'border-amber-500/30 text-amber-600 bg-amber-50' : 'border-slate-200 text-slate-500'}
                                        `}>
                                            {agent.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-emerald-600 font-mono text-xs tracking-wider">
                                        {agent.whatsapp_number ? `+${agent.whatsapp_number}` : <span className="text-slate-400">Not Linked</span>}
                                    </TableCell>
                                    <TableCell>
                                        {agent.whatsapp_number ? (
                                            <div className="flex items-center gap-2">
                                                <span className="relative flex h-2 w-2">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                                </span>
                                                <span className="text-xs font-medium text-slate-500">Listening</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <span className="relative flex h-2 w-2">
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-300"></span>
                                                </span>
                                                <span className="text-xs font-medium text-slate-400">Offline</span>
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
