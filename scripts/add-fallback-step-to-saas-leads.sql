-- Add fallback_step column to track the email sequence for automated fallback
ALTER TABLE public.saas_leads
ADD COLUMN IF NOT EXISTS fallback_step SMALLINT DEFAULT 0;

-- Optional: Add an index if you plan to query this column frequently in the cron wrapper
-- CREATE INDEX IF NOT EXISTS idx_saas_leads_fallback_step ON public.saas_leads(fallback_step);
