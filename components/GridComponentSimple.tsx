import React, { useState, useRef, useEffect, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-theme-alpine.css";
import "ag-grid-community/styles/ag-theme-balham.css";
import "ag-grid-community/styles/ag-theme-material.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { HistoryButtonRenderer } from './grid/HistoryButtonRenderer';
import { SaveChangesButton } from './SaveChangesButton';
import { HistoryDrawer } from './HistoryDrawer';
import { useChangeTracking } from '../hooks/useChangeTracking';
import { registerAgGridModules } from '@/lib/agGridModules';
import { Button } from '@/components/ui/button';
import { Kit, ChangeLog } from '@/types/kit';
import { getKitColumnDefs } from './grid/kitColumnDefs';
// Register modules once
registerAgGridModules();


interface GridComponentProps {
    rowData?: Kit[];
    readOnly?: boolean;
}

const GridComponent: React.FC<GridComponentProps> = ({
    rowData: initialRowData,
    readOnly = false
}) => {
    const testData = initialRowData || [];

    const {
        rowData,
        localChanges,
        isLoading,
        onCellValueChanged,
        saveChanges,
        getChangeHistory
    } = useChangeTracking<Kit>(testData);

    const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
    const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
    const gridRef = useRef<AgGridReact>(null);
    const [historyData, setHistoryData] = useState<ChangeLog<Kit>[] | null>(null);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);

    useEffect(() => {
        if (selectedRowId !== null) {
            const fetchHistory = async () => {
                setIsHistoryLoading(true);
                try {
                    const history = await getChangeHistory(selectedRowId);
                    setHistoryData(history);
                } catch (error) {
                    console.error("Error fetching history:", error);
                } finally {
                    setIsHistoryLoading(false);
                }
            };
            fetchHistory();
        } else {
            setHistoryData(null);
        }
    }, [selectedRowId, getChangeHistory]);


    // Memoize column definitions to prevent unnecessary re-renders
    const columnDefs = useMemo(() => getKitColumnDefs((props: any) => (
        <HistoryButtonRenderer
            {...props}
            setSelectedRowId={setSelectedRowId}
            setIsDrawerOpen={setIsHistoryDrawerOpen}
        />
    ), !readOnly, !readOnly), [readOnly]);
    // first is for editable and second is for history button


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
                    <Button
                        variant="outline"
                        onClick={handleExport}
                    >
                        Export to CSV
                    </Button>
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
                    <AgGridReact
                        ref={gridRef}
                        rowData={rowData}
                        columnDefs={columnDefs}
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
            <HistoryDrawer
                isOpen={isHistoryDrawerOpen}
                onOpenChange={setIsHistoryDrawerOpen}
                selectedRowId={selectedRowId}
                rowData={rowData}
                changeLog={historyData}
                isLoading={isHistoryLoading}
            />


        </div>
    );
};

export default GridComponent;