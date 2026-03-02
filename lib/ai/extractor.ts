
import OpenAI from "openai";
import { z } from "zod";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const PropertySchema = z.object({
    property_type: z.enum(['Apartment', 'Villa', 'House', 'Plot', 'Commercial', 'Other']).describe("The type of property."),
    condition: z.enum(['New', 'Resale', 'Under Construction', 'Unknown']).describe("The condition or status of the build."),
    price_value: z.number().describe("The numeric value of the price."),
    currency: z.string().describe("The currency code, e.g., EUR."),
    vat_applicable: z.boolean().nullable().describe("True if the price is subject to VAT (usually new builds). False if VAT is fully included or not applicable (resales)."),
    vat_type: z.enum(['19%', '5%', '0%']).nullable().describe("The type of VAT applicable, if any."),
    location_area: z.string().describe("The location or area of the property, e.g., 'Limassol - Marina'."),
    lat: z.number().nullable().describe("Latitude coordinate if found or inferable."),
    lng: z.number().nullable().describe("Longitude coordinate if found or inferable."),
    bedrooms: z.number().nullable().describe("Number of bedrooms."),
    bathrooms: z.number().nullable().describe("Number of bathrooms."),
    covered_area_sqm: z.number().nullable().describe("Covered area in square meters."),
    plot_size_sqm: z.number().nullable().describe("Plot size in square meters, if applicable."),
    title_deeds: z.boolean().nullable().describe("Whether title deeds are mentioned or available."),
    amenities: z.array(z.string()).describe("A list of amenities (e.g., 'Pool', 'Covered Parking', 'Sea View', 'Furnished')."),
    description_short: z.string().describe("A short summary description of the property."),
    internal_notes: z.string().nullable().describe("Any hidden or agent-specific notes found (optional)."),
    images_urls: z.array(z.string()).describe("A list of image URLs (extract as many high quality property photos as possible, ignore logos)."),
});

export type PropertyData = z.infer<typeof PropertySchema>;

export async function extractPropertyData(htmlContent: string): Promise<PropertyData | null> {
    try {
        const jsonSchema = JSON.stringify({
            property_type: "Apartment | Villa | House | Plot | Commercial | Other",
            condition: "New | Resale | Under Construction | Unknown",
            price_value: "number",
            currency: "string (EUR)",
            vat_applicable: "boolean | null",
            vat_type: "19% | 5% | 0% | null",
            location_area: "string",
            lat: "number | null",
            lng: "number | null",
            bedrooms: "number | null",
            bathrooms: "number | null",
            covered_area_sqm: "number | null",
            plot_size_sqm: "number | null",
            title_deeds: "boolean | null",
            amenities: ["string"],
            description_short: "string",
            internal_notes: "string | null",
            images_urls: ["string (url)"]
        });

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `You are an expert real estate data extractor for the Cyprus market (expert in parsing DOM.com.cy and Bazaraki). 
          Your task is to analyze the provided HTML of a property listing and extract key information into a structured JSON string.
          
          Strictly follow this JSON structure:
          ${jsonSchema}

          Crucial Instructions:
          - Cyprus VAT: Pay close attention to VAT (IVA). New builds often have "+ VAT", meaning vat_applicable is true and usually it's 19% or 5%. Resales are usually 0% or VAT not applicable.
          - Images: Look for <img src="..."> or background-images that look like property photos. Grab as many high-res photos as possible.
          - If a field is not found or unclear, use null.
          The input is raw HTML.
          Return ONLY valid JSON matching the exact schema keys.`,

                },
                {
                    role: "user",
                    content: htmlContent.substring(0, 100000),
                },
            ],
            response_format: { type: "json_object" },
        });

        const content = completion.choices[0].message.content;
        if (!content) return null;

        const result = JSON.parse(content);
        return result as PropertyData; // Basic casting, could add Zod validation here if strictness needed
    } catch (error) {
        console.error("OpenAI Extraction Error:", error);
        return null;
    }
}
