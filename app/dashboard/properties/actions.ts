'use server'

import { createClient } from "@/lib/supabase/server";
import { PropertyData } from "@/lib/ai/extractor";
import { revalidatePath } from "next/cache";

/**
 * Downloads an external image, uploads it to Supabase Storage, and returns the new public URL.
 */
async function uploadImageToSupabase(url: string, supabase: any, propertyId: string): Promise<string | null> {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.warn(`[Anti-Hotlink] Failed to fetch image: ${url} - Status: ${response.status}`);
            return null;
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Generate a unique filename using timestamp and a random string
        const ext = url.split('.').pop()?.split('?')[0] || 'jpg';
        const fileName = `${propertyId}-${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
        const filePath = `properties/${fileName}`;

        const { data, error } = await supabase.storage
            .from('properties-media')
            .upload(filePath, buffer, {
                contentType: response.headers.get('content-type') || 'image/jpeg',
                upsert: true
            });

        if (error) {
            console.error(`[Anti-Hotlink] Supabase upload failed for ${url}:`, error.message);
            return null;
        }

        const { data: publicData } = supabase.storage
            .from('properties-media')
            .getPublicUrl(filePath);

        return publicData.publicUrl;
    } catch (error) {
        console.error(`[Anti-Hotlink] Exception processing image ${url}:`, error);
        return null;
    }
}

export async function savePropertyAction(data: PropertyData, assignedAgentIds: string[], propertyId?: string, status?: string) {
    const supabase = await createClient();

    // 1. Auth & Tenant Isolation via Impersonation Helper
    const { requireActiveOrg } = await import('@/lib/impersonation');

    let activeOrgId;
    try {
        const ctx = await requireActiveOrg();
        activeOrgId = ctx.activeOrgId;
    } catch (e: any) {
        return { success: false, error: e.message || "Unauthorized or missing organization context" };
    }

    // Se mantiene user.id para registrar el created_by exacto de quién lo hizo (Admin o Broker)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    try {
        console.log(`[Save] Starting property save for user ${user.id}...`);

        const targetPropertyId = propertyId || crypto.randomUUID();

        // 2. The Anti-Hotlinking Engine (Image Processing)
        console.log(`[Save] Processing ${data.images_urls.length} images for hotlink protection...`);
        const secureImageUrls: string[] = [];

        for (const externalUrl of data.images_urls) {
            // Already a supabase URL? Skip download.
            if (externalUrl.includes('supabase.co')) {
                secureImageUrls.push(externalUrl);
                continue;
            }
            const internalUrl = await uploadImageToSupabase(externalUrl, supabase, targetPropertyId);
            if (internalUrl) {
                secureImageUrls.push(internalUrl);
            }
        }

        // Replace the external URLs with our internal ones
        const secureData = { ...data, images_urls: secureImageUrls };

        // 3. Database Upsertion
        console.log(`[Save] Upserting main record...`);

        // Build the payload
        const payload: any = {
            id: targetPropertyId,
            org_id: activeOrgId,
            parsed_data: secureData,
            updated_at: new Date().toISOString()
        };

        // Important: Only set created_by on new records, and only update status if explicitly passed (or default to Available for new)
        if (!propertyId) {
            payload.created_by = user.id;
            payload.status = status || 'Available';
        } else if (status) {
            payload.status = status;
        }

        const { data: savedProperty, error: upsertError } = await supabase
            .from('properties')
            .upsert(payload)
            .select('id')
            .single();

        if (upsertError) {
            console.error("DB Upsert Error:", upsertError);
            return { success: false, error: "Failed to save the property record." };
        }

        const finalPropertyId = savedProperty.id;

        // 4. Pivot Table Sync (Atomic Agents Assignment)
        console.log(`[Save] Syncing ${assignedAgentIds.length} agents...`);

        // Clear existing
        await supabase.from('property_agents').delete().eq('property_id', finalPropertyId);

        // Bulk insert new
        if (assignedAgentIds.length > 0) {
            const agentRecords = assignedAgentIds.map(agentId => ({
                property_id: finalPropertyId,
                agent_id: agentId
            }));

            const { error: syncError } = await supabase.from('property_agents').insert(agentRecords);

            if (syncError) {
                console.error("Agent Sync Error:", syncError);
                // Non-fatal, property is saved, but relationships are broken
                return { success: true, warning: "Property saved but agent mapping failed." };
            }
        }

        console.log(`[Save] 🎉 Success!`);
        revalidatePath('/dashboard/properties');

        // We could also revalidate specific agent pages if calendars rely on this

        return { success: true, propertyId: finalPropertyId };

    } catch (e: any) {
        console.error("Save Action Exception:", e);
        return { success: false, error: e.message || "Internal Server Error" };
    }
}
