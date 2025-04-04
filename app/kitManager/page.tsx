// 📄 pages/KitManager.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Grid as GridIcon, BarChart3 as ChartIcon, Calendar as DateIcon, History as HistoryIcon, DiffIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import GridComponent from '@/components/GridComponentSimple';
import KitDashboardTable from '@/components/KitDashboardTable';
// import KitChangesComparison from '@/components/KitChangesCompv2';
import KitChangesComparison from '@/components/KiChangesCompv2';
import { processKitData, FilterState } from '@/lib/kitDataProcessor';
import { Kit } from '@/types/kit';
import "ag-grid-community/styles/ag-theme-alpine.css";

const KitManager: React.FC = () => {
    // State for all kits from database
    const [allKits, setAllKits] = useState<Kit[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // State for filtering
    const [filters, setFilters] = useState<FilterState>({
        categories: ['Total'],
        statuses: ['All']
    });

    // State for date selection
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [isHistorical, setIsHistorical] = useState<boolean>(false);
    // Processed data based on filters
    const [processedData, setProcessedData] = useState(() => processKitData(allKits, filters));

    // Load initial data
    useEffect(() => {
        fetchKits();
    }, []);

    // Update processed data when filters or kits change
    useEffect(() => {
        setProcessedData(processKitData(allKits, filters));
    }, [allKits, filters]);

    // Fetch kits from the API
    const fetchKits = async (date?: Date) => {
        setLoading(true);
        setError(null);

        try {
            let url = '/api/kits';

            // If date is provided, fetch historical data
            if (date) {
                // Format date correctly for API
                const dateString = formatDateForApi(date);
                url += `?date=${dateString}`;
                setIsHistorical(true);
            } else {
                setIsHistorical(false);
            }

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Failed to fetch kits: ${response.statusText}`);
            }

            const data = await response.json();
            setAllKits(data);
        } catch (err) {
            console.error('Error fetching kits:', err);
            setError(err instanceof Error ? err.message : 'Unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    // Helper function to format date for API
    const formatDateForApi = (date: Date): string => {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };

    // Reset filters
    const handleResetFilters = () => {
        setFilters({
            categories: ['Total'],
            statuses: ['All']
        });
    };

    // Fetch data for a specific date
    const handleDateChange = (date: Date) => {
        setSelectedDate(date);
        fetchKits(date);
    };

    // Reset to current data
    const handleResetDate = () => {
        setSelectedDate(new Date());
        fetchKits();
    };

    return (
        <div className="container mx-auto p-4 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">JF-17 Kit Items Management System</h1>
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
                        onClick={handleResetFilters}
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
                        Showing {processedData.filteredData.length} of {allKits.length} kit items
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
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="kit-table" className="cursor-pointer">
                            <ChartIcon className="w-4 h-4 mr-2" />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="grid" className="cursor-pointer">
                            <GridIcon className="w-4 h-4 mr-2" />
                            Details
                        </TabsTrigger>
                        <TabsTrigger value="changes" className="cursor-pointer">
                            <HistoryIcon className="w-4 h-4 mr-2" />
                            Compare Changes
                        </TabsTrigger>
                    </TabsList>

                    {/* Kit Status Table Tab Content */}
                    <TabsContent value="kit-table" className="mt-4">
                        <KitDashboardTable
                            totalSummary={processedData.totalSummary}
                            kitBSummary={processedData.kitBSummary}
                            kitCSummary={processedData.kitCSummary}
                            kitC125Summary={processedData.kitC125Summary}
                            statusBreakdown={processedData.statusBreakdown}
                            filters={filters}
                            setFilters={setFilters}
                        />
                    </TabsContent>

                    {/* Grid View Tab Content */}
                    <TabsContent value="grid" className="mt-4">
                        <GridComponent
                            rowData={processedData.filteredData}
                            readOnly={isHistorical} // Pass readOnly prop
                        />
                    </TabsContent>

                    {/* Changes Comparison Tab Content */}
                    <TabsContent value="changes" className="mt-4">
                        <KitChangesComparison />
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
};

export default KitManager;