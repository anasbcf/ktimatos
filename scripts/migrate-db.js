const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function migrate() {
    // Final correct connection string provided by the user
    const password = 'BiaSfZ9YjtU7KQvr';
    const connectionString = `postgresql://postgres.qfgtoyrjhshtltztvnoc:${password}@aws-1-eu-west-1.pooler.supabase.com:6543/postgres`;

    const client = new Client({
        connectionString: connectionString,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log("🚀 Connecting to Supabase Pooler (eu-west-1)...");
        await client.connect();
        console.log("✅ Connected successfully!");

        const schemaPath = path.join(__dirname, '../../supabase/schema.sql');
        console.log(`📖 Reading schema from ${schemaPath}...`);
        let sql = fs.readFileSync(schemaPath, 'utf8');

        // Robustly add IF NOT EXISTS to all CREATE TABLE statements
        sql = sql.replace(/CREATE TABLE\s+/gi, 'CREATE TABLE IF NOT EXISTS ');

        // Remove RLS enable statements if they might fail or wrap them
        // For simplicity, we just execute the block.

        console.log("🏗️  Executing full schema block...");
        await client.query(sql);

        console.log("🎉 DATABASE REPAIR COMPLETE (Single Block).");
    } catch (err) {
        console.error("❌ Migration failed:", err.message);
        if (err.detail) console.error("Detail:", err.detail);
        process.exit(1);
    } finally {
        await client.end();
    }
}

migrate();
