"use client";

import Dropdown from "@/components/DropDown";
import { FilterInput } from "@/components/FilterInput";
import { AVAILABLE_FILTERS, PokemonFilterType } from "@/components/filters";
import InlineLink from "@/components/InlineLink";
import InternalLink from "@/components/InternalLink";
import TypeBadge from "@/components/TypeBadge";
import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import PokemonCard from "../../components/PokemonCard";
import { abilities, nullAbility } from "../data/abilities";
import { items, nullItem } from "../data/items";
import { moves, nullMove } from "../data/moves";
import { nullPokemon, pokemon } from "../data/pokemon";
import { decodeTeam, encodeTeam, MAX_LEVEL, SavedPartyPokemon } from "../data/teamExport";
import { tribes } from "../data/tribes";
import { calcTypeMatchup } from "../data/typeChart";
import { nullType, types } from "../data/types";
import { PartyPokemon } from "../data/types/PartyPokemon";
import { isNull } from "../data/util";
import TypeChartCell from "../pokedex/components/TypeChartCell";
import AtkTotalCell from "./components/AtkTotalCell";
import DefTotalCell from "./components/DefTotalCell";
import TableHeader from "./components/TableHeader";

const TeamBuilder: NextPage = () => {
    const [cards, setCards] = useState<PartyPokemon[]>(Array(6).fill(new PartyPokemon()));
    const [teamName, setTeamName] = useState<string>("");
    const [savedTeams, setSavedTeams] = useState<string[]>([]);
    const [loadedTeam, setLoadedTeam] = useState<string>("");
    const [teamCode, setTeamCode] = useState<string>("");

    const [filters, setFilters] = useState<PokemonFilterType[]>([]);
    const [currentFilter, setCurrentFilter] = useState<PokemonFilterType>(AVAILABLE_FILTERS[0]);

    const handleAddFilter = (filter: PokemonFilterType, value: string) => {
        setFilters((prev) => [...prev, { ...filter, value }]);
    };

    const removeFilter = (index: number) => {
        setFilters((prev) => prev.filter((_, i) => i !== index));
    };

    useEffect(() => {
        if (typeof window !== "undefined") {
            setSavedTeams(Object.keys(localStorage));
        }
    }, []);

    function updateCards(index: number, card: Partial<PartyPokemon>) {
        const newCards = [...cards];
        newCards[index] = new PartyPokemon({ ...cards[index], ...card });
        setCards(newCards);
    }

    // Mutant type is secret and irrelevant to defensive matchups
    const realTypes = Object.values(types).filter((t) => t.isRealType);

    const tribeCounts = Object.fromEntries(Object.values(tribes).map((t) => [t.id, 0]));
    for (const card of cards) {
        // count as all tribes if wild card equipped
        if (card.items.some((i) => i.id === "WILDCARD")) {
            for (const tribe in tribes) {
                tribeCounts[tribe]++;
            }
        } else {
            for (const tribe of card.species.tribes) {
                tribeCounts[tribe.id]++;
            }
        }
    }

    const filteredTribes = Object.keys(tribeCounts)
        .filter((tribe) => tribeCounts[tribe] > 1)
        .sort((a, b) => tribeCounts[b] - tribeCounts[a]);

    function saveTeamToData() {
        const savedCards: SavedPartyPokemon[] = cards.map((c) => {
            return {
                pokemon: c.species.id,
                moves: c.moves.map((m) => m.id),
                ability: c.ability.id,
                items: c.items.map((i) => i.id),
                itemType: c.itemType.id,
                form: c.form,
                level: c.level,
                sp: [
                    c.stylePoints.hp,
                    c.stylePoints.attacks,
                    c.stylePoints.defense,
                    c.stylePoints.spdef,
                    c.stylePoints.speed,
                ],
            };
        });
        return savedCards;
    }

    function saveTeam() {
        if (teamName.length < 1) {
            alert("Please name the team before saving!");
            return;
        }
        const savedCards = saveTeamToData();
        const json = JSON.stringify(savedCards);
        localStorage.setItem(teamName, json);
        setSavedTeams(Object.keys(localStorage));
        alert("Team saved successfully!");
    }

    function exportTeam() {
        const code = encodeTeam(cards);
        setTeamCode(code);
        navigator.clipboard.writeText(code);
        alert(`Team copied to clipboard!`);
    }

    function loadTeamFromData(data: SavedPartyPokemon[]) {
        setCards(
            data.map((c) => {
                // fall back to defaults for newly added fields
                const level = c.level || MAX_LEVEL;
                const sp = c.sp || [10, 10, 10, 10, 10];
                return new PartyPokemon({
                    species: pokemon[c.pokemon] || nullPokemon,
                    moves: c.moves.map((m) => moves[m] || nullMove),
                    ability: abilities[c.ability] || nullAbility,
                    items: c.items.map((i) => items[i] || nullItem),
                    itemType: c.itemType ? types[c.itemType] || nullType : nullType,
                    form: c.form,
                    level: level,
                    stylePoints: {
                        hp: sp[0],
                        attacks: sp[1],
                        defense: sp[2],
                        spdef: sp[3],
                        speed: sp[4],
                    },
                });
            })
        );
    }

    function loadTeam(name: string) {
        setLoadedTeam(name);
        if (name === "") {
            // returning to null entry
            return;
        }
        const savedCardsJson = localStorage.getItem(name);
        if (savedCardsJson) {
            try {
                const savedCards = JSON.parse(savedCardsJson) as SavedPartyPokemon[];
                loadTeamFromData(savedCards);
            } catch (e) {
                console.error(e);
                alert("Error while loading team!");
            }
        }
    }

    function importTeam() {
        try {
            setCards(decodeTeam(teamCode));
            alert("Team imported successfully!");
        } catch (error) {
            console.error("Import error:", error);
            alert("Invalid team code! Please check and try again.");
        }
    }

    const mons = Object.values(pokemon);
    const filteredPokemon = useMemo(() => {
        const filtered = mons.filter((mon) => {
            return filters.every((filter) => {
                return filter.apply(mon, filter.value);
            });
        });
        return filtered;
    }, [filters, mons]);

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <Head>
                <title>Pokémon Tectonic Team Builder</title>
                <meta name="description" content="Analyse team composition for the fangame Pokémon Tectonic" />
            </Head>

            <main className="container mx-auto py-8 px-4">
                <div className="flex flex-col justify-center items-center mb-10 relative">
                    <h1 className="text-3xl font-bold text-center mb-8 text-blue-800 dark:text-blue-300">
                        Pokémon Tectonic Team Builder
                    </h1>
                    <p>
                        This tool is a work in progress! While it&apos;s largely functional, improvements are still
                        planned. See the to-do list and contribute on{" "}
                        <InlineLink url="https://github.com/AlphaKretin/tectonic-tools">GitHub</InlineLink>.
                    </p>
                    <p>
                        <InternalLink url="../">Return to homepage</InternalLink>
                    </p>
                    <FilterInput
                        currentFilter={currentFilter}
                        filters={filters}
                        onAddFilter={handleAddFilter}
                        removeFilter={removeFilter}
                        setCurrentFilter={setCurrentFilter}
                    />
                    <div className="flex flex-row justify-center items-center gap-4 mt-6">
                        <input
                            type="text"
                            placeholder="Team name"
                            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                        />
                        <button
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onClick={saveTeam}
                        >
                            Save Team
                        </button>
                        <Dropdown value={loadedTeam} onChange={(e) => loadTeam(e.target.value)}>
                            <option value="">Load Saved Team</option>
                            {savedTeams.map((team) => (
                                <option key={team} value={team}>
                                    {team}
                                </option>
                            ))}
                        </Dropdown>
                    </div>
                    <div className="flex flex-row justify-center items-center gap-4 mt-6">
                        <input
                            type="text"
                            placeholder="Team code"
                            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={teamCode}
                            onChange={(e) => setTeamCode(e.target.value)}
                        />
                        <button
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onClick={importTeam}
                        >
                            Import Team
                        </button>
                        <button
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onClick={exportTeam}
                        >
                            Export Team
                        </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 w-full">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div
                                key={index}
                                className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 flex flex-col items-center w-60"
                            >
                                <PokemonCard
                                    pokemonList={filteredPokemon}
                                    data={cards[index]}
                                    update={(c) => updateCards(index, c)}
                                    battle={false}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Potential Tribes Table */}
                    <div className="w-full max-w-4xl mx-auto mt-8">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 text-center">Tribes</h2>
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                            <div className="overflow-x-auto">
                                {filteredTribes.length > 0 ? (
                                    <table className="w-full">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Tribe
                                                </th>
                                                {filteredTribes.map((tribe) => (
                                                    <th
                                                        key={tribe}
                                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                                                    >
                                                        {tribe}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            <tr>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    Count
                                                </td>
                                                {Object.entries(tribeCounts)
                                                    .filter(([, count]) => count > 1)
                                                    .sort((a, b) => b[1] - a[1])
                                                    .map(([t, count]) => (
                                                        <td
                                                            key={t}
                                                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300"
                                                        >
                                                            {count}
                                                        </td>
                                                    ))}
                                            </tr>
                                        </tbody>
                                    </table>
                                ) : (
                                    <p className="text-center">
                                        If multiple Pokémon on your team share a tribe, they&apos;ll be listed here.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* Defensive Matchups Table */}
                    <div className="w-full max-w-6xl mx-auto mt-12">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 text-center">
                            Defensive Matchups
                        </h2>
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                            <div className="overflow-auto max-h-[calc(100vh-300px)]">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Type
                                            </th>
                                            {cards.map((_, index) => (
                                                <th
                                                    key={index}
                                                    className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                                                >
                                                    <TableHeader card={cards[index]} />
                                                </th>
                                            ))}
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Total Weak
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Total Resist
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {realTypes.map((type) => (
                                            <tr
                                                key={type.id}
                                                className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <TypeBadge type1={type} />
                                                    </div>
                                                </td>
                                                {cards.map((c, index) => {
                                                    const mult = !isNull(c.species)
                                                        ? calcTypeMatchup(
                                                              { type },
                                                              {
                                                                  type1: c.types.type1,
                                                                  type2: c.types.type2,
                                                                  ability: c.ability,
                                                              }
                                                          )
                                                        : 1;
                                                    return <TypeChartCell key={index} mult={mult} />;
                                                })}
                                                <DefTotalCell cards={cards} type={type} total="weak" />
                                                <DefTotalCell cards={cards} type={type} total="strong" />
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Offensive Matchups Table */}
                    <div className="w-full max-w-6xl mx-auto mt-12">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 text-center">
                            Offensive Matchups
                        </h2>
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                            <div className="overflow-auto max-h-[calc(100vh-300px)]">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Type
                                            </th>
                                            {cards.map((_, index) => (
                                                <th
                                                    key={index}
                                                    className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                                                >
                                                    <TableHeader card={cards[index]} />
                                                </th>
                                            ))}
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Total NVE
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Total SE
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {realTypes.map((type) => (
                                            <tr
                                                key={type.id}
                                                className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <TypeBadge type1={type} />
                                                    </div>
                                                </td>
                                                {cards.map((c, index) => {
                                                    const realMoves = c.moves.filter((m) => !isNull(m));
                                                    const mult = !isNull(c.species)
                                                        ? Math.max(
                                                              ...realMoves.map((m) =>
                                                                  calcTypeMatchup(
                                                                      {
                                                                          type: m.getType(c),
                                                                          move: m,
                                                                          ability: c.ability,
                                                                      },
                                                                      { type1: type }
                                                                  )
                                                              )
                                                          )
                                                        : 1;
                                                    return <TypeChartCell key={index} mult={mult} />;
                                                })}
                                                <AtkTotalCell cards={cards} type={type} total="nve" />
                                                <AtkTotalCell cards={cards} type={type} total="se" />
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TeamBuilder;
