// 📄 utils/generateKitData.ts
import { Kit } from '@/types/kit';

export const generateKitData = (count: number = 100): Kit[] => {
    // All possible values based on the Kit type
    const kitNames: Kit['kitName'][] = [
        'Kit B',
        'Kit C',
        'Kit C 125',
    ];

    const stateStatuses: Kit['stateStatus'][] = [
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

    const currentStatuses = [
        'In Progress',
        'Evaluation',
        'Testing',
        'Completed',
        'On Hold',
        'Cancelled',
        'Ready for Production',
        'Awaiting Approval',
        null
    ];

    const manufacturers: Kit['manufacturer'][] = [
        'Machine Shop',
        'Sheet Metal',
        'Rubber and Ploymer',
        'PMC',
        'Harness Manufacturing',
        'Spring Shop'
    ];

    const nouns = [
        'Component',
        'Assembly',
        'Module',
        'Unit',
        'Part',
        'System',
        'Device',
        'Element'
    ];

    const users = [
        'John Doe',
        'Jane Smith',
        'Mike Johnson',
        'Sarah Williams',
        'David Brown',
        'Emily Davis',
        'Robert Wilson',
        'Lisa Miller'
    ];

    const kits: Kit[] = [];

    for (let i = 1; i <= count; i++) {
        const partNumber = `KIT-${String(i).padStart(3, '0')}`;
        const noun = `${nouns[Math.floor(Math.random() * nouns.length)]} ${String.fromCharCode(65 + Math.floor(Math.random() * 8))}`;
        const dieRequired = Math.random() > 0.5;

        kits.push({
            id: i,
            partNumber,
            noun,
            kitName: kitNames[Math.floor(Math.random() * kitNames.length)],
            manufacturer: manufacturers[Math.floor(Math.random() * manufacturers.length)],
            stateStatus: stateStatuses[Math.floor(Math.random() * stateStatuses.length)],
            currentStatus: currentStatuses[Math.floor(Math.random() * currentStatuses.length)],
            remarks: `Auto-generated kit ${i}`,
            form48number: `F48-${String(i).padStart(3, '0')}`,
            user: users[Math.floor(Math.random() * users.length)],
            dieRequired,
            dieNumber: dieRequired ? `DIE-${String(i).padStart(3, '0')}` : '',
            version: 1
        });
    }

    return kits;
};