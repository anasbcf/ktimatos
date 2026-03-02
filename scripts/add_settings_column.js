
const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function runMigration() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        console.error('❌ DATABASE_URL is not set in .env.local');
        process.exit(1);
    }

    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('🔌 Connected to database...');

        console.log('🛠️ Adding settings column to organizations...');
        await client.query(`
      ALTER TABLE organizations 
      ADD COLUMN IF NOT EXISTS settings jsonb DEFAULT '{}'::jsonb;
    `);

        console.log('✅ Migration successful: settings column added.');
    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        await client.end();
    }
}

runMigration();
