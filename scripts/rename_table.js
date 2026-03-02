const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  await client.connect();

  try {
    console.log("Renaming table...");
    await client.query(`ALTER TABLE marketing_leads RENAME TO saas_leads;`);
    
    // Add columns that didn't exist individually
    console.log("Adding new columns...");
    await client.query(`ALTER TABLE saas_leads ADD COLUMN IF NOT EXISTS agents_count text;`);
    await client.query(`ALTER TABLE saas_leads ADD COLUMN IF NOT EXISTS language text;`);
    await client.query(`ALTER TABLE saas_leads ADD COLUMN IF NOT EXISTS notes text;`);

    console.log("Success! Table is now saas_leads with proper columns.");
  } catch (err) {
    console.error("Error modifying database:", err);
  } finally {
    await client.end();
  }
}
run();
