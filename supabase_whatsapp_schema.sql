-- Frente B: WhatsApp Chatbot (Memoria)

-- Crear Enum para los roles del chat
-- DROP TYPE IF EXISTS sender_role CASCADE;
-- DROP TYPE IF EXISTS conversation_state CASCADE;
DO $$ BEGIN
    CREATE TYPE sender_role AS ENUM ('lead', 'ai', 'human_broker');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE conversation_state AS ENUM ('ai_active', 'human_intervened', 'closed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;


-- Tabla Whatsapp Conversations
CREATE TABLE IF NOT EXISTS public.whatsapp_conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    lead_phone TEXT NOT NULL,
    status conversation_state DEFAULT 'ai_active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Ensure a lead only has one active conversation per organization at a time
    UNIQUE (org_id, lead_phone, status) 
);

-- Tabla Whatsapp Messages (Historial de texto)
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES public.whatsapp_conversations(id) ON DELETE CASCADE,
    sender_type sender_role NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.whatsapp_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- Políticas de Seguridad

-- WHATSAPP_CONVERSATIONS
-- Solo los usuarios autenticados de la misma organización pueden ver sus conversaciones
CREATE POLICY "Users can view their organization's conversations" 
ON public.whatsapp_conversations FOR SELECT 
USING (
    org_id IN (
        SELECT org_id FROM public.profiles WHERE profiles.id = auth.uid()::text
    )
    OR
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid()::text AND profiles.role IN ('admin', 'super_admin_impersonating'))
);

CREATE POLICY "Users can insert their organization's conversations" 
ON public.whatsapp_conversations FOR INSERT 
WITH CHECK (
    org_id IN (
        SELECT org_id FROM public.profiles WHERE profiles.id = auth.uid()::text
    )
);

CREATE POLICY "Users can update their organization's conversations" 
ON public.whatsapp_conversations FOR UPDATE 
USING (
    org_id IN (
        SELECT org_id FROM public.profiles WHERE profiles.id = auth.uid()::text
    )
);

-- WHATSAPP_MESSAGES
-- Solo los usuarios pueden ver los mensajes si pueden ver la conversación vinculada
CREATE POLICY "Users can view their organization's messages" 
ON public.whatsapp_messages FOR SELECT 
USING (
    conversation_id IN (
        SELECT id FROM public.whatsapp_conversations WHERE org_id IN (
            SELECT org_id FROM public.profiles WHERE profiles.id = auth.uid()::text
        )
    )
    OR
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid()::text AND profiles.role IN ('admin', 'super_admin_impersonating'))
);

CREATE POLICY "Users can insert their organization's messages" 
ON public.whatsapp_messages FOR INSERT 
WITH CHECK (
    conversation_id IN (
        SELECT id FROM public.whatsapp_conversations WHERE org_id IN (
            SELECT org_id FROM public.profiles WHERE profiles.id = auth.uid()::text
        )
    )
);
