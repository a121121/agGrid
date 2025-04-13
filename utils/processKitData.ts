// 📄 lib/kitDataProcessor.ts
//this is important for the summar table keep it as it is
import { Kit } from '@/types/kit';


// Define types for the filter state
export type KitCategoryFilter = 'Total' | 'Kit B' | 'Kit C' | 'Kit C 125';
export type StateStatusFilter = 'All' | Kit['stateStatus'];

export interface FilterState {
    categories: KitCategoryFilter[];
    statuses: StateStatusFilter[];
}

export interface KitStatusSummary {
    total: number;
    mclCount: number;
    nonMclPercentage: number;
    mclPercentage: number;
}

export interface ProcessedKitData {
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
    // Initialize the data structure
    const allStatuses: Kit['stateStatus'][] = [
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

    // Initialize the status breakdown structure
    const statusBreakdown: Record<Kit['stateStatus'], {
        total: KitStatusSummary;
        kitB: KitStatusSummary;
        kitC: KitStatusSummary;
        kitC125: KitStatusSummary;
    }> = {} as any;

    // Initialize with empty summaries
    allStatuses.forEach(status => {
        statusBreakdown[status] = {
            total: createEmptySummary(),
            kitB: createEmptySummary(),
            kitC: createEmptySummary(),
            kitC125: createEmptySummary()
        };
    });

    // Get kits by type
    const kitBItems = kits.filter(kit => kit.kitName === 'Kit B');
    const kitCItems = kits.filter(kit => kit.kitName === 'Kit C');
    const kitC125Items = kits.filter(kit => kit.kitName === 'Kit C 125');

    // Calculate total summaries
    const totalSummary = calculateSummary(kits);
    const kitBSummary = calculateSummary(kitBItems);
    const kitCSummary = calculateSummary(kitCItems);
    const kitC125Summary = calculateSummary(kitC125Items);

    // Calculate breakdown by status
    allStatuses.forEach(status => {
        const totalWithStatus = kits.filter(kit => kit.stateStatus === status);
        const kitBWithStatus = kitBItems.filter(kit => kit.stateStatus === status);
        const kitCWithStatus = kitCItems.filter(kit => kit.stateStatus === status);
        const kitC125WithStatus = kitC125Items.filter(kit => kit.stateStatus === status);

        statusBreakdown[status] = {
            total: calculateSummary(totalWithStatus),
            kitB: calculateSummary(kitBWithStatus),
            kitC: calculateSummary(kitCWithStatus),
            kitC125: calculateSummary(kitC125WithStatus)
        };
    });

    // Apply filters to get filtered data
    const filteredData = applyFilters(kits, filters);

    return {
        totalSummary,
        kitBSummary,
        kitCSummary,
        kitC125Summary,
        statusBreakdown,
        filteredData
    };
}

/**
 * Apply filters to the kit data
 */
function applyFilters(kits: Kit[], filters: FilterState): Kit[] {
    let result = [...kits];

    // Filter by kit categories
    if (filters.categories.length > 0 && !filters.categories.includes('Total')) {
        result = result.filter(kit => {
            return filters.categories.some(category => {
                if (category === 'Kit B') return kit.kitName === 'Kit B';
                if (category === 'Kit C') return kit.kitName === 'Kit C';
                if (category === 'Kit C 125') return kit.kitName === 'Kit C 125';
                return false;
            });
        });
    }

    // Filter by statuses
    if (filters.statuses.length > 0 && !filters.statuses.includes('All')) {
        result = result.filter(kit => {
            return filters.statuses.includes(kit.stateStatus as StateStatusFilter);
        });
    }

    return result;
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
 * Create an empty summary object
 */
function createEmptySummary(): KitStatusSummary {
    return {
        total: 0,
        mclCount: 0,
        mclPercentage: 0,
        nonMclPercentage: 0
    };
}