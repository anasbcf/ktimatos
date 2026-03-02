'use client'

import { useState } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { UserPlus, Clock, Eye, Activity, CheckCircle2, AlertCircle, PhoneOff } from "lucide-react"
import { ProvisionTenantDialog } from "./provision-tenant-dialog"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

interface Lead {
    id: string
    created_at: string
    full_name: string
    email: string
    agency_name: string
    phone: string | null
    status: string
    call_status: string | null
    call_summary: string | null
    call_transcript: string | null
    language: string | null
}

export function LeadsTable({ leads }: { leads: Lead[] }) {
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
    const [isProvisioning, setIsProvisioning] = useState(false)
    const [intelLead, setIntelLead] = useState<Lead | null>(null)

    function handleProvisionClick(lead: Lead) {
        setSelectedLead(lead)
        setIsProvisioning(true)
    }

    function getCallStatusBadge(status: string | null) {
        switch (status) {
            case 'completed':
                return <Badge variant="outline" className="border-green-900 bg-green-950/30 text-green-400 capitalize"><CheckCircle2 className="w-3 h-3 mr-1" />Completed</Badge>
            case 'failed':
                return <Badge variant="outline" className="border-red-900 bg-red-950/30 text-red-400 capitalize"><AlertCircle className="w-3 h-3 mr-1" />Failed</Badge>
            case 'not_supported':
                return <Badge variant="outline" className="border-slate-800 bg-slate-900/50 text-slate-400 capitalize"><PhoneOff className="w-3 h-3 mr-1" />Not Supported</Badge>
            case 'pending':
            default:
                return <Badge variant="outline" className="border-yellow-900 bg-yellow-950/30 text-yellow-500 capitalize"><Activity className="w-3 h-3 mr-1 animate-pulse" />Pending</Badge>
        }
    }

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow className="border-neutral-800 hover:bg-neutral-900">
                        <TableHead className="text-neutral-400">Name</TableHead>
                        <TableHead className="text-neutral-400">Agency</TableHead>
                        <TableHead className="text-neutral-400">Language</TableHead>
                        <TableHead className="text-neutral-400">Status</TableHead>
                        <TableHead className="text-neutral-400">AI Call Status</TableHead>
                        <TableHead className="text-neutral-400">Date</TableHead>
                        <TableHead className="text-right text-neutral-400">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {leads.map((lead) => {
                        const language = lead.language;
                        const cleanAgencyName = lead.agency_name;

                        return (
                            <TableRow key={lead.id} className="border-neutral-800 hover:bg-neutral-800 group">
                                <TableCell className="font-medium text-white">
                                    {lead.full_name}
                                    <div className="text-xs text-neutral-500 font-normal">{lead.email}</div>
                                </TableCell>
                                <TableCell className="text-neutral-300">
                                    {cleanAgencyName}
                                    {lead.phone && <div className="text-xs text-neutral-500">{lead.phone}</div>}
                                </TableCell>
                                <TableCell>
                                    {language ? (
                                        <Badge variant="outline" className="border-slate-700 text-slate-300">
                                            {language}
                                        </Badge>
                                    ) : (
                                        <span className="text-neutral-500 text-xs">-</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="border-blue-900 text-blue-400 capitalize">
                                        <Clock className="w-3 h-3 mr-1" /> {lead.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {getCallStatusBadge(lead.call_status)}
                                </TableCell>
                                <TableCell className="text-neutral-300 text-xs text-nowrap">
                                    {new Date(lead.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-right flex justify-end gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-yellow-900/50 text-yellow-500 hover:bg-yellow-950/30 hover:text-yellow-400 transition-colors gap-2"
                                        onClick={() => setIntelLead(lead)}
                                    >
                                        <Eye className="w-4 h-4" />
                                        Intel
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-white hover:bg-blue-600 transition-colors gap-2"
                                        onClick={() => handleProvisionClick(lead)}
                                    >
                                        <UserPlus className="w-4 h-4" />
                                        Provision
                                    </Button>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                    {leads.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center text-neutral-500">
                                No pending leads. Your landing page is waiting!
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {/* Provision Modal */}
            {selectedLead && (
                <ProvisionTenantDialog
                    open={isProvisioning}
                    onOpenChange={setIsProvisioning}
                    initialData={{
                        lead_id: selectedLead.id,
                        name: selectedLead.agency_name,
                        email: selectedLead.email,
                        phone: selectedLead.phone ?? undefined
                    }}
                />
            )}

            {/* AI Intel Modal */}
            <IntelModal
                lead={intelLead}
                open={!!intelLead}
                onOpenChange={(isOpen) => !isOpen && setIntelLead(null)}
            />
        </>
    )
}

function IntelModal({ lead, open, onOpenChange }: { lead: Lead | null, open: boolean, onOpenChange: (o: boolean) => void }) {
    if (!lead) return null;

    const isPending = !lead.call_status || lead.call_status === 'pending';
    const isNotSupported = lead.call_status === 'not_supported';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl bg-[#0B0C10] border-gray-800 text-gray-200">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                        <Eye className="w-5 h-5 text-yellow-500" /> AI Intelligence Report
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Agent interaction summary for <span className="text-white font-medium">{lead.full_name}</span> ({lead.agency_name})
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4 space-y-6">
                    {isPending ? (
                        <div className="p-8 text-center border border-dashed border-gray-800 rounded-xl bg-[#111216]">
                            <Activity className="w-8 h-8 text-yellow-500/50 animate-pulse mx-auto mb-3" />
                            <h3 className="text-lg font-medium text-gray-300">Awaiting AI Connection...</h3>
                            <p className="text-sm text-gray-500 mt-1">The outbound call has not completed yet or summary is processing.</p>
                        </div>
                    ) : isNotSupported ? (
                        <div className="p-8 text-center border border-dashed border-gray-800 rounded-xl bg-[#111216]">
                            <PhoneOff className="w-8 h-8 text-slate-500 mx-auto mb-3" />
                            <h3 className="text-lg font-medium text-gray-300">Region Not Supported</h3>
                            <p className="text-sm text-gray-500 mt-1">This lead was routed directly to Cal.com for manual booking.</p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-2">
                                <h4 className="text-sm font-bold text-yellow-500 uppercase tracking-widest">AI Summary (Client Pains)</h4>
                                <div className="p-4 rounded-xl bg-yellow-950/10 border border-yellow-900/30 text-gray-300 leading-relaxed min-h-[80px]">
                                    {lead.call_summary || "No specific summary extracted. See full transcript below."}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Full Transcript</h4>
                                <div className="p-4 rounded-xl bg-[#111216] border border-gray-800">
                                    <div className="max-h-[300px] overflow-y-auto text-sm text-gray-400 leading-relaxed space-y-2 pr-2 custom-scrollbar font-mono">
                                        {lead.call_transcript ? (
                                            lead.call_transcript.split('\n').map((line, i) => (
                                                <div key={i}>{line}</div>
                                            ))
                                        ) : (
                                            <div className="text-gray-600 italic">No transcript recorded for this call.</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
} 
