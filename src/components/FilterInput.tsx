import { useState } from "react";
import BasicButton from "./BasicButton";
import { AVAILABLE_FILTERS, PokemonFilterType } from "./filters";

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
        <div className="w-full md:w-200 mx-auto bg-gray-800 rounded-lg p-2 mb-4">
            <div className="flex flex-wrap justify-center items-center gap-2 mb-2">
                <select
                    className="border rounded p-2"
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

                {currentFilter.inputMethod === "select" ? (
                    <select
                        className="border rounded p-2"
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
                        className="border rounded p-2"
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

                <BasicButton onClick={handleAdd}>Add Filter</BasicButton>
            </div>
            <div className="flex flex-wrap gap-2">
                {filters.map((filter, index) => (
                    <div
                        key={index}
                        className="pr-2 py-1 rounded-full bg-gray-700 hover:bg-rose-800 font-bold cursor-pointer border"
                        onClick={() => removeFilter(index)}
                    >
                        <span className="mr-1 px-2 py-1.5 rounded-full border border-white bg-gray-900/50">x</span>
                        {filter.label} {filter.operator} {filter.value}
                    </div>
                ))}
            </div>
        </div>
    );
}
