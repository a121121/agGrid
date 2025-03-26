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