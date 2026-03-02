import { createAdminClient } from '@/lib/supabase/admin';
import { GoogleGenerativeAI, FunctionDeclaration, SchemaType, FunctionCallingMode } from '@google/generative-ai';

// Initialize Gemini matching the Enterprise B2B setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;

// Tool declaration: The VIP Escalation Handoff
const escalateVipLeadFunc: FunctionDeclaration = {
    name: "escalate_vip_lead",
    description: "Escalates a high-value VIP lead directly to the Broker or Director.",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            client_name: { type: SchemaType.STRING, description: "The name of the VIP client." },
            extracted_budget: { type: SchemaType.NUMBER, description: "The stated high budget amount." },
            key_preferences: { type: SchemaType.STRING, description: "Key properties they are looking for." }
        },
        required: ["client_name", "extracted_budget", "key_preferences"],
    },
};

export async function invokeBrain1(senderPhone: string, messageContent: string, leadProfile: any) {
    console.log(`[Brain 1 - Concierge] Waking up for Lead: ${leadProfile?.id || 'NEW'} (${senderPhone})`);

    const supabase = createAdminClient();
    let history: any[] = [];
    let conversationId: string | null = null;
    let vipThreshold = 2000000;

    // 0. Extraer Configuración del Tenant
    if (leadProfile && leadProfile.org_id) {
        const { data: orgData } = await supabase
            .from('organizations')
            .select('vip_budget_threshold')
            .eq('id', leadProfile.org_id)
            .single();
        if (orgData?.vip_budget_threshold) {
            vipThreshold = orgData.vip_budget_threshold;
        }
    }

    // 1. Capa de Memoria: Gestionar la Conversación
    if (leadProfile && leadProfile.id) {
        // Buscamos conversación abierta
        let { data: convData } = await supabase
            .from('conversations')
            .select('id')
            .eq('lead_id', leadProfile.id)
            .eq('status', 'open')
            .single();

        // Si no existe, la creamos al vuelo
        if (!convData) {
            const { data: newConv } = await supabase
                .from('conversations')
                .insert({ lead_id: leadProfile.id, status: 'open' })
                .select('id')
                .single();
            convData = newConv;
        }

        if (convData) {
            conversationId = convData.id;

            // Extraemos los últimos 10 mensajes para el RAG
            const { data: msgData } = await supabase
                .from('messages')
                .select('sender_type, content')
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: false })
                .limit(10);

            if (msgData) {
                // Invertimos para el LLM (orden cronológico en formato Gemini)
                history = msgData.reverse().map(msg => ({
                    role: msg.sender_type === 'ai' || msg.sender_type === 'system' ? 'model' : 'user',
                    parts: [{ text: msg.content }]
                }));
            }
        }
    }

    // 2. Persistir Mensaje Entrante (Antes de llamar al LLM)
    if (conversationId) {
        await supabase.from('messages').insert({
            conversation_id: conversationId,
            sender_type: 'user', // Instrucción directa: El cliente final cuenta como 'user' o 'lead'
            content: messageContent,
            content_type: 'text'
        });
    }

    // 3. El System Prompt B2C (Conserje de WhatsApp Estricto)
    const systemPrompt = `You are the AI Concierge for a luxury real estate agency in Cyprus. 
Your primary goal is to qualify inbound leads efficiently and professionally via WhatsApp.

STRICT RULES (CRITICAL U.C. 1.X):
1. QUALIFICATION: Politely ask for the client's Budget, desired Area/City, and number of Bedrooms before proceeding with aggressive selling.
2. NO HALLUCINATION: NEVER invent properties, addresses, or prices. If you don't know the exact inventory requested, say you are checking with the senior agents.
3. SCHEDULING BAILOUT: NEVER confirm a viewing time or date directly. ALWAYS state that you must "check with the specialized agent to confirm their schedule". Do NOT promise an hour blindly.
4. TONE: Professional, warm, and highly efficient. Use short messages suitable for WhatsApp (1-3 sentences max). Use emojis sparingly but tastefully (🏠, ✨, 📅).
5. NO SALES PRESSURE: You are a white-glove concierge, not a pushy salesperson. Ensure the client feels assisted.`;

    // Inyectar el Bypass VIP dinámico
    const finalSystemPrompt = systemPrompt + `\n\nVIP RULE: The VIP budget threshold for this agency is €${vipThreshold}. If the user states a budget equal to or higher than this, you MUST use the escalate_vip_lead tool immediately to transfer them to the Director.Do not provide normal responses if VIP is triggered.`;

    try {
        // 3. El Motor LLM (Gemini 2.5 Pro - Modo Dios)
        console.log(`[Brain 1] Invoking Gemini 2.5 Pro for qualification...`);
        const aiModel = genAI.getGenerativeModel({
            model: 'gemini-2.5-pro',
            systemInstruction: finalSystemPrompt,
            tools: [{ functionDeclarations: [escalateVipLeadFunc] }],
            toolConfig: { functionCallingConfig: { mode: FunctionCallingMode.AUTO } }
        });

        const chat = aiModel.startChat({
            history: history,
            generationConfig: {
                temperature: 0.2, // Estrictamente frío
                maxOutputTokens: 300,
            }
        });

        const chatCompletion = await chat.sendMessage(messageContent);
        const response = chatCompletion.response;
        const calls = response.functionCalls();

        let aiResponse = '';

        if (calls && calls.length > 0) {
            const call = calls[0];
            if (call.name === 'escalate_vip_lead') {
                const args = call.args as any;
                console.log(`[Brain 1 - VIP HIT] 🚨 Escalar lead a Broker.Cliente: ${args.client_name}, Presupuesto: ${args.extracted_budget} `);

                // Buscar un Broker o Admin de este Tenant
                const { data: brokerProfile } = await supabase
                    .from('profiles')
                    .select('whatsapp_number')
                    .eq('org_id', leadProfile.org_id)
                    .in('role', ['admin', 'broker', 'super_admin'])
                    .not('whatsapp_number', 'is', null)
                    .limit(1)
                    .single();

                if (brokerProfile?.whatsapp_number) {
                    const alertMsg = `🚨 * NUEVO LEAD VIP DETECTADO * 🚨\n * Nombre:* ${args.client_name} \n * Presupuesto:* ${args.extracted_budget}€\n * Detalles:* ${args.key_preferences} \n * Teléfono del lead:* ${senderPhone} \n👉 Escríbele directamente para cerrar la venta.`;
                    await sendWhatsAppMessage(brokerProfile.whatsapp_number, alertMsg);
                }

                aiResponse = "Por el tipo de propiedad que busca, voy a transferir su expediente directamente a nuestro Director para garantizarle atención prioritaria. Le contactará en breve.";
            }
        } else {
            aiResponse = response.text() || 'I am currently checking that with my team, I will get back to you shortly.';
        }

        console.log(`[Brain 1 - Concierge] Generated Response: ${aiResponse} `);

        // 5. Persistir Respuesta de la IA
        if (conversationId) {
            await supabase.from('messages').insert({
                conversation_id: conversationId,
                sender_type: 'ai',
                content: aiResponse,
                content_type: 'text'
            });
        }

        // 6. El Disparo Final (Meta API)
        await sendWhatsAppMessage(senderPhone, aiResponse);

        return { success: true, ai_response: aiResponse };

    } catch (error) {
        console.error('[Brain 1] Internal Gemini API Error:', error);
        return { success: false, error: 'AI generation failed' };
    }
}

// ==========================================
// EL SISTEMA DE ENVÍO DIRECTO A META
// ==========================================
async function sendWhatsAppMessage(to: string, text: string) {
    if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_ID) {
        console.warn('[WhatsApp API] WHATSAPP_TOKEN or WHATSAPP_PHONE_ID missing in env. Simulating sending text:', text);
        return;
    }

    try {
        const response = await fetch(`https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_ID}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: to, // El API requiere el formato sin '+' (ej: 34600123456)
                type: 'text',
                text: {
                    preview_url: true,
                    body: text
                }
            })
        });

        const fbResult = await response.json();
        if (!response.ok) {
            console.error('[WhatsApp API] Meta Broadcast Failed:', fbResult);
        } else {
            console.log(`[WhatsApp API] Successfully dispatched payload to ${to} via Graph API`);
        }
    } catch (err) {
        console.error('[WhatsApp API] Native Fetch Exception:', err);
    }
}
