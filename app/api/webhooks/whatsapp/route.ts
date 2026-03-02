import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { invokeBrain1 } from '@/lib/ai/brain1_concierge';
import { invokeBrain2 } from '@/lib/ai/brain2_executive';
// WhatsApp Verification Secret
const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

// GET: Verificación requerida por Meta (WhatsApp Cloud API) al configurar el Webhook
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    if (!WHATSAPP_VERIFY_TOKEN) {
        console.error('[WhatsApp Webhook] FATAL: WHATSAPP_VERIFY_TOKEN is missing in .env');
        return new NextResponse('Internal Server Error', { status: 500 });
    }

    if (mode === 'subscribe' && token === WHATSAPP_VERIFY_TOKEN) {
        console.log('[WhatsApp Webhook] Verification successful');
        return new NextResponse(challenge, { status: 200 }); // Meta requiere response en texto plano
    } else {
        console.error('[WhatsApp Webhook] Verification failed');
        return new NextResponse('Forbidden', { status: 403 });
    }
}

// POST: Recepción de Mensajes (Router Cognitivo RBAC)
export async function POST(req: Request) {
    try {
        const body = await req.json();

        // 1. Verificamos que es un evento válido de WhatsApp
        if (body.object !== 'whatsapp_business_account') {
            return NextResponse.json({ error: 'Not a WhatsApp event' }, { status: 404 });
        }

        // 2. Parseo defensivo del payload anidado de Meta
        const entry = body.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;
        const messages = value?.messages;

        // Meta envía actualizaciones de estado (read/delivered) por este mismo webhook. 
        // Si no hay array de 'messages', es un status update y lo ignoramos por ahora.
        if (!messages || messages.length === 0) {
            return NextResponse.json({ success: true, message: 'Status update ignored' });
        }

        const message = messages[0];
        const senderPhone = message.from; // WhatsApp lo envía como string numérico puro (ej: "34600123456")
        const messageType = message.type;

        // Extracción de contenido base (soporta audios para transcripción futura)
        let content = '';
        if (messageType === 'text') {
            content = message.text.body;
        } else if (messageType === 'audio') {
            content = `[Voice Message Received - Audio ID: ${message.audio.id}]`;
        } else {
            content = `[Unsupported message type: ${messageType}]`;
        }

        console.log(`[Cognitive Router] Incoming message from ${senderPhone}: ${content.substring(0, 50)}...`);

        const supabase = createAdminClient();

        // ==========================================
        // CAPA DE ROUTING (Cognitive RBAC)
        // ==========================================

        // A. Buscamos en el Cerebro Ejecutivo (Internos / Agentes)
        const { data: agentProfile } = await supabase
            .from('profiles')
            .select('role, id, full_name, org_id')
            .eq('whatsapp_number', senderPhone)
            .single();

        if (agentProfile) {
            console.log(`[WhatsApp Router] Agent detected (${agentProfile.role}): Despertando Cerebro 2 (Executive) preparado para U.C. 2.X`);

            // Extraer el audioId si el agente grabó una nota de voz para actualizar el CRM
            const audioId = messageType === 'audio' ? message.audio?.id : null;

            // UX: Acuse de recibo instantáneo para audios lentos
            if (messageType === 'audio') {
                await sendWhatsAppReceipt(senderPhone, "⏳ Escuchando tu nota de voz...");
            } else {
                await sendWhatsAppReceipt(senderPhone, "⏳ Procesando tu orden en el CRM...");
            }

            // Invocamos el cerebro de forma asíncrona para despachar a Meta al instante
            invokeBrain2(senderPhone, content, audioId, agentProfile).catch(e => console.error(e));

            return NextResponse.json({ success: true, route: 'brain_2_executive' });
        }

        // B. Buscamos en el Cerebro Conserje (Clientes / Inquilinos / Leads)
        const { data: leadProfile } = await supabase
            .from('leads')
            .select('id, name, org_id')
            .eq('phone', senderPhone)
            .single();

        if (leadProfile) {
            console.log(`[WhatsApp Router] Client detected (Existing): Despertando Cerebro 1 (Concierge) preparado para U.C. 1.X`);

            // UX: Acuse de recibo para latencia de Gemini
            await sendWhatsAppReceipt(senderPhone, "⏳ Permíteme revisar eso en el sistema...");

            // Aquí inyectaremos la llamada LLM con funciones de Concierge (Agendar opt-in, buscar propiedades)
            invokeBrain1(senderPhone, content, leadProfile).catch(console.error);

            return NextResponse.json({ success: true, route: 'brain_1_concierge' });
        }

        // C. Cliente Frío No Reconocido (Nuevo Lead)
        console.log(`[WhatsApp Router] Client detected (New): Insertando Lead y Despertando Cerebro 1 (Concierge)`);

        // Extraemos 'receiverNumber' (el número de la Inmobiliaria al que ha escrito el cliente)
        const receiverNumber = value.metadata?.display_phone_number;
        console.log(`[Internal] Line receiving: ${receiverNumber}. Obteniendo el Tenant Org_ID...`);

        if (!receiverNumber) {
            console.error('[WhatsApp Router] Cannot resolve Multi-Tenant route. No display_phone_number found.');
            return NextResponse.json({ success: false, message: 'Unroutable inbound logic.' }, { status: 400 });
        }

        // Buscamos la Agencia que posee ese número para que el webhook sepa de quién es el Lead
        const cleanReceiverNum = receiverNumber.replace(/\+/g, ''); // Limpieza defensiva
        const { data: tenantOrg } = await supabase
            .from('organizations')
            .select('id')
            .eq('whatsapp_business_number', cleanReceiverNum)
            .single();

        if (!tenantOrg) {
            console.error(`[WhatsApp Router] ❌ Multi-Tenant Hit Miss: El número ${cleanReceiverNum} no pertenece a ninguna inmobiliaria activa en KtimatOS.`);
            return NextResponse.json({ success: false, message: 'Line not assigned to any agency.' });
        }

        try {
            const { data: newLead } = await supabase.from('leads').insert({
                phone: senderPhone,
                source: 'whatsapp',
                org_id: tenantOrg.id // Multi-Tenant Dynamic Mapping ✅
            }).select().single();

            invokeBrain1(senderPhone, content, newLead || { phone: senderPhone }).catch(console.error);
        } catch (insertErr) {
            console.error('[WhatsApp Router] Failed to insert new lead. Waking brain with null profile.', insertErr);
            invokeBrain1(senderPhone, content, { id: null, phone: senderPhone }).catch(console.error);
        }

        return NextResponse.json({ success: true, route: 'brain_1_concierge_new' });

    } catch (error: any) {
        console.error('[WhatsApp Router Error]:', error.message || error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// ==========================================
// UX FRICTION REDUCER: ACUSE DE RECIBO
// ==========================================
async function sendWhatsAppReceipt(to: string, text: string) {
    const HW_TOKEN = process.env.WHATSAPP_TOKEN;
    const HW_PHONE_ID = process.env.WHATSAPP_PHONE_ID;
    if (!HW_TOKEN || !HW_PHONE_ID) return;

    try {
        await fetch(`https://graph.facebook.com/v20.0/${HW_PHONE_ID}/messages`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${HW_TOKEN}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: to,
                type: 'text',
                text: { preview_url: false, body: text }
            })
        });
    } catch (e) {
        console.error('[WhatsApp UX Receipt Error]:', e);
    }
}
