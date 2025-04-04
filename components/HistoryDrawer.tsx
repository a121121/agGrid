import React from 'react';
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerFooter,
    DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Kit, ChangeLog } from '@/types/kit';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User, ArrowRightLeft } from "lucide-react";

interface HistoryDrawerProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    selectedRowId: number | null;
    rowData: Kit[];
    changeLog: ChangeLog<Kit>[] | null;
    isLoading?: boolean;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
    isOpen,
    onOpenChange,
    selectedRowId,
    rowData,
    changeLog,
    isLoading = false
}) => {
    // Find selected row data
    const selectedRow = selectedRowId !== null
        ? rowData.find(row => row.id === selectedRowId)
        : null;

    return (
        <Drawer open={isOpen} onOpenChange={onOpenChange}>
            <DrawerContent className="max-h-[85vh]">
                <DrawerHeader className="border-b pb-4">
                    <div className="container mx-auto">
                        <DrawerTitle className="text-2xl">
                            {selectedRow && (
                                <div className="flex flex-wrap gap-3 items-center">
                                    <span>Change History:</span>
                                    <Badge variant="outline" className="bg-amber-100 hover:bg-amber-100 text-amber-800 border-amber-200 px-3 py-1">
                                        {selectedRow.partNumber}
                                    </Badge>
                                    <Badge variant="outline" className="bg-green-100 hover:bg-green-100 text-green-800 border-green-200 px-3 py-1">
                                        {selectedRow.noun}
                                    </Badge>
                                </div>
                            )}
                        </DrawerTitle>
                        <DrawerDescription className="mt-2 text-sm text-gray-500">
                            Track all modifications made to this item over time
                        </DrawerDescription>
                    </div>
                </DrawerHeader>

                <div className="overflow-y-auto container mx-auto px-4 py-6">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                            <p className="mt-4 text-gray-500">Loading change history...</p>
                        </div>
                    ) : changeLog && changeLog.length > 0 ? (
                        <div className="space-y-6">
                            {changeLog.map((log, index) => (
                                <Card key={index} className="overflow-hidden border border-gray-200 shadow-sm py-0 gap-0">
                                    <div className="bg-gray-50 px-4 py-2 border-b">
                                        <div className="flex flex-col sm:flex-row justify-between">
                                            <div className="flex items-center gap-2">
                                                <Badge className="bg-blue-100 text-blue-800 border-blue-200">v{log.version}</Badge>
                                                <div className="flex items-center text-gray-500 text-sm">
                                                    <Clock className="h-4 w-4 mr-1" />
                                                    {new Date(log.changedAt).toLocaleString()}
                                                </div>
                                            </div>
                                            <div className="flex items-center mt-2 sm:mt-0 text-sm text-gray-500">
                                                <User className="h-4 w-4 mr-1" />
                                                <span>{log.changedBy}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <div className="grid grid-cols-1 md:grid-cols-3 font-medium text-sm text-gray-600 mb-2 bg-gray-50 rounded">
                                            <div className="px-4 py-0">Field</div>
                                            <div className="px-4 py-0">Previous Value</div>
                                            <div className="px-4 py-0">New Value</div>
                                        </div>

                                        {log.changes.map((change, idx) => (
                                            <div
                                                key={idx}
                                                className={`hover:bg-blue-300/30 cursor-pointer grid grid-cols-1 md:grid-cols-3 text-sm border-t ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                                            >
                                                <div className="px-4 py-1 font-medium">{String(change.field)}</div>
                                                <div className="px-4 py-1 text-red-600">{String(change.oldValue)}</div>
                                                <div className="px-4 py-1 text-green-600">{String(change.newValue)}</div>
                                            </div>
                                        ))}

                                        {log.changes.length === 0 && (
                                            <div className="text-center py-4 text-gray-500">
                                                No changes recorded in this version
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                            <ArrowRightLeft className="h-12 w-12 mb-4 text-gray-300" />
                            <p className="text-lg font-medium">No change history available</p>
                            <p className="mt-2">No modifications have been recorded for this item</p>
                        </div>
                    )}
                </div>

                <DrawerFooter className="border-t">
                    <div className="container mx-auto flex justify-end">
                        <DrawerClose asChild>
                            <Button variant="outline">Close</Button>
                        </DrawerClose>
                    </div>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
};