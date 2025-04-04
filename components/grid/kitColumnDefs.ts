// 📄 components/grid/kitColumnDefs.ts
import { ColDef } from 'ag-grid-community';
import { Kit } from '@/types/kit';

export const getKitColumnDefs = (
    HistoryButtonRenderer: any,
    editable: boolean = true,
    showHistory: boolean = true
): ColDef<Kit>[] => {
    const baseColumns: ColDef<Kit>[] = [
        {
            field: "partNumber",
            headerName: "Part Number",
            flex: 1,
            editable: false,
            filter: true,
        },
        {
            field: "noun",
            headerName: "Noun",
            flex: 1,
            editable: false,
            filter: true,
        },
        {
            field: "kitName",
            headerName: "Kit Name",
            flex: 1,
            editable: editable,
            cellEditor: editable ? 'agSelectCellEditor' : undefined,
            cellEditorParams: editable ? {
                values: ['Kit B', 'Kit C', 'Kit C 125'],
            } : undefined,
            filter: true,
        },
        {
            field: "manufacturer",
            flex: 1,
            editable: editable,
            cellEditor: editable ? 'agSelectCellEditor' : undefined,
            cellEditorParams: editable ? {
                values: ['Machine Shop', 'Sheet Metal', 'Rubber and Ploymer', 'PMC', 'Harness Manufacturing', 'Spring Shop'],
            } : undefined,
            filter: true,
        },
        {
            field: "stateStatus",
            headerName: "State Status",
            flex: 1,
            editable: editable,
            cellEditor: editable ? 'agSelectCellEditor' : undefined,
            cellEditorParams: editable ? {
                values: [
                    'Form 17 Pending',
                    'Under Indegenization',
                    'Part Under TF',
                    'Die Under TF',
                    'Part Trial Testing',
                    'MCL',
                    'Under Sourcing',
                    'Sourcing Completed',
                    'Beyond Capability'
                ],
            } : undefined,
            filter: true,
        },
        {
            field: "currentStatus",
            headerName: "Current Status",
            flex: 1,
            editable: editable,
            filter: true,
        },
        {
            field: "remarks",
            flex: 1,
            editable: editable,
            filter: true,
        },
        {
            field: "form48number",
            headerName: "Form 48 Number",
            flex: 1,
            editable: editable,
            filter: true,
        },
        {
            field: "user",
            flex: 1,
            editable: editable,
            filter: true,
        },
        {
            field: "dieRequired",
            headerName: "Die Required",
            flex: 1,
            editable: editable,
            cellRenderer: (params: any) => params.value ? 'Yes' : 'No',
            cellEditor: editable ? 'agSelectCellEditor' : undefined,
            cellEditorParams: editable ? {
                values: [true, false],
            } : undefined,
            filter: true,
        },
        {
            field: "dieNumber",
            headerName: "Die Number",
            flex: 1,
            editable: editable,
            filter: true,
        },
    ];
    if (showHistory) {
        baseColumns.push({
            headerName: "History",
            field: "id",
            flex: 0,
            sortable: true,
            filter: false,
            editable: false,
            cellRenderer: HistoryButtonRenderer,
            pinned: 'right',
            cellStyle: {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            },
        });
    }

    return baseColumns;
};