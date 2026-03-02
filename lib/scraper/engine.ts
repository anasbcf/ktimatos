const puppeteerExtra = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const chromium = require('@sparticuz/chromium');
const puppeteerCore = require('puppeteer-core');

const puppeteer = puppeteerExtra.default || puppeteerExtra;

// Prevent multiple plugin registration in dev HMR
if (puppeteer.getPlugins && puppeteer.getPlugins().length === 0) {
    puppeteer.use(StealthPlugin());
}

// Using system Chrome for maximum stability and stealth locally
const LOCAL_CHROME_EXECUTABLE = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

export async function scrapePropertyUrl(url: string): Promise<string | null> {
    let browser = null;
    try {
        const isProduction = process.env.NODE_ENV === 'production';

        if (isProduction) {
            console.log("🚀 Starting Production Scraper (Sparticuz/Chromium)...");
            // Configure Sparticuz Chromium
            chromium.setGraphicsMode = false;

            browser = await puppeteerCore.launch({
                args: chromium.args,
                defaultViewport: chromium.defaultViewport,
                executablePath: await chromium.executablePath(),
                headless: chromium.headless,
                ignoreHTTPSErrors: true,
            });

        } else {
            // Local Development
            console.log(`Starting Local stealth scraper for: ${url}`);
            browser = await puppeteer.launch({
                headless: true,
                executablePath: LOCAL_CHROME_EXECUTABLE,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-web-security',
                    '--disable-features=IsolateOrigins,site-per-process'
                ],
            });
        }

        const page = await browser.newPage();

        // Set a realistic User-Agent (Critical for Bazaraki)
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        // Optimize resource loading
        await page.setRequestInterception(true);
        page.on('request', (req: any) => {
            if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
                req.abort();
            } else {
                req.continue();
            }
        });

        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

        // Wait for key elements to ensure we bypassed basic captchas
        await page.waitForSelector('body');

        const content = await page.content();
        return content;

    } catch (error: any) {
        console.error("Puppeteer Scraping Error:", error.message);
        return null;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}
