// 📄 components/CalendarDrawer.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-theme-alpine.css";
import { ColDef } from 'ag-grid-community';

interface CalendarDrawerProps<T extends { id: number }> {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    getDataForDate: (date: Date) => Promise<T[]>;
    getColumnDefs: (HistoryButtonRenderer: any, editable: boolean, showHistory: boolean) => ColDef<T>[];
}

export const CalendarDrawer = <T extends { id: number }>({
    isOpen,
    onOpenChange,
    getDataForDate,
    getColumnDefs
}: CalendarDrawerProps<T>): React.ReactElement => {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [historicalData, setHistoricalData] = useState<T[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const columnDefs = getColumnDefs(() => null, false, false); // No history button needed, non-editable

    const handleDateSelect = async (selectedDate: Date | undefined) => {
        if (!selectedDate) return;

        setDate(selectedDate);
        setLoading(true);

        try {
            const data = await getDataForDate(selectedDate);
            setHistoricalData(data);
        } catch (error) {
            console.error("Error fetching historical data:", error);
            setHistoricalData([]);
        } finally {
            setLoading(false);
        }
    };

    // Load initial data when drawer opens
    useEffect(() => {
        if (isOpen && date) {
            handleDateSelect(date);
        }
    }, [isOpen]);

    return (
        <Drawer open={isOpen} onOpenChange={onOpenChange}>
            <DrawerContent className="h-[90vh] ">
                <div className="container mx-auto w-[90%]">
                    <DrawerHeader>
                        <DrawerTitle>Historical View</DrawerTitle>
                        <DrawerDescription>
                            Select a date to view the data as it was at that time
                        </DrawerDescription>
                    </DrawerHeader>

                    <div className="p-4 pb-0 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-1">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={handleDateSelect}
                                className="rounded-md border flex items-center"
                            />
                            {date && (
                                <p className="mt-2 text-sm text-gray-500">
                                    Showing data as of {format(date, 'PPP')}
                                </p>
                            )}
                        </div>

                        <div className="md:col-span-3 ag-theme-alpine h-[350px]">
                            {loading ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                                </div>
                            ) : (
                                <AgGridReact
                                    rowData={historicalData}
                                    columnDefs={columnDefs}
                                    defaultColDef={{
                                        editable: false,
                                        suppressMovable: true,
                                        resizable: true,
                                        minWidth: 150,
                                    }}
                                    getRowId={(params) => params.data.id.toString()}
                                    suppressHorizontalScroll={false}
                                    alwaysShowHorizontalScroll={true}
                                />
                            )}
                        </div>
                    </div>

                    <DrawerFooter>
                        <DrawerClose asChild>
                            <Button variant="outline">Close</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
};