// components/modals/AddKitModal.tsx
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Kit } from '@/types/kit';
import { useToast } from '@/hooks/use-toast';

interface AddKitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onKitAdded: (kit: Kit) => void;
}

const AddKitModal: React.FC<AddKitModalProps> = ({ isOpen, onClose, onKitAdded }) => {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState<Partial<Kit>>({
        partNumber: '',
        noun: '',
        kitName: 'Kit B',
        stateStatus: 'Form 17 Pending',
        currentStatus: '',
        remarks: '',
        manufacturer: 'Machine Shop',
        form48number: '',
        shopName: '',
        dieRequired: false,
        dieNumber: '',
        userName: '', // Will be set on the server side or pulled from auth context
    });

    const handleChange = (field: keyof Kit, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/kits', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to create kit');
            }

            const newKit = await response.json();
            toast({
                title: 'Success',
                description: 'Kit has been created successfully',
                variant: 'default',
            });

            onKitAdded(newKit);
            onClose();
        } catch (error) {
            console.error('Error creating kit:', error);
            toast({
                title: 'Error',
                description: 'Failed to create kit. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Add New Kit</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="partNumber">Part Number *</Label>
                        <Input
                            id="partNumber"
                            value={formData.partNumber}
                            onChange={(e) => handleChange('partNumber', e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="noun">Noun *</Label>
                        <Input
                            id="noun"
                            value={formData.noun}
                            onChange={(e) => handleChange('noun', e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="kitName">Kit Name *</Label>
                        <Select
                            value={formData.kitName}
                            onValueChange={(value) => handleChange('kitName', value)}
                        >
                            <SelectTrigger id="kitName">
                                <SelectValue placeholder="Select Kit Name" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Kit B">Kit B</SelectItem>
                                <SelectItem value="Kit C">Kit C</SelectItem>
                                <SelectItem value="Kit C 125">Kit C 125</SelectItem>
                                <SelectItem value="Kit D">Kit D</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="manufacturer">Manufacturer *</Label>
                        <Select
                            value={formData.manufacturer}
                            onValueChange={(value) => handleChange('manufacturer', value)}
                        >
                            <SelectTrigger id="manufacturer">
                                <SelectValue placeholder="Select Manufacturer" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Machine Shop">Machine Shop</SelectItem>
                                <SelectItem value="Sheet Metal">Sheet Metal</SelectItem>
                                <SelectItem value="Rubber and Ploymer">Rubber and Ploymer</SelectItem>
                                <SelectItem value="PMC">PMC</SelectItem>
                                <SelectItem value="Harness Manufacturing">Harness Manufacturing</SelectItem>
                                <SelectItem value="Spring Shop">Spring Shop</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="stateStatus">State Status *</Label>
                        <Select
                            value={formData.stateStatus}
                            onValueChange={(value) => handleChange('stateStatus', value)}
                        >
                            <SelectTrigger id="stateStatus">
                                <SelectValue placeholder="Select Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Form 17 Pending">Form 17 Pending</SelectItem>
                                <SelectItem value="Under Indegenization">Under Indegenization</SelectItem>
                                <SelectItem value="Part Under TF">Part Under TF</SelectItem>
                                <SelectItem value="Die Under TF">Die Under TF</SelectItem>
                                <SelectItem value="Part Trial Testing">Part Trial Testing</SelectItem>
                                <SelectItem value="MCL">MCL</SelectItem>
                                <SelectItem value="Under Sourcing">Under Sourcing</SelectItem>
                                <SelectItem value="Sourcing Completed">Sourcing Completed</SelectItem>
                                <SelectItem value="Beyond Capability">Beyond Capability</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="currentStatus">Current Status</Label>
                        <Input
                            id="currentStatus"
                            value={formData.currentStatus || ''}
                            onChange={(e) => handleChange('currentStatus', e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="form48number">Form 48 Number</Label>
                        <Input
                            id="form48number"
                            value={formData.form48number}
                            onChange={(e) => handleChange('form48number', e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="shopName">Shop Name *</Label>
                        <Input
                            id="shopName"
                            value={formData.shopName}
                            onChange={(e) => handleChange('shopName', e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex items-center space-x-2 pt-4">
                        <Checkbox
                            id="dieRequired"
                            checked={formData.dieRequired}
                            onCheckedChange={(checked) => handleChange('dieRequired', checked)}
                        />
                        <Label htmlFor="dieRequired">Die Required</Label>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="dieNumber">Die Number</Label>
                        <Input
                            id="dieNumber"
                            value={formData.dieNumber}
                            onChange={(e) => handleChange('dieNumber', e.target.value)}
                            disabled={!formData.dieRequired}
                        />
                    </div>

                    <div className="col-span-2 space-y-2">
                        <Label htmlFor="remarks">Remarks</Label>
                        <Textarea
                            id="remarks"
                            value={formData.remarks}
                            onChange={(e) => handleChange('remarks', e.target.value)}
                            className="h-20"
                        />
                    </div>

                    <DialogFooter className="col-span-2">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Creating...' : 'Create Kit'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddKitModal;