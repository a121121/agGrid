
// 📄 app/api/kits/[id]/history/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getKitChangeHistory } from '@/lib/db/kit-service';

// 📄 app/api/kits/[id]/history/route.ts
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // No need to await params - it's not a Promise

        const id = parseInt(await params.id, 10);

        // Check if we need to filter by date
        const url = new URL(request.url);
        const dateParam = url.searchParams.get('date');

        let date = undefined;
        if (dateParam) {
            date = new Date(dateParam);
            if (isNaN(date.getTime())) {
                return NextResponse.json(
                    { error: 'Invalid date format' },
                    { status: 400 }
                );
            }
        }

        // Pass the date parameter to getKitChangeHistory
        const history = await getKitChangeHistory(id, date);
        return NextResponse.json(history);
    } catch (error) {
        console.error(`Error fetching history for kit ${params.id}:`, error);
        return NextResponse.json(
            { error: 'Failed to fetch kit history' },
            { status: 500 }
        );
    }
}