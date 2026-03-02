
import OpenAI from "openai";
import { z } from "zod";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const PropertySchema = z.object({
    // Core
    property_use: z.enum(['Sale', 'Rent', 'Investment', 'Unknown']).describe("Purpose of the property listing."),
    property_type: z.enum(['Apartment', 'Studio', 'Penthouse', 'House', 'Villa', 'Townhouse', 'Plot', 'Commercial', 'Office', 'Other']).describe("The detailed category of the property."),
    condition: z.enum(['New', 'Resale', 'Under Construction', 'Unknown']).describe("The condition or status of the build."),

    // Financials
    price_value: z.number().describe("The numeric value of the price."),
    currency: z.string().describe("The currency code, e.g., EUR."),
    vat_applicable: z.boolean().nullable().describe("True if the price is subject to VAT (usually new builds)."),
    vat_type: z.enum(['19%', '5%', '0%']).nullable().describe("The type of VAT applicable, if any."),

    // Location
    location_area: z.string().describe("The location or area of the property, e.g., 'Limassol - Marina'."),
    distance_to_sea_m: z.number().nullable().describe("Distance to the sea in meters, if specified."),
    views: z.array(z.string()).describe("Views mentioned (e.g., 'Sea', 'Mountains', 'City', 'Pool')."),
    lat: z.number().nullable(),
    lng: z.number().nullable(),

    // Spaces & Age
    bedrooms: z.number().nullable(),
    bathrooms: z.number().nullable(),
    covered_area_sqm: z.number().nullable(),
    plot_size_sqm: z.number().nullable(),
    year_of_construction: z.number().nullable().describe("Year the property was built."),

    // Detailed Features
    title_deeds: z.boolean().nullable().describe("Whether title deeds are mentioned or available."),
    furnishing: z.enum(['Fully Furnished', 'Semi-Furnished', 'Unfurnished', 'Unknown']).describe("Furnishing status."),
    heating: z.string().nullable().describe("Heating details (e.g. 'Underfloor', 'Central', 'None')."),
    air_conditioning: z.string().nullable().describe("AC details (e.g. 'VRV', 'Split Units', 'None')."),
    pool: z.string().nullable().describe("Pool details (e.g. 'Private', 'Communal', 'None')."),

    amenities: z.array(z.string()).describe("Other tags (e.g., 'Gated complex', 'Gym', 'Sauna', 'Smart Home', 'Elevator', 'Covered Parking')."),

    // Content
    description_short: z.string().describe("A short summary description of the property."),
    internal_notes: z.string().nullable().describe("Any hidden or agent-specific notes found (optional)."),
    images_urls: z.array(z.string()).describe("A list of high quality property image URLs. Ignore logos/icons."),
});

export type PropertyData = z.infer<typeof PropertySchema>;

export async function extractPropertyData(htmlContent: string): Promise<PropertyData | null> {
    try {
        const jsonSchema = JSON.stringify({
            property_use: "Sale | Rent | Investment | Unknown",
            property_type: "Apartment | Studio | Penthouse | House | Villa | Townhouse | Plot | Commercial | Office | Other",
            condition: "New | Resale | Under Construction | Unknown",
            price_value: "number",
            currency: "string (EUR)",
            vat_applicable: "boolean | null",
            vat_type: "19% | 5% | 0% | null",
            location_area: "string",
            distance_to_sea_m: "number | null",
            views: ["string"],
            lat: "number | null",
            lng: "number | null",
            bedrooms: "number | null",
            bathrooms: "number | null",
            covered_area_sqm: "number | null",
            plot_size_sqm: "number | null",
            year_of_construction: "number | null",
            title_deeds: "boolean | null",
            furnishing: "Fully Furnished | Semi-Furnished | Unfurnished | Unknown",
            heating: "string | null",
            air_conditioning: "string | null",
            pool: "string | null",
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
