// app/api/kits/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/db'
import { KitService } from '@/utils/kit-service';
import importCsv from '@/utils/csvParser';


export async function GET(request: NextRequest) {
    try {
        const kitService = new KitService();

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
            const historicalKits = await kitService.getAllKitsAtDate(date);
            return NextResponse.json(historicalKits);
        } else {
            const kits = await prisma.kit.findMany(
                {
                    where: {
                        validUntil: new Date('9999-12-31T23:59:59')
                    }
                }
            );

            return NextResponse.json(kits);
        }


    } catch (error) {
        console.error('Failed to fetch kits:', error);
        return NextResponse.json({ error: 'Failed to fetch kits' }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest
) {
    try {
        importCsv()
            .catch((error) => {
                console.error('Import failed:', error);
                process.exit(1);
            });
        return NextResponse.json({ body: 'Upload Successful' })
    } catch (error) {
        console.error(`Error updating kit `, error);
        return NextResponse.json(
            { error: 'Failed to update kit' },
            { status: 500 }
        );
    }
}