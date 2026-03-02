require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function executeMigration() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log('[Postgres] Connected to the database for Settings Migration.');

        // 1. Add fields for WhatsApp Routing and VIP Alerts
        await client.query(`
            ALTER TABLE organizations 
            ADD COLUMN IF NOT EXISTS whatsapp_business_number text UNIQUE,
            ADD COLUMN IF NOT EXISTS vip_budget_threshold numeric DEFAULT 2000000;
        `);
        console.log('[Postgres] Added whatsapp_business_number and vip_budget_threshold to organizations.');

        console.log('[Postgres] Migration completed successfully.');
    } catch (err) {
        console.error('[Postgres] Migration failed:', err);
    } finally {
        await client.end();
    }
}

executeMigration();
