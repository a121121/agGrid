import React, { useState, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Trash2, Plus, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

// Type definitions
interface ColumnMapping {
    label: string;
    required: boolean;
}

interface ColumnMappings {
    [key: string]: ColumnMapping;
}

interface CsvRow {
    [key: string]: string;
}

interface TransformedRow {
    [key: string]: string;
}

interface ColumnMappingState {
    [csvColumn: string]: string;
}

interface ValidationResult {
    isValid: boolean;
    missingColumns: string[];
}

interface CsvImportComponentProps {
    onImportComplete?: () => void;
}

// Column mapping configuration
const COLUMN_MAPPINGS: ColumnMappings = {
    noun: { label: 'Noun', required: true },
    kitName: { label: 'Kit Name', required: true },
    stateStatus: { label: 'State Status', required: false },
    currentStatus: { label: 'Current Status', required: false },
    manufacturer: { label: 'Manufacturer', required: false },
    form48number: { label: 'Form 48 Number', required: false },
    userName: { label: 'User Name', required: false },
    dieNumber: { label: 'Die Number', required: false },
    remarks: { label: 'Remarks', required: false },
    partNumber: { label: 'Part Number', required: true },
};

export default function CsvImportComponent({ onImportComplete }: CsvImportComponentProps) {
    const [file, setFile] = useState<File | null>(null);
    const [csvData, setCsvData] = useState<CsvRow[]>([]);
    const [columnMapping, setColumnMapping] = useState<ColumnMappingState>({});
    const [clearExistingData, setClearExistingData] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [step, setStep] = useState<number>(1); // 1: Upload, 2: Preview

    const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile && selectedFile.type === 'text/csv') {
            setFile(selectedFile);
            parseCSV(selectedFile);
        } else {
            toast.error('Please select a valid CSV file');
        }
    };

    const parseCSV = (file: File) => {
        setIsLoading(true);
        const reader = new FileReader();

        reader.onload = (e: ProgressEvent<FileReader>) => {
            const csv = e.target?.result as string;
            const lines = csv.split('\n');
            const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));

            const data: CsvRow[] = lines.slice(1)
                .filter(line => line.trim())
                .map(line => {
                    const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
                    const row: CsvRow = {};
                    headers.forEach((header, index) => {
                        row[header] = values[index] || '';
                    });
                    return row;
                });

            setCsvData(data);

            // Auto-map columns based on header names
            const autoMapping: ColumnMappingState = {};
            headers.forEach(header => {
                const lowerHeader = header.toLowerCase();
                Object.keys(COLUMN_MAPPINGS).forEach(key => {
                    if (lowerHeader.includes(key.toLowerCase()) ||
                        lowerHeader.includes(COLUMN_MAPPINGS[key].label.toLowerCase())) {
                        autoMapping[header] = key;
                    }
                });
            });

            setColumnMapping(autoMapping);
            setStep(2);
            setIsLoading(false);
            toast.success(`Successfully parsed ${data.length} rows from CSV`);
        };

        reader.onerror = () => {
            setIsLoading(false);
            toast.error('Error reading CSV file');
        };

        reader.readAsText(file);
    };

    const handleColumnMapping = (csvColumn: string, dbColumn: string) => {
        setColumnMapping(prev => ({
            ...prev,
            [csvColumn]: dbColumn
        }));
    };

    const validateMapping = (): ValidationResult => {
        const requiredColumns = Object.keys(COLUMN_MAPPINGS).filter(
            key => COLUMN_MAPPINGS[key].required
        );

        const mappedColumns = Object.values(columnMapping);
        const missingRequired = requiredColumns.filter(
            col => !mappedColumns.includes(col)
        );

        return {
            isValid: missingRequired.length === 0,
            missingColumns: missingRequired
        };
    };

    const handleImport = async () => {
        const validation = validateMapping();
        if (!validation.isValid) {
            toast.error(`Missing required columns: ${validation.missingColumns.join(', ')}`);
            return;
        }

        setIsLoading(true);

        try {
            // Transform data according to column mapping
            const transformedData: TransformedRow[] = csvData.map(row => {
                const transformedRow: TransformedRow = {};
                Object.entries(columnMapping).forEach(([csvCol, dbCol]) => {
                    if (dbCol) {
                        transformedRow[dbCol] = row[csvCol];
                    }
                });
                return transformedRow;
            });

            console.log("Sending data to API:", { data: transformedData, clearExisting: clearExistingData });

            const response = await fetch('/api/kits/import', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    data: transformedData,
                    clearExisting: clearExistingData
                }),
            });

            console.log("Response status:", response.status, response.statusText);

            // Get response text first to debug
            const responseText = await response.text();
            console.log("Raw response:", responseText);

            if (response.ok) {
                try {
                    // Try to parse as JSON
                    const result = JSON.parse(responseText);
                    console.log("Parsed response:", result);

                    const successMessage = result.message || `Successfully imported ${result.importedCount || 'unknown'} records`;
                    toast.success(successMessage);

                    // Reset the form and go back to step 1
                    resetImport();
                    onImportComplete?.();
                } catch (jsonError) {
                    console.error("JSON parsing error:", jsonError);
                    toast.success("Import completed successfully");
                    resetImport();
                    onImportComplete?.();
                }
            } else {
                // Handle HTTP error responses
                try {
                    const errorResult = JSON.parse(responseText);
                    toast.error(errorResult.error || `HTTP Error: ${response.status}`);
                } catch (jsonError) {
                    toast.error(`HTTP Error: ${response.status} - ${responseText}`);
                }
            }
        } catch (error) {
            // This should only catch network errors or other unexpected issues
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            console.error("Network or unexpected error:", error);
            toast.error('Network error or unexpected issue: ' + errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const resetImport = () => {
        setFile(null);
        setCsvData([]);
        setColumnMapping({});
        setStep(1);
    };

    const renderStep1 = () => (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Upload CSV File
                </CardTitle>
                <CardDescription>
                    Select a CSV file to import kit data
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="csv-upload"
                        disabled={isLoading}
                    />
                    <label htmlFor="csv-upload" className={`cursor-pointer ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-lg font-medium">
                            {isLoading ? 'Processing...' : 'Choose CSV File'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            {isLoading ? 'Please wait while we parse your file' : 'Click to select a file'}
                        </p>
                    </label>
                </div>

                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="clear-data"
                        checked={clearExistingData}
                        onCheckedChange={(checked) => setClearExistingData(checked as boolean)}
                        disabled={isLoading}
                    />
                    <label htmlFor="clear-data" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Clear existing data before import
                    </label>
                </div>

                {clearExistingData && (
                    <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            Warning: This will delete all existing kit data before importing new data.
                        </AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>
    );

    const renderStep2 = () => (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Preview & Map Columns
                    </CardTitle>
                    <CardDescription>
                        Review your data and map CSV columns to database fields
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-4 flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            Found {csvData.length} rows in {file?.name}
                        </p>
                        <div className="flex items-center gap-2">
                            <Badge variant={clearExistingData ? "destructive" : "secondary"}>
                                {clearExistingData ? (
                                    <>
                                        <Trash2 className="w-3 h-3 mr-1" />
                                        Clear & Import
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-3 h-3 mr-1" />
                                        Add to Existing
                                    </>
                                )}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Column Mapping</CardTitle>
                    <CardDescription>
                        Map your CSV columns to database fields
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3">
                        {Object.keys(csvData[0] || {}).map(csvColumn => (
                            <div key={csvColumn} className="flex items-center gap-4 p-3 border rounded">
                                <div className="flex-1">
                                    <p className="font-medium">{csvColumn}</p>
                                    <p className="text-sm text-gray-500">
                                        Sample: {csvData[0]?.[csvColumn] || 'No data'}
                                    </p>
                                </div>
                                <div className="flex-1">
                                    <select
                                        value={columnMapping[csvColumn] || ''}
                                        onChange={(e) => handleColumnMapping(csvColumn, e.target.value)}
                                        className="w-full p-2 border rounded"
                                        disabled={isLoading}
                                    >
                                        <option value="">Select database field</option>
                                        {Object.entries(COLUMN_MAPPINGS).map(([key, config]) => (
                                            <option key={key} value={key}>
                                                {config.label} {config.required ? '*' : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Data Preview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse border border-gray-300">
                            <thead>
                                <tr className="bg-gray-50">
                                    {Object.keys(csvData[0] || {}).map(header => (
                                        <th key={header} className="border border-gray-300 px-4 py-2 text-left font-medium">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {csvData.slice(0, 5).map((row, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        {Object.values(row).map((value, cellIndex) => (
                                            <td key={cellIndex} className="border border-gray-300 px-4 py-2">
                                                {value}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {csvData.length > 5 && (
                        <p className="text-sm text-gray-500 mt-2">
                            Showing first 5 rows of {csvData.length} total
                        </p>
                    )}
                </CardContent>
            </Card>

            <div className="flex gap-3">
                <Button variant="outline" onClick={resetImport} disabled={isLoading}>
                    Cancel
                </Button>
                <Button
                    onClick={handleImport}
                    disabled={isLoading}
                    className="flex-1"
                >
                    {isLoading ? 'Importing...' : 'Import Data'}
                </Button>
            </div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">CSV Import</h1>
                <div className="flex items-center gap-2 mt-2">
                    {[1, 2].map(stepNum => (
                        <div
                            key={stepNum}
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${stepNum === step
                                ? 'bg-blue-500 text-white'
                                : stepNum < step
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-200 text-gray-600'
                                }`}
                        >
                            {stepNum}
                        </div>
                    ))}
                </div>
            </div>

            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
        </div>
    );
}