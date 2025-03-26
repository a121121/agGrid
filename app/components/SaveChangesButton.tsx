// 📄 components/SaveChangesButton.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { Car } from '../types/car';

interface SaveChangesButtonProps {
    localChanges: { [key: number]: { field: keyof Car, oldValue: any, newValue: any }[] };
    saveChanges: () => void;
}

export const SaveChangesButton: React.FC<SaveChangesButtonProps> = ({
    localChanges,
    saveChanges
}) => {
    const pendingChangesCount = Object.values(localChanges).reduce(
        (total, changes) => total + changes.length,
        0
    );

    return (
        <div className="flex items-center space-x-4">
            {pendingChangesCount > 0 && (
                <span className="text-sm text-gray-600">
                    {pendingChangesCount} pending change{pendingChangesCount !== 1 ? 's' : ''}
                </span>
            )}
            <Button
                onClick={saveChanges}
                variant={pendingChangesCount > 0 ? "default" : "outline"}
                className="flex items-center gap-2"
                disabled={pendingChangesCount === 0}
            >
                <Save className="w-4 h-4" />
                Save Changes
            </Button>
        </div>
    );
};