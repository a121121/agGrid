// app/api/kits/[id]/version/route.ts
import { NextResponse } from 'next/server';
import { getKitLatestVersion } from '@/lib/db/kit-service';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        // Await the params object before accessing properties
        const resolvedParams = await params;
        const version = await getKitLatestVersion(Number(resolvedParams.id));
        return NextResponse.json({ version });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch version' },
            { status: 500 }
        );
    }
}