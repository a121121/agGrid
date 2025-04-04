// components/KitChangesComparison.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { DatePickerWithPresets } from '@/components/ui/date-picker-with-presets';
import { CalendarIcon, ArrowRightLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Kit } from '@/types/kit';

interface ChangeRecord {
    id: number;
    kitId: number;
    kitName: string;
    partNumber: string;
    field: string;
    oldValue: string;
    newValue: string;
    changedAt: string;
    username: string;
}

const KitChangesComparison: React.FC = () => {
    const [startDate, setStartDate] = useState<Date>(new Date());
    const [endDate, setEndDate] = useState<Date>(new Date());
    const [changes, setChanges] = useState<ChangeRecord[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchChanges = async () => {
        setLoading(true);
        setError(null);

        try {
            const startDateStr = startDate.toISOString().split('T')[0];
            const endDateStr = endDate.toISOString().split('T')[0];

            const response = await fetch(`/api/kit-changes?start=${startDateStr}&end=${endDateStr}`);

            if (!response.ok) {
                throw new Error(`Failed to fetch changes: ${response.statusText}`);
            }

            const data = await response.json();
            setChanges(data);
        } catch (err) {
            console.error('Error fetching changes:', err);
            setError(err instanceof Error ? err.message : 'Unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (startDate && endDate) {
            fetchChanges();
        }
    }, [startDate, endDate]);

    // Helper to format value display
    const formatValue = (value: string) => {
        if (!value) return 'Empty';
        if (value === 'true') return 'Yes';
        if (value === 'false') return 'No';
        return value;
    };

    // Group changes by kit
    const groupedChanges = changes.reduce((acc, change) => {
        if (!acc[change.kitId]) {
            acc[change.kitId] = {
                kitId: change.kitId,
                kitName: change.kitName,
                partNumber: change.partNumber,
                changes: []
            };
        }
        acc[change.kitId].changes.push(change);
        return acc;
    }, {} as Record<string, { kitId: number; kitName: string; partNumber: string; changes: ChangeRecord[] }>);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Compare Kit Changes</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-2">From Date</label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start text-left font-normal"
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {format(startDate, 'PPP')}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={startDate}
                                        onSelect={(date) => date && setStartDate(date)}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="flex items-center justify-center">
                            <ArrowRightLeft className="h-6 w-6 text-gray-400" />
                        </div>

                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-2">To Date</label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start text-left font-normal"
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {format(endDate, 'PPP')}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={endDate}
                                        onSelect={(date) => date && setEndDate(date)}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="flex items-end">
                            <Button onClick={fetchChanges}>Compare</Button>
                        </div>
                    </div>

                    {/* Loading state */}
                    {loading && (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        </div>
                    )}

                    {/* Error message */}
                    {error && (
                        <div className="bg-red-50 p-4 rounded-md mb-4">
                            <div className="text-red-600">Error: {error}</div>
                        </div>
                    )}

                    {/* Results */}
                    {!loading && changes.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            No changes found between selected dates
                        </div>
                    )}

                    {!loading && changes.length > 0 && (
                        <div className="space-y-6">
                            <div className="text-sm text-gray-500 mb-2">
                                Showing {changes.length} changes across {Object.keys(groupedChanges).length} kits
                            </div>

                            {Object.values(groupedChanges).map((group) => (
                                <Card key={group.kitId} className="overflow-hidden">
                                    <CardHeader className="bg-gray-50 py-3">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="text-lg font-medium">{group.kitName}</h3>
                                                <p className="text-sm text-gray-500">Part #: {group.partNumber}</p>
                                            </div>
                                            <Badge>{group.changes.length} changes</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Field</TableHead>
                                                    <TableHead>Old Value</TableHead>
                                                    <TableHead>New Value</TableHead>
                                                    <TableHead>Changed By</TableHead>
                                                    <TableHead>Date</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {group.changes.map((change, idx) => (
                                                    <TableRow key={idx}>
                                                        <TableCell className="font-medium">{change.field}</TableCell>
                                                        <TableCell className="text-red-600">{formatValue(change.oldValue)}</TableCell>
                                                        <TableCell className="text-green-600">{formatValue(change.newValue)}</TableCell>
                                                        <TableCell>{change.username}</TableCell>
                                                        <TableCell>{format(new Date(change.changedAt), 'PPp')}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default KitChangesComparison;