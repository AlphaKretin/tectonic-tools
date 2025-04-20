"use client";

import { getTypeColorClass } from "@/components/colours";
import InlineLink from "@/components/InlineLink";
import InternalLink from "@/components/InternalLink";
import TypeBadge from "@/components/TypeBadge";
import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import { moves } from "../data/moves";
import { pokemon } from "../data/pokemon";
import { Move } from "../data/types/Move";
import { Pokemon } from "../data/types/Pokemon";
import PokemonModal from "./components/PokemonModal";
import PokemonTable from "./components/PokemonTable";
import TabContent from "./components/TabContent";
import TableCell from "./components/TableCell";
import TableHeader from "./components/TableHeader";

export interface PokemonTableProps {
    mons: Pokemon[];
    onRowClick: (pokemon: Pokemon) => void;
}

import { tribes } from "@/app/data/tribes";
import { types } from "@/app/data/types";
import Image from "next/image";
import { abilities } from "../data/abilities";
import { items } from "../data/items";
import { calcTypeMatchup } from "../data/typeChart";
import { Ability } from "../data/types/Ability";
import { Item } from "../data/types/Item";
import { Tribe } from "../data/types/Tribe";
import { FilterInput } from "./components/FilterInput";
import TypeChartCell from "./components/TypeChartCell";

export type FilterOperator = "==" | "!=" | ">" | "<" | "includes";

type BaseFilter = {
    label: string; // What users see in the UI
    operator: FilterOperator;
    value: string | number;
    apply: (pokemon: Pokemon, value: string | number) => boolean;
};

type TextFilter = BaseFilter & {
    inputMethod: "text";
};

type SelectFilter = BaseFilter & {
    inputMethod: "select";
    inputValues: readonly string[];
};

function validateMoves(pokemon: Pokemon) {
    if (!pokemon.levelMoves) {
        console.warn(`Pokemon ${pokemon.name} has undefined level_moves`);
        return false;
    }

    const invalidMoves = pokemon.levelMoves.filter((m) => !m?.[1]?.name);
    if (invalidMoves.length > 0) {
        console.warn(`Pokemon ${pokemon.name} has invalid moves:`, invalidMoves);
        return false;
    }
    return true;
}

export type PokemonFilterType = TextFilter | SelectFilter;

const nameFilter: PokemonFilterType = {
    label: "Name",
    operator: "includes",
    value: "",
    inputMethod: "text",
    apply: (pokemon, value) => {
        const searchValue = String(value).toLowerCase();
        return pokemon.name.toLowerCase().includes(searchValue);
    },
};

const abilityNameFilter: PokemonFilterType = {
    label: "Ability Name",
    operator: "includes",
    value: "",
    apply: (pokemon: Pokemon, value: string | number) => {
        const searchValue = String(value).toLowerCase();
        return pokemon.abilities.some((a) => a.name.toLowerCase().includes(searchValue));
    },
    inputMethod: "text",
};

const allMovesFilter: PokemonFilterType = {
    label: "Moves (All)",
    operator: "includes",
    value: "",
    apply: (pokemon: Pokemon, value: string | number) => {
        if (!validateMoves(pokemon)) return false;
        const searchValue = String(value).toLowerCase();
        return pokemon.allMoves().some((m) => m.name.toLowerCase().includes(searchValue));
    },
    inputMethod: "select",
    inputValues: Object.values(moves).map((m) => m.name),
};

const tribesFilter: PokemonFilterType = {
    label: "Tribes",
    operator: "includes",
    value: "",
    apply: (pokemon: Pokemon, value: string | number) => {
        const searchValue = String(value).toLowerCase();
        return pokemon.tribes.some((t) => t.name.toLowerCase().includes(searchValue));
    },
    inputMethod: "select",
    inputValues: Object.values(tribes).map((t) => t.name),
};

const heldItemFilter: PokemonFilterType = {
    label: "Wild Held Item",
    operator: "includes",
    value: "",
    apply: (pokemon: Pokemon, value: string | number) => {
        const searchValue = String(value).toLowerCase();
        return pokemon.items.some((i) => i.name.toLowerCase().includes(searchValue));
    },
    inputMethod: "select",
    inputValues: Object.values(items).map((m) => m.name),
};

