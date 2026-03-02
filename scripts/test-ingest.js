
// Scripts usually need to be run with ts-node or similar. 
// However, since we are in a Next.js environment, the best way to test this without spinning up the full dev server 
// (which can be slow to start/reload) or dealing with complex tsconfig-paths for standalone scripts
// is to creating a small test route or just running it via the dev server.
// But the user requested a "test script".
// We'll create a simple fetch script that hits our API endpoint while the local server is running.

const TEST_URL = "https://www.bazaraki.com/adv/6059147_2-bedroom-penthouse-for-sale/";
const API_ENDPOINT = "http://localhost:3000/api/ingest";

async function runTest() {
    console.log(`Testing Ingestion API with URL: ${TEST_URL}`);

    try {
        const response = await fetch(API_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: TEST_URL }),
        });

        const data = await response.json();
        console.log("Response Status:", response.status);
        console.log("Extraction Result:", JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Test Failed:", error);
    }
}

runTest();
