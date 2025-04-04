// 📄 app/api/kits/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
    getKitById,
    updateKit,
    deleteKit,
    getKitStatusAtDate,
    getKitChangeHistory
} from '@/lib/db/kit-service';

// Get a specific kit
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id, 10);

        // Check if we need to get kit at a specific date
        const url = new URL(request.url);
        const dateParam = url.searchParams.get('date');

        if (dateParam) {
            const date = new Date(dateParam);
            if (isNaN(date.getTime())) {
                return NextResponse.json(
                    { error: 'Invalid date format' },
                    { status: 400 }
                );
            }

            const kit = await getKitStatusAtDate(id, date);
            if (!kit) {
                return NextResponse.json(
                    { error: 'Kit not found at the specified date' },
                    { status: 404 }
                );
            }

            return NextResponse.json(kit);
        } else {
            const kit = await getKitById(id);
            if (!kit) {
                return NextResponse.json(
                    { error: 'Kit not found' },
                    { status: 404 }
                );
            }

            return NextResponse.json(kit);
        }
    } catch (error) {
        console.error(`Error fetching kit ${params.id}:`, error);
        return NextResponse.json(
            { error: 'Failed to fetch kit' },
            { status: 500 }
        );
    }
}

// Update a kit
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id, 10);
        const body = await request.json();

        // In a real app, you would get the current user ID from the session
        const userId = body.userId || 1; // Default to first user for demo

        const kit = await getKitById(id);
        if (!kit) {
            return NextResponse.json(
                { error: 'Kit not found' },
                { status: 404 }
            );
        }

        const updatedKit = {
            ...kit,
            ...body.kit
        };

        const result = await updateKit(updatedKit, body.changes, userId);
        return NextResponse.json(result);
    } catch (error) {
        console.error(`Error updating kit ${params.id}:`, error);
        return NextResponse.json(
            { error: 'Failed to update kit' },
            { status: 500 }
        );
    }
}

// Delete a kit
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id, 10);

        const result = await deleteKit(id);
        if (!result) {
            return NextResponse.json(
                { error: 'Kit not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(`Error deleting kit ${params.id}:`, error);
        return NextResponse.json(
            { error: 'Failed to delete kit' },
            { status: 500 }
        );
    }
}