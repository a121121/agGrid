// 📄 hooks/useChangeTracking.ts
import { useState, useCallback } from 'react';
import { CellValueChangedEvent } from 'ag-grid-community';
import { Kit } from '@/types/kit';
import { useKitContext } from '@/context/kitContext';
import { toast } from 'sonner';
// import { useAuth } from '@/context/AuthContext';

// Mock user ID - in a real app, get this from your auth system

export const useChangeTracking = <T extends Kit>() => {
    const { kits, updateKit } = useKitContext();
    const [localChanges, setLocalChanges] = useState<{ [key: number]: { field: keyof T, oldValue: any, newValue: any }[] }>({});
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

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

    const saveChanges = useCallback(async (username: string) => {
        if (Object.keys(localChanges).length === 0) {
            toast.error('No changes to save!');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // For each modified row, make API call to update it
            for (const rowId in localChanges) {
                const changes = localChanges[rowId];

                // Apply changes to create updated values object
                const updatedValues = Object.fromEntries(
                    changes.map(change => [change.field, change.newValue])
                );
                console.log(username);
                // Use the context's updateKit function with the username
                await updateKit(parseInt(rowId), updatedValues, username);
            }

            // Clear local changes
            setLocalChanges({});
            toast.success('Changes saved successfully!');
        } catch (err) {
            console.error('Error saving changes:', err);
            setError(err instanceof Error ? err.message : 'Unknown error occurred');
            toast.error(`Error saving changes: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    }, [localChanges, updateKit]);

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

    return {
        rowData: kits,
        localChanges,
        isLoading,
        error,
        onCellValueChanged,
        saveChanges,
        getChangeHistory
    };
};