import { createAdminClient } from '@/lib/supabase/admin';
import { GoogleGenerativeAI, FunctionDeclaration, SchemaType, FunctionCallingMode, Part } from '@google/generative-ai';

// Initialize Native Multimodal Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;

// Tool declaration: The Executable CRM Action
const updateCrmLeadFunc: FunctionDeclaration = {
    name: "update_crm_lead",
    description: "Updates the CRM system with feedback, notes, and actions for a specific real estate lead.",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            lead_name_or_id: { type: SchemaType.STRING, description: "The name or ID of the lead being updated." },
            feedback_note: { type: SchemaType.STRING, description: "The detailed notes, pain points, or feedback from the meeting." },
            new_budget: { type: SchemaType.NUMBER, description: "The updated budget amount, if the agent mentions a specific number." },
            action_to_take: { type: SchemaType.STRING, description: "The action to take next", format: "enum", enum: ['discard', 'search', 'follow_up', 'schedule_showing', 'unknown'] }
        },
        required: ["lead_name_or_id", "feedback_note", "action_to_take"],
    },
};

export async function invokeBrain2(senderPhone: string, messageContent: string, audioId: string | null, agentProfile: any) {
    console.log(`[Brain 2 - Executive] Waking up for Agent Role: ${agentProfile.role} (${senderPhone})`);

    const supabase = createAdminClient();
    let parts: Part[] = [];

    // 1. Multimodalidad: Descarga de Meta API si hay nota de voz
    if (audioId) {
        console.log(`[Brain 2] Fetching native audio payload from Meta for Audio ID: ${audioId}`);
        if (!WHATSAPP_TOKEN) {
            console.error('[Brain 2] Missing WHATSAPP_TOKEN. Cannot fetch media.');
        } else {
            try {
                const urlRes = await fetch(`https://graph.facebook.com/v20.0/${audioId}`, {
                    headers: { 'Authorization': `Bearer ${WHATSAPP_TOKEN}` }
                });

                if (!urlRes.ok) {
                    throw new Error(`Meta API Error: Failed to get audio URL. Status: ${urlRes.status}`);
                }

                const urlData = await urlRes.json();

                if (urlData.url) {
                    // Download the actual binary using the provided URL
                    const audioRes = await fetch(urlData.url, {
                        headers: { 'Authorization': `Bearer ${WHATSAPP_TOKEN}` }
                    });

                    if (!audioRes.ok) {
                        throw new Error(`Meta API Error: Failed to download audio binary. Status: ${audioRes.status}`);
                    }

                    const arrayBuffer = await audioRes.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);
                    const base64Audio = buffer.toString('base64');
                    const mimeType = urlData.mime_type || 'audio/ogg';

                    parts.push({
                        inlineData: {
                            data: base64Audio,
                            mimeType: mimeType
                        }
                    });
                    console.log(`[Brain 2] Successfully injected ${mimeType} binary into Gemini Context.`);
                }
            } catch (error: any) {
                console.error('[Brain 2] Failed to fetch audio from Meta:', error);
                await sendWhatsAppMessage(senderPhone, `⚠️ *Meta API Error:* No pude descargar ni analizar tu nota de voz. Por favor, escríbelo en texto.`);
                return { success: false, message: 'Audio fetch failed' };
            }
        }
    }

    // 2. Si el agente también escribió texto, lo añadimos (Contexto Híbrido)
    if (messageContent && !messageContent.includes('Voice Message Received')) {
        parts.push({ text: messageContent });
    }

    if (parts.length === 0) {
        console.error('[Brain 2] No data to process (No audio and no text).');
        return { success: false, message: 'No input provided' };
    }

    // 3. System Prompt Ejecutivo (Ultra restrictivo)
    const systemPrompt = `You are the Executive AI for a Real Estate Broker. Listen to the broker's voice note. Your ONLY job is to extract commands and call the update_crm_lead tool. NEVER output conversational text. Always act as an invisible, silent processor.`;

    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-pro',
            systemInstruction: systemPrompt,
            tools: [{ functionDeclarations: [updateCrmLeadFunc] }],
            // Forzar a Llama 3 / Gemini a invocar la función si los parámetros encajan
            toolConfig: { functionCallingConfig: { mode: FunctionCallingMode.ANY, allowedFunctionNames: ["update_crm_lead"] } }
        });

        console.log(`[Brain 2] Invoking Gemini 2.5 Pro (God Mode - Multimodal & Function Calling)...`);

        const chatCompletion = await model.generateContent({
            contents: [{ role: 'user', parts: parts }],
            generationConfig: { temperature: 0.0 } // Cold robotic precision
        });

        const response = chatCompletion.response;
        const calls = response.functionCalls();

        // 4. El Cierre del Cerebro 2: Simulador de Ejecución
        if (calls && calls.length > 0) {
            const call = calls[0];
            if (call.name === 'update_crm_lead') {
                const args = call.args as any;

                console.log(`============= [CRM UPDATE ENGINE] =============`);
                console.log(`🎯 Lead: ${args.lead_name_or_id}`);
                console.log(`📝 Feedback: ${args.feedback_note}`);
                console.log(`💰 Budget: ${args.new_budget || 'Not specified'}`);
                console.log(`⚡ Action: ${args.action_to_take}`);
                console.log(`===============================================`);

                // 5. Búsqueda Robusta (Fuzzy) y Seguridad Multi-Tenant
                const { data: matchedLeads, error: searchError } = await supabase
                    .from('leads')
                    .select('id, name, preferences_summary, budget, org_id')
                    .eq('org_id', agentProfile.org_id)
                    .ilike('name', `%${args.lead_name_or_id}%`)
                    .limit(1);

                if (searchError || !matchedLeads || matchedLeads.length === 0) {
                    console.log(`[Brain 2] Lead no encontrado: ${args.lead_name_or_id}`);
                    const errorMsg = `❌ *Error:* No he encontrado ningún lead llamado "${args.lead_name_or_id}" en tu base de datos. Intenta usar su nombre completo.`;
                    await sendWhatsAppMessage(senderPhone, errorMsg);
                    return { success: false, message: 'Lead not found' };
                }

                const targetLead = matchedLeads[0];
                const currentNotes = targetLead.preferences_summary || '';
                const timestamp = new Date().toLocaleString('en-US');
                const newNotesRaw = currentNotes ? `${currentNotes}\n\n[${timestamp} Update]: ${args.feedback_note}` : `[${timestamp} Update]: ${args.feedback_note}`;

                const updatePayload: any = { preferences_summary: newNotesRaw };
                if (args.new_budget) {
                    updatePayload.budget = args.new_budget;
                }

                // El Update Final en Supabase
                const { error: updateError } = await supabase
                    .from('leads')
                    .update(updatePayload)
                    .eq('id', targetLead.id);

                if (updateError) {
                    console.error('[Brain 2] Failed to update lead in DB:', updateError);
                    await sendWhatsAppMessage(senderPhone, `⚠️ *Error de CRM:* No pude guardar los cambios en el perfil de ${targetLead.name}. Error interno.`);
                    return { success: false, error: 'Database update failed' };
                }

                // Enviar confirmación al Agente por WhatsApp
                const confirmText = `✅ *CRM Actualizado*\n*Lead:* ${targetLead.name}\n*Acción:* ${args.action_to_take}\n*Nota:* ${args.feedback_note}`;
                await sendWhatsAppMessage(senderPhone, confirmText);

                return { success: true, toolCall: call };
            }
        }

        return { success: false, message: 'No tool was called by Gemini.' };

    } catch (e: any) {
        console.error('[Brain 2] Gemini Execution Error:', e);
        return { success: false, error: e.message };
    }
}

// Dispatcher de Confirmación (Para hablarle al Agente internamente)
async function sendWhatsAppMessage(to: string, text: string) {
    if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_ID) return;
    try {
        await fetch(`https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_ID}/messages`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: to,
                type: 'text',
                text: { preview_url: false, body: text }
            })
        });
    } catch (err) {
        console.error('[WhatsApp Fetch Error]:', err);
    }
}
