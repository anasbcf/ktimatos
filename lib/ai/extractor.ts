
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
    vat_applicable: z.boolean().nullable().describe("True if the price is subject to VAT (usually new builds in Cyprus)."),
    price_includes_vat: z.boolean().nullable().describe("True if the listed price already has the VAT included."),
    vat_type: z.enum(['19%', '5%', '0%']).nullable().describe("The type of VAT applicable, if any."),

    // Financials (Rentals)
    communal_fees: z.number().nullable().describe("Cost of common expenses."),
    communal_fees_included: z.boolean().nullable().describe("True if common expenses are included in the rent."),
    deposit_months: z.number().nullable().describe("Number of months required upfront for deposit."),
    rent_upfront_months: z.number().nullable().describe("Number of rent months required in advance."),
    minimum_lease_months: z.number().nullable().describe("Minimum contract duration in months."),

    // Location
    location_area: z.string().describe("The location or area of the property, e.g., 'Limassol - Marina'."),
    distance_to_sea_meters: z.number().nullable().describe("Distance to the sea in meters, if specified."),
    sea_view: z.boolean().nullable().describe("Explicit boolean if the property has a sea view."),
    views: z.array(z.string()).describe("Other views mentioned (e.g., 'Mountains', 'City', 'Pool')."),
    lat: z.number().nullable(),
    lng: z.number().nullable(),

    // Spaces & Age
    bedrooms: z.number().nullable(),
    bathrooms: z.number().nullable(),
    covered_area_sqm: z.number().nullable(),
    covered_verandas_sqm: z.number().nullable(),
    uncovered_verandas_sqm: z.number().nullable(),
    plot_sqm: z.number().nullable(),
    year_of_construction: z.number().nullable().describe("Year the property was built."),
    floor_number: z.number().nullable().describe("Floor number for apartments."),
    total_building_floors: z.number().nullable(),

    // Detailed Features (Cyprus Specifics)
    title_deeds_status: z.enum(['Available', 'Share of Land', 'Pending', 'None']).nullable().describe("Status of the property title deeds (Kotzani)."),
    energy_efficiency_rating: z.enum(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'Exempt']).nullable().describe("EPC rating class."),
    furnishing_status: z.enum(['Fully Furnished', 'Semi-Furnished', 'Unfurnished', 'Appliances Only', 'Unknown']).describe("Furnishing status."),
    heating: z.string().nullable().describe("Heating details (e.g. 'Underfloor', 'Central', 'None')."),
    air_conditioning: z.string().nullable().describe("AC details (e.g. 'VRV', 'Split Units', 'None')."),
    pool: z.string().nullable().describe("Pool details (e.g. 'Private', 'Communal', 'None')."),
    parking_spaces: z.number().nullable(),
    parking_type: z.enum(['Covered', 'Uncovered', 'Both', 'None']).nullable(),
    storage_room: z.boolean().nullable(),
    elevator: z.boolean().nullable(),
    pet_friendly: z.boolean().nullable().describe("True if explicitly pet friendly, false if pets not allowed, null if unmentioned."),

    amenities: z.array(z.string()).describe("Other tags (e.g., 'Gated complex', 'Gym', 'Sauna', 'Smart Home', 'Photovoltaic System')."),

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
            price_includes_vat: "boolean | null",
            vat_type: "19% | 5% | 0% | null",
            communal_fees: "number | null",
            communal_fees_included: "boolean | null",
            deposit_months: "number | null",
            rent_upfront_months: "number | null",
            minimum_lease_months: "number | null",
            location_area: "string",
            distance_to_sea_meters: "number | null",
            sea_view: "boolean | null",
            views: ["string"],
            lat: "number | null",
            lng: "number | null",
            bedrooms: "number | null",
            bathrooms: "number | null",
            covered_area_sqm: "number | null",
            covered_verandas_sqm: "number | null",
            uncovered_verandas_sqm: "number | null",
            plot_sqm: "number | null",
            year_of_construction: "number | null",
            floor_number: "number | null",
            total_building_floors: "number | null",
            title_deeds_status: "Available | Share of Land | Pending | None | null",
            energy_efficiency_rating: "A | B | C | D | E | F | G | Exempt | null",
            furnishing_status: "Fully Furnished | Semi-Furnished | Unfurnished | Appliances Only | Unknown",
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

          Crucial Cyprus Market Instructions:
          - Cyprus VAT: Pay close attention to VAT (IVA). New builds often have "+ VAT". If it's a resale, VAT is usually not applicable.
          - Title Deeds (Kotzani): Watch out for terms like "Title deeds available", "Share of land", "Final approval pending". Very important.
          - Pets: If it is a rental, check if pets are allowed.
          - Deposits/Rentals: Look for "2 deposits", "1 rent upfront", "common expenses included".
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
