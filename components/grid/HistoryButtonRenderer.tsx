import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { History } from 'lucide-react';

interface HistoryButtonRendererProps {
    data: {
        id: number;
        version: number; // This is the current version from kits table
    };
    setSelectedRowId: (id: number) => void;
    setIsDrawerOpen: (open: boolean) => void;
}

export const HistoryButtonRenderer = ({
    data,
    setSelectedRowId,
    setIsDrawerOpen
}: HistoryButtonRendererProps) => {
    const [versionCount, setVersionCount] = useState<number>(data.version || 1);

    // Fetch latest version when component mounts
    // this can be written in kit-service
    useEffect(() => {
        const fetchLatestVersion = async () => {
            try {
                const response = await fetch(`/api/kits/${data.id}/version`);
                if (response.ok) {
                    const { version } = await response.json();
                    setVersionCount(version);
                }
            } catch (error) {
                console.error('Error fetching latest version:', error);
                setVersionCount(data.version || 1);
            }
        };

        fetchLatestVersion();
    }, [data.id, data.version]);

    return (
        <div className="flex items-center justify-center w-full">
            <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 relative cursor-pointer"
                onClick={() => {
                    setSelectedRowId(data.id);
                    setIsDrawerOpen(true);
                }}
                title="View history"
            >
                <div className='flex gap-1 items-center'>
                    <span><History className="w-4 h-4" /></span>
                    <span className="absolute -right-1 -top-1 text-xs bg-blue-500 text-white rounded-full h-4 w-4 flex items-center justify-center">
                        {versionCount}
                    </span>
                </div>
            </Button>
        </div>
    );
};