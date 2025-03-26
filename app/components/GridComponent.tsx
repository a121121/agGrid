// 📄 components/GridComponent.tsx
import React, { useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-theme-alpine.css";
import { HistoryButtonRenderer } from './grid/HistoryButtonRenderer';
import { SaveChangesButton } from './SaveChangesButton';
import { HistoryDrawer } from './HistoryDrawer';
import { useChangeTracking } from '../hooks/useChangeTracking';
import { getColumnDefs } from './grid/columnDefs';
import { INITIAL_CAR_DATA } from './constants/carData';
import { registerAgGridModules } from '../utils/agGridModules';

// Register modules once
registerAgGridModules();

const GridComponent = () => {
    const {
        rowData,
        localChanges,
        changeLog,
        onCellValueChanged,
        saveChanges,
    } = useChangeTracking(INITIAL_CAR_DATA);

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedRowId, setSelectedRowId] = useState<number | null>(null);

    const columnDefs = getColumnDefs((props: any) => (
        <HistoryButtonRenderer
            {...props}
            setSelectedRowId={setSelectedRowId}
            setIsDrawerOpen={setIsDrawerOpen}
        />
    ));

    return (
        <div className="container mx-auto mt-10 space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">Car Inventory</h2>
                <SaveChangesButton
                    localChanges={localChanges}
                    saveChanges={saveChanges}
                />
            </div>

            <div className="ag-theme-alpine w-full h-[500px]">
                <AgGridReact
                    rowData={rowData}
                    columnDefs={columnDefs}
                    onCellValueChanged={onCellValueChanged}
                    defaultColDef={{
                        editable: true,
                        suppressMovable: true
                    }}
                    getRowId={(params) => params.data.id.toString()}
                />
            </div>

            <HistoryDrawer
                isOpen={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
                selectedRowId={selectedRowId}
                rowData={rowData}
                changeLog={changeLog}
            />
        </div>
    );
};

export default GridComponent;