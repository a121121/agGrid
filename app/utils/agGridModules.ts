// 📄 utils/agGridModules.ts
import { ModuleRegistry } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    SelectEditorModule,
    TextEditorModule,
    TextFilterModule,
    NumberFilterModule,
    DateFilterModule,
    ValidationModule,
    NumberEditorModule,
    CellStyleModule,
    CustomFilterModule
} from 'ag-grid-community';

export const registerAgGridModules = () => {
    ModuleRegistry.registerModules([
        ClientSideRowModelModule,
        SelectEditorModule,
        TextEditorModule,
        TextFilterModule,
        NumberFilterModule,
        DateFilterModule,
        ValidationModule,
        NumberEditorModule,
        CellStyleModule,
        CustomFilterModule
    ]);
};