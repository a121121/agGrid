// 📄 components/grid/HistoryButtonRenderer.tsx
import { Button } from '@/components/ui/button';
import { History } from 'lucide-react';

interface HistoryButtonRendererProps {
    data: {
        id: number;
        version: number;
    };
    setSelectedRowId: (id: number) => void;
    setIsDrawerOpen: (open: boolean) => void;
}

export const HistoryButtonRenderer = ({
    data,
    setSelectedRowId,
    setIsDrawerOpen
}: HistoryButtonRendererProps) => {
    return (
        <div className="flex items-center justify-center w-full">
            <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 relative"
                onClick={() => {
                    setSelectedRowId(data.id);
                    setIsDrawerOpen(true);
                }}
                title="View history"
            >
                <History className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 text-xs bg-blue-500 text-white rounded-full h-4 w-4 flex items-center justify-center">
                    {data.version}
                </span>
            </Button>
        </div>
    );
};