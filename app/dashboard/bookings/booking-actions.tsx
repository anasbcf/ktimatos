
'use client'

import { Button } from "@/components/ui/button";
import { updateBookingStatus } from "./actions";
import { Check, X } from "lucide-react";
import { useState } from "react";
// import { useToast } from "@/components/ui/use-toast";

export function BookingActions({ bookingId }: { bookingId: string }) {
    const [loading, setLoading] = useState(false);

    async function handleStatus(status: 'confirmed' | 'rejected') {
        setLoading(true);
        await updateBookingStatus(bookingId, status);
        setLoading(false);
    }

    return (
        <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleStatus('confirmed')} disabled={loading}>
                <Check className="h-4 w-4 mr-1" /> Approve
            </Button>
            <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleStatus('rejected')} disabled={loading}>
                <X className="h-4 w-4 mr-1" /> Reject
            </Button>
        </div>
    )
}
