// 📄 hooks/useChangeTracking.ts
import { useState, useCallback, useEffect } from 'react';
import { CellValueChangedEvent } from 'ag-grid-community';
import { ChangeLog } from '@/types/kit';



// Mock user ID - in a real app, get this from your auth system
const userName = "bawa Qadra";

export const useChangeTracking = <T extends { id: number; version: number }>(initialData: T[]) => {
    const [rowData, setRowData] = useState<T[]>(initialData);
    const [localChanges, setLocalChanges] = useState<{ [key: number]: { field: keyof T, oldValue: any, newValue: any }[] }>({});
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [changeLog, setChangeLog] = useState<ChangeLog<T>[]>([]);

    // Load initial data
    useEffect(() => {
        setRowData(initialData);
    }, [initialData]);

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

    const saveChanges = useCallback(async () => {
        if (Object.keys(localChanges).length === 0) {
            alert('No changes to save!');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const updatedRows: T[] = [...rowData];

            // For each modified row, make API call to update it
            for (const rowId in localChanges) {
                const changes = localChanges[rowId];
                const rowIndex = rowData.findIndex(row => row.id === parseInt(rowId));

                if (rowIndex === -1) continue;

                // const currentRow = rowData[rowIndex];

                // Apply changes to create updated row
                // Previously we had ...currentRow here as well
                const updatedValues = {
                    ...Object.fromEntries(
                        changes.map(change => [change.field, change.newValue])
                    )
                };

                // Send update to API
                const response = await fetch(`/api/kits/${rowId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        updatedValues: updatedValues,
                        userName: userName
                    }),
                });

                if (!response.ok) {
                    throw new Error(`Failed to update kit ${rowId}: ${response.statusText}`);
                }

                const updatedKit = await response.json();
                updatedRows[rowIndex] = updatedKit as T;
            }

            // Update state with new data
            // Update state with new data
            setRowData(updatedRows);
            setLocalChanges({});
            alert('Changes saved successfully!');
            return updatedRows; // Return the updated rows
        } catch (err) {
            console.error('Error saving changes:', err);
            setError(err instanceof Error ? err.message : 'Unknown error occurred');
            alert(`Error saving changes: ${err instanceof Error ? err.message : 'Unknown error'}`);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [rowData, localChanges]);

    const getDataForDate = useCallback(async (date: Date): Promise<T[]> => {
        setIsLoading(true);
        setError(null);

        try {
            const dateString = date.toISOString().split('T')[0];
            const response = await fetch(`/api/kits?date=${dateString}`);

            if (!response.ok) {
                throw new Error(`Failed to fetch data for date ${dateString}: ${response.statusText}`);
            }

            const historicalData = await response.json();
            return historicalData as T[];
        } catch (err) {
            console.error('Error fetching historical data:', err);
            setError(err instanceof Error ? err.message : 'Unknown error occurred');
            // Return current data as fallback
            return rowData;
        } finally {
            setIsLoading(false);
        }
    }, [rowData]);

    // Update this part of your useChangeTracking hook
    const getChangeHistory = useCallback(async (rowId: number, date?: Date) => {
        setIsLoading(true);
        try {
            let url = `/api/kits/${rowId}/audit`;

            // Add date parameter if provided
            if (date) {
                const dateString = date.toISOString().split('T')[0];
                url += `?date=${dateString}`;
            }

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch history: ${response.statusText}`);
            }

            const history = await response.json();
            return history;
        } catch (error) {
            console.error('Error fetching change history:', error);
            return [];
        } finally {
            setIsLoading(false);
        }
    }, []);

    const reloadData = useCallback(async (): Promise<void> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/kits');

            if (!response.ok) {
                throw new Error(`Failed to fetch kits: ${response.statusText}`);
            }

            const kits = await response.json();
            setRowData(kits as T[]);
        } catch (err) {
            console.error('Error reloading data:', err);
            setError(err instanceof Error ? err.message : 'Unknown error occurred');
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        rowData,
        localChanges,
        isLoading,
        error,
        changeLog,
        onCellValueChanged,
        saveChanges,
        getDataForDate,
        getChangeHistory,
        reloadData,
        setRowData,
    };
};