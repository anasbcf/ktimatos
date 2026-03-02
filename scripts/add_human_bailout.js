const { Client } = require('pg');

async function enableHumanaBailout() {
    console.log("Adding needs_human column to saas_leads...");

    // We expect DATABASE_URL to be present in the environment or passed directly
    const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres'; // Fallback for local testing if not loaded

    const client = new Client({
        connectionString: dbUrl,
    });

    try {
        await client.connect();

        const q = `
            ALTER TABLE saas_leads 
            ADD COLUMN IF NOT EXISTS needs_human boolean DEFAULT false;
        `;

        await client.query(q);

        console.log("✅ Column 'needs_human' added successfully (or already existed).");
    } catch (err) {
        console.error("❌ SQL Migration Error:", err);
    } finally {
        await client.end();
        process.exit(0);
    }
}

// Automatically load .env.local if running from root app folder
require('dotenv').config({ path: '.env.local' });

enableHumanaBailout();
