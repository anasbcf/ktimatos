-- Frente B: WhatsApp Chatbot (Memoria)

-- Crear Enum para los roles del chat
CREATE TYPE sender_role AS ENUM ('lead', 'ai', 'human_broker');
CREATE TYPE conversation_state AS ENUM ('ai_active', 'human_intervened', 'closed');

-- Tabla Conversations
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    lead_phone TEXT NOT NULL,
    status conversation_state DEFAULT 'ai_active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Ensure a lead only has one active conversation per organization at a time
    UNIQUE (org_id, lead_phone, status) 
);

-- Tabla Messages (Historial de texto)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_type sender_role NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Políticas de Seguridad

-- CONVERSATIONS
-- Solo los usuarios autenticados de la misma organización pueden ver sus conversaciones
CREATE POLICY "Users can view their organization's conversations" 
ON public.conversations FOR SELECT 
USING (
    org_id IN (
        SELECT org_id FROM public.profiles WHERE profiles.id = auth.uid()
    )
    OR
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin_impersonating'))
);

CREATE POLICY "Users can insert their organization's conversations" 
ON public.conversations FOR INSERT 
WITH CHECK (
    org_id IN (
        SELECT org_id FROM public.profiles WHERE profiles.id = auth.uid()
    )
);

CREATE POLICY "Users can update their organization's conversations" 
ON public.conversations FOR UPDATE 
USING (
    org_id IN (
        SELECT org_id FROM public.profiles WHERE profiles.id = auth.uid()
    )
);

-- MESSAGES
-- Solo los usuarios pueden ver los mensajes si pueden ver la conversación vinculada
CREATE POLICY "Users can view their organization's messages" 
ON public.messages FOR SELECT 
USING (
    conversation_id IN (
        SELECT id FROM public.conversations WHERE org_id IN (
            SELECT org_id FROM public.profiles WHERE profiles.id = auth.uid()
        )
    )
    OR
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin_impersonating'))
);

CREATE POLICY "Users can insert their organization's messages" 
ON public.messages FOR INSERT 
WITH CHECK (
    conversation_id IN (
        SELECT id FROM public.conversations WHERE org_id IN (
            SELECT org_id FROM public.profiles WHERE profiles.id = auth.uid()
        )
    )
);
