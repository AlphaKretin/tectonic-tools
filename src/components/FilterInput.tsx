import { useState } from "react";
import { AVAILABLE_FILTERS, FilterOperator, PokemonFilterType } from "./filters";

interface FilterInputProps {
    currentFilter: PokemonFilterType;
    filters: PokemonFilterType[];
    onAddFilter: (filter: PokemonFilterType, value: string) => void;
    removeFilter: (index: number) => void;
    setCurrentFilter: (filter: PokemonFilterType) => void;
}

export function FilterInput({ currentFilter, filters, onAddFilter, removeFilter, setCurrentFilter }: FilterInputProps) {
    const [localValue, setLocalValue] = useState("");

    const handleAdd = () => {
        if (!localValue) {
            alert("Please select a value for the filter!");
            return;
        }
        onAddFilter(currentFilter, localValue);
        setLocalValue("");
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-4">
            <div className="filter-container p-4 border rounded shadow-md bg-white dark:bg-gray-800 dark:border-gray-700">
                <div className="filter-controls flex items-center gap-4 mb-4">
                    <select
                        className="border rounded px-2 py-1 bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        value={currentFilter.label}
                        onChange={(e) => {
                            const selected = AVAILABLE_FILTERS.find((f) => f.label === e.target.value);
                            if (selected) setCurrentFilter(selected);
                        }}
                    >
                        {AVAILABLE_FILTERS.map((filter) => (
                            <option key={filter.label} value={filter.label}>
                                {filter.label}
                            </option>
                        ))}
                    </select>

                    {[">", "<", "==", "!="].includes(currentFilter.operator) && (
                        <select
                            className="border rounded px-2 py-1 bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
                            value={currentFilter.operator}
                            onChange={(e) =>
                                setCurrentFilter({
                                    ...currentFilter,
                                    operator: e.target.value as FilterOperator,
                                })
                            }
                        >
                            <option value="==">=</option>
                            <option value="!=">≠</option>
                            <option value=">">&gt;</option>
                            <option value="<">&lt;</option>
                        </select>
                    )}
                </div>
                <div>
                    {currentFilter.inputMethod === "select" ? (
                        <select
                            className="border rounded px-2 py-1 bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
                            value={localValue}
                            onChange={(e) => setLocalValue(e.target.value)}
                        >
                            <option value="">Value...</option>
                            {currentFilter.inputValues.map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <input
                            className="border rounded px-2 py-1 bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
                            type={typeof currentFilter.value === "number" ? "number" : "text"}
                            value={localValue}
                            onChange={(e) => setLocalValue(e.target.value)}
                            placeholder="Value..."
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleAdd();
                                }
                            }}
                        />
                    )}

                    <button
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                        onClick={handleAdd}
                    >
                        Add Filter
                    </button>
                </div>
                <div className="active-filters flex flex-wrap gap-2">
                    {filters.map((filter, index) => (
                        <div
                            key={index}
                            className="filter-chip flex items-center gap-2 px-3 py-1 bg-gray-200 rounded shadow-sm dark:bg-gray-700"
                        >
                            <span className="text-sm dark:text-white">
                                {filter.label} {filter.operator} {filter.value}
                            </span>
                            <button
                                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500"
                                onClick={() => removeFilter(index)}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
