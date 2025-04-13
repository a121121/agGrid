export interface Kit {
    id: number;
    partNumber: string;
    noun: string;
    kitName: string;
    stateStatus: string;
    currentStatus: string | null;
    remarks: string;
    manufacturer: string;
    form48number: string;
    userName: string;
    shopName: string;
    dieRequired: boolean;
    dieNumber: string;
    version: number;
    createdAt: string | Date;
    validUntil: string | Date;
    originalKitId: number;
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

// Define types for the filter state
export type KitCategoryFilter = 'Total' | 'Kit B' | 'Kit C' | 'Kit C 125';
export type StateStatusFilter = 'All' | Kit['stateStatus'];

export interface FilterState {
    categories: KitCategoryFilter[];
    statuses: StateStatusFilter[];
}

// New audit record type for the flat format from API
export interface AuditRecord {
    id: number;
    kitId: number;
    userName: string;
    changedAt: string | Date;
    version: number;
    field: string;
    oldValue: string;
    newValue: string;
}


// id: number;
// partNumber: string;
// noun: string;
// kitName: 'Kit B' | 'Kit C' | 'Kit C 125' | string,
// stateStatus: 'Form 17 Pending' | 'Under Indegenization' | 'Part Under TF' | 'Die Under TF' | 'Part Trial Testing' | 'MCL' | 'Under Sourcing' | 'Sourcing Completed' | 'Beyond Capability';
// currentStatus: string | null,
// remarks: string,
// manufacturer: 'Machine Shop' | 'Sheet Metal' | 'Rubber and Ploymer' | 'PMC' | 'Harness Manufacturing' | 'Spring Shop', //more to be added later
// form48number: string,
// userName: string,
// dieRequired: boolean,
// dieNumber: string,
// version: number;
// originalKitId: number

