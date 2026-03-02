import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { v4 as uuidv4 } from "uuid";
import crypto from 'crypto';

export async function POST(req: NextRequest) {
    try {
        const { imageUrl } = await req.json();

        if (!imageUrl) {
            return NextResponse.json({ error: "No imageUrl provided" }, { status: 400 });
        }

        // Steath Headers to bypass Cloudflare and Hotlink protections on Bazaraki/DOM
        const stealthHeaders = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "Referer": "https://www.bazaraki.com/",
        };

        const imageRes = await fetch(imageUrl, { headers: stealthHeaders });

        if (!imageRes.ok) {
            console.error(`Failed to download image from ${imageUrl}: ${imageRes.statusText}`);
            return NextResponse.json({ error: "Failed to download image from external source" }, { status: 400 });
        }

        const arrayBuffer = await imageRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const contentType = imageRes.headers.get("content-type") || "image/jpeg";

        // Generate a unique filename
        const hash = crypto.createHash('md5').update(imageUrl).digest('hex').substring(0, 10);
        const extension = contentType.split("/")[1] || "jpg";
        const filename = `scraped_${hash}_${uuidv4()}.${extension}`;

        const supabase = await createClient();

        // Upload buffer directly to Supabase Storage
        const { data, error } = await supabase.storage
            .from("property_images")
            .upload(filename, buffer, {
                contentType: contentType,
                upsert: false
            });

        if (error) {
            console.error("Supabase Storage Error:", error);
            return NextResponse.json({ error: "Failed to upload to storage" }, { status: 500 });
        }

        const { data: { publicUrl } } = supabase.storage
            .from("property_images")
            .getPublicUrl(data.path);

        return NextResponse.json({ success: true, url: publicUrl });

    } catch (error: any) {
        console.error("External Image Upload Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
