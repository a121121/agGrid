// 📄 components/grid/columnDefs.ts
import { ColDef } from 'ag-grid-community';
import { Car } from '../../types/car';

export const getColumnDefs = (HistoryButtonRenderer: any, editable: boolean = true): ColDef<Car>[] => [
    {
        field: "make",
        headerName: "Company",
        flex: 1,
        editable: editable,  // Use the parameter here
        cellEditor: editable ? 'agSelectCellEditor' : undefined,
        cellEditorParams: editable ? {
            values: ['Tesla', 'Ford', 'Toyota', 'BMW'],
        } : undefined,
        filter: true,
    },
    {
        field: "model",
        flex: 1,
        editable: editable,  // Use the parameter here
        filter: true,
    },
    {
        field: "price",
        valueFormatter: p => '£' + p.value?.toLocaleString(),
        flex: 1,
        editable: editable,  // Use the parameter here
        filter: true,
    },
    {
        field: "electric",
        flex: 1,
        editable: editable,  // Use the parameter here
        cellRenderer: (params: any) => params.value ? 'Yes' : 'No',
        cellEditor: editable ? 'agSelectCellEditor' : undefined,
        cellEditorParams: editable ? {
            values: [true, false],
        } : undefined,
        filter: true,
    },
    {
        headerName: "History",
        field: "id",
        flex: 0.5,
        sortable: false,
        filter: false,
        editable: false,  // Always false for this column
        cellRenderer: HistoryButtonRenderer,
        pinned: 'right',
        cellStyle: { display: 'flex', justifyContent: 'center' }
    }
];