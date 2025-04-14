// 📄 pages/KitManager.tsx
'use client';

import React from 'react';
import { Grid as GridIcon, BarChart3 as ChartIcon, Calendar as DateIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import GridComponent from '@/components/grid/GridComponent';
import KitDashboardTable from '@/components/kitDashboardTable/KitDashboardTable';
import { KitProvider, useKitContext } from '@/context/kitContext';
import "ag-grid-community/styles/ag-theme-alpine.css";

const KitManagerContent: React.FC = () => {
    const {
        error,
        loading,
        isHistorical,
        selectedDate,
        fetchKits,
        resetFilters,
        filters,
        processedData
    } = useKitContext();

    // Handlers
    const handleDateChange = (date: Date) => {
        fetchKits(date);
    };

    const handleResetDate = () => {
        fetchKits();
    };

    const handleUploadCsv = async () => {
        const response = await fetch(`/api/kits/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        fetchKits();
    };

    return (
        <div className="container mx-auto p-4 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">JF-17 Kit Items Management System</h1>
                <Button onClick={handleUploadCsv}>
                    Upload CSV from here
                </Button>
                <div className="flex gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="flex gap-2 cursor-pointer">
                                <DateIcon className="h-4 w-4" />
                                {isHistorical ? format(selectedDate, 'PPP') : 'Current Data'}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={(date) => date && handleDateChange(date)}
                                initialFocus
                            />
                            {isHistorical && (
                                <div className="p-2 border-t border-border">
                                    <Button variant="ghost" onClick={handleResetDate} className="w-full cursor-pointer">
                                        View Current Data
                                    </Button>
                                </div>
                            )}
                        </PopoverContent>
                    </Popover>

                    <Button
                        variant="outline"
                        onClick={resetFilters}
                        disabled={filters.categories.length === 1 && filters.categories[0] === 'Total' && filters.statuses[0] === 'All'}
                    >
                        Reset Filters
                    </Button>
                </div>
            </div>

            {/* Error message */}
            {error && (
                <Card className="bg-red-50">
                    <CardContent className="pt-4">
                        <div className="text-red-600">Error: {error}</div>
                    </CardContent>
                </Card>
            )}

            {/* Historical data notice */}
            {isHistorical && (
                <Card className="bg-yellow-50">
                    <CardContent className="pt-0">
                        <div className="text-yellow-700 flex items-center gap-2">
                            <DateIcon className="h-4 w-4" />
                            <span>
                                Viewing historical data from {format(selectedDate, 'PPPP')}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Filter summary */}
            <Card className="bg-blue-50">
                <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-2">
                        <span className="font-medium">Active Filters:</span>
                        {filters.categories.includes('Total') && filters.statuses.includes('All') ? (
                            <span>Showing all kit items</span>
                        ) : (
                            <>
                                <div className="flex flex-wrap gap-2">
                                    <span>Categories:</span>
                                    {filters.categories.map(cat => (
                                        <span key={cat} className="bg-blue-200 px-2 py-1 rounded-md text-sm">
                                            {cat}
                                        </span>
                                    ))}
                                </div>

                                {!filters.statuses.includes('All') && (
                                    <div className="flex flex-wrap gap-2 ml-4">
                                        <span>Status:</span>
                                        {filters.statuses.map(status => (
                                            <span key={status} className="bg-green-200 px-2 py-1 rounded-md text-sm">
                                                {status}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                    <div className="mt-2 text-sm">
                        Showing {processedData.filteredData.length} of {processedData.totalSummary.total} kit items
                        {loading && <span className="ml-2 text-gray-500">(Loading...)</span>}
                    </div>
                </CardContent>
            </Card>

            {/* Loading indicator */}
            {loading && (
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
            )}

            {/* Tabs for Dashboard, Grid and Changes Comparison */}
            {!loading && (
                <Tabs defaultValue='kit-table' className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="kit-table" className="cursor-pointer">
                            <ChartIcon className="w-4 h-4 mr-2" />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="grid" className="cursor-pointer">
                            <GridIcon className="w-4 h-4 mr-2" />
                            Details
                        </TabsTrigger>
                    </TabsList>

                    {/* Kit Status Table Tab Content */}
                    <TabsContent value="kit-table" className="mt-4">
                        <KitDashboardTable />
                    </TabsContent>

                    {/* Grid View Tab Content */}
                    <TabsContent value="grid" className="mt-4">
                        <GridComponent readOnly={isHistorical} />
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
};

const KitManager: React.FC = () => {
    return (
        <KitProvider>
            <KitManagerContent />
        </KitProvider>
    );
};

export default KitManager;