const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function run() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });

    try {
        await client.connect();
        console.log('Connected to Supabase Postgres database.');

        await client.query(`
            ALTER TABLE public.saas_leads
            ADD COLUMN IF NOT EXISTS fallback_step SMALLINT DEFAULT 0;
        `);
        console.log('✅ Successfully added fallback_step column to saas_leads table.');

    } catch (err) {
        console.error('❌ Error running migration:', err);
    } finally {
        await client.end();
    }
}

run();
