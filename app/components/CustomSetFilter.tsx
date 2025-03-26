// components/CustomSetFilter.tsx
// just need to look at the details of custom filter implementation

import React, { useState, useEffect, forwardRef } from 'react';
import { IFilterParams } from 'ag-grid-community';

interface CustomSetFilterProps {
    values: string[];
    filterParams: IFilterParams;
}

const CustomSetFilter = forwardRef((props: CustomSetFilterProps, ref) => {
    const { values, filterParams } = props;
    const [selectedValues, setSelectedValues] = useState<Set<string>>(new Set(values));
    const [isActive, setIsActive] = useState(false);

    // Expose AG Grid filter methods
    React.useImperativeHandle(ref, () => {
        return {
            isFilterActive() {
                return isActive;
            },
            getModel() {
                if (!isActive) return null;
                return { filterType: 'set', values: Array.from(selectedValues) };
            },
            setModel(model: any) {
                if (model == null) {
                    setSelectedValues(new Set(values));
                    setIsActive(false);
                } else {
                    setSelectedValues(new Set(model.values));
                    setIsActive(true);
                }
            }
        };
    });

    const toggleValue = (value: string) => {
        const newSelectedValues = new Set(selectedValues);
        if (newSelectedValues.has(value)) {
            newSelectedValues.delete(value);
        } else {
            newSelectedValues.add(value);
        }
        setSelectedValues(newSelectedValues);
        setIsActive(newSelectedValues.size > 0 && newSelectedValues.size < values.length);
        filterParams.filterChangedCallback();
    };

    const selectAll = () => {
        setSelectedValues(new Set(values));
        setIsActive(false);
        filterParams.filterChangedCallback();
    };

    const selectNone = () => {
        setSelectedValues(new Set());
        setIsActive(true);
        filterParams.filterChangedCallback();
    };

    return (
        <div className="custom-set-filter p-2 bg-white shadow-md border border-gray-200 rounded">
            <div className="mb-2">
                <button
                    className="text-xs text-blue-600 mr-2 hover:underline"
                    onClick={selectAll}
                >
                    Select All
                </button>
                <button
                    className="text-xs text-blue-600 hover:underline"
                    onClick={selectNone}
                >
                    Select None
                </button>
            </div>
            <div className="max-h-40 overflow-y-auto">
                {values.map(value => (
                    <div key={value} className="flex items-center mb-1">
                        <input
                            type="checkbox"
                            id={`filter-checkbox-${value}`}
                            checked={selectedValues.has(value)}
                            onChange={() => toggleValue(value)}
                            className="mr-2"
                        />
                        <label htmlFor={`filter-checkbox-${value}`}>{value}</label>
                    </div>
                ))}
            </div>
        </div>
    );
});

export default CustomSetFilter;