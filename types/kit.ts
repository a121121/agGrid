// 📄 types/car.ts
export interface Kit {
    id: number;
    partNumber: string;
    noun: string;
    kitName: 'Kit B' | 'Kit C' | 'Kit C 125' | string,
    stateStatus: 'Form 17 Pending' | 'Under Indegenization' | 'Part Under TF' | 'Die Under TF' | 'Part Trial Testing' | 'MCL' | 'Under Sourcing' | 'Sourcing Completed' | 'Beyond Capability';
    currentStatus: string | null,
    remarks: string,
    manufacturer: 'Machine Shop' | 'Sheet Metal' | 'Rubber and Ploymer' | 'PMC' | 'Harness Manufacturing' | 'Spring Shop', //more to be added later
    form48number: string,
    user: string,
    dieRequired: boolean,
    dieNumber: string,
    version: number;
}

export interface ChangeLog<T> {
    id: number;
    version: number;
    changes: Change<T>[];
    changedAt: Date;
    changedBy: string;
}

export interface Change<T> {
    field: keyof T;
    oldValue: any;
    newValue: any;
}

export interface DataSnapshot<T> {
    date: Date;
    data: T[];
}

export function createChangeLogEntry<T>(
    id: number,
    changes: { field: keyof T; oldValue: any; newValue: any }[],
    version: number
): ChangeLog<T> {
    return {
        id,
        version: version + 1,
        changes,
        changedAt: new Date(),
        changedBy: 'currentUser' // You might want to get this from your auth context
    };
}
