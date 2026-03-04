const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function run() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });

    try {
        await client.connect();
        console.log('Connected to Postgres.');

        // Drop existing policies just in case to avoid "policy already exists" errors
        await client.query(`
            DROP POLICY IF EXISTS "Users can view their organization's conversations" ON public.whatsapp_conversations;
            DROP POLICY IF EXISTS "Users can insert their organization's conversations" ON public.whatsapp_conversations;
            DROP POLICY IF EXISTS "Users can update their organization's conversations" ON public.whatsapp_conversations;
            DROP POLICY IF EXISTS "Users can view their organization's messages" ON public.whatsapp_messages;
            DROP POLICY IF EXISTS "Users can insert their organization's messages" ON public.whatsapp_messages;
        `);

        console.log('Dropped existing policies (if any). Executing migration...');

        const sql = fs.readFileSync(path.join(__dirname, '..', 'supabase_whatsapp_schema.sql'), 'utf8');
        await client.query(sql);
        console.log('✅ RLS Migration applied successfully.');

    } catch (err) {
        console.error('❌ Error running migration:', err);
    } finally {
        await client.end();
    }
}

run();
