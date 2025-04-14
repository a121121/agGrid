// components/grid/GridComponent.tsx
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-theme-alpine.css";
import "ag-grid-community/styles/ag-theme-balham.css";
import "ag-grid-community/styles/ag-theme-material.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { HistoryButtonRenderer } from './HistoryButtonRenderer';
import { SaveChangesButton } from './SaveChangesButton';
import { HistoryDrawer } from './HistoryDrawer';
import { useChangeTracking } from '@/hooks/useChangeTracking';
import { registerAgGridModules } from '@/utils/agGridModules';
import { Button } from '@/components/ui/button';
import { Kit, AuditRecord } from '@/types/kit';
import { getKitColumnDefs } from './gridColumnDefs';
import { useKitContext } from '@/context/kitContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SlidersHorizontal, Plus } from 'lucide-react';
import AddKitModal from './AddKitModal';

// Register modules once
registerAgGridModules();

interface GridComponentProps {
    readOnly?: boolean;
}

interface ColumnVisibility {
    [key: string]: boolean;
}

const GridComponent: React.FC<GridComponentProps> = ({
    readOnly = false
}) => {
    const { processedData, refreshData } = useKitContext();
    const kitData = processedData.filteredData;

    const {
        rowData,
        localChanges,
        isLoading,
        onCellValueChanged,
        saveChanges,
        getChangeHistory
    } = useChangeTracking<Kit>();

    const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
    const [isAddKitModalOpen, setIsAddKitModalOpen] = useState(false);
    const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
    const gridRef = useRef<AgGridReact<Kit>>(null);
    const [auditRecords, setAuditRecords] = useState<AuditRecord[] | null>(null);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);
    const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({
        partNumber: true,
        noun: true,
        kitName: true,
        manufacturer: true,
        stateStatus: true,
        currentStatus: true,
        remarks: true,
        form48number: true,
        dieRequired: true,
        dieNumber: true,
        shopName: true,
        userName: true,
        createdAt: true,
        version: true,
    });

    useEffect(() => {
        if (selectedRowId !== null) {
            const fetchHistory = async () => {
                setIsHistoryLoading(true);
                try {
                    const history = await getChangeHistory(selectedRowId);
                    setAuditRecords(history);
                } catch (error) {
                    console.error("Error fetching history:", error);
                } finally {
                    setIsHistoryLoading(false);
                }
            };
            fetchHistory();
        } else {
            setAuditRecords(null);
        }
    }, [selectedRowId, getChangeHistory]);

    const handleVisibilityChange = (column: string, visible: boolean) => {
        setColumnVisibility(prev => ({
            ...prev,
            [column]: visible,
        }));
    };

    const handleKitAdded = (newKit: Kit) => {
        // Refresh data from context after a kit is added
        refreshData();
    };

    // Filter column definitions based on visibility
    const filteredColumnDefs = useMemo(() => {
        const allColumns = getKitColumnDefs((props: any) => (
            <HistoryButtonRenderer
                {...props}
                setSelectedRowId={setSelectedRowId}
                setIsDrawerOpen={setIsHistoryDrawerOpen}
            />
        ), !readOnly, !readOnly);

        return allColumns.filter(col => col.field ? columnVisibility[col.field] : true);
    }, [readOnly, columnVisibility]);

    // Update the grid when column visibility changes
    useEffect(() => {
        if (gridRef.current && gridRef.current.api) {
            // Correct way to set column definitions
            gridRef.current.api.setGridOption('columnDefs', filteredColumnDefs);
        }
    }, [filteredColumnDefs]);

    const handleExport = () => {
        if (gridRef.current && gridRef.current.api) {
            gridRef.current.api.exportDataAsCsv({
                fileName: 'kit-data-export.csv',
            });
        }
    };

    return (
        <div className="container mx-auto space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">Kit Data Grid</h2>
                <div className="flex space-x-2">
                    {!readOnly && (
                        <Button
                            onClick={() => setIsAddKitModalOpen(true)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Kit
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        onClick={handleExport}
                    >
                        Export to CSV
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="ml-2">
                                <SlidersHorizontal className="mr-2 h-4 w-4" />
                                Columns
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {Object.keys(columnVisibility).map((column) => (
                                <DropdownMenuCheckboxItem
                                    key={column}
                                    checked={columnVisibility[column]}
                                    onCheckedChange={(checked) => handleVisibilityChange(column, checked)}
                                >
                                    {column}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    {!readOnly && (
                        <SaveChangesButton<Kit>
                            localChanges={localChanges}
                            saveChanges={saveChanges}
                        />
                    )}
                </div>
            </div>

            <div className="ag-theme-alpine w-full h-[550px]">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                ) : (
                    <AgGridReact<Kit>
                        ref={gridRef}
                        rowData={kitData}
                        columnDefs={filteredColumnDefs}
                        onCellValueChanged={readOnly ? undefined : onCellValueChanged}
                        defaultColDef={{
                            editable: !readOnly,
                            suppressMovable: true,
                            resizable: true,
                            minWidth: 200,
                        }}
                        getRowId={(params) => params.data.id.toString()}
                        suppressHorizontalScroll={false}
                        alwaysShowHorizontalScroll={true}
                        pagination={true}
                        paginationPageSize={10}
                        paginationPageSizeSelector={[10, 30, 50]}
                        suppressExcelExport={true}
                    />
                )}
            </div>

            {/* History Drawer */}
            <HistoryDrawer
                isOpen={isHistoryDrawerOpen}
                onOpenChange={setIsHistoryDrawerOpen}
                selectedRowId={selectedRowId}
                rowData={rowData}
                auditRecords={auditRecords}
                isLoading={isHistoryLoading}
            />

            {/* Add Kit Modal */}
            <AddKitModal
                isOpen={isAddKitModalOpen}
                onClose={() => setIsAddKitModalOpen(false)}
                onKitAdded={handleKitAdded}
            />
        </div>
    );
};

export default GridComponent;