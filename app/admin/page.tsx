
import { createAdminClient } from '@/lib/supabase/admin'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Power, UserCog, Users, Building2 } from "lucide-react"
import { ProvisionTenantDialog } from "@/components/provision-tenant-dialog"
import { TenantActions } from "@/components/tenant-actions"
import { LeadsTable } from "@/components/leads-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function AdminPage() {
    const supabase = createAdminClient()

    // Fetch Orgs and Leads in parallel
    const [orgsResult, leadsResult] = await Promise.all([
        supabase.from('organizations').select('*').order('created_at', { ascending: false }),
        supabase.from('saas_leads').select('*').neq('status', 'provisioned').order('created_at', { ascending: false })
    ])

    const orgs = orgsResult.data || []
    const leads = leadsResult.data || []

    return (
        <div className="flex flex-col gap-6 p-6 min-h-screen bg-black text-white">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">The Factory</h1>
                    <p className="text-neutral-400">Manage your SaaS tenants and global infrastructure.</p>
                </div>
                <ProvisionTenantDialog />
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card className="bg-neutral-900 border-neutral-800 text-white shadow-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Revenue (MRR)</CardTitle>
                        <UserCog className="h-4 w-4 text-neutral-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$0.00</div>
                        <p className="text-xs text-neutral-400">Ready to scale</p>
                    </CardContent>
                </Card>
                <Card className="bg-neutral-900 border-neutral-800 text-white shadow-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Agencies</CardTitle>
                        <Building2 className="h-4 w-4 text-neutral-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{orgs.length}</div>
                        <p className="text-xs text-neutral-400">Active tenants</p>
                    </CardContent>
                </Card>
                <Card className="bg-neutral-900 border-neutral-800 text-white shadow-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Leads</CardTitle>
                        <Users className="h-4 w-4 text-neutral-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-500">{leads.length}</div>
                        <p className="text-xs text-neutral-400">Requests waiting</p>
                    </CardContent>
                </Card>
                <Card className="bg-neutral-900 border-neutral-800 text-white shadow-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">System Health</CardTitle>
                        <Power className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">100%</div>
                        <p className="text-xs text-neutral-400">All systems optimal</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="tenants" className="space-y-4">
                <TabsList className="bg-neutral-900 border border-neutral-800 p-1">
                    <TabsTrigger value="leads" className="data-[state=active]:bg-neutral-800 data-[state=active]:text-white text-neutral-400 px-6">Leads & Requests</TabsTrigger>
                    <TabsTrigger value="tenants" className="data-[state=active]:bg-neutral-800 data-[state=active]:text-white text-neutral-400 px-6">Agencies</TabsTrigger>
                </TabsList>

                <TabsContent value="tenants" className="space-y-4">
                    <Card className="bg-neutral-900 border-neutral-800 text-white">
                        <CardHeader>
                            <CardTitle>Tenants</CardTitle>
                            <CardDescription className="text-neutral-400">Active organizations on your platform.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-neutral-800 hover:bg-neutral-900">
                                        <TableHead className="text-neutral-400">Organization</TableHead>
                                        <TableHead className="text-neutral-400">Status</TableHead>
                                        <TableHead className="text-neutral-400">Phone</TableHead>
                                        <TableHead className="text-neutral-400">Created At</TableHead>
                                        <TableHead className="text-right text-neutral-400">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orgs.map((org) => (
                                        <TableRow key={org.id} className="border-neutral-800 hover:bg-neutral-800">
                                            <TableCell className="font-medium text-white">{org.name}</TableCell>
                                            <TableCell>
                                                <Badge variant={org.billing_status === 'active' ? 'default' : 'destructive'}
                                                    className={org.billing_status === 'active' ? "bg-green-900 text-green-300 hover:bg-green-900" : ""}>
                                                    {org.billing_status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-neutral-300">{org.settings?.twilio_number || '-'}</TableCell>
                                            <TableCell className="text-neutral-300">{new Date(org.created_at).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-right flex justify-end gap-2">
                                                <TenantActions orgId={org.id} email={org.email} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {orgs.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center text-neutral-500">
                                                No tenants found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="leads" className="space-y-4">
                    <Card className="bg-neutral-900 border-neutral-800 text-white">
                        <CardHeader>
                            <CardTitle>Inbound Requests</CardTitle>
                            <CardDescription className="text-neutral-400">People requesting access from your landing page.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <LeadsTable leads={leads} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