const AVAILABLE_FILTERS: PokemonFilterType[] = [
    // Standard field filters
    nameFilter,

    // Custom filters
    {
        label: "Type",
        operator: "includes",
        value: "",
        apply: (pokemon: Pokemon, value: string | number) => {
            const searchType = String(value).toLowerCase();
            return (
                pokemon.type1.name.toLowerCase().includes(searchType) ||
                (pokemon.type2?.name.toLowerCase().includes(searchType) ?? false)
            );
        },
        inputMethod: "select",
        inputValues: Object.values(types).map((t) => t.name),
    },
    abilityNameFilter,
    {
        label: "Ability Desc",
        operator: "includes",
        value: "",
        apply: (pokemon: Pokemon, value: string | number) => {
            const searchValue = String(value).toLowerCase();
            return pokemon.abilities.some((a) => a.description.toLowerCase().includes(searchValue));
        },
        inputMethod: "text",
    },
    {
        label: "Moves (Level)",
        operator: "includes",
        value: "",
        apply: (pokemon: Pokemon, value: string | number) => {
            if (!validateMoves(pokemon)) return false;
            const searchValue = String(value).toLowerCase();
            return pokemon.levelMoves.some((m) => m[1].name.toLowerCase().includes(searchValue));
        },
        inputMethod: "select",
        inputValues: Object.values(moves).map((m) => m.name),
    },
    allMovesFilter,
    tribesFilter,
    heldItemFilter,
];

const tabNames = ["Pokemon", "Moves", "Abilities", "Items", "Tribes", "Type Chart"];

