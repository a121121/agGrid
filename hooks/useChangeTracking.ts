import { useState, useCallback } from 'react';
import { createChangeLogEntry } from '../lib/changeLogHelpers';
import { CellValueChangedEvent } from 'ag-grid-community';

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

export const useChangeTracking = <T extends { id: number; version: number }>(initialData: T[]) => {
    const [rowData, setRowData] = useState<T[]>(initialData);
    const [localChanges, setLocalChanges] = useState<{ [key: number]: { field: keyof T, oldValue: any, newValue: any }[] }>({});
    const [changeLog, setChangeLog] = useState<{ [key: number]: ChangeLog<T>[] }>({});
    const [snapshots, setSnapshots] = useState<DataSnapshot<T>[]>([
        {
            date: new Date(0), // Initial snapshot at the beginning of time
            data: initialData.map(row => ({ ...row }))
        }
    ]);

    const onCellValueChanged = useCallback((event: CellValueChangedEvent<T, keyof T>) => {
        const { data, column, oldValue, newValue } = event;

        if (!data) return;

        if (oldValue !== newValue) {
            setLocalChanges(prev => ({
                ...prev,
                [data.id]: [
                    ...(prev[data.id] || []),
                    {
                        field: column.getColId() as keyof T,
                        oldValue,
                        newValue
                    }
                ]
            }));
        }
    }, []);

    const saveChanges = useCallback(() => {
        if (Object.keys(localChanges).length === 0) {
            alert('No changes to save!');
            return;
        }

        const updatedRowData = rowData.map(row => {
            const rowChanges = localChanges[row.id];
            if (rowChanges) {
                const changeLogEntry = createChangeLogEntry(row.id, rowChanges, row.version);

                setChangeLog(prev => ({
                    ...prev,
                    [row.id]: [...(prev[row.id] || []), changeLogEntry]
                }));

                return {
                    ...row,
                    ...Object.fromEntries(
                        rowChanges.map(change => [change.field, change.newValue])
                    ),
                    version: row.version + 1
                };
            }
            return row;
        });

        // Save a snapshot when changes are saved
        setSnapshots(prev => [
            ...prev,
            {
                date: new Date(),
                data: updatedRowData.map(row => ({ ...row }))
            }
        ]);

        setRowData(updatedRowData);
        setLocalChanges({});

        alert('Changes saved successfully!');
    }, [rowData, localChanges]);

    const getDataForDate = useCallback((date: Date): T[] => {
        // Sort snapshots to ensure chronological order
        const sortedSnapshots = [...snapshots].sort((a, b) => a.date.getTime() - b.date.getTime());

        // Find the most recent snapshot before or on the given date
        const relevantSnapshot = sortedSnapshots.reduce((latest, current) =>
            current.date <= date ? current : latest
        );

        // Create a deep copy of the snapshot data
        const historicalData = relevantSnapshot.data.map(row => ({ ...row }));

        // Apply change logs for each row up to and including the specified date
        Object.keys(changeLog).forEach(rowId => {
            const parsedRowId = parseInt(rowId);
            const rowChangeLogs = changeLog[parsedRowId]
                .filter(log => {
                    // Compare dates without time components
                    const logDate = new Date(log.changedAt);
                    logDate.setHours(0, 0, 0, 0);
                    const queryDate = new Date(date);
                    queryDate.setHours(0, 0, 0, 0);
                    return logDate <= queryDate;
                })
                .sort((a, b) => a.changedAt.getTime() - b.changedAt.getTime());

            const rowIndex = historicalData.findIndex(r => r.id === parsedRowId);
            if (rowIndex !== -1) {
                rowChangeLogs.forEach(log => {
                    log.changes.forEach(change => {
                        (historicalData[rowIndex] as any)[change.field] = change.newValue;
                    });
                });
            }
        });

        return historicalData;
    }, [snapshots, changeLog]);
    return {
        rowData,
        localChanges,
        changeLog,
        snapshots,
        onCellValueChanged,
        saveChanges,
        getDataForDate,
        setRowData,
    };
};