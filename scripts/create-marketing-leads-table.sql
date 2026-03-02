-- Crea la tabla marketing_leads para el formulario de la página /contact
CREATE TABLE IF NOT EXISTS public.marketing_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    company_name TEXT,
    notes TEXT,
    source TEXT DEFAULT 'contact_form'
);

-- Permisos de lectura/escritura (RLS)
ALTER TABLE public.marketing_leads ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Admins can read marketing leads" 
    ON public.marketing_leads FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'super_admin'
        )
    );

CREATE POLICY "Service role can insert marketing leads"
    ON public.marketing_leads FOR INSERT
    WITH CHECK (true); -- Permitimos insert desde el servidor (donde se usa Service Role)
