
import { createClient } from "@/lib/supabase/server";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BookingActions } from "./booking-actions";
import { EmptyState } from "@/components/empty-state";
import { MessageSquare, Calendar } from "lucide-react";

export default async function BookingsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch Bookings with Relations
    // For MVP, assuming user is Broker/Agent and RLS allows reading bookings for their Org
    const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user!.id).single();

    // Fetch Org Settings to get Twilio Number
    const { data: org } = await supabase
        .from('organizations')
        .select('settings')
        .eq('id', profile!.org_id)
        .single();

    const twilioNumber = (org?.settings as any)?.twilio_number || "Determining...";

    // We need to query bookings where property -> org_id matches
    const { data: bookings } = await supabase
        .from('bookings')
        .select(`
        id, created_at, status, time_slot,
        properties!inner (id, parsed_data, org_id),
        leads (name, phone)
    `)
        .eq('properties.org_id', profile!.org_id)
        .order('created_at', { ascending: false });

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Bookings</h1>
            </div>

            {(!bookings || bookings.length === 0) ? (
                <EmptyState
                    icon={Calendar}
                    title="Waiting for the first spark"
                    description="Once you add a property, text your new AI Assistant to test the booking flow!"
                    action={
                        <div className="bg-slate-100 p-4 rounded-lg flex items-center gap-3 mt-2 border border-slate-200">
                            <div className="bg-green-100 p-2 rounded-full">
                                <MessageSquare className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="text-left">
                                <p className="text-xs font-semibold text-slate-500 uppercase">Text this number</p>
                                <p className="text-lg font-mono font-bold text-slate-900">{twilioNumber}</p>
                            </div>
                        </div>
                    }
                />
            ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-slate-200">
                                <TableHead className="text-slate-500">Property</TableHead>
                                <TableHead className="text-slate-500">Lead</TableHead>
                                <TableHead className="text-slate-500">Time Slot</TableHead>
                                <TableHead className="text-slate-500">Status</TableHead>
                                <TableHead className="text-right text-slate-500">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {bookings?.map((booking) => {
                                // Type Casting Logic
                                const prop: any = booking.properties; // Singular
                                const lead: any = booking.leads;
                                const propData = prop?.parsed_data;

                                return (
                                    <TableRow key={booking.id} className="border-slate-100 hover:bg-slate-50/50">
                                        <TableCell className="font-medium">
                                            <span className="text-slate-900">{propData?.location_area || 'Unknown'}</span> <br />
                                            <span className="text-xs text-slate-400">ID: {prop.id.slice(0, 6)}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-slate-800">{lead?.name || 'Unknown'}</span> <br />
                                            <span className="text-xs text-slate-500">{lead?.phone}</span>
                                        </TableCell>
                                        <TableCell className="text-slate-700">
                                            {booking.time_slot}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                booking.status === 'confirmed' ? 'default' :
                                                    booking.status === 'rejected' ? 'destructive' : 'secondary'
                                            } className={
                                                booking.status === 'confirmed' ? 'bg-green-600 hover:bg-green-700' : ''
                                            }>
                                                {booking.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {booking.status === 'pending_agent_review' && (
                                                <BookingActions bookingId={booking.id} />
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
