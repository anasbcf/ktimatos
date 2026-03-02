
import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function GET() {
    try {
        const supabase = createServiceClient();
        const { data, error } = await supabase.from('marketing_leads').select('*').limit(1);

        return NextResponse.json({
            exists: !error,
            error: error ? error.message : null,
            data
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
