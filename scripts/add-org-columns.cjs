const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function runMigration() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error("Missing DATABASE_URL");
        process.exit(1);
    }

    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log("Connected to Supabase. Executing ALTER TABLE on organizations...");

        const query = `
            ALTER TABLE organizations 
            ADD COLUMN IF NOT EXISTS telnyx_phone_number text,
            ADD COLUMN IF NOT EXISTS meta_waba_id text,
            ADD COLUMN IF NOT EXISTS meta_access_token text,
            ADD COLUMN IF NOT EXISTS elevenlabs_agent_id text,
            ADD COLUMN IF NOT EXISTS ai_greeting text,
            ADD COLUMN IF NOT EXISTS business_hours jsonb;
        `;

        await client.query(query);
        console.log("✅ Successfully added 6 integration columns to the organizations table.");

    } catch (error) {
        console.error("❌ Migration error:", error);
    } finally {
        await client.end();
    }
}

runMigration();
