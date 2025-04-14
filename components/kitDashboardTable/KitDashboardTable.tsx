// 📄 components/KitDashboardTable.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useKitContext } from '@/context/kitContext';
import { PieChart, Pie, Cell } from 'recharts';

const KitDashboardTable: React.FC = () => {
    const { processedData, filters, setFilters } = useKitContext();
    const { totalSummary, kitSummaries, statusBreakdown } = processedData;

    // Get unique kit types and status types
    const kitTypes = Object.keys(kitSummaries);
    const allStatuses = Object.keys(statusBreakdown);

    // Function to handle category filter click
    const handleCategoryClick = (category: string, event: React.MouseEvent) => {
        event.stopPropagation();

        setFilters(prev => {
            if (category === 'Total') {
                // Select only Total
                return { ...prev, categories: ['Total'] };
            } else {
                // If Total was selected, deselect it and select only this kit
                // If this kit was already selected, toggle it off
                // Otherwise, add this kit to selections
                const isTotalSelected = prev.categories.includes('Total');
                const isThisCategorySelected = prev.categories.includes(category);

                let newCategories: string[];

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
            }
        });
    };

    // Handle status cell click
    const handleStatusClick = (category: string, status: string, event: React.MouseEvent) => {
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
            let newStatuses: string[];

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
    const isCellSelected = (category: string, status: string): boolean => {
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
    const renderPieChart = (summary: typeof totalSummary) => {
        if (summary.total === 0) return <div className="text-center text-gray-400">No data</div>;

        // For Recharts PieChart
        const data = [
            { name: 'MCL', value: summary.mclCount },
            { name: 'Others', value: summary.total - summary.mclCount }
        ];

        const COLORS = ['#10b981', '#3b82f6'];

        return (
            <div className="h-32 flex justify-center">
                <PieChart width={120} height={120}>
                    <Pie
                        data={data}
                        cx={60}
                        cy={60}
                        innerRadius={25}
                        outerRadius={40}
                        paddingAngle={2}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                </PieChart>
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

                                {/* Dynamic Kit Type Column Headers */}
                                {kitTypes.map(kitType => (
                                    <th
                                        key={kitType}
                                        className={`border p-2 cursor-pointer transition-colors duration-200 hover:bg-blue-50 ${isCellSelected(kitType, 'All') ? 'bg-blue-200' : ''}`}
                                        onClick={(e) => handleCategoryClick(kitType, e)}
                                    >
                                        <div className="flex flex-col items-center">
                                            <div className="font-semibold mb-2">{kitType}</div>
                                            {renderPieChart(kitSummaries[kitType])}
                                            <div className="text-sm mt-2">
                                                Total: {kitSummaries[kitType].total} | MCL: {kitSummaries[kitType].mclCount} ({kitSummaries[kitType].mclPercentage.toFixed(1)}%)
                                            </div>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {/* All statuses rows */}
                            {allStatuses.map((status) => (
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

                                    {/* Dynamic Kit Type Column Cells */}
                                    {kitTypes.map(kitType => (
                                        <td
                                            key={`${status}-${kitType}`}
                                            className={`border p-2 text-center cursor-pointer transition-colors duration-200 hover:bg-blue-50 ${isCellSelected(kitType, status) ? 'bg-blue-200' : ''} ${!filters.categories.includes(kitType) ? 'opacity-50' : ''}`}
                                            onClick={(e) => handleStatusClick(kitType, status, e)}
                                        >
                                            {statusBreakdown[status].byKit[kitType].total}
                                            {status === 'MCL' && kitSummaries[kitType].total > 0
                                                ? ` (${(statusBreakdown[status].byKit[kitType].total / kitSummaries[kitType].total * 100).toFixed(1)}%)`
                                                : ''}
                                        </td>
                                    ))}
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