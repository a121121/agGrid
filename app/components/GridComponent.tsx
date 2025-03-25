"use client";

import React, { useState, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    ColDef,
    SelectEditorModule,
    TextEditorModule,
    GridApi,
    GridReadyEvent
} from 'ag-grid-community';
import "ag-grid-community/styles/ag-theme-quartz.css";
import { Button } from '@/components/ui/button';
import { Save, History } from 'lucide-react';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer';

// Register modules
ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    SelectEditorModule,
    TextEditorModule
]);

// Interfaces for data and change tracking
interface Car {
    id: number;
    make: string;
    model: string;
    price: number;
    electric: boolean;
    version: number;
}

interface CarChangeLog {
    id: number;
    changes: {
        field: keyof Car;
        oldValue: any;
        newValue: any;
    }[];
    changedAt: Date;
    changedBy: string;
    version: number;
}

const GridComponent = () => {
    // Initial data with version tracking
    const [rowData, setRowData] = useState<Car[]>([
        { id: 1, make: "Tesla", model: "Model Y", price: 64950, electric: true, version: 1 },
        { id: 2, make: "Ford", model: "F-Series", price: 33850, electric: false, version: 1 },
        { id: 3, make: "Toyota", model: "Corolla", price: 29600, electric: false, version: 1 },
        { id: 4, make: "BMW", model: "S-100", price: 44600, electric: true, version: 1 },
    ]);

    // Tracking local changes before saving
    const [localChanges, setLocalChanges] = useState<{ [key: number]: { field: keyof Car, oldValue: any, newValue: any }[] }>({});

    // Change log tracking
    const [changeLog, setChangeLog] = useState<{ [key: number]: CarChangeLog[] }>({});

    // Drawer state
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedRowId, setSelectedRowId] = useState<number | null>(null);

    // Grid API
    const [gridApi, setGridApi] = useState<GridApi | null>(null);

    // Track cell value changes
    const onCellValueChanged = useCallback((event: any) => {
        const { data, column, oldValue, newValue } = event;

        if (oldValue !== newValue) {
            // Track local changes for the specific row
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

    // Save changes (now groups all local changes)
    const saveChanges = () => {
        // If no local changes, do nothing
        if (Object.keys(localChanges).length === 0) {
            alert('No changes to save!');
            return;
        }

        // Create a new version of rows data
        const updatedRowData = rowData.map(row => {
            // Check if this row has local changes
            const rowChanges = localChanges[row.id];
            if (rowChanges) {
                // Create a new change log entry
                const changeLogEntry: CarChangeLog = {
                    id: row.id,
                    changes: rowChanges,
                    changedAt: new Date(),
                    changedBy: 'current_user',
                    version: row.version + 1
                };

                // Update change log for this row
                setChangeLog(prev => ({
                    ...prev,
                    [row.id]: [...(prev[row.id] || []), changeLogEntry]
                }));

                // Return updated row with new version
                return { ...row, version: row.version + 1 };
            }
            return row;
        });

        // Update row data and clear local changes
        setRowData(updatedRowData);
        setLocalChanges({});

        alert('Changes saved successfully!');
    };

    // Open history drawer for a specific row
    const openHistoryDrawer = (rowId: number) => {
        setSelectedRowId(rowId);
        setIsDrawerOpen(true);
    };

    // History button renderer for the dedicated column
    const HistoryButtonRenderer = (props: any) => {
        return (
            <div className="flex items-center justify-center w-full">
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 relative"
                    onClick={() => openHistoryDrawer(props.data.id)}
                    title="View history"
                >
                    <History className="w-4 h-4" />
                    <span className="absolute -top-1 -right-1 text-xs bg-blue-500 text-white rounded-full h-4 w-4 flex items-center justify-center">
                        {props.data.version}
                    </span>
                </Button>
            </div>
        );
    };

    // Column definitions
    const [colDefs] = useState<ColDef<Car>[]>([
        {
            field: "make",
            headerName: "Company",
            flex: 1,
            editable: true,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: {
                values: ['Tesla', 'Ford', 'Toyota', 'BMW'],
            },
        },
        {
            field: "model",
            flex: 1,
            editable: true,
        },
        {
            field: "price",
            valueFormatter: p => '£' + p.value?.toLocaleString(),
            flex: 1,
            editable: true,
        },
        {
            field: "electric",
            flex: 1,
            editable: true,
            cellRenderer: (params: any) => params.value ? 'Yes' : 'No',
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: {
                values: [true, false],
            },
        },
        {
            headerName: "History",
            field: "id",
            flex: 0.5,
            sortable: false,
            filter: false,
            editable: false,
            cellRenderer: HistoryButtonRenderer,
            pinned: 'right',
            cellStyle: { display: 'flex', justifyContent: 'center' }
        }
    ]);

    // Render change log for drawer
    const renderChangeLog = () => {
        if (!selectedRowId) return null;

        const logs = changeLog[selectedRowId] || [];
        const row = rowData.find(r => r.id === selectedRowId);

        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Change History</h3>
                    <span className="text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded">
                        Current Version: {row?.version || 1}
                    </span>
                </div>

                {logs.length === 0 ? (
                    <p className="text-gray-500 text-sm">No changes made to this record</p>
                ) : (
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                        {logs
                            .sort((a, b) => b.version - a.version)
                            .map((log, index) => (
                                <div key={index} className="border-b border-gray-100 pb-2 last:border-0">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            {log.changes.map((change, changeIndex) => (
                                                <div key={changeIndex} className="flex items-center">
                                                    <span className="font-medium">{change.field}</span>
                                                    <span className="mx-2 text-gray-400">→</span>
                                                    <span>{String(change.newValue)}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                            v{log.version}
                                        </span>
                                    </div>
                                    <div className="flex justify-between mt-1 text-xs text-gray-500">
                                        <div>
                                            Previous Values:
                                            {log.changes.map((change, changeIndex) => (
                                                <span key={changeIndex} className="ml-2 font-mono">
                                                    {change.field}: {String(change.oldValue)}
                                                </span>
                                            ))}
                                        </div>
                                        <div>
                                            {log.changedAt.toLocaleString()} by {log.changedBy}
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="container mx-auto mt-10 space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">Car Inventory</h2>
                <div className="flex items-center space-x-4">
                    {Object.keys(localChanges).length > 0 && (
                        <span className="text-sm text-gray-600">
                            {Object.values(localChanges).reduce((total, changes) => total + changes.length, 0)} pending change{Object.values(localChanges).reduce((total, changes) => total + changes.length, 0) !== 1 ? 's' : ''}
                        </span>
                    )}
                    <Button
                        onClick={saveChanges}
                        variant={Object.keys(localChanges).length > 0 ? "default" : "outline"}
                        className="flex items-center gap-2"
                        disabled={Object.keys(localChanges).length === 0}
                    >
                        <Save className="w-4 h-4" />
                        Save Changes
                    </Button>
                </div>
            </div>

            <div className="ag-theme-quartz w-full h-[500px]">
                <AgGridReact
                    rowData={rowData}
                    columnDefs={colDefs}
                    onCellValueChanged={onCellValueChanged}
                    defaultColDef={{
                        editable: true,
                        suppressMovable: true
                    }}
                    getRowId={(params) => params.data.id.toString()}
                />
            </div>

            {/* History Drawer */}
            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <DrawerContent>
                    <div className="mx-auto w-full max-w-sm">
                        <DrawerHeader>
                            <DrawerTitle>Record History</DrawerTitle>
                            <DrawerDescription>
                                View all changes made to this record
                            </DrawerDescription>
                        </DrawerHeader>
                        <div className="p-4 pb-0">
                            {renderChangeLog()}
                        </div>
                        <DrawerFooter>
                            <DrawerClose asChild>
                                <Button variant="outline">Close</Button>
                            </DrawerClose>
                        </DrawerFooter>
                    </div>
                </DrawerContent>
            </Drawer>
        </div>
    );
};

export default GridComponent;