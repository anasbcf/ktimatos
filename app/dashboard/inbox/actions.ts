"use server"

import { requireActiveOrg } from "@/lib/impersonation";
import { createAdminClient } from "@/lib/supabase/admin";
import { auth } from "@clerk/nextjs/server";

export async function getConversationsAction() {
    const { activeOrgId } = await requireActiveOrg();
    if (!activeOrgId) throw new Error("No active organization found");

    const supabase = await createAdminClient();

    // Fetch conversations for the org
    const { data: conversations, error: convErr } = await supabase
        .from('whatsapp_conversations')
        .select(`
            id,
            lead_phone,
            status,
            created_at,
            updated_at
        `)
        .eq('org_id', activeOrgId)
        .order('updated_at', { ascending: false });

    if (convErr) throw convErr;

    // Fetch all leads for this org to resolve names
    const { data: leads, error: leadErr } = await supabase
        .from('leads')
        .select('phone, name')
        .eq('org_id', activeOrgId);

    if (leadErr) throw leadErr;

    const leadsMap = new Map();
    leads?.forEach((l: any) => {
        // Fallback name logic if name isn't directly available.
        const fullName = l.name || "Unknown Lead";
        leadsMap.set(l.phone, fullName);
    });

    const enrichedConversations = conversations?.map((conv: any) => ({
        ...conv,
        lead_name: leadsMap.get(conv.lead_phone) || conv.lead_phone // Cross-reference lead name or phone fallback
    }));

    return enrichedConversations || [];
}

export async function getMessagesAction(conversationId: string) {
    const { activeOrgId } = await requireActiveOrg();
    const supabase = await createAdminClient();

    // Verify conversation belongs to org
    const { data: conv } = await supabase
        .from('whatsapp_conversations')
        .select('id')
        .eq('id', conversationId)
        .eq('org_id', activeOrgId)
        .single();

    if (!conv) throw new Error("Conversation not found or unauthorized");

    const { data: messages, error } = await supabase
        .from('whatsapp_messages')
        .select(`
            id,
            conversation_id,
            sender_type,
            agent_id,
            content,
            created_at
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return messages || [];
}

export async function toggleAIStatusAction(conversationId: string, currentStatus: string) {
    const { activeOrgId } = await requireActiveOrg();
    const supabase = await createAdminClient();

    const newStatus = currentStatus === 'ai_active' ? 'human_intervened' : 'ai_active';

    const { error } = await supabase
        .from('whatsapp_conversations')
        .update({ status: newStatus })
        .eq('id', conversationId)
        .eq('org_id', activeOrgId);

    if (error) throw error;
    return newStatus;
}

export async function sendHumanMessageAction(conversationId: string, leadPhone: string, text: string) {
    const { activeOrgId } = await requireActiveOrg();
    const { userId } = await auth();
    if (!activeOrgId || !userId) throw new Error("Unauthorized");

    const HW_TOKEN = process.env.WHATSAPP_TOKEN;
    const HW_PHONE_ID = process.env.WHATSAPP_PHONE_ID;

    if (!HW_TOKEN || !HW_PHONE_ID) {
        throw new Error("WhatsApp credentials not configured on the server.");
    }

    // 1. Send text via Meta Graph API
    const response = await fetch(`https://graph.facebook.com/v20.0/${HW_PHONE_ID}/messages`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${HW_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: leadPhone,
            type: 'text',
            text: { preview_url: false, body: text }
        })
    });

    const metaResult = await response.json();

    // Capture the 24-hour rule error from Meta
    if (!response.ok) {
        let errorMsg = "Fallo al enviar el mensaje de WhatsApp.";
        if (metaResult?.error?.code === 131047 || metaResult?.error?.message?.includes("24 hours") || metaResult?.error?.code === 131215) {
            errorMsg = "❌ Error de Meta: Han pasado más de 24h desde el último mensaje del cliente. Meta exige usar una plantilla aprobada para reiniciar la conversación.";
        } else if (metaResult?.error?.message) {
            errorMsg = `Error de Meta: ${metaResult.error.message}`;
        }
        throw new Error(errorMsg);
    }

    // 2. Save log to whatsapp_messages (Trazabilidad)
    const supabase = await createAdminClient();
    const { error: insertErr } = await supabase
        .from('whatsapp_messages')
        .insert({
            conversation_id: conversationId,
            sender_type: 'human_broker',
            agent_id: userId,
            content: text
        });

    if (insertErr) throw insertErr;

    return { success: true };
}
