// 📄 app/api/kits/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
    getAllKits,
    getKitById,
    createKit,
    updateKit,
    deleteKit,
    getKitStatusAtDate,
    getKitChangeHistory,
    getAllKitsAtDate
} from '@/lib/db/kit-service';

// Get all kits or filter by date
export async function GET(request: NextRequest) {
    try {
        // Check if we need to get kits at a specific date
        const url = new URL(request.url);
        const dateParam = (url.searchParams.get('date'));

        if (dateParam) {
            const date = new Date(dateParam);
            if (isNaN(date.getTime())) {
                return NextResponse.json(
                    { error: 'Invalid date format' },
                    { status: 400 }
                );
            }

            // This would need to be implemented to get all kits at a specific date
            // For now, we'll just return current kits
            const historicalKits = await getAllKitsAtDate(date);
            return NextResponse.json(historicalKits);
        } else {
            const kits = await getAllKits();
            return NextResponse.json(kits);
        }
    } catch (error) {
        console.error('Error fetching kits:', error);
        return NextResponse.json(
            { error: 'Failed to fetch kits' },
            { status: 500 }
        );
    }
}

// Create a new kit
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // In a real app, you would get the current user ID from the session
        const userId = body.userId || 1; // Default to first user for demo

        const newKit = await createKit(body.kit, userId);
        return NextResponse.json(newKit, { status: 201 });
    } catch (error) {
        console.error('Error creating kit:', error);
        return NextResponse.json(
            { error: 'Failed to create kit' },
            { status: 500 }
        );
    }
}
