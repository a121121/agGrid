// 📄 components/grid/columnDefs.ts
import { ColDef } from 'ag-grid-community';
import { Car } from '../../types/car';

export const getColumnDefs = (HistoryButtonRenderer: any): ColDef<Car>[] => [
    {
        field: "make",
        headerName: "Company",
        flex: 1,
        editable: true,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
            values: ['Tesla', 'Ford', 'Toyota', 'BMW'],
        },
        filter: true,
    },
    {
        field: "model",
        flex: 1,
        editable: true,
        filter: true,
    },
    {
        field: "price",
        valueFormatter: p => '£' + p.value?.toLocaleString(),
        flex: 1,
        editable: true,
    },
    {
        field: "electric",
        flex: 1,
        editable: true,
        cellRenderer: (params: any) => params.value ? 'Yes' : 'No',
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
            values: [true, false],
        },
    },
    {
        headerName: "History",
        field: "id",
        flex: 0.5,
        sortable: false,
        filter: false,
        editable: false,
        cellRenderer: HistoryButtonRenderer,
        pinned: 'right',
        cellStyle: { display: 'flex', justifyContent: 'center' }
    }
];