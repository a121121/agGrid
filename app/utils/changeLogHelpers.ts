import { Car, CarChangeLog } from '../types/car';

export const createChangeLogEntry = (
    id: number,
    changes: { field: keyof Car, oldValue: any, newValue: any }[],
    currentVersion: number
): CarChangeLog => ({
    id,
    changes,
    changedAt: new Date(),
    changedBy: 'current_user', // TODO: Replace with actual user authentication
    version: currentVersion + 1
});