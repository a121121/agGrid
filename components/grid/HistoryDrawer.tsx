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
import { Kit, AuditRecord } from '@/types/kit';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User, ArrowRightLeft } from "lucide-react";

interface HistoryDrawerProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    selectedRowId: number | null;
    rowData: Kit[];
    auditRecords: AuditRecord[] | null;
    isLoading?: boolean;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
    isOpen,
    onOpenChange,
    selectedRowId,
    rowData,
    auditRecords,
    isLoading = false
}) => {
    // Find selected row data
    const selectedRow = selectedRowId !== null
        ? rowData.find(row => row.id === selectedRowId)
        : null;

    // Group audit records by version
    const groupedRecords = React.useMemo(() => {
        if (!auditRecords) return [];

        const groupedByVersion: { [key: number]: AuditRecord[] } = {};
        auditRecords.forEach(record => {
            if (!groupedByVersion[record.version]) {
                groupedByVersion[record.version] = [];
            }
            groupedByVersion[record.version].push(record);
        });

        // Sort by version in descending order (newest first)
        return Object.entries(groupedByVersion)
            .map(([version, records]) => ({
                version: parseInt(version),
                records,
                // Use the first record's data for common fields
                changedAt: records[0].changedAt,
                changedBy: records[0].userName
            }))
            .sort((a, b) => b.version - a.version);
    }, [auditRecords]);

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
                    ) : groupedRecords.length > 0 ? (
                        <div className="space-y-6">
                            {groupedRecords.map((versionGroup, index) => (
                                <Card key={index} className="overflow-hidden border border-gray-200 shadow-sm py-0 gap-0">
                                    <div className="bg-gray-50 px-4 py-2 border-b">
                                        <div className="flex flex-col sm:flex-row justify-between">
                                            <div className="flex items-center gap-2">
                                                <Badge className="bg-blue-100 text-blue-800 border-blue-200">v{versionGroup.version}</Badge>
                                                <div className="flex items-center text-gray-500 text-sm">
                                                    <Clock className="h-4 w-4 mr-1" />
                                                    {new Date(versionGroup.changedAt).toLocaleString()}
                                                </div>
                                            </div>
                                            <div className="flex items-center mt-2 sm:mt-0 text-sm text-gray-500">
                                                <User className="h-4 w-4 mr-1" />
                                                <span>{versionGroup.changedBy}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <div className="grid grid-cols-1 md:grid-cols-3 font-medium text-sm text-gray-600 mb-2 bg-gray-50 rounded">
                                            <div className="px-4 py-0">Field</div>
                                            <div className="px-4 py-0">Previous Value</div>
                                            <div className="px-4 py-0">New Value</div>
                                        </div>

                                        {versionGroup.records.map((record, idx) => {
                                            // Try to parse oldValue and newValue if they're JSON strings
                                            let oldValue = record.oldValue;
                                            let newValue = record.newValue;

                                            try {
                                                // Check if values are quoted strings (JSON encoded strings)
                                                if (record.oldValue.startsWith('"') && record.oldValue.endsWith('"')) {
                                                    oldValue = JSON.parse(record.oldValue);
                                                }
                                                if (record.newValue.startsWith('"') && record.newValue.endsWith('"')) {
                                                    newValue = JSON.parse(record.newValue);
                                                }
                                            } catch (e) {
                                                // Keep original values if parsing fails
                                            }

                                            return (
                                                <div
                                                    key={idx}
                                                    className={`hover:bg-blue-300/30 cursor-pointer grid grid-cols-1 md:grid-cols-3 text-sm border-t ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                                                >
                                                    <div className="px-4 py-1 font-medium">{String(record.field)}</div>
                                                    <div className="px-4 py-1 text-red-600">{String(oldValue)}</div>
                                                    <div className="px-4 py-1 text-green-600">{String(newValue)}</div>
                                                </div>
                                            );
                                        })}

                                        {versionGroup.records.length === 0 && (
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