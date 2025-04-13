import { NextRequest, NextResponse } from 'next/server';
import { KitService } from '@/utils/kit-service';

// Update a kit
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {

    const kitService = new KitService();


    try {
        const { id } = await params;
        // const id = parseInt(id, 10);
        const body = await request.json();

        // In a real app, you would get the current user ID from the session
        const userName = body.userName || "bawa Qadra"; // Default to first user for demo
        const updatedValues = body.updatedValues;

        const result = await kitService.updateKit(parseInt(id), updatedValues, userName);
        return NextResponse.json(result);
    } catch (error) {
        console.error(`Error updating kit ${params.id}:`, error);
        return NextResponse.json(
            { error: 'Failed to update kit' },
            { status: 500 }
        );
    }
}
