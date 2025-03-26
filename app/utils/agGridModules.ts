// 📄 utils/agGridModules.ts
import { ModuleRegistry } from 'ag-grid-community';
import {
    AllCommunityModule,
    ClientSideRowModelModule,
    SelectEditorModule,
    TextEditorModule,
    TextFilterModule,
    NumberFilterModule,
    DateFilterModule,
    ValidationModule,
    NumberEditorModule,
    CellStyleModule,
    CustomFilterModule,
    PaginationModule,
    CsvExportModule,
} from 'ag-grid-community';

export const registerAgGridModules = () => {
    ModuleRegistry.registerModules([
        AllCommunityModule,
        ClientSideRowModelModule,
        SelectEditorModule,
        TextEditorModule,
        TextFilterModule,
        NumberFilterModule,
        DateFilterModule,
        ValidationModule,
        NumberEditorModule,
        CellStyleModule,
        CustomFilterModule,
        PaginationModule,
        CsvExportModule
    ]);
};