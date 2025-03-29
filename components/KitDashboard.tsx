import React, { useMemo } from 'react';
import { Kit } from '@/types/kit';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, PieChart } from '@mui/x-charts';
import {
    PackageIcon,
    FactoryIcon,
    CheckCircle2Icon
} from 'lucide-react';

interface KitDashboardProps {
    kits: Kit[];
}

const KitDashboard: React.FC<KitDashboardProps> = ({ kits }) => {
    // Comprehensive analytics with detailed metrics
    const kitAnalytics = useMemo(() => {
        // Separate MCL and non-MCL kits
        const nonMCLKits = kits.filter(kit => kit.stateStatus !== 'MCL');
        const mclKits = kits.filter(kit => kit.stateStatus === 'MCL');

        // Kit-type breakdown
        const kitTypeBreakdown = kits.reduce((acc, kit) => {
            if (!acc[kit.kitName]) {
                acc[kit.kitName] = {
                    total: 0,
                    mclCount: 0
                };
            }
            acc[kit.kitName].total++;
            if (kit.stateStatus === 'MCL') {
                acc[kit.kitName].mclCount++;
            }
            return acc;
        }, {} as Record<string, { total: number, mclCount: number }>);

        // Manufacturer breakdown (excluding MCL kits)
        const manufacturerCounts = nonMCLKits.reduce((acc, kit) => {
            acc[kit.manufacturer] = (acc[kit.manufacturer] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // State status breakdown (excluding MCL)
        const stateStatusCounts = nonMCLKits.reduce((acc, kit) => {
            acc[kit.stateStatus] = (acc[kit.stateStatus] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            totalItems: kits.length,
            totalMCL: mclKits.length,
            mclPercentage: (mclKits.length / kits.length) * 100,
            kitTypeBreakdown,
            manufacturerCounts,
            stateStatusCounts,
            nonMCLCount: nonMCLKits.length
        };
    }, [kits]);

    // Prepare chart data with improved formatting
    const chartData = {
        kitName: Object.entries(kitAnalytics.kitTypeBreakdown)
            .map(([name, { total, mclCount }]) => ({
                label: name,
                total: total,
                mclCount: mclCount,
                nonMclCount: total - mclCount
            }))
            .sort((a, b) => b.total - a.total),

        manufacturer: Object.entries(kitAnalytics.manufacturerCounts)
            .map(([name, count]) => ({ label: name, value: count }))
            .sort((a, b) => b.value - a.value),

        stateStatus: Object.entries(kitAnalytics.stateStatusCounts)
            .map(([status, count]) => ({ label: status, value: count }))
            .sort((a, b) => b.value - a.value)
    };

    return (
        <div className="p-4 bg-gray-50 space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-sm">Total Parts</CardTitle>
                        <PackageIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{kitAnalytics.totalItems}</div>
                        <p className="text-xs text-muted-foreground">
                            Total kit Items
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-sm">MCL Achieved</CardTitle>
                        <CheckCircle2Icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{kitAnalytics.totalMCL}</div>
                        <p className="text-xs text-muted-foreground">
                            {kitAnalytics.mclPercentage.toFixed(1)}% of total
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-sm">Remaining Parts</CardTitle>
                        <FactoryIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{kitAnalytics.nonMCLCount}</div>
                        <p className="text-xs text-muted-foreground">
                            Parts not yet on MCL
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Kit Name Distribution */}
                <Card className="h-[400px]">
                    <CardHeader>
                        <CardTitle>Kit Type Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="h-full -mt-10">
                        <BarChart
                            xAxis={[
                                {
                                    scaleType: 'band',
                                    data: chartData.kitName.map(item => item.label),
                                    tickLabelStyle: {
                                        angle: 45,
                                        textAnchor: 'start',
                                        fontSize: 10,
                                    },
                                },
                            ]}
                            series={[
                                {
                                    data: chartData.kitName.map(item => item.mclCount),
                                    label: 'MCL Achieved',
                                    color: '#10b981'
                                },
                                {
                                    data: chartData.kitName.map(item => item.nonMclCount),
                                    label: 'Pending',
                                    color: '#3b82f6'
                                }
                            ]}
                            height={350}
                            margin={{ left: 80, right: 50, top: 50, bottom: 80 }}
                        />
                    </CardContent>
                </Card>

                {/* Manufacturer Distribution */}
                <Card className="h-[400px]">
                    <CardHeader>
                        <CardTitle>Manufacturer Breakdown (Non-MCL)</CardTitle>
                    </CardHeader>
                    <CardContent className="h-full -mt-10">

                        <BarChart
                            xAxis={[
                                {
                                    scaleType: 'band',
                                    data: chartData.manufacturer.map(item => item.label),
                                    tickLabelStyle: {
                                        angle: 45,
                                        textAnchor: 'start',
                                        fontSize: 10,
                                    },
                                },
                            ]}
                            series={[
                                {
                                    data: chartData.manufacturer.map(item => item.value),
                                    label: 'Number of Parts',
                                    color: '#8b5cf6'
                                },
                            ]}
                            height={350}
                            margin={{ left: 80, right: 50, top: 50, bottom: 80 }}
                        />
                    </CardContent>
                </Card>

                {/* State Status Breakdown */}
                <Card className="md:col-span-2 h-[400px]">
                    <CardHeader>
                        <CardTitle>State Status Overview (Non-MCL)</CardTitle>
                    </CardHeader>
                    <CardContent className="h-full -mt-10">
                        <BarChart
                            xAxis={[
                                {
                                    scaleType: 'band',
                                    data: chartData.stateStatus.map(item => item.label),
                                    tickLabelStyle: {

                                        angle: 20,
                                        textAnchor: 'start',
                                        fontSize: 14,
                                        textAlign: 'left',
                                    },
                                },
                            ]}
                            series={[
                                {
                                    data: chartData.stateStatus.map(item => item.value),
                                    label: 'Number of Kits',
                                    color: '#f43f5e'
                                },
                            ]}
                            height={350}
                            margin={{ left: 80, right: 50, top: 50, bottom: 80 }}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Breakdown Tables */}
            <div className="grid gap-4 md:grid-cols-3">
                {/* Kit Type Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle>Kit Type Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {Object.entries(kitAnalytics.kitTypeBreakdown)
                                .sort((a, b) => b[1].total - a[1].total)
                                .map(([kitName, { total, mclCount }]) => (
                                    <li
                                        key={kitName}
                                        className="flex justify-between p-2 hover:bg-gray-100 rounded-md transition-colors"
                                    >
                                        <span className="text-sm">{kitName}</span>
                                        <span className="flex items-center">
                                            <span className="text-green-600 font-medium mr-2">
                                                {mclCount}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                / {total} ({((mclCount / total) * 100).toFixed(1)}%)
                                            </span>
                                        </span>
                                    </li>
                                ))}
                        </ul>
                    </CardContent>
                </Card>

                {/* Manufacturer Breakdown (Non-MCL) */}
                <Card>
                    <CardHeader>
                        <CardTitle>Manufacturer Details (Non-MCL)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {chartData.manufacturer.map(({ label, value }) => (
                                <li
                                    key={label}
                                    className="flex justify-between p-2 hover:bg-gray-100 rounded-md transition-colors"
                                >
                                    <span className="text-sm">{label}</span>
                                    <span className="font-medium text-purple-600">{value}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                {/* State Status Breakdown (Non-MCL) */}
                <Card>
                    <CardHeader>
                        <CardTitle>State Status Details (Non-MCL)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {chartData.stateStatus.map(({ label, value }) => (
                                <li
                                    key={label}
                                    className="flex justify-between p-2 hover:bg-gray-100 rounded-md transition-colors"
                                >
                                    <span className="text-sm">{label}</span>
                                    <span className="font-medium text-red-600">{value}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default KitDashboard;