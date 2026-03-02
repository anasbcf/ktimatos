import { createClient } from "@/lib/supabase/server";
import { PropertyForm } from "@/components/properties/property-form";
import { savePropertyAction } from "../../actions";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { PropertyData } from "@/lib/ai/extractor";

export default async function EditPropertyPage({ params }: { params: { id: string } }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single();

    if (!profile?.org_id) {
        return <div className="p-8">No organization found.</div>;
    }

    // Fetch the property
    const { data: property } = await supabase
        .from('properties')
        .select('*')
        .eq('id', params.id)
        .eq('org_id', profile.org_id) // Security check
        .single();

    if (!property) {
        return <div className="p-8">Property not found or unauthorized.</div>;
    }

    // Fetch agents for the org to populate the dropdown
    const { data: agents } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('org_id', profile.org_id);

    // Fetch assigned agents
    const { data: assigned } = await supabase
        .from('property_agents')
        .select('agent_id')
        .eq('property_id', params.id);

    const assignedAgentIds = assigned?.map(a => a.agent_id) || [];

    // The Server Action wrapper for updating
    const updateAction = async (data: PropertyData, assignedAgents: string[], status?: string) => {
        "use server";
        const result = await savePropertyAction(data, assignedAgents, params.id, status);
        if (result.success) {
            redirect('/dashboard/properties');
        } else {
            // Handle error - ideally expose it to UI via a toast, but server throws for now
            throw new Error(result.error || "Update failed");
        }
    };

    return (
        <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full pb-12">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/properties" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back to Properties
                </Link>
                <h1 className="text-2xl font-bold tracking-tight">Edit Property</h1>
            </div>

            <PropertyForm
                agents={agents || []}
                initialData={property.parsed_data as any}
                initialStatus={property.status}
                initialAssignedAgents={assignedAgentIds}
                onSubmit={updateAction}
            />
        </div>
    );
}
