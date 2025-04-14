// 📄 components/grid/ColumnSelector.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SlidersHorizontal } from 'lucide-react';

interface ColumnSelectorProps {
    columnVisibility: Record<string, boolean>;
    onVisibilityChange: (column: string, visible: boolean) => void;
}

export const ColumnSelector: React.FC<ColumnSelectorProps> = ({
    columnVisibility,
    onVisibilityChange,
}) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="ml-2">
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    Columns
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {Object.keys(columnVisibility).map((column) => (
                    <DropdownMenuCheckboxItem
                        key={column}
                        checked={columnVisibility[column]}
                        onCheckedChange={(checked) => onVisibilityChange(column, checked)}
                    >
                        {column}
                    </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};