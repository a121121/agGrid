// 📄 hooks/useChangeTracking.ts
import { useState, useCallback } from 'react';
import { Car, CarChangeLog } from '../types/car';
import { createChangeLogEntry } from '../utils/changeLogHelpers';

export const useChangeTracking = (initialData: Car[]) => {
    const [rowData, setRowData] = useState<Car[]>(initialData);
    const [localChanges, setLocalChanges] = useState<{ [key: number]: { field: keyof Car, oldValue: any, newValue: any }[] }>({});
    const [changeLog, setChangeLog] = useState<{ [key: number]: CarChangeLog[] }>({});

    const onCellValueChanged = useCallback((event: any) => {
        const { data, column, oldValue, newValue } = event;

        if (oldValue !== newValue) {
            setLocalChanges(prev => ({
                ...prev,
                [data.id]: [
                    ...(prev[data.id] || []),
                    {
                        field: column.getColId() as keyof Car,
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
                // TODO: In actual app, this is where you'd call your backend API
                const changeLogEntry = createChangeLogEntry(row.id, rowChanges, row.version);

                setChangeLog(prev => ({
                    ...prev,
                    [row.id]: [...(prev[row.id] || []), changeLogEntry]
                }));

                return { ...row, version: row.version + 1 };
            }
            return row;
        });

        setRowData(updatedRowData);
        setLocalChanges({});

        alert('Changes saved successfully!');
    }, [rowData, localChanges]);

    return {
        rowData,
        localChanges,
        changeLog,
        onCellValueChanged,
        saveChanges,
        setRowData,
    };
};