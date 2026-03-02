import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, MapPin, BedDouble, Bath, Euro, Edit, User } from "lucide-react";
import Image from "next/image";

export default async function PropertiesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch properties for Org
    const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user!.id).single();

    if (!profile?.org_id) {
        return (
            <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg h-64 text-muted-foreground">
                <p>No organization associated with your profile.</p>
            </div>
        );
    }

    const { data: properties } = await supabase
        .from('properties')
        .select(`
            *,
            property_agents (
                profiles (
                    full_name
                )
            )
        `)
        .eq('org_id', profile.org_id)
        .order('created_at', { ascending: false });

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Properties</h1>
                <Button asChild>
                    <Link href="/dashboard/properties/new">
                        <Plus className="mr-2 h-4 w-4" /> Add Property
                    </Link>
                </Button>
            </div>

            {(!properties || properties.length === 0) ? (
                <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg h-64 text-muted-foreground">
                    <p>No properties yet. Add one to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {properties.map((prop) => {
                        const d = prop.parsed_data as any; // Cast JSONB
                        const imageUrl = d.images_urls?.[0] || '/placeholder.jpg';

                        let badgeColor = "bg-green-500 hover:bg-green-600";
                        if (prop.status === "Reserved") badgeColor = "bg-orange-500 hover:bg-orange-600";
                        if (prop.status === "Sold") badgeColor = "bg-red-500 hover:bg-red-600";
                        if (prop.status === "Off-Market") badgeColor = "bg-slate-500 hover:bg-slate-600";

                        return (
                            <Card key={prop.id} className="overflow-hidden flex flex-col">
                                <div className="relative h-48 w-full bg-muted">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={imageUrl} alt="Property" className="object-cover w-full h-full hover:scale-105 transition-transform duration-300" />
                                    <Badge className={`absolute top-2 right-2 text-white border-none uppercase ${badgeColor}`}>
                                        {prop.status}
                                    </Badge>
                                </div>
                                <CardHeader className="p-4">
                                    <CardTitle className="line-clamp-1 text-lg" title={d.title_deeds ? 'Title Deeds Available' : ''}>
                                        {d.location_area || 'Unknown Location'}
                                    </CardTitle>
                                    <div className="text-2xl font-bold text-primary flex items-center gap-1">
                                        <Euro className="h-5 w-5" />
                                        {d.price_value?.toLocaleString() || 'N/A'}
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 pt-0 flex-1">
                                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                                        {d.description_short}
                                    </p>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <BedDouble className="h-4 w-4" />
                                            <span>{d.bedrooms || '-'} Beds</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Bath className="h-4 w-4" />
                                            <span>{d.bathrooms || '-'} Baths</span>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="p-4 border-t bg-muted/20 flex flex-col gap-3 items-start">
                                    {/* Assigned Agents */}
                                    {prop.property_agents && prop.property_agents.length > 0 && (
                                        <div className="flex flex-wrap gap-1 w-full">
                                            {prop.property_agents.map((pa: any, i: number) => {
                                                const agentName = pa.profiles?.full_name?.split(' ')[0] || 'Unknown';
                                                return (
                                                    <Badge key={i} variant="secondary" className="text-[10px] flex items-center gap-1 bg-white border-slate-200">
                                                        <User className="h-3 w-3 text-slate-400" />
                                                        {agentName}
                                                    </Badge>
                                                );
                                            })}
                                        </div>
                                    )}

                                    <div className="text-xs text-muted-foreground w-full flex justify-between items-center">
                                        <span title={prop.id}>ID: ...{prop.id.slice(-6)}</span>
                                        <div className="flex items-center gap-2">
                                            {d.external_source_url && (
                                                <a href={d.external_source_url} target="_blank" rel="noopener noreferrer" className="hover:underline">Source</a>
                                            )}
                                            <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
                                                <Link href={`/dashboard/properties/${prop.id}/edit`}>
                                                    <Edit className="h-3 w-3 mr-1" /> Edit
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