const Home: NextPage = () => {
    const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
    const [filters, setFilters] = useState<PokemonFilterType[]>([]);
    const [activeTab, setActiveTab] = useState<string>("Pokemon");

    const [currentFilter, setCurrentFilter] = useState<PokemonFilterType>(AVAILABLE_FILTERS[0]);

    const handleAddFilter = (filter: PokemonFilterType, value: string) => {
        setFilters((prev) => [...prev, { ...filter, value }]);
    };

    const removeFilter = (index: number) => {
        setFilters((prev) => prev.filter((_, i) => i !== index));
    };

    const mons = Object.values(pokemon);
    const filteredPokemon = useMemo(() => {
        const filtered = mons.filter((mon) => {
            return filters.every((filter) => {
                return filter.apply(mon, filter.value);
            });
        });
        return filtered;
    }, [filters, mons]);

    useEffect(() => {
        if (selectedPokemon) {
            document.body.style.overflow = "hidden"; // Disable scrolling
        } else {
            document.body.style.overflow = ""; // Re-enable scrolling
        }
    }, [selectedPokemon]);

    const handlePokemonClick = (pokemon: Pokemon | null) => {
        setSelectedPokemon(pokemon);
    };

    const handleMoveClick = (move: Move) => {
        handleAddFilter(allMovesFilter, move.name.toLowerCase());
        setActiveTab("Pokemon");
    };

    const handleAbilityClick = (ability: Ability) => {
        handleAddFilter(abilityNameFilter, ability.name.toLowerCase());
        setActiveTab("Pokemon");
    };

    const handleItemClick = (item: Item) => {
        handleAddFilter(heldItemFilter, item.name.toLowerCase());
        setActiveTab("Pokemon");
    };

    const handleTribeClick = (tribe: Tribe) => {
        handleAddFilter(tribesFilter, tribe.name.toLowerCase());
        setActiveTab("Pokemon");
    };

    // filter for items that can be found on wild pokemon
    const validItems = Object.values(items).filter((i) =>
        Object.values(pokemon).some((p) => p.items.some((pi) => pi.name === i.name))
    );

    const realTypes = Object.values(types).filter((t) => t.isRealType);
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <Head>
                <title>Pokémon Tectonic Online Pokédex</title>
                <meta name="description" content="View Pokémon data for the fangame Pokémon Tectonic" />
            </Head>

            <main className="container mx-auto py-8 px-4">
                <div className="flex flex-col justify-center items-center mb-10 relative">
                    <h1 className="text-3xl font-bold text-center mb-8 text-blue-800 dark:text-blue-300">
                        Pokémon Tectonic Online Pokédex
                    </h1>
                    <p>
                        This tool is a work in progress! While it&apos;s largely functional, improvements are still
                        planned. See the to-do list and contribute on{" "}
                        <InlineLink url="https://github.com/AlphaKretin/tectonic-tools">GitHub</InlineLink>.
                    </p>
                    <p>
                        <InternalLink url="../">Return to homepage</InternalLink>
                    </p>
                </div>

                <div className="text-center p-1.5 w-max mx-auto sticky top-0 bg-gray-900">
                    {tabNames.map((n) => (
                        <button
                            key={n}
                            className={`p-2.5 text-2xl text-center no-underline inline-block rounded-lg mx-2 hover:bg-[#FFD166] hover:text-black hover:cursor-pointer ${
                                n === activeTab ? "bg-[#FFD166] text-black" : "bg-gray-500"
                            }`}
                            onClick={() => setActiveTab(n)}
                        >
                            {n}
                        </button>
                    ))}
                </div>
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

                        <FilterInput currentFilter={currentFilter} onAddFilter={handleAddFilter} />

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
                <TabContent tab="Pokemon" activeTab={activeTab}>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <PokemonTable mons={filteredPokemon} onRowClick={handlePokemonClick} />
                    </div>
                    {selectedPokemon && (
                        <PokemonModal
                            allMons={pokemon}
                            pokemon={selectedPokemon}
                            handlePokemonClick={handlePokemonClick}
                        />
                    )}
                </TabContent>
                <TabContent tab="Moves" activeTab={activeTab}>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <TableHeader>Name</TableHeader>
                                    <TableHeader>Type</TableHeader>
                                    <TableHeader>Category</TableHeader>
                                    <TableHeader>Power</TableHeader>
                                    <TableHeader>Acc</TableHeader>
                                    <TableHeader>PP</TableHeader>
                                    <TableHeader>Effect</TableHeader>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.values(moves).map((m) => (
                                    <tr
                                        key={m.id}
                                        onClick={() => handleMoveClick(m)}
                                        className={`cursor-pointer ${getTypeColorClass(m.type, false)}`}
                                    >
                                        <TableCell>{m.name}</TableCell>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500 dark:text-gray-400">
                                            <TypeBadge type1={m.type} />
                                        </td>
                                        <TableCell>{m.category}</TableCell>
                                        <TableCell>{m.bp}</TableCell>
                                        <TableCell>{m.accuracy}</TableCell>
                                        <TableCell>{m.pp}</TableCell>
                                        <TableCell>{m.description}</TableCell>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </TabContent>
                <TabContent tab="Abilities" activeTab={activeTab}>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <TableHeader>Name</TableHeader>
                                    <TableHeader>Effect</TableHeader>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.values(abilities).map((a) => (
                                    <tr
                                        key={a.id}
                                        onClick={() => handleAbilityClick(a)}
                                        className={`hover:bg-blue-50 dark:hover:bg-blue-900 cursor-pointer`}
                                    >
                                        <TableCell>{a.name}</TableCell>
                                        <TableCell>{a.description}</TableCell>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </TabContent>
                <TabContent tab="Items" activeTab={activeTab}>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <TableHeader>
                                        <></>
                                    </TableHeader>
                                    <TableHeader>Name</TableHeader>
                                    <TableHeader>Effect</TableHeader>
                                </tr>
                            </thead>
                            <tbody>
                                {validItems.map((i) => (
                                    <tr
                                        key={i.id}
                                        onClick={() => handleItemClick(i)}
                                        className={`hover:bg-blue-50 dark:hover:bg-blue-900 cursor-pointer`}
                                    >
                                        <TableCell>
                                            <Image alt={i.name} src={i.getImage()} width={50} height={50} />
                                        </TableCell>
                                        <TableCell>{i.name}</TableCell>
                                        <TableCell>{i.description}</TableCell>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </TabContent>
                <TabContent tab="Tribes" activeTab={activeTab}>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <TableHeader>Name</TableHeader>
                                    <TableHeader>Effect</TableHeader>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.values(tribes).map((t) => (
                                    <tr
                                        key={t.id}
                                        onClick={() => handleTribeClick(t)}
                                        className={`hover:bg-blue-50 dark:hover:bg-blue-900 cursor-pointer`}
                                    >
                                        <TableCell>{t.name}</TableCell>
                                        <TableCell>{t.description}</TableCell>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </TabContent>
                <TabContent tab="Type Chart" activeTab={activeTab}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-center align-middle border border-gray-300 dark:border-gray-700 rounded-lg shadow-md bg-white dark:bg-gray-800">
                            <thead className="bg-gray-100 dark:bg-gray-700">
                                <tr>
                                    <th className="px-8 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                        Defense →
                                        <br />
                                        Attack ↴
                                    </th>
                                    {realTypes.map((t) => (
                                        <th
                                            key={t.id}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                                        >
                                            <TypeBadge type1={t} />
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {realTypes.map((t) => (
                                    <tr key={t.id} className="even:bg-gray-50 dark:even:bg-gray-700">
                                        <td className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            <TypeBadge type1={t} />
                                        </td>
                                        {realTypes.map((t2) => {
                                            const mult = calcTypeMatchup({ type: t }, { type1: t2 });
                                            return <TypeChartCell key={t2.index} mult={mult} />;
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </TabContent>
            </main>
        </div>
    );
};

export default Home;
