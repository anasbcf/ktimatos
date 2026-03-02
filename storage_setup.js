const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function checkStorage() {
    const password = 'BiaSfZ9YjtU7KQvr';
    const connectionString = `postgresql://postgres.qfgtoyrjhshtltztvnoc:${password}@aws-1-eu-west-1.pooler.supabase.com:6543/postgres`;

    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        
        console.log("📝 Inserting 'properties-media' bucket if it doesn't exist...");
        // Ensure storage schema is used
        await client.query(`
            INSERT INTO storage.buckets (id, name, public) 
            VALUES ('properties-media', 'properties-media', true)
            ON CONFLICT (id) DO NOTHING;
        `);
        
        console.log("📝 Attempting to add permissive properties-media access policies...");
        // This is a rough insert for RLS on storage, ideally managed in dashboard, but we'll try to add basic inserts
        await client.query(`
            CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'properties-media' );
            CREATE POLICY "Authenticated Insert" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'properties-media' AND auth.role() = 'authenticated' );
        `).catch(e => console.log("Policies might already exist or need dashboard config:", e.message));

        console.log("🎉 Storage bucket setup complete.");
        
    } catch (err) {
        console.error("❌ Setup failed:", err.message);
    } finally {
        await client.end();
    }
}
checkStorage();
