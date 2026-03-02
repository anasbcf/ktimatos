import { createAdminClient } from '../lib/supabase/admin.js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function addColumns() {
    console.log('[Schema Update] Upgrading saas_leads table for Voice AI CRM...');
    const supabase = createAdminClient();

    // In Supabase, executing raw DDL via the standard JS client requires RPC or running a query via postgres functions.
    // However, since we don't have direct access to a raw query executer in this JS client, 
    // a simpler approach is to use the Supabase REST API or just ask the user to run it in the SQL Editor.
    // Alternatively, I will create a SQL file that they can paste, or look for an existing DB executing script.

    console.log('Please execute the following SQL in your Supabase SQL Editor:');
    console.log(`
        ALTER TABLE saas_leads 
        ADD COLUMN IF NOT EXISTS transcript TEXT,
        ADD COLUMN IF NOT EXISTS call_summary TEXT,
        ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
        ADD COLUMN IF NOT EXISTS fallback_triggered BOOLEAN DEFAULT false;
    `);
}

addColumns().catch(console.error);
