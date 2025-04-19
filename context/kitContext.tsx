// 📄 context/KitContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Kit } from '@/types/kit';
import { processKitData, FilterState } from '@/utils/processKitData';

interface KitContextType {
    kits: Kit[];
    loading: boolean;
    error: string | null;
    filters: FilterState;
    isHistorical: boolean;
    selectedDate: Date;
    processedData: ReturnType<typeof processKitData>;

    // Actions
    setFilters: (filters: React.SetStateAction<FilterState>) => void;
    fetchKits: (date?: Date) => Promise<void>;
    updateKit: (kitId: number, updatedValues: Partial<Kit>, userName: string) => Promise<void>;
    resetFilters: () => void;
    refreshData: () => void;
}

const defaultFilters: FilterState = {
    categories: ['Total'],
    statuses: ['All']
};

const KitContext = createContext<KitContextType | undefined>(undefined);

export const KitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [kits, setKits] = useState<Kit[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<FilterState>(defaultFilters);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [isHistorical, setIsHistorical] = useState<boolean>(false);
    const [processedData, setProcessedData] = useState(() => processKitData([], defaultFilters));

    const formatDateForApi = (date: Date): string => {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };

    const fetchKits = useCallback(async (date?: Date) => {
        setLoading(true);
        setError(null);
        try {
            let url = '/api/kits';
            if (date) {
                const dateString = formatDateForApi(date);
                url += `?date=${dateString}`;
                setIsHistorical(true);
                setSelectedDate(date);
            } else {
                setIsHistorical(false);
                setSelectedDate(new Date());
            }

            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch kits');
            const data = await response.json();
            setKits(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error occurred');
        } finally {
            setLoading(false);
        }
    }, []);

    // Update kit data
    const updateKit = useCallback(async (kitId: number, updatedValues: Partial<Kit>, username: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/kits/${kitId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    updatedValues,
                    username
                }),
            });

            if (!response.ok) {
                throw new Error(`Failed to update kit ${kitId}: ${response.statusText}`);
            }

            const updatedKit = await response.json();

            // Update the kits array with the updated kit
            setKits(prev => prev.map(kit => kit.id === kitId ? updatedKit : kit));

            return;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error occurred');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Function to refresh data
    const refreshData = async () => {
        fetchKits();
        setProcessedData(processKitData(kits, filters));
    };

    const resetFilters = useCallback(() => {
        setFilters(defaultFilters);
    }, []);

    // Fetch kits on initial load
    useEffect(() => {
        fetchKits();
    }, [fetchKits]);

    // Process data whenever kits or filters change
    useEffect(() => {
        setProcessedData(processKitData(kits, filters));
    }, [kits, filters]);

    const value = {
        kits,
        loading,
        error,
        filters,
        isHistorical,
        selectedDate,
        processedData,
        setFilters,
        fetchKits,
        updateKit,
        resetFilters,
        refreshData
    };

    return <KitContext.Provider value={value}>{children}</KitContext.Provider>;
};

export const useKitContext = () => {
    const context = useContext(KitContext);
    if (context === undefined) {
        throw new Error('useKitContext must be used within a KitProvider');
    }
    return context;
};