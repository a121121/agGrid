'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Type definition based on your Prisma schema
type Kit = {
    id: number;
    partNumber: string;
    noun: string;
    kitName: string;
    stateStatus: string;
    currentStatus: string | null;
    remarks: string;
    manufacturer: string;
    form48number: string;
    userName: string;
    dieRequired: boolean;
    dieNumber: string;
    version: number;
    createdAt: string;
    validUntil: string;
    originalKitId: number;
};


export default function KitDatabaseTester() {
    const [kits, setKits] = useState<Kit[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedKit, setSelectedKit] = useState<Kit | null>(null);
    const [versionHistory, setVersionHistory] = useState<Kit[]>([]);
    const [auditLog, setAuditLog] = useState<any[]>([]);
    const [drawerOpen, setDrawerOpen] = useState(false);

    // Fetch all current kit versions
    useEffect(() => {
        const fetchKits = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/kits/current');
                if (!response.ok) throw new Error('Failed to fetch kits');
                const data = await response.json();
                setKits(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchKits();
    }, []);

    // Fetch version history and audit log when a kit is selected
    const viewKitDetails = async (kit: Kit) => {
        try {
            setSelectedKit(kit);
            console.log('Selected kit:', kit);
            console.log('OriginalKitId:', kit.originalKitId);

            // Fetch version history
            const historyResponse = await fetch(`/api/kits/${kit.originalKitId}/history`);
            if (!historyResponse.ok) {
                const error = await historyResponse.json();
                throw new Error(error.message || 'Failed to fetch version history');
            }
            const historyData = await historyResponse.json();
            console.log('Version history:', historyData);
            setVersionHistory(historyData);

            // Fetch audit log
            const auditResponse = await fetch(`/api/kits/${kit.originalKitId}/audit`);
            if (!auditResponse.ok) {
                const error = await auditResponse.json();
                throw new Error(error.message || 'Failed to fetch audit log');
            }
            const auditData = await auditResponse.json();
            console.log('Audit log:', auditData);
            setAuditLog(auditData);

            // Open the drawer after data is fetched
            setDrawerOpen(true);
        } catch (err) {
            console.error('Error in viewKitDetails:', err);
            setError(err instanceof Error ? err.message : 'Unknown error occurred');
        }
    };

    // Format date for better readability
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    return (
        <div className="container mx-auto p-4">
            <Card className="w-full mb-8">
                <CardHeader>
                    <CardTitle>Kit Database Tester</CardTitle>
                    <CardDescription>Test your Prisma database connection and kit service functions</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center p-8">Loading kits...</div>
                    ) : error ? (
                        <div className="bg-red-100 p-4 rounded text-red-700">{error}</div>
                    ) : kits.length === 0 ? (
                        <div className="text-center p-8">
                            <p>No kits found in the database.</p>
                            <Button className="mt-4" onClick={() => window.location.href = '/kits/new'}>
                                Create First Kit
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="p-2 text-left">ID</th>
                                        <th className="p-2 text-left">Part Number</th>
                                        <th className="p-2 text-left">Kit Name</th>
                                        <th className="p-2 text-left">Status</th>
                                        <th className="p-2 text-left">Version</th>
                                        <th className="p-2 text-left">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {kits.map((kit) => (
                                        <tr key={kit.id} className="border-t hover:bg-gray-50">
                                            <td className="p-2">{kit.id}</td>
                                            <td className="p-2">{kit.partNumber}</td>
                                            <td className="p-2">{kit.kitName}</td>
                                            <td className="p-2">{kit.stateStatus}</td>
                                            <td className="p-2">{kit.version}</td>
                                            <td className="p-2">
                                                <Button variant="outline" size="sm" onClick={() => viewKitDetails(kit)}>
                                                    View Details
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Kit details drawer */}
            <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
                <SheetContent className="w-full md:w-3/4 lg:w-2/3 max-w-4xl overflow-y-auto">
                    {selectedKit && (
                        <>
                            <SheetHeader>
                                <SheetTitle>{selectedKit.kitName} (Part #: {selectedKit.partNumber})</SheetTitle>
                                <SheetDescription>
                                    Current Version: {selectedKit.version} | Created: {formatDate(selectedKit.createdAt)}
                                </SheetDescription>
                            </SheetHeader>
                            <div className="py-6">
                                <Tabs defaultValue="details" className="w-full">
                                    <TabsList className="grid w-full grid-cols-3">
                                        <TabsTrigger value="details">Details</TabsTrigger>
                                        <TabsTrigger value="history">Version History</TabsTrigger>
                                        <TabsTrigger value="audit">Audit Log</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="details" className="p-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <h3 className="font-semibold">Basic Information</h3>
                                                <p><span className="font-medium">Noun:</span> {selectedKit.noun}</p>
                                                <p><span className="font-medium">Manufacturer:</span> {selectedKit.manufacturer}</p>
                                                <p><span className="font-medium">Form 48 Number:</span> {selectedKit.form48number}</p>
                                                <p><span className="font-medium">Status:</span> {selectedKit.stateStatus}</p>
                                                {selectedKit.currentStatus && (
                                                    <p><span className="font-medium">Current Status:</span> {selectedKit.currentStatus}</p>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">Additional Details</h3>
                                                <p><span className="font-medium">Die Required:</span> {selectedKit.dieRequired ? 'Yes' : 'No'}</p>
                                                <p><span className="font-medium">Die Number:</span> {selectedKit.dieNumber}</p>
                                                <p><span className="font-medium">Created By:</span> {selectedKit.userName}</p>
                                                <p><span className="font-medium">Original Kit ID:</span> {selectedKit.originalKitId}</p>
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <h3 className="font-semibold">Remarks</h3>
                                            <p className="whitespace-pre-wrap">{selectedKit.remarks}</p>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="history" className="p-4">
                                        {versionHistory.length === 0 ? (
                                            <p>No version history available.</p>
                                        ) : (
                                            <div className="overflow-x-auto">
                                                <table className="w-full border-collapse">
                                                    <thead>
                                                        <tr className="bg-gray-100">
                                                            <th className="p-2 text-left">Version</th>
                                                            <th className="p-2 text-left">Created</th>
                                                            <th className="p-2 text-left">Valid Until</th>
                                                            <th className="p-2 text-left">State Status</th>
                                                            <th className="p-2 text-left">User</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {versionHistory.map((version) => (
                                                            <tr key={version.id} className="border-t hover:bg-gray-50">
                                                                <td className="p-2">{version.version}</td>
                                                                <td className="p-2">{formatDate(version.createdAt)}</td>
                                                                <td className="p-2">{formatDate(version.validUntil)}</td>
                                                                <td className="p-2">{version.stateStatus}</td>
                                                                <td className="p-2">{version.userName}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </TabsContent>

                                    <TabsContent value="audit" className="p-4">
                                        {auditLog.length === 0 ? (
                                            <p>No audit records available.</p>
                                        ) : (
                                            <div className="overflow-x-auto">
                                                <table className="w-full border-collapse">
                                                    <thead>
                                                        <tr className="bg-gray-100">
                                                            <th className="p-2 text-left">Changed At</th>
                                                            <th className="p-2 text-left">Version</th>
                                                            <th className="p-2 text-left">Field</th>
                                                            <th className="p-2 text-left">Old Value</th>
                                                            <th className="p-2 text-left">New Value</th>
                                                            <th className="p-2 text-left">User</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {auditLog.map((log) => (
                                                            <tr key={log.id} className="border-t hover:bg-gray-50">
                                                                <td className="p-2">{formatDate(log.changedAt)}</td>
                                                                <td className="p-2">{log.version}</td>
                                                                <td className="p-2">{log.field}</td>
                                                                <td className="p-2 max-w-xs truncate">{log.oldValue}</td>
                                                                <td className="p-2 max-w-xs truncate">{log.newValue}</td>
                                                                <td className="p-2">{log.userName}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </TabsContent>
                                </Tabs>
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <Button variant="outline" onClick={() => setDrawerOpen(false)}>
                                    Close
                                </Button>
                                <Button variant="default" onClick={() => window.location.href = `/kits/edit/${selectedKit.id}`}>
                                    Edit Kit
                                </Button>
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}