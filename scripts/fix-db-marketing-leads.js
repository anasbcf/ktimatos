const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function fixDatabase() {
    const password = 'BiaSfZ9YjtU7KQvr';
    const connectionString = `postgresql://postgres.qfgtoyrjhshtltztvnoc:${password}@aws-1-eu-west-1.pooler.supabase.com:6543/postgres`;

    const client = new Client({
        connectionString: connectionString,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log("🚀 Connecting to Supabase...");
        await client.connect();

        const sqlPath = path.join(__dirname, '../../supabase/marketing_leads.sql');
        console.log(`📖 Reading SQL from ${sqlPath}...`);
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log("🏗️  Creating marketing_leads table...");
        await client.query(sql);

        console.log("✅ Table created successfully!");
    } catch (err) {
        console.error("❌ Action failed:", err.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

fixDatabase();
