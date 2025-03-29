// 📄 pages/KitManager.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Grid as GridIcon, BarChart3 as ChartIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import GridComponent from '@/components/GridComponent';
import KitDashboard from '@/components/KitDashboard';
import KitDashboardTable from '@/components/KitDashboardTable'
import { generateKitData } from '@/lib/generateKitData';
import { processKitData, FilterState, KitCategoryFilter, StateStatusFilter } from '@/lib/kitDataProcessor';
import { Kit } from '@/types/kit';

const KitManager: React.FC = () => {
    // Generate test data
    const [allKits] = useState<Kit[]>(() => generateKitData(500));

    // State for filtering
    const [filters, setFilters] = useState<FilterState>({
        categories: ['Total'],
        statuses: ['All']
    });

    // Processed data
    const [processedData, setProcessedData] = useState(() => processKitData(allKits, filters));

    // Update processed data when filters change
    useEffect(() => {
        setProcessedData(processKitData(allKits, filters));
    }, [allKits, filters]);

    // Reset filters
    const handleResetFilters = () => {
        setFilters({
            categories: ['Total'],
            statuses: ['All']
        });
    };

    return (
        <div className="container mx-auto p-4 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Kit Management System</h1>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={handleResetFilters}
                        disabled={filters.categories.length === 1 && filters.categories[0] === 'Total' && filters.statuses[0] === 'All'}
                    >
                        Reset Filters
                    </Button>
                </div>
            </div>

            {/* Filter summary */}
            <Card className="bg-blue-50">
                <CardContent className="pt-4">
                    <div className="flex flex-wrap gap-2">
                        <span className="font-medium">Active Filters:</span>
                        {filters.categories.includes('Total') && filters.statuses.includes('All') ? (
                            <span>Showing all kits</span>
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
                        Showing {processedData.filteredData.length} of {allKits.length} kits
                    </div>
                </CardContent>
            </Card>

            {/* Tabs for Dashboard and Grid */}
            <Tabs defaultValue="dashboard" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-3">
                    <TabsTrigger value="dashboard">
                        <ChartIcon className="w-4 h-4 mr-2" />
                        Dashboard
                    </TabsTrigger>
                    <TabsTrigger value="kit-table">
                        <ChartIcon className="w-4 h-4 mr-2" />
                        Kit Status Table
                    </TabsTrigger>
                    <TabsTrigger value="grid">
                        <GridIcon className="w-4 h-4 mr-2" />
                        Grid View
                    </TabsTrigger>
                </TabsList>

                {/* Dashboard Tab Content */}
                <TabsContent value="dashboard" className="mt-4">
                    <KitDashboard kits={processedData.filteredData} />
                </TabsContent>

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
                    <GridComponent rowData={processedData.filteredData} />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default KitManager;