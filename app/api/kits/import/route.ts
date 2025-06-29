// app/api/kits/import/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/db';

interface ImportData {
    noun?: string;
    kitName?: string;
    stateStatus?: string;
    currentStatus?: string;
    manufacturer?: string;
    form48number?: string;
    userName?: string;
    dieNumber?: string;
    remarks?: string;
    partNumber?: string;
}

interface ImportRequest {
    data: ImportData[];
    clearExisting: boolean;
}

function transformImportData(row: ImportData) {
    const createdAt = new Date();

    return {
        partNumber: row.partNumber || '',
        noun: row.noun || '',
        kitName: row.kitName || '',
        stateStatus: row.stateStatus || '',
        currentStatus: row.currentStatus || '',
        manufacturer: row.manufacturer || '',
        form48number: row.form48number || '',
        userName: row.userName || "System User",
        shopName: row.userName || '',
        dieNumber: row.dieNumber || '',
        remarks: row.remarks || '',
        dieRequired: (row.dieNumber || '').trim() !== '',
        version: 1,
        createdAt: createdAt,
        validUntil: new Date('9999-12-31T23:59:59'),
        originalKitId: -1, // Set to -1 initially, will be updated after creation
    };
}

async function clearExistingData() {
    console.log('Clearing existing data...');

    // Delete all records first
    await prisma.auditLog.deleteMany();
    console.log('Deleted all audit logs');

    await prisma.kit.deleteMany();
    console.log('Deleted all kits');

    // Reset MySQL auto-increment counters
    await prisma.$executeRawUnsafe(`ALTER TABLE Kit AUTO_INCREMENT = 1`);
    await prisma.$executeRawUnsafe(`ALTER TABLE AuditLog AUTO_INCREMENT = 1`);
    console.log('Reset MySQL auto-increment counters');
}

export async function POST(request: NextRequest) {
    try {
        const body: ImportRequest = await request.json();
        const { data, clearExisting } = body;

        if (!data || !Array.isArray(data) || data.length === 0) {
            return NextResponse.json(
                { error: 'No data provided for import' },
                { status: 400 }
            );
        }

        // Validate required fields
        const missingRequired = data.filter(row =>
            !row.partNumber || !row.noun || !row.kitName
        );

        if (missingRequired.length > 0) {
            return NextResponse.json(
                { error: `Missing required fields (partNumber, noun, kitName) in ${missingRequired.length} rows` },
                { status: 400 }
            );
        }

        // Clear existing data if requested
        if (clearExisting) {
            await clearExistingData();
        }

        // Transform data
        const transformedData = data.map(transformImportData);

        // Import data in batches
        const batchSize = 100;
        let successCount = 0;
        const createdKitIds: number[] = [];

        for (let i = 0; i < transformedData.length; i += batchSize) {
            const batch = transformedData.slice(i, i + batchSize);

            if (clearExisting) {
                // For clearing imports, we can use createMany for better performance
                const result = await prisma.kit.createMany({
                    data: batch,
                });
                successCount += result.count;

                // Fetch created IDs if needed (MySQL does not guarantee sequential IDs)
                const createdKits = await prisma.kit.findMany({
                    orderBy: { id: 'desc' },
                    take: batch.length,
                });

                createdKitIds.push(...createdKits.map(kit => kit.id));
            } else {
                // For non-clearing imports, handle duplicates manually and collect IDs
                for (const item of batch) {
                    try {
                        const createdKit = await prisma.kit.create({
                            data: item,
                        });
                        createdKitIds.push(createdKit.id);
                        successCount++;
                    } catch (error) {
                        // Skip duplicates or handle other errors
                        console.log(`Skipped duplicate or invalid record: ${item.partNumber}`);
                    }
                }
            }

            console.log(`Imported batch: ${i + 1} to ${Math.min(i + batchSize, transformedData.length)}`);
        }

        // Update originalKitId for all newly created kits
        console.log('Updating originalKitId for imported kits...');

        if (clearExisting) {
            await prisma.$executeRawUnsafe(`
                UPDATE Kit 
                SET originalKitId = id 
                WHERE originalKitId = -1
            `);
        } else {
            for (const kitId of createdKitIds) {
                await prisma.kit.update({
                    where: { id: kitId },
                    data: { originalKitId: kitId },
                });
            }
        }

        console.log(`Import completed. ${successCount} records imported.`);
        console.log(`Updated originalKitId for ${clearExisting ? 'all' : createdKitIds.length} imported kits.`);

        return NextResponse.json({
            message: `Successfully imported ${successCount} kits${clearExisting ? ' (existing data cleared)' : ' (added to existing data)'}`,
            importedCount: successCount,
            cleared: clearExisting,
        });

    } catch (error: unknown) {
        console.error('Error importing data:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return NextResponse.json(
            { error: 'Failed to import data: ' + errorMessage },
            { status: 500 }
        );
    }
}
