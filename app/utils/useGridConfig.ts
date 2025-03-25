import { useState, useMemo } from 'react';
import {
    ColDef,
    ValueFormatterParams,
    ICellRendererParams,
    CellStyleFunc,
    CellClassParams
} from 'ag-grid-community';

// Create a type that ensures field is a valid keyof T
type GridColumn<T> = {
    [K in keyof T]: ColDef<T, T[K]> & { field: K }
}[keyof T];

export const createColumnDefinitions = <T extends object>(
    columns: Array<keyof T>
): GridColumn<T>[] => {
    return columns.map(column => {
        const baseConfig: GridColumn<T> = {
            field: column as keyof T,
            headerName: String(column).charAt(0).toUpperCase() + String(column).slice(1)
        } as GridColumn<T>;

        // Handle specific column formatting
        switch (column) {
            case 'price':
                return {
                    ...baseConfig,
                    valueFormatter: (params: ValueFormatterParams<T, number>) =>
                        `$${params.value?.toLocaleString() || '0'}`
                } as GridColumn<T>;
            case 'electric':
                return {
                    ...baseConfig,
                    cellRenderer: (params: ICellRendererParams<T, boolean>) =>
                        params.value ? '✓' : '✗',
                    cellStyle: ((params: CellClassParams<T, boolean>) => {
                        return params.value
                            ? { color: 'green', fontWeight: 'bold' }
                            : { color: 'red', fontWeight: 'bold' };
                    }) as CellStyleFunc<T, boolean>
                } as GridColumn<T>;
            default:
                return baseConfig;
        }
    });
};

// Custom hook to manage grid configuration
export const useGridConfig = <T extends object>(
    data: T[],
    columns: Array<keyof T>
) => {
    // Memoize column definitions to prevent unnecessary re-renders
    const columnDefs = useMemo(() =>
        createColumnDefinitions<T>(columns),
        [columns]
    );

    return {
        rowData: data,
        columnDefs
    };
};