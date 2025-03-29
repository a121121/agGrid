// 📄 components/KitDashboardTable.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart } from '@mui/x-charts';
import { KitStatusSummary, FilterState, KitCategoryFilter, StateStatusFilter } from '@/lib/kitDataProcessor';
import { Kit } from '@/types/kit';

interface KitDashboardTableProps {
    totalSummary: KitStatusSummary;
    kitBSummary: KitStatusSummary;
    kitCSummary: KitStatusSummary;
    kitC125Summary: KitStatusSummary;
    statusBreakdown: Record<Kit['stateStatus'], {
        total: KitStatusSummary;
        kitB: KitStatusSummary;
        kitC: KitStatusSummary;
        kitC125: KitStatusSummary;
    }>;
    filters: FilterState;
    setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

const KitDashboardTable: React.FC<KitDashboardTableProps> = ({
    totalSummary,
    kitBSummary,
    kitCSummary,
    kitC125Summary,
    statusBreakdown,
    filters,
    setFilters
}) => {
    // All possible state statuses
    const allStateStatuses: Kit['stateStatus'][] = [
        'Form 17 Pending',
        'Under Indegenization',
        'Part Under TF',
        'Die Under TF',
        'Part Trial Testing',
        'MCL',
        'Under Sourcing',
        'Sourcing Completed',
        'Beyond Capability'
    ];

    // Handle category header click (Total, Kit B, Kit C, Kit C 125)
    const handleCategoryClick = (category: KitCategoryFilter, event: React.MouseEvent) => {
        event.stopPropagation();

        if (category === 'Total') {
            // Select only Total and all statuses
            setFilters({
                categories: ['Total'],
                statuses: ['All']
            });
        } else {
            // If Total was selected, deselect it and select only this kit
            // If this kit was already selected, toggle it off
            // Otherwise, add this kit to selections
            setFilters(prev => {
                const isTotalSelected = prev.categories.includes('Total');
                const isThisCategorySelected = prev.categories.includes(category);

                let newCategories: KitCategoryFilter[];

                if (isTotalSelected) {
                    // Deselect Total, select only this category
                    newCategories = [category];
                } else if (isThisCategorySelected) {
                    // Toggle this category off
                    newCategories = prev.categories.filter(c => c !== category);
                    // If no categories left, select Total
                    if (newCategories.length === 0) {
                        newCategories = ['Total'];
                    }
                } else {
                    // Add this category to existing selections
                    newCategories = [...prev.categories, category];
                }

                return {
                    ...prev,
                    categories: newCategories
                };
            });
        }
    };

    // Handle status cell click (rows)
    const handleStatusClick = (category: KitCategoryFilter, status: StateStatusFilter, event: React.MouseEvent) => {
        event.stopPropagation();

        // Prevent selecting specific statuses for Total if kit categories are selected
        const isTotalCategory = category === 'Total';
        const isKitSelected = filters.categories.some(c => c !== 'Total');

        if (isTotalCategory && isKitSelected) return;

        // If category is not in selected categories, do nothing
        if (!filters.categories.includes(category) && category !== 'Total') return;

        // Toggle the status in filters
        setFilters(prev => {
            const isStatusSelected = prev.statuses.includes(status);
            let newStatuses: StateStatusFilter[];

            if (status === 'All') {
                // Select all statuses
                newStatuses = ['All'];
            } else if (isStatusSelected) {
                // Toggle status off
                newStatuses = prev.statuses.filter(s => s !== status);
                // If no statuses left, select All
                if (newStatuses.length === 0) {
                    newStatuses = ['All'];
                }
            } else {
                // Add status to existing selections, remove All if present
                newStatuses = [...prev.statuses.filter(s => s !== 'All'), status];
            }

            return {
                ...prev,
                statuses: newStatuses
            };
        });
    };

    // Check if a cell is selected
    const isCellSelected = (category: KitCategoryFilter, status: StateStatusFilter): boolean => {
        // For headers (All status)
        if (status === 'All') {
            return filters.categories.includes(category);
        }

        // For Total category
        if (category === 'Total') {
            return filters.categories.includes('Total') &&
                (filters.statuses.includes(status) || filters.statuses.includes('All'));
        }

        // For specific kit categories
        return filters.categories.includes(category) &&
            (filters.statuses.includes(status) || filters.statuses.includes('All'));
    };

    // Render a pie chart for a kit summary
    const renderPieChart = (summary: KitStatusSummary) => {
        if (summary.total === 0) return <div className="text-center text-gray-400">No data</div>;

        return (
            <div className="h-32">
                <PieChart
                    series={[
                        {
                            data: [
                                { id: 0, value: summary.mclCount, label: 'MCL', color: '#10b981' },
                                { id: 1, value: summary.total - summary.mclCount, label: 'Others', color: '#3b82f6' }
                            ],
                            innerRadius: 30,
                            outerRadius: 50,
                            paddingAngle: 2,
                            cornerRadius: 4,
                            startAngle: 0,
                            endAngle: 360,
                        }
                    ]}
                    width={140}
                    height={140}
                    margin={{ right: 5, left: 5, top: 5, bottom: 5 }}
                    legend={{ hidden: true }}
                />
            </div>
        );
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Kit Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                <th className="border p-2">Status \ Category</th>

                                {/* Total Column Header */}
                                <th
                                    className={`border p-2 cursor-pointer transition-colors duration-200 hover:bg-blue-50 ${isCellSelected('Total', 'All') ? 'bg-blue-200' : ''}`}
                                    onClick={(e) => handleCategoryClick('Total', e)}
                                >
                                    <div className="flex flex-col items-center">
                                        <div className="font-semibold mb-2">Total</div>
                                        {renderPieChart(totalSummary)}
                                        <div className="text-sm mt-2">
                                            Total: {totalSummary.total} | MCL: {totalSummary.mclCount} ({totalSummary.mclPercentage.toFixed(1)}%)
                                        </div>
                                    </div>
                                </th>

                                {/* Kit B Column Header */}
                                <th
                                    className={`border p-2 cursor-pointer transition-colors duration-200 hover:bg-blue-50 ${isCellSelected('Kit B', 'All') ? 'bg-blue-200' : ''}`}
                                    onClick={(e) => handleCategoryClick('Kit B', e)}
                                >
                                    <div className="flex flex-col items-center">
                                        <div className="font-semibold mb-2">Kit B</div>
                                        {renderPieChart(kitBSummary)}
                                        <div className="text-sm mt-2">
                                            Total: {kitBSummary.total} | MCL: {kitBSummary.mclCount} ({kitBSummary.mclPercentage.toFixed(1)}%)
                                        </div>
                                    </div>
                                </th>

                                {/* Kit C Column Header */}
                                <th
                                    className={`border p-2 cursor-pointer transition-colors duration-200 hover:bg-blue-50 ${isCellSelected('Kit C', 'All') ? 'bg-blue-200' : ''}`}
                                    onClick={(e) => handleCategoryClick('Kit C', e)}
                                >
                                    <div className="flex flex-col items-center">
                                        <div className="font-semibold mb-2">Kit C</div>
                                        {renderPieChart(kitCSummary)}
                                        <div className="text-sm mt-2">
                                            Total: {kitCSummary.total} | MCL: {kitCSummary.mclCount} ({kitCSummary.mclPercentage.toFixed(1)}%)
                                        </div>
                                    </div>
                                </th>

                                {/* Kit C 125 Column Header */}
                                <th
                                    className={`border p-2 cursor-pointer transition-colors duration-200 hover:bg-blue-50 ${isCellSelected('Kit C 125', 'All') ? 'bg-blue-200' : ''}`}
                                    onClick={(e) => handleCategoryClick('Kit C 125', e)}
                                >
                                    <div className="flex flex-col items-center">
                                        <div className="font-semibold mb-2">Kit C 125</div>
                                        {renderPieChart(kitC125Summary)}
                                        <div className="text-sm mt-2">
                                            Total: {kitC125Summary.total} | MCL: {kitC125Summary.mclCount} ({kitC125Summary.mclPercentage.toFixed(1)}%)
                                        </div>
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {allStateStatuses.map((status) => (
                                <tr key={status}>
                                    {/* Row Label */}
                                    <td className="border p-2 font-medium">{status}</td>

                                    {/* Total Column Cell */}
                                    <td
                                        className={`border p-2 text-center cursor-pointer transition-colors duration-200 hover:bg-blue-50 ${isCellSelected('Total', status) ? 'bg-blue-200' : ''} ${!filters.categories.includes('Total') ? 'opacity-50' : ''}`}
                                        onClick={(e) => handleStatusClick('Total', status, e)}
                                    >
                                        {statusBreakdown[status].total.total}
                                        {status === 'MCL' && totalSummary.total > 0
                                            ? ` (${(statusBreakdown[status].total.total / totalSummary.total * 100).toFixed(1)}%)`
                                            : ''}
                                    </td>

                                    {/* Kit B Column Cell */}
                                    <td
                                        className={`border p-2 text-center cursor-pointer transition-colors duration-200 hover:bg-blue-50 ${isCellSelected('Kit B', status) ? 'bg-blue-200' : ''} ${!filters.categories.includes('Kit B') ? 'opacity-50' : ''}`}
                                        onClick={(e) => handleStatusClick('Kit B', status, e)}
                                    >
                                        {statusBreakdown[status].kitB.total}
                                        {status === 'MCL' && kitBSummary.total > 0
                                            ? ` (${(statusBreakdown[status].kitB.total / kitBSummary.total * 100).toFixed(1)}%)`
                                            : ''}
                                    </td>

                                    {/* Kit C Column Cell */}
                                    <td
                                        className={`border p-2 text-center cursor-pointer transition-colors duration-200 hover:bg-blue-50 ${isCellSelected('Kit C', status) ? 'bg-blue-200' : ''} ${!filters.categories.includes('Kit C') ? 'opacity-50' : ''}`}
                                        onClick={(e) => handleStatusClick('Kit C', status, e)}
                                    >
                                        {statusBreakdown[status].kitC.total}
                                        {status === 'MCL' && kitCSummary.total > 0
                                            ? ` (${(statusBreakdown[status].kitC.total / kitCSummary.total * 100).toFixed(1)}%)`
                                            : ''}
                                    </td>

                                    {/* Kit C 125 Column Cell */}
                                    <td
                                        className={`border p-2 text-center cursor-pointer transition-colors duration-200 hover:bg-blue-50 ${isCellSelected('Kit C 125', status) ? 'bg-blue-200' : ''} ${!filters.categories.includes('Kit C 125') ? 'opacity-50' : ''}`}
                                        onClick={(e) => handleStatusClick('Kit C 125', status, e)}
                                    >
                                        {statusBreakdown[status].kitC125.total}
                                        {status === 'MCL' && kitC125Summary.total > 0
                                            ? ` (${(statusBreakdown[status].kitC125.total / kitC125Summary.total * 100).toFixed(1)}%)`
                                            : ''}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
};

export default KitDashboardTable;