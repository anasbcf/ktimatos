const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function checkProfiles() {
    const password = 'BiaSfZ9YjtU7KQvr';
    const connectionString = `postgresql://postgres.qfgtoyrjhshtltztvnoc:${password}@aws-1-eu-west-1.pooler.supabase.com:6543/postgres`;

    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        const res = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'profiles';
        `);
        console.log("Profiles table columns:");
        console.table(res.rows);
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

checkProfiles();
