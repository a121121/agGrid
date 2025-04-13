// app/scripts/import-csv.ts
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import prisma from '@/db'

// const prisma = new PrismaClient();

// Update this type to match your data model
type CsvRow = {

    noun: string,
    kitName: string,
    stateStatus: string,
    currentStatus: string,
    manufacturer: string,
    form48number: string,
    userName: string,
    dieNumber: string,
    remarks: string,
    partNumber: string,
};

// Update this function to transform your CSV data to match your Prisma model
function transformCsvRow(row: CsvRow) {
    const createdAt = new Date();
    // console.log((row.partNumber).toString())
    return {
        id: undefined,
        partNumber: row.partNumber,
        noun: row.noun,
        kitName: row.kitName,
        stateStatus: row.stateStatus,
        currentStatus: row.currentStatus,
        manufacturer: row.manufacturer,
        form48number: row.form48number,
        userName: "Abdullah",
        shopName: row.userName,
        dieNumber: row.dieNumber,
        remarks: row.remarks,
        dieRequired: row.dieNumber != "",
        version: 1,
        createdAt: new Date(createdAt.setMonth(createdAt.getMonth() - 3)), // just add 3 months backdate here,
        validUntil: new Date('9999-12-31T23:59:59'),
        // Transform other fields as needed
    };
}

async function clearExistingData() {
    console.log('Clearing existing data...');

    // Delete all records first
    await prisma.auditLog.deleteMany();
    console.log('Deleted all audit logs');
    await prisma.kit.deleteMany();
    console.log('Deleted all kits');

    // Reset SQLite auto-increment counters
    await prisma.$executeRaw`DELETE FROM sqlite_sequence WHERE name='Kit'`;
    await prisma.$executeRaw`DELETE FROM sqlite_sequence WHERE name='AuditLog'`;
    console.log('Reset SQLite auto-increment counters');
}


export default async function importCsv() {

    const results: ReturnType<typeof transformCsvRow>[] = [];
    const csvFilePath = path.join(process.cwd(), 'public', 'kitList.csv');

    // Read and parse the CSV file
    await new Promise<void>((resolve, reject) => {
        fs.createReadStream(csvFilePath)
            .pipe(csv())
            .on('data', (row: CsvRow) => {
                results.push(transformCsvRow(row));
            })
            .on('end', () => {
                console.log(`CSV file processed: ${results.length} rows found`);
                resolve();
            })
            .on('error', (error: any) => {
                reject(error);
            });
    });

    // Batch size for createMany operations
    // SQLite has limitations, so we might need to process in chunks
    const batchSize = results.length - 100;
    let successCount = 0;
    // const i = 0;

    try {
        clearExistingData();
        // Process in batches since SQLite might have limitations
        for (let i = 0; i < results.length; i += batchSize) {
            const batch = results.slice(i, i + batchSize);

            await prisma.kit.createMany({
                data: batch,
                // skipDuplicates: true, // Optional: skip duplicate records
            });

            successCount += batch.length;
            console.log(`Imported batch: ${i} to ${i + batch.length}`);

        }

        const kits = await prisma.kit.findMany()
        for (const kit of kits) {
            await prisma.kit.update(
                {
                    where: { id: kit.id },
                    data: { originalKitId: kit.id },
                }
            )
        }


        console.log(`Import completed. ${successCount} records imported.`);
    } catch (error) {
        console.error('Error importing data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Execute the import
