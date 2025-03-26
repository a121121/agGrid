// 📄 constants/kitData.ts
import { Kit } from '@/types/kit';

export const INITIAL_KIT_DATA: Kit[] = [
    {
        id: 1,
        partNumber: 'KIT-001',
        noun: 'Component A',
        kitName: 'Kit B',
        manufacturer: 'Machine Shop',
        stateStatus: 'Form 17 Pending',
        currentStatus: 'In Progress',
        remarks: 'Initial development stage',
        form48number: 'F48-001',
        user: 'John Doe',
        dieRequired: true,
        dieNumber: 'DIE-001',
        version: 1
    },
    {
        id: 2,
        partNumber: 'KIT-002',
        noun: 'Component B',
        kitName: 'Kit C',
        manufacturer: 'Sheet Metal',
        stateStatus: 'Under Indegenization',
        currentStatus: 'Evaluation',
        remarks: 'Sourcing in progress',
        form48number: 'F48-002',
        user: 'Jane Smith',
        dieRequired: false,
        dieNumber: '',
        version: 1
    },
    {
        id: 3,
        partNumber: 'KIT-003',
        noun: 'Component C',
        kitName: 'Kit C 125',
        manufacturer: 'Rubber and Ploymer',
        stateStatus: 'Part Under TF',
        currentStatus: 'Testing',
        remarks: 'Technical feasibility assessment',
        form48number: 'F48-003',
        user: 'Mike Johnson',
        dieRequired: true,
        dieNumber: 'DIE-003',
        version: 1
    },

];