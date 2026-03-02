const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function migrate() {
    const password = 'BiaSfZ9YjtU7KQvr';
    const connectionString = `postgresql://postgres.qfgtoyrjhshtltztvnoc:${password}@aws-1-eu-west-1.pooler.supabase.com:6543/postgres`;

    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        console.log("📝 Adding columns to properties table...");
        await client.query(`
            ALTER TABLE properties 
            ADD COLUMN IF NOT EXISTS created_by text REFERENCES profiles(id) ON DELETE SET NULL,
            ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Available';
        `);

        console.log("📝 Creating property_agents table...");
        await client.query(`
            CREATE TABLE IF NOT EXISTS property_agents (
                property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
                agent_id text REFERENCES profiles(id) ON DELETE CASCADE,
                assigned_at TIMESTAMPTZ DEFAULT NOW(),
                PRIMARY KEY (property_id, agent_id)
            );
        `);

        console.log("🎉 Migration completed successfully.");
    } catch (err) {
        console.error("❌ Migration failed:", err.message);
        if (err.detail) console.error("Detail:", err.detail);
    } finally {
        await client.end();
    }
}

migrate();
