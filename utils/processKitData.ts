// 📄 utils/processKitData.ts
import { Kit } from '@/types/kit';

// Define types for the filter state
export type KitCategoryFilter = 'Total' | string;
export type StateStatusFilter = 'All' | string;

export interface FilterState {
    categories: string[];
    statuses: string[];
}

export interface KitStatusSummary {
    total: number;
    mclCount: number;
    nonMclPercentage: number;
    mclPercentage: number;
}

export interface ProcessedKitData {
    // Summary for all kits and by kit type
    totalSummary: KitStatusSummary;
    kitSummaries: Record<string, KitStatusSummary>;

    // Status breakdown
    statusBreakdown: Record<string, {
        total: KitStatusSummary;
        byKit: Record<string, KitStatusSummary>;
    }>;

    // Filtered data based on current selection
    filteredData: Kit[];
}

/**
 * Process kit data and calculate all necessary metrics for the dashboard
 */
export function processKitData(
    kits: Kit[],
    filters: FilterState
): ProcessedKitData {
    // Get unique kit types from the data
    const kitTypes = Array.from(new Set(kits.map(kit => kit.kitName)));

    // Get unique statuses from the data
    const allStatuses = Array.from(new Set(kits.map(kit => kit.stateStatus)));

    // Initialize summaries
    const kitSummaries: Record<string, KitStatusSummary> = {};
    const statusBreakdown: Record<string, {
        total: KitStatusSummary;
        byKit: Record<string, KitStatusSummary>;
    }> = {};

    // Calculate total summary
    const totalSummary = calculateSummary(kits);

    // Calculate summaries for each kit type
    kitTypes.forEach(kitType => {
        const kitsOfType = kits.filter(kit => kit.kitName === kitType);
        kitSummaries[kitType] = calculateSummary(kitsOfType);
    });

    // Initialize and calculate status breakdown
    allStatuses.forEach(status => {
        const kitsWithStatus = kits.filter(kit => kit.stateStatus === status);

        const byKit: Record<string, KitStatusSummary> = {};
        kitTypes.forEach(kitType => {
            const kitsOfTypeWithStatus = kitsWithStatus.filter(kit => kit.kitName === kitType);
            byKit[kitType] = calculateSummary(kitsOfTypeWithStatus);
        });

        statusBreakdown[status] = {
            total: calculateSummary(kitsWithStatus),
            byKit
        };
    });

    // Apply filters to get filtered data
    const filteredData = applyFilters(kits, filters);

    return {
        totalSummary,
        kitSummaries,
        statusBreakdown,
        filteredData
    };
}

/**
 * Calculate summary metrics for a set of kits
 */
function calculateSummary(kits: Kit[]): KitStatusSummary {
    const total = kits.length;
    const mclCount = kits.filter(kit => kit.stateStatus === 'MCL').length;
    const mclPercentage = total > 0 ? (mclCount / total) * 100 : 0;
    const nonMclPercentage = total > 0 ? 100 - mclPercentage : 0;

    return {
        total,
        mclCount,
        mclPercentage,
        nonMclPercentage
    };
}

/**
 * Apply filters to the kit data
 */
function applyFilters(kits: Kit[], filters: FilterState): Kit[] {
    let result = [...kits];

    // Filter by kit categories
    if (filters.categories.length > 0 && !filters.categories.includes('Total')) {
        result = result.filter(kit => filters.categories.includes(kit.kitName));
    }

    // Filter by statuses
    if (filters.statuses.length > 0 && !filters.statuses.includes('All')) {
        result = result.filter(kit => filters.statuses.includes(kit.stateStatus));
    }

    return result;
}