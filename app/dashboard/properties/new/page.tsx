import { createClient } from "@/lib/supabase/server";
import { PropertyForm } from "@/components/properties/property-form";
import { savePropertyAction } from "../actions";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { PropertyData } from "@/lib/ai/extractor";

export default async function NewPropertyPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Get agents for the organization to populate the multi-select
    const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single();

    let agents: any[] = [];
    if (profile?.org_id) {
        const { data } = await supabase
            .from('profiles')
            .select('id, full_name')
            .eq('org_id', profile.org_id);

        agents = data || [];
    }

    // Server-side wrapper for the submit action to handle redirects securely
    async function submitAction(formData: PropertyData, agentIds: string[]) {
        'use server'
        const result = await savePropertyAction(formData, agentIds);
        if (result.success) {
            redirect('/dashboard/properties');
        } else {
            // Ideally trigger a client-side error, but redirecting with an error param is a fallback
            console.error("Failed to save:", result.error);
            // Throwing allows error.tsx to catch or we return error
            throw new Error(result.error);
        }
    }

    return (
        <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/properties" className="p-2 bg-white border rounded-md hover:bg-slate-50">
                    <ChevronLeft className="h-5 w-5 text-slate-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Add New Property</h1>
                    <p className="text-muted-foreground text-sm">Create a property manually or extract from a URL.</p>
                </div>
            </div>

            {/* We pass a client-wrapped version of the server action to handle UI errors gracefully later if needed */}
            <PropertyForm
                agents={agents}
                onSubmit={submitAction as any}
            />
        </div>
    );
}
