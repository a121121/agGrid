// app/api/kit-changes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/db-init';

interface ChangeRecord {
    id: number;
    kitId: number;
    kitName: string;
    partNumber: string;
    field: string;
    oldValue: string;
    newValue: string;
    changedAt: string;
    username: string;
}

export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const startDate = url.searchParams.get('start');
        const endDate = url.searchParams.get('end');

        if (!startDate || !endDate) {
            return NextResponse.json(
                { error: 'Start and end dates are required' },
                { status: 400 }
            );
        }

        // Format dates to ensure the end date includes the entire day
        const formattedStartDate = `${startDate} 00:00:00`;
        const formattedEndDate = `${endDate} 23:59:59`;

        const db = await getDb();

        // Fetch changes within the specified date range
        const changes = await db.all<ChangeRecord[]>(`
      SELECT 
        cl.id,
        cl.kit_id as kitId,
        k.kit_name as kitName,
        k.part_number as partNumber,
        cd.field,
        cd.old_value as oldValue,
        cd.new_value as newValue,
        cl.changed_at as changedAt,
        u.name as username
      FROM change_logs cl
      JOIN change_details cd ON cl.id = cd.change_log_id
      JOIN kits k ON cl.kit_id = k.id
      JOIN users u ON cl.user_id = u.id
      WHERE datetime(cl.changed_at) >= datetime(?)
      AND datetime(cl.changed_at) <= datetime(?)
      ORDER BY cl.changed_at DESC
    `, [formattedStartDate, formattedEndDate]);

        return NextResponse.json(changes);
    } catch (error) {
        console.error('Error fetching kit changes:', error);
        return NextResponse.json(
            { error: 'Failed to fetch kit changes' },
            { status: 500 }
        );
    }
}