"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Wand2, Trash2, Link as LinkIcon, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { PropertyData } from "@/lib/ai/extractor";

interface Agent {
    id: string;
    full_name: string;
}

interface PropertyFormProps {
    agents?: Agent[];
    initialData?: Partial<PropertyData>;
    initialStatus?: string;
    initialAssignedAgents?: string[];
    onSubmit?: (data: PropertyData, assignedAgentIds: string[], status?: string) => void;
}

const DEFAULT_DATA: PropertyData = {
    property_use: "Sale",
    property_type: "Apartment",
    condition: "Resale",
    price_value: 0,
    currency: "EUR",
    vat_applicable: false,
    vat_type: null,
    location_area: "",
    distance_to_sea_m: null,
    views: [],
    lat: null,
    lng: null,
    year_of_construction: null,
    bedrooms: null,
    bathrooms: null,
    covered_area_sqm: null,
    plot_size_sqm: null,
    title_deeds: false,
    furnishing: "Unknown",
    heating: null,
    air_conditioning: null,
    pool: null,
    amenities: [],
    title_deeds: false,
    amenities: [],
    description_short: "",
    internal_notes: "",
    images_urls: [],
};

export function PropertyForm({ agents = [], initialData, initialStatus, initialAssignedAgents, onSubmit }: PropertyFormProps) {
    const [isExtracting, setIsExtracting] = useState(false);
    const [extractUrl, setExtractUrl] = useState("");

    const [formData, setFormData] = useState<PropertyData>({
        ...DEFAULT_DATA,
        ...initialData,
    });
    const [assignedAgentIds, setAssignedAgentIds] = useState<string[]>(initialAssignedAgents || []);
    const [status, setStatus] = useState<string>(initialStatus || "Available");

    // Simple state handler for string/number fields
    const handleChange = (field: keyof PropertyData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Calculate Final Price with VAT
    const finalPrice = useMemo(() => {
        if (!formData.price_value) return 0;
        if (!formData.vat_applicable || formData.vat_type === "0%" || !formData.vat_type) {
            return formData.price_value;
        }

        const vatRate = formData.vat_type === "19%" ? 0.19 : 0.05;
        return formData.price_value * (1 + vatRate);
    }, [formData.price_value, formData.vat_applicable, formData.vat_type]);

    const handleExtract = async () => {
        if (!extractUrl) {
            toast.error("Please enter a URL to extract from.");
            return;
        }

        setIsExtracting(true);
        try {
            const res = await fetch("/api/ingest", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: extractUrl })
            });

            const result = await res.json();

            if (!res.ok || !result.success) {
                throw new Error(result.error || "Failed to extract data");
            }

            // Pre-fill the form with AI extracted data
            setFormData(prev => ({
                ...prev,
                ...result.data,
                // Ensure array fields don't accidentally become null
                amenities: result.data.amenities || prev.amenities,
                views: result.data.views || prev.views,
                images_urls: result.data.images_urls || prev.images_urls
            }));

            toast.success("Property data successfully extracted!");

        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsExtracting(false);
        }
    };

    const handleRemoveImage = (indexToRemove: number) => {
        setFormData(prev => ({
            ...prev,
            images_urls: prev.images_urls.filter((_, i) => i !== indexToRemove)
        }));
    };

    const handleToggleAgent = (agentId: string) => {
        setAssignedAgentIds(prev =>
            prev.includes(agentId)
                ? prev.filter(id => id !== agentId)
                : [...prev, agentId]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onSubmit) {
            onSubmit(formData, assignedAgentIds, status);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto pb-12">
            {/* Smart Extraction Area */}
            <Card className="border-blue-100 shadow-sm bg-blue-50/30">
                <CardHeader className="pb-4">
                    <CardTitle className="text-blue-900 flex items-center gap-2">
                        <Wand2 className="w-5 h-5 text-blue-600" />
                        Start from a Link (Bazaraki / DOM.com.cy)
                    </CardTitle>
                    <CardDescription>
                        Paste a URL to magically extract all property details, VAT settings, and images automatically.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="https://bazaraki.com/..."
                                className="pl-9 bg-white"
                                value={extractUrl}
                                onChange={(e) => setExtractUrl(e.target.value)}
                                disabled={isExtracting}
                            />
                        </div>
                        <Button
                            type="button"
                            onClick={handleExtract}
                            disabled={isExtracting}
                            className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px]"
                        >
                            {isExtracting ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Extracting</>
                            ) : (
                                "Extract Data"
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Main Details */}
                <div className="md:col-span-8 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2 mb-4 p-4 border rounded-md bg-slate-50 border-slate-200">
                                <Label className="text-slate-700">Lifecycle Status</Label>
                                <Select
                                    value={status}
                                    onValueChange={setStatus}
                                >
                                    <SelectTrigger className="bg-white">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Available">🟢 Available</SelectItem>
                                        <SelectItem value="Reserved">🟠 Reserved</SelectItem>
                                        <SelectItem value="Sold">🔴 Sold</SelectItem>
                                        <SelectItem value="Off-Market">⚫ Off-Market</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Property Use</Label>
                                    <Select
                                        value={formData.property_use}
                                        onValueChange={(val) => handleChange("property_use", val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select purpose" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Sale">Sale</SelectItem>
                                            <SelectItem value="Rent">Rent</SelectItem>
                                            <SelectItem value="Investment">Investment</SelectItem>
                                            <SelectItem value="Unknown">Unknown</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Property Type</Label>
                                    <Select
                                        value={formData.property_type}
                                        onValueChange={(val) => handleChange("property_type", val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Apartment">Apartment</SelectItem>
                                            <SelectItem value="Studio">Studio</SelectItem>
                                            <SelectItem value="Penthouse">Penthouse</SelectItem>
                                            <SelectItem value="House">House</SelectItem>
                                            <SelectItem value="Villa">Villa</SelectItem>
                                            <SelectItem value="Townhouse">Townhouse</SelectItem>
                                            <SelectItem value="Plot">Plot</SelectItem>
                                            <SelectItem value="Commercial">Commercial</SelectItem>
                                            <SelectItem value="Office">Office</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Condition</Label>
                                    <Select
                                        value={formData.condition}
                                        onValueChange={(val) => handleChange("condition", val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select condition" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="New">New</SelectItem>
                                            <SelectItem value="Resale">Resale</SelectItem>
                                            <SelectItem value="Under Construction">Under Constr.</SelectItem>
                                            <SelectItem value="Unknown">Unknown</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-2 space-y-2">
                                    <Label>Location Area</Label>
                                    <Input
                                        value={formData.location_area || ""}
                                        onChange={(e) => handleChange("location_area", e.target.value)}
                                        placeholder="e.g. Limassol - Marina"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Distance to Sea (m)</Label>
                                    <Input
                                        type="number"
                                        value={formData.distance_to_sea_m || ""}
                                        onChange={(e) => handleChange("distance_to_sea_m", parseInt(e.target.value) || null)}
                                        placeholder="e.g. 500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <Label>Bedrooms</Label>
                                    <Input
                                        type="number"
                                        value={formData.bedrooms || ""}
                                        onChange={(e) => handleChange("bedrooms", parseInt(e.target.value) || null)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Bathrooms</Label>
                                    <Input
                                        type="number"
                                        value={formData.bathrooms || ""}
                                        onChange={(e) => handleChange("bathrooms", parseInt(e.target.value) || null)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Year Built</Label>
                                    <Input
                                        type="number"
                                        value={formData.year_of_construction || ""}
                                        onChange={(e) => handleChange("year_of_construction", parseInt(e.target.value) || null)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Area (m²)</Label>
                                    <Input
                                        type="number"
                                        value={formData.covered_area_sqm || ""}
                                        onChange={(e) => handleChange("covered_area_sqm", parseInt(e.target.value) || null)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Furnishing</Label>
                                    <Select
                                        value={formData.furnishing}
                                        onValueChange={(val) => handleChange("furnishing", val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Furnishing status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Fully Furnished">Fully Furnished</SelectItem>
                                            <SelectItem value="Semi-Furnished">Semi-Furnished</SelectItem>
                                            <SelectItem value="Unfurnished">Unfurnished</SelectItem>
                                            <SelectItem value="Unknown">Unknown</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Amenities Extracted (Tags)</Label>
                                    <Input
                                        value={formData.amenities.join(', ')}
                                        readOnly
                                        className="bg-slate-50 text-slate-500 cursor-not-allowed text-sm"
                                        placeholder="e.g. Pool, Gym, Sauna"
                                        title={formData.amenities.join(', ')}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Public Description</Label>
                                <Textarea
                                    className="min-h-[120px]"
                                    value={formData.description_short || ""}
                                    onChange={(e) => handleChange("description_short", e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Media Gallery */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ImageIcon className="h-5 w-5" />
                                Image Gallery
                            </CardTitle>
                            <CardDescription>Review and remove low-quality scraped images. Images will be secured in our Supabase bucket on save.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {formData.images_urls.length === 0 ? (
                                <div className="border border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-slate-400">
                                    <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
                                    <p>No images added yet.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {formData.images_urls.map((url, idx) => (
                                        <div key={idx} className="relative group rounded-md overflow-hidden bg-slate-100 aspect-square border border-slate-200">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={url} alt="Property preview" className="object-cover w-full h-full" />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveImage(idx)}
                                                className="absolute inset-x-0 bottom-0 bg-red-600/90 text-white py-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex justify-center items-center gap-1 text-xs font-medium"
                                            >
                                                <Trash2 className="h-3 w-3" /> Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Details */}
                <div className="md:col-span-4 space-y-6">
                    {/* Pricing & VAT */}
                    <Card className="border-green-100 border-2">
                        <CardHeader className="bg-green-50/50 pb-4">
                            <CardTitle>Pricing & Cyprus VAT</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label>Base Price ({formData.currency})</Label>
                                <Input
                                    type="number"
                                    value={formData.price_value || ""}
                                    onChange={(e) => handleChange("price_value", parseFloat(e.target.value) || 0)}
                                    className="font-bold text-lg"
                                />
                            </div>

                            <div className="flex items-center gap-2 py-2">
                                <input
                                    type="checkbox"
                                    id="vat-check"
                                    checked={formData.vat_applicable || false}
                                    onChange={(e) => handleChange("vat_applicable", e.target.checked)}
                                    className="h-4 w-4 rounded border-slate-300 text-green-600 focus:ring-green-600"
                                />
                                <Label htmlFor="vat-check" className="font-medium">Subject to VAT</Label>
                            </div>

                            {formData.vat_applicable && (
                                <div className="space-y-2 pl-6 border-l-2 border-green-200">
                                    <Label>VAT Type</Label>
                                    <Select
                                        value={formData.vat_type || ""}
                                        onValueChange={(val) => handleChange("vat_type", val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select VAT rate" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="19%">19% (Standard)</SelectItem>
                                            <SelectItem value="5%">5% (First Home)</SelectItem>
                                            <SelectItem value="0%">0%</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div className="pt-4 mt-2 border-t flex justify-between items-center px-2">
                                <span className="text-slate-500 font-medium">Final Ask Price:</span>
                                <span className="font-bold text-2xl text-green-700">
                                    €{finalPrice.toLocaleString()}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Strategic AI Data */}
                    <Card className="border-amber-100">
                        <CardHeader className="bg-amber-50/50 pb-4">
                            <CardTitle className="text-amber-900">AI Context & Admin</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label>Private Notes (AI & Agents Only)</Label>
                                <Textarea
                                    className="bg-amber-50/30 text-amber-900 placeholder:text-amber-300/50"
                                    placeholder="e.g. Owner accepts 5% less, gate code 1234"
                                    value={formData.internal_notes || ""}
                                    onChange={(e) => handleChange("internal_notes", e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Assigned Agents</Label>
                                {agents.length === 0 ? (
                                    <p className="text-sm text-slate-500 italic">No agents created yet.</p>
                                ) : (
                                    <div className="space-y-2 border rounded-md p-3 max-h-48 overflow-y-auto">
                                        {agents.map(agent => (
                                            <div key={agent.id} className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    id={`agent-${agent.id}`}
                                                    checked={assignedAgentIds.includes(agent.id)}
                                                    onChange={() => handleToggleAgent(agent.id)}
                                                    className="h-4 w-4 rounded border-slate-300"
                                                />
                                                <Label htmlFor={`agent-${agent.id}`} className="cursor-pointer">{agent.full_name}</Label>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="title-deeds"
                                    checked={formData.title_deeds || false}
                                    onChange={(e) => handleChange("title_deeds", e.target.checked)}
                                    className="h-4 w-4 rounded border-slate-300"
                                />
                                <Label htmlFor="title-deeds">Title Deeds Target</Label>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="flex justify-end gap-4 mt-8 pt-4 border-t">
                <Button variant="outline" type="button">Cancel</Button>
                <Button type="submit" size="lg" className="min-w-[150px]">Save Property</Button>
            </div>
        </form>
    );
}
