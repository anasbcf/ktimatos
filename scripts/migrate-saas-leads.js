const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log("Adding saas_leads table...");
  
  // Create table via a raw SQL query using the service role bypass
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS saas_leads (
        id uuid primary key default uuid_generate_v4(),
        full_name text not null,
        email text not null,
        agency_name text not null,
        agents_count text not null,
        language text not null,
        phone text not null,
        status text not null default 'new',
        notes text,
        created_at timestamp with time zone default timezone('utc'::text, now()) not null,
        updated_at timestamp with time zone default timezone('utc'::text, now()) not null
      );
    `
  });

  if (error) {
    console.error("Failed to create table:", error.message);
    // If exec_sql doesn't work (which is common if RPC isn't set up), we fallback to explaining to the user 
    // that they need to run this in the Supabase SQL Editor.
  } else {
    console.log("saas_leads table created successfully!");
  }
}

runMigration();
