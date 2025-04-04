// components/KitChangesComparison.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, ArrowRightLeft, AlertCircle, CheckCircle2, Clock, Hammer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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

// Define the possible status values from the Kit type
type StateStatus =
    | 'Form 17 Pending'
    | 'Under Indegenization'
    | 'Part Under TF'
    | 'Die Under TF'
    | 'Part Trial Testing'
    | 'MCL'
    | 'Under Sourcing'
    | 'Sourcing Completed'
    | 'Beyond Capability';

const KitChangesComparison: React.FC = () => {
    const [startDate, setStartDate] = useState<Date>(new Date());
    const [endDate, setEndDate] = useState<Date>(new Date());
    const [changes, setChanges] = useState<ChangeRecord[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const tickerRef = useRef<HTMLDivElement>(null);

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

    // Filter for status changes only
    const getStatusChanges = (kitChanges: ChangeRecord[]) => {
        return kitChanges.filter(change => change.field === 'stateStatus');
    };

    // Filter for non-status changes
    const getNonStatusChanges = (kitChanges: ChangeRecord[]) => {
        return kitChanges.filter(change => change.field !== 'stateStatus');
    };

    // Ticker effect for non-status changes
    useEffect(() => {
        const ticker = tickerRef.current;
        if (!ticker) return;

        let animationFrame: number;
        let position = 0;

        const animate = () => {
            position -= 1;
            if (position <= -ticker.scrollWidth / 2) {
                position = 0;
            }
            ticker.style.transform = `translateX(${position}px)`;
            animationFrame = requestAnimationFrame(animate);
        };

        animationFrame = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animationFrame);
        };
    }, [changes]);

    // Status icon and color mapping
    const getStatusInfo = (status: string) => {
        const statusMap: Record<string, { color: string; icon: React.ReactNode; phase: string }> = {
            'Form 17 Pending': {
                color: 'bg-yellow-500',
                icon: <Clock className="h-4 w-4" />,
                phase: 'Initial'
            },
            'Under Indegenization': {
                color: 'bg-blue-500',
                icon: <Hammer className="h-4 w-4" />,
                phase: 'Development'
            },
            'Part Under TF': {
                color: 'bg-blue-600',
                icon: <Hammer className="h-4 w-4" />,
                phase: 'Development'
            },
            'Die Under TF': {
                color: 'bg-purple-500',
                icon: <Hammer className="h-4 w-4" />,
                phase: 'Development'
            },
            'Part Trial Testing': {
                color: 'bg-indigo-500',
                icon: <AlertCircle className="h-4 w-4" />,
                phase: 'Testing'
            },
            'MCL': {
                color: 'bg-green-500',
                icon: <CheckCircle2 className="h-4 w-4" />,
                phase: 'Production'
            },
            'Under Sourcing': {
                color: 'bg-orange-500',
                icon: <Clock className="h-4 w-4" />,
                phase: 'Sourcing'
            },
            'Sourcing Completed': {
                color: 'bg-green-600',
                icon: <CheckCircle2 className="h-4 w-4" />,
                phase: 'Sourcing'
            },
            'Beyond Capability': {
                color: 'bg-red-500',
                icon: <AlertCircle className="h-4 w-4" />,
                phase: 'Blocked'
            }
        };

        return statusMap[status] || { color: 'bg-gray-300', icon: <Clock className="h-4 w-4" />, phase: 'Unknown' };
    };

    // Get abbreviated status for graph display
    const getShortStatus = (status: string) => {
        const statusMap: Record<string, string> = {
            'Form 17 Pending': 'F17',
            'Under Indegenization': 'UIG',
            'Part Under TF': 'PTF',
            'Die Under TF': 'DTF',
            'Part Trial Testing': 'PTT',
            'MCL': 'MCL',
            'Under Sourcing': 'USR',
            'Sourcing Completed': 'SRC',
            'Beyond Capability': 'BYC'
        };

        return statusMap[status] || status.substring(0, 3).toUpperCase();
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Kit State Changes</CardTitle>
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

                    {/* News ticker for non-status changes */}
                    {!loading && changes.filter(c => c.field !== 'stateStatus').length > 0 && (
                        <div className="mb-6 bg-gray-50 p-2 rounded-md overflow-hidden">
                            <div className="text-sm font-medium mb-1">Other Changes:</div>
                            <div className="relative overflow-hidden h-6">
                                <div ref={tickerRef} className="whitespace-nowrap inline-block">
                                    {changes.filter(c => c.field !== 'stateStatus').map((change, idx) => (
                                        <span key={idx} className="mr-8 inline-flex items-center">
                                            <span className="font-medium">{change.kitName}</span>: {change.field} changed from{' '}
                                            <span className="text-red-600 mx-1">{formatValue(change.oldValue)}</span> to{' '}
                                            <span className="text-green-600 mx-1">{formatValue(change.newValue)}</span> by {change.username}
                                            <span className="text-gray-500 ml-1">({format(new Date(change.changedAt), 'MMM d')})</span>
                                        </span>
                                    ))}
                                    {/* Duplicate for smooth scrolling */}
                                    {changes.filter(c => c.field !== 'stateStatus').map((change, idx) => (
                                        <span key={`dup-${idx}`} className="mr-8 inline-flex items-center">
                                            <span className="font-medium">{change.kitName}</span>: {change.field} changed from{' '}
                                            <span className="text-red-600 mx-1">{formatValue(change.oldValue)}</span> to{' '}
                                            <span className="text-green-600 mx-1">{formatValue(change.newValue)}</span> by {change.username}
                                            <span className="text-gray-500 ml-1">({format(new Date(change.changedAt), 'MMM d')})</span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Status changes visualization */}
                    {!loading && changes.length > 0 && (
                        <div className="space-y-6">
                            <div className="text-sm text-gray-500 mb-2">
                                Showing state changes across {Object.keys(groupedChanges).length} kits
                            </div>

                            {/* Legend */}
                            <div className="bg-gray-50 p-3 rounded-md mb-4">
                                <div className="text-sm font-medium mb-2">Status Legend:</div>
                                <div className="flex flex-wrap gap-3">
                                    {['Form 17 Pending', 'Under Indegenization', 'Part Under TF', 'Die Under TF', 'Part Trial Testing', 'MCL', 'Under Sourcing', 'Sourcing Completed', 'Beyond Capability'].map((status) => {
                                        const statusInfo = getStatusInfo(status);
                                        return (
                                            <div key={status} className="flex items-center">
                                                <div className={`w-4 h-4 rounded-full ${statusInfo.color} mr-1 flex items-center justify-center text-white text-xs`}>
                                                    {statusInfo.icon}
                                                </div>
                                                <span className="text-xs">{getShortStatus(status)} - {status}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Kit state change cards */}
                            {Object.values(groupedChanges).map((group) => {
                                const statusChanges = getStatusChanges(group.changes);
                                if (statusChanges.length === 0) return null;

                                // Sort status changes chronologically
                                statusChanges.sort((a, b) => new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime());

                                return (
                                    <Card key={group.kitId} className="overflow-hidden">
                                        <CardHeader className="bg-gray-50 py-3">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <h3 className="text-lg font-medium">{group.kitName}</h3>
                                                    <p className="text-sm text-gray-500">Part #: {group.partNumber}</p>
                                                </div>
                                                <Badge>{statusChanges.length} state changes</Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-4">
                                            {/* Process flow timeline */}
                                            <div className="mb-6 overflow-x-auto">
                                                <div className="min-w-min">
                                                    <div className="relative pt-8 pb-4">
                                                        <div className="absolute left-0 right-0 h-1 bg-gray-200 top-12"></div>

                                                        <div className="flex">
                                                            {statusChanges.map((change, idx) => {
                                                                const oldStatusInfo = getStatusInfo(change.oldValue);
                                                                const newStatusInfo = getStatusInfo(change.newValue);

                                                                return (
                                                                    <div key={idx} className={`flex flex-col items-center ${idx === 0 ? '' : 'ml-16'}`}>
                                                                        <div className="mb-1 text-xs text-gray-500 whitespace-nowrap">
                                                                            {format(new Date(change.changedAt), 'MMM d, yyyy')}
                                                                        </div>

                                                                        <TooltipProvider>
                                                                            <Tooltip>
                                                                                <TooltipTrigger asChild>
                                                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${newStatusInfo.color}`}>
                                                                                        {newStatusInfo.icon}
                                                                                        <span className="ml-1 text-xs font-bold">{getShortStatus(change.newValue)}</span>
                                                                                    </div>
                                                                                </TooltipTrigger>
                                                                                <TooltipContent>
                                                                                    <p>{change.newValue}</p>
                                                                                    <p className="text-xs text-gray-400">Phase: {newStatusInfo.phase}</p>
                                                                                </TooltipContent>
                                                                            </Tooltip>
                                                                        </TooltipProvider>

                                                                        <div className="mt-1 text-xs text-gray-600">
                                                                            by {change.username}
                                                                        </div>

                                                                        {/* Status transition arrow */}
                                                                        {idx < statusChanges.length - 1 && (
                                                                            <div className="absolute h-0.5 bg-gray-300 w-14 left-12 top-12"></div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Phase progression chart */}
                                            <div className="mt-8">
                                                <h4 className="text-sm font-medium mb-3">Status Progression</h4>
                                                <div className="relative h-10 bg-gray-100 rounded-md overflow-hidden mb-2">
                                                    {statusChanges.map((change, idx) => {
                                                        const phaseColors = {
                                                            'Initial': 'bg-yellow-200',
                                                            'Development': 'bg-blue-200',
                                                            'Testing': 'bg-indigo-200',
                                                            'Production': 'bg-green-200',
                                                            'Sourcing': 'bg-orange-200',
                                                            'Blocked': 'bg-red-200',
                                                            'Unknown': 'bg-gray-200'
                                                        };

                                                        const newPhase = getStatusInfo(change.newValue).phase;
                                                        const width = `${100 / statusChanges.length}%`;

                                                        return (
                                                            <div
                                                                key={idx}
                                                                className={`absolute h-full ${phaseColors[newPhase as keyof typeof phaseColors]}`}
                                                                style={{
                                                                    left: `${(idx / statusChanges.length) * 100}%`,
                                                                    width: width
                                                                }}
                                                            >
                                                                <div className={`h-2 ${getStatusInfo(change.newValue).color}`} />
                                                                <div className="flex justify-center items-center h-8 text-xs font-medium">
                                                                    {newPhase}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {/* Timeline dates */}
                                                <div className="flex justify-between text-xs text-gray-500">
                                                    <span>{statusChanges.length > 0 ? format(new Date(statusChanges[0].changedAt), 'MMM d, yyyy') : ''}</span>
                                                    <span>{statusChanges.length > 0 ? format(new Date(statusChanges[statusChanges.length - 1].changedAt), 'MMM d, yyyy') : ''}</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default KitChangesComparison;