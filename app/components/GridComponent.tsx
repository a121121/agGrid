"use client";

import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-theme-quartz.css";
import { ClientSideRowModelModule } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import { ColDef } from 'ag-grid-community';
import { useState, useEffect } from 'react';

// Register the required modules
ModuleRegistry.registerModules([ClientSideRowModelModule]);

interface Car {
    make: string;
    model: string;
    price: number;
    electric: boolean;
}

const GridComponent = () => {
    const [rowData, setRowData] = useState<Car[]>([]);
    const [colDefs] = useState<ColDef<Car>[]>([
        {
            field: "make",
        },
        {
            field: "model",
        },
        {
            field: "price",
        },
        {
            field: "electric",
        }
    ]);

    // Load data on client side only to avoid hydration issues
    useEffect(() => {
        setRowData([
            { make: "Tesla", model: "Model Y", price: 64950, electric: true },
            { make: "Ford", model: "F-Series", price: 33850, electric: false },
            { make: "Toyota", model: "Corolla", price: 29600, electric: false },
        ]);
    }, []);

    return (
        <div className="ag-theme-quartz" style={{ width: '100%', height: '400px' }}>
            <AgGridReact
                rowData={rowData}
                columnDefs={colDefs}
                domLayout='autoHeight'
            />
        </div>
    );
};

export default GridComponent;