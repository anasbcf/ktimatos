
const { scrapePropertyUrl } = require('../lib/scraper/engine');
require('dotenv').config({ path: '.env.local' });

async function test() {
    const url = "https://www.bazaraki.com/adv/5613313_luxury-3-bedroom-apartment-in-limassol-marina/";
    console.log(`Testing scraper on: ${url}`);

    try {
        const content = await scrapePropertyUrl(url);
        if (content) {
            console.log("✅ Success! Content length:", content.length);
            console.log("Snippet:", content.substring(0, 200));
        } else {
            console.error("❌ Failed to scrape content (null returned)");
        }
    } catch (e) {
        console.error("❌ Test Script Error:", e);
    }
    process.exit(0);
}

test();
