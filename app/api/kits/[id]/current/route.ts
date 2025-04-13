// app/api/kits/[id]/current/route.ts
import { NextResponse } from 'next/server';
import { KitService } from '@/utils/kit-service';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const kitService = new KitService();

    try {
        const kitId = parseInt(params.id);
        if (isNaN(kitId)) {
            return NextResponse.json({ error: 'Invalid Kit ID' }, { status: 400 });
        }

        const kit = await kitService.getCurrentVersion(kitId);
        if (!kit) {
            return NextResponse.json({ error: 'Kit not found' }, { status: 404 });
        }

        return NextResponse.json(kit);
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}