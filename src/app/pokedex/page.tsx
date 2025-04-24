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
import {
    abilityNameFilter,
    allMovesFilter,
    AVAILABLE_FILTERS,
    heldItemFilter,
    PokemonFilterType,
    tribesFilter,
} from "@/components/filters";
import Image from "next/image";
import { FilterInput } from "../../components/FilterInput";
import { abilities } from "../data/abilities";
import { items } from "../data/items";
import { calcTypeMatchup } from "../data/typeChart";
import { Ability } from "../data/types/Ability";
import { Item } from "../data/types/Item";
import { Tribe } from "../data/types/Tribe";
import TypeChartCell from "./components/TypeChartCell";

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

                <FilterInput
                    currentFilter={currentFilter}
                    filters={filters}
                    onAddFilter={handleAddFilter}
                    removeFilter={removeFilter}
                    setCurrentFilter={setCurrentFilter}
                />

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
