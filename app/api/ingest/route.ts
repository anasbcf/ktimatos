
import { NextRequest, NextResponse } from 'next/server';
import { scrapePropertyUrl } from '@/lib/scraper/engine';
import { extractPropertyData } from '@/lib/ai/extractor';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
    try {
        const { url, org_id } = await req.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        // 1. Scrape the HTML
        console.log(`Scraping URL: ${url}`);
        const html = await scrapePropertyUrl(url);

        if (!html) {
            return NextResponse.json({ error: 'Failed to retrieve content from URL' }, { status: 500 });
        }

        // 2. Extract Data using AI
        console.log('Extracting data with AI...');
        const extractedData = await extractPropertyData(html);

        if (!extractedData) {
            return NextResponse.json({ error: 'Failed to extract data from content' }, { status: 500 });
        }

        // 3. Return the Extracted Data for the Smart Form (No Auto-Save)
        return NextResponse.json({
            success: true,
            data: extractedData
        });

    } catch (error: any) {
        console.error("Ingestion API Error:", error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
