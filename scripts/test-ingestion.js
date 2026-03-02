
require('dotenv').config({ path: '.env.local' });
const { scrapePropertyUrl } = require('../lib/scraper/engine');
const { extractPropertyData } = require('../lib/ai/extractor');

async function testPipeline() {
    const url = "https://www.bazaraki.com/adv/5613313_luxury-3-bedroom-apartment-in-limassol-marina/";
    console.log(`🚀 Starting Full Ingestion Pipeline Test for: ${url}`);

    // 1. Scrape
    console.time("Scraping");
    const htmlContent = await scrapePropertyUrl(url);
    console.timeEnd("Scraping");

    if (!htmlContent) {
        console.error("❌ Scraping failed (null content)");
        return;
    }
    console.log(`✅ Scraped ${htmlContent.length} bytes.`);

    // 2. Extract
    console.time("Extraction");
    console.log("🤖 Sending to OpenAI for extraction...");
    const extractedData = await extractPropertyData(htmlContent);
    console.timeEnd("Extraction");

    if (!extractedData) {
        console.error("❌ Extraction failed (null data)");
    } else {
        console.log("✅ Extraction Success!");
        console.log(JSON.stringify(extractedData, null, 2));
    }
}

testPipeline();
