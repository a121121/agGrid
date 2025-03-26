// 📄 components/HistoryDrawer.tsx
import React from 'react';
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
import { Car, CarChangeLog } from '../types/car';

interface HistoryDrawerProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    selectedRowId: number | null;
    rowData: Car[];
    changeLog: { [key: number]: CarChangeLog[] };
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
    isOpen,
    onOpenChange,
    selectedRowId,
    rowData,
    changeLog
}) => {
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
        <Drawer open={isOpen} onOpenChange={onOpenChange}>
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
    );
};