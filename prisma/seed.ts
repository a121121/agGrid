// import { PrismaClient } from '@prisma/client';
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient();

// Data generators for realistic kit data
const manufacturers = [
    'Machine Shop',
    'Sheet Metal',
    'Rubber and Ploymer',
    'PMC',
    'Harness Manufacturing',
    'Spring Shop'
];

const kitNames = [
    'Kit B',
    'Kit C',
    'Kit C 125',
    'Kit D',
];

const stateStatuses = [
    'Form 17 Pending',
    'Under Indegenization',
    'Part Under TF',
    'Die Under TF',
    'Part Trial Testing',
    'MCL',
    'Under Sourcing',
    'Sourcing Completed',
    'Beyond Capability'
];

const nouns = [
    'Bracket', 'Harness', 'Gasket', 'Bolt', 'Nut', 'Washer',
    'Panel', 'Cover', 'Housing', 'Shaft', 'Gear', 'Bearing',
    'Seal', 'Clip', 'Spring', 'Pin', 'Bushing', 'Adapter',
    'Connector', 'Terminal', 'Switch', 'Sensor', 'Actuator'
];

const users = [
    'engineer1', 'engineer2', 'engineer3', 'manager1', 'manager2',
    'admin1', 'tech1', 'tech2', 'supervisor1', 'supervisor2'
];

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

// Generate 100 unique part numbers
function generatePartNumbers(count: number) {
    const partNumbers = new Set();
    while (partNumbers.size < count) {
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        partNumbers.add(`PN-${randomNum}`);
    }
    return Array.from(partNumbers);
}

// Generate random kit data
function generateKit(index: number, partNumber: unknown) {
    const createdAt = new Date();
    // Make some kits older for realistic data spread
    if (index % 5 === 0) {
        createdAt.setMonth(createdAt.getMonth() - 3);
    } else if (index % 10 === 0) {
        createdAt.setMonth(createdAt.getMonth() - 6);
    }

    return {
        partNumber,
        noun: nouns[Math.floor(Math.random() * nouns.length)],
        kitName: kitNames[Math.floor(Math.random() * kitNames.length)],
        stateStatus: stateStatuses[Math.floor(Math.random() * stateStatuses.length)],
        currentStatus: Math.random() > 0.3 ? ['Pending', 'In Progress', 'Approved', 'Rejected', 'Testing'][Math.floor(Math.random() * 5)] : null,
        remarks: Math.random() > 0.5 ? `Initial remarks for ${partNumber}` : '',
        manufacturer: manufacturers[Math.floor(Math.random() * manufacturers.length)],
        form48number: `F48-2023-${String(index + 1).padStart(3, '0')}`,
        userName: users[Math.floor(Math.random() * users.length)],
        dieRequired: Math.random() > 0.7,
        dieNumber: Math.random() > 0.7 ? `DIE-${Math.floor(1000 + Math.random() * 9000)}` : '',
        version: 1,
        createdAt,
        validUntil: new Date('9999-12-31T23:59:59'),
        // originalKitId will be set after creation
    };
}

// Generate random changes for kits
function generateChangesForKit(kit: any, versionsToCreate: number) {
    const changes = [];
    let currentData = { ...kit };

    for (let i = 0; i < versionsToCreate; i++) {
        const changeableFields = [
            'stateStatus',
            'currentStatus',
            'remarks',
            'dieNumber',
            'dieRequired'
        ].filter(field => {
            // Don't change fields that are null unless they're status fields
            if (field === 'currentStatus' && currentData[field] === null) return true;
            return currentData[field] !== null && currentData[field] !== '';
        });

        const fieldToChange = changeableFields[Math.floor(Math.random() * changeableFields.length)];
        let newValue;

        switch (fieldToChange) {
            case 'stateStatus':
                newValue = stateStatuses[Math.floor(Math.random() * stateStatuses.length)];
                break;
            case 'currentStatus':
                newValue = ['Pending', 'In Progress', 'Approved', 'Rejected', 'Testing', null][Math.floor(Math.random() * 6)];
                break;
            case 'remarks':
                newValue = `Updated remarks v${i + 2}: ${['Design change', 'Material update', 'Vendor changed', 'Spec updated', 'Test completed'][Math.floor(Math.random() * 5)]}`;
                break;
            case 'dieNumber':
                newValue = `DIE-${Math.floor(1000 + Math.random() * 9000)}`;
                break;
            case 'dieRequired':
                newValue = !currentData.dieRequired;
                break;
            default:
                newValue = currentData[fieldToChange];
        }

        changes.push({
            field: fieldToChange,
            oldValue: currentData[fieldToChange],
            newValue,
            userName: users[Math.floor(Math.random() * users.length)],
            version: i + 2 // versions start at 2 for changes
        });

        // Update currentData for next iteration
        currentData[fieldToChange] = newValue;
    }

    return changes;
}

async function seedData() {
    console.log('Seeding 100 kits with audit logs...');

    clearExistingData();
    // Generate 100 unique part numbers
    const partNumbers = generatePartNumbers(100);

    // Create all initial kit versions
    const createdKits = [];
    for (let i = 0; i < 100; i++) {
        const kitData = generateKit(i, partNumbers[i]);
        const result = await prisma.kit.create({
            data: kitData,
        });
        createdKits.push(result);
        if ((i + 1) % 10 === 0) {
            console.log(`Created ${i + 1} initial kit versions`);
        }
    }

    // Update originalKitId to point to themselves (for initial versions)
    for (const kit of createdKits) {
        await prisma.kit.update({
            where: { id: kit.id },
            data: { originalKitId: kit.id },
        });
    }

    // Create version history and audit logs for each kit
    for (let i = 0; i < createdKits.length; i++) {
        const kit = createdKits[i];

        // Determine how many versions to create (1-4 additional versions)
        const versionsToCreate = Math.floor(1 + Math.random() * 4);
        const changes = generateChangesForKit(kit, versionsToCreate);

        let currentKitData = { ...kit };

        for (const change of changes) {
            // Update the previous version's validUntil to now
            const updateTime = new Date();
            await prisma.kit.update({
                where: { id: currentKitData.id },
                data: { validUntil: updateTime },
            });

            // Create new version of the kit
            const newVersion = await prisma.kit.create({
                data: {
                    ...currentKitData,
                    id: undefined, // Let Prisma auto-generate
                    [change.field]: change.newValue,
                    version: change.version,
                    originalKitId: kit.id, // Important: Use the original kit's ID
                    createdAt: updateTime, // This will be the version's effective date
                },
            });

            // Create audit log entry
            await prisma.auditLog.create({
                data: {
                    kitId: kit.id, // Use the original kit's ID
                    userName: change.userName,
                    version: change.version,
                    field: change.field,
                    oldValue: JSON.stringify(change.oldValue),
                    newValue: JSON.stringify(change.newValue),
                    changedAt: updateTime,
                },
            });

            // Update currentKitData for next iteration
            currentKitData = newVersion;
        }

        if ((i + 1) % 10 === 0) {
            console.log(`Processed ${i + 1} kits with version history`);
        }
    }

    console.log('Finished seeding 100 kits with version histories and audit logs.');
}

seedData()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });

