// 📄 components/GridComponent.tsx
import React, { useState, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-theme-alpine.css";
import "ag-grid-community/styles/ag-theme-balham.css";
import "ag-grid-community/styles/ag-theme-material.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { HistoryButtonRenderer } from './grid/HistoryButtonRenderer';
import { SaveChangesButton } from './SaveChangesButton';
import { HistoryDrawer } from './HistoryDrawer';
import { CalendarDrawer } from './CalendarDrawer';
import { useChangeTracking } from '../hooks/useChangeTracking';
import { INITIAL_KIT_DATA } from './constants/kitData';
import { registerAgGridModules } from '../utils/agGridModules';
import { Button } from '@/components/ui/button';
import { Kit } from '../types/kit';
import { getKitColumnDefs } from './grid/kitColumnDefs';

// Register modules once (make sure CsvExportModule is included)
registerAgGridModules();

const GridComponent = () => {
    const {
        rowData,
        localChanges,
        changeLog,
        onCellValueChanged,
        saveChanges,
        getDataForDate,
    } = useChangeTracking<Kit>(INITIAL_KIT_DATA);

    const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
    const [isCalendarDrawerOpen, setIsCalendarDrawerOpen] = useState(false);
    const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
    const gridRef = useRef<AgGridReact>(null);

    const columnDefs = getKitColumnDefs((props: any) => (
        <HistoryButtonRenderer
            {...props}
            setSelectedRowId={setSelectedRowId}
            setIsDrawerOpen={setIsHistoryDrawerOpen}
        />
    ));

    const handleExport = () => {
        if (gridRef.current) {
            gridRef.current.api.exportDataAsCsv({
                fileName: 'kit-data-export.csv',
                // You can add additional export options here if needed
                // processCellCallback: (params) => { /* format cells */ },
                // columnKeys: ['specific', 'columns'], // export only specific columns
            });
        }
    };

    return (
        <div className="container mx-auto mt-10 space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">Kit Management</h2>
                <div className="flex space-x-2">
                    <Button
                        variant="outline"
                        onClick={() => setIsCalendarDrawerOpen(true)}
                    >
                        View History by Date
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleExport}
                    >
                        Export to CSV
                    </Button>
                    <SaveChangesButton<Kit>
                        localChanges={localChanges}
                        saveChanges={saveChanges}
                    />
                </div>
            </div>

            <div className="ag-theme-alpine w-full h-[500px]">
                <AgGridReact
                    ref={gridRef}
                    rowData={rowData}
                    columnDefs={columnDefs}
                    onCellValueChanged={onCellValueChanged}
                    defaultColDef={{
                        editable: true,
                        suppressMovable: true,
                        resizable: true,
                        minWidth: 150,
                    }}
                    getRowId={(params) => params.data.id.toString()}
                    suppressHorizontalScroll={false}
                    alwaysShowHorizontalScroll={true}
                    pagination={true}
                    paginationPageSize={10}
                    paginationPageSizeSelector={[10, 25, 50]}
                    // Add CSV export configuration
                    suppressExcelExport={true} // Disable Excel export if you only want CSV
                />
            </div>

            <HistoryDrawer
                isOpen={isHistoryDrawerOpen}
                onOpenChange={setIsHistoryDrawerOpen}
                selectedRowId={selectedRowId}
                rowData={rowData}
                changeLog={changeLog}
            />

            <CalendarDrawer<Kit>
                isOpen={isCalendarDrawerOpen}
                onOpenChange={setIsCalendarDrawerOpen}
                getDataForDate={getDataForDate}
                getColumnDefs={getKitColumnDefs}
            />
        </div>
    );
};

export default GridComponent;