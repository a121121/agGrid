// app/api/kits/[id]/audit/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/db';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Await the params to get the id
        const { id } = await params;
        console.log('kitId:', id);

        const history = await prisma.kit.findMany({
            where: {
                originalKitId: parseInt(id)  // Convert to number if your DB expects a number
            },
            orderBy: {
                version: 'desc'
            }
        });

        return NextResponse.json(history);
    } catch (error) {
        console.error('Failed to fetch audit log:', error);
        return NextResponse.json(
            { error: 'Failed to fetch audit log' },
            { status: 500 }
        );
    }
}