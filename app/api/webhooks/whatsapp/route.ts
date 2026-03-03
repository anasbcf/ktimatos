import { NextResponse } from 'next/server';
import { waitUntil } from '@vercel/functions';
import { createAdminClient } from '@/lib/supabase/admin';
import { invokeBrain1 } from '@/lib/ai/brain1_concierge';
import { invokeBrain2 } from '@/lib/ai/brain2_executive';

// Aumentamos el límite de ejecución (Hobby -> max 60s, Pro -> max 300s) para procesos de IA asíncronos en Vercel Serverless
export const maxDuration = 60;

// WhatsApp Verification Secret
const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || process.env.META_WEBHOOK_VERIFY_TOKEN;

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

// POST: Recepción de Mensajes con Robustez Nivel CTO y Memoria (Frente B)
export async function POST(req: Request) {
    try {
        const body = await req.json();

        // 1. Verificamos que es un evento válido de WhatsApp
        if (body.object !== 'whatsapp_business_account') {
            // No devolvemos 404 a Meta para evitar pings fallidos recurrentes. Devolvemos 200 y la ignoramos.
            return NextResponse.json({ success: true, message: 'Not a WhatsApp event' }, { status: 200 });
        }

        // 2. Parseo defensivo Extremo (Optional Chaining) del payload de Meta
        const entry = body.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;

        // 3. Filtro CTO: Abortar si es una actualización de estado (sent, delivered, read)
        if (value?.statuses && value.statuses.length > 0) {
            console.log(`[Meta Webhook] Status update received (${value.statuses[0].status}). Ignored.`);
            return NextResponse.json({ success: true, message: 'Status update ignored' }, { status: 200 });
        }

        const messages = value?.messages;
        const metadata = value?.metadata;

        if (!messages || messages.length === 0 || !metadata) {
            return NextResponse.json({ success: true, message: 'No messages to process' }, { status: 200 });
        }

        const message = messages[0];
        const senderPhone = message.from;
        const receiverNumber = metadata.display_phone_number;
        const messageType = message?.type;

        // Extraer contenido de forma segura
        let content = '';
        if (messageType === 'text') {
            content = message?.text?.body || '';
        } else if (messageType === 'audio') {
            content = `[Voice Message Received - Audio ID: ${message?.audio?.id}]`;
        } else {
            console.log(`[Meta Webhook] Received unsupported message type: ${messageType}. Ignored.`);
            return NextResponse.json({ success: true, message: `Ignored unsupported media type: ${messageType}` }, { status: 200 });
        }

        console.log(`[Cognitive Router] Incoming message from ${senderPhone} to ${receiverNumber}: ${content.substring(0, 50)}...`);

        const supabase = createAdminClient();

        // 4. Identificar el Tenant (Org ID) usando el receiverNumber (meta_waba_id o whatsapp_business_number)
        const cleanReceiverNum = receiverNumber?.replace(/\+/g, '').replace(/\D/g, '');
        if (!cleanReceiverNum) {
            console.error('[WhatsApp Router] Cannot resolve Multi-Tenant route. No valid display_phone_number.');
            return NextResponse.json({ success: true, message: 'Invalid display_phone_number' }, { status: 200 });
        }

        const { data: tenantOrg } = await supabase
            .from('organizations')
            .select('id')
            .or(`meta_waba_id.eq.${cleanReceiverNum},whatsapp_business_number.eq.${cleanReceiverNum}`)
            .limit(1)
            .single();

        if (!tenantOrg) {
            console.error(`[WhatsApp Router] ❌ Multi-Tenant Hit Miss: El número receptor ${cleanReceiverNum} no pertenece a ninguna inmobiliaria activa.`);
            return NextResponse.json({ success: true, message: 'Agency not found' }, { status: 200 });
        }

        const activeOrgId = tenantOrg.id;

        // ==========================================
        // CAPA DE ROUTING (Cognitive RBAC) Y MEMORIA (Frente B)
        // ==========================================

        // A. Buscamos en el Cerebro Ejecutivo (Internos / Agentes)
        const { data: agentProfile } = await supabase
            .from('profiles')
            .select('role, id, full_name, org_id')
            .eq('whatsapp_number', senderPhone)
            .eq('org_id', activeOrgId) // Estricto: El agente pertenece a este Tenant
            .single();

        if (agentProfile) {
            console.log(`[WhatsApp Router] Agent detected (${agentProfile.role}): Executing Brain 2`);
            const audioId = messageType === 'audio' ? message.audio?.id : null;

            if (messageType === 'audio') {
                await sendWhatsAppReceipt(senderPhone, "⏳ Escuchando tu nota de voz...");
            } else {
                await sendWhatsAppReceipt(senderPhone, "⏳ Procesando tu orden en el CRM...");
            }

            waitUntil(invokeBrain2(senderPhone, content, audioId, agentProfile).catch(e => console.error(e)));
            return NextResponse.json({ success: true, route: 'brain_2_executive' }, { status: 200 });
        }

        // B. Contexto Concierge (Lead): Manejo de Memoria
        // Buscamos o creamos el perfil del Lead en este Tenant
        let { data: leadProfile } = await supabase
            .from('leads')
            .select('id, name, org_id')
            .eq('phone', senderPhone)
            .eq('org_id', activeOrgId)
            .single();

        if (!leadProfile) {
            console.log(`[WhatsApp Router] New Lead detected: Inserting Lead for Org ${activeOrgId}`);
            const { data: newLead, error: insertErr } = await supabase.from('leads').insert({
                phone: senderPhone,
                source: 'whatsapp',
                org_id: activeOrgId
            }).select().single();

            if (insertErr) {
                console.error('[WhatsApp Router] Failed to insert new lead', insertErr);
            }
            leadProfile = newLead || { id: null, phone: senderPhone, org_id: activeOrgId };
        } else {
            console.log(`[WhatsApp Router] Existing Lead detected. Waking Brain 1.`);
        }

        // MEMORIA (Fase 1 de Frente B): Actualizar Conversations y Messages
        let { data: conversation } = await supabase
            .from('whatsapp_conversations')
            .select('id, status')
            .eq('org_id', activeOrgId)
            .eq('lead_phone', senderPhone)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        // Si no hay coversacion activa, creamos una
        if (!conversation || conversation.status === 'closed') {
            const { data: newConv, error: convErr } = await supabase
                .from('whatsapp_conversations')
                .insert({
                    org_id: activeOrgId,
                    lead_phone: senderPhone,
                    status: 'ai_active'
                })
                .select('id')
                .single();
            if (!convErr && newConv) {
                conversation = { id: newConv.id, status: 'ai_active' };
            }
        }

        // Logueamos el mensaje del cliente en la BBDD
        if (conversation) {
            await supabase.from('whatsapp_messages').insert({
                conversation_id: conversation.id,
                sender_type: 'lead',
                content: content
            });
            console.log(`[WhatsApp Router] Logged customer message to conversation ${conversation.id}`);
        }

        // Si el estado es human_intervened, NO invocamos a la IA a menos que queramos
        if (conversation?.status === 'human_intervened') {
            console.log(`[WhatsApp Router] Conversation is handled by a HUMAN. Brain 1 muted.`);
            // You can optionally send a webhook/notification to the dashboard here so the broker knows they got a reply
            return NextResponse.json({ success: true, route: 'human_handled' }, { status: 200 });
        }

        // Invocación asíncrona de Brain 1 protegida por el Serverless Watchdog de Vercel
        waitUntil(invokeBrain1(senderPhone, content, leadProfile).catch(console.error));

        return NextResponse.json({ success: true, route: 'brain_1_concierge' }, { status: 200 });

    } catch (error: any) {
        console.error('[WhatsApp Router Fatal Error]:', error.message || error);
        // Meta EXPECTS strictly 200 OK. Returning 500 triggers aggressive retries and IP blocks.
        return NextResponse.json({ success: false, error: 'Internal Server Error logged' }, { status: 200 });
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
