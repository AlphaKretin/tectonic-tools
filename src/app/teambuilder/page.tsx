"use client";

import BasicButton from "@/components/BasicButton";
import Dropdown from "@/components/DropDown";
import { FilterInput } from "@/components/FilterInput";
import { AVAILABLE_FILTERS, PokemonFilterType } from "@/components/filters";
import PageHeader, { PageType } from "@/components/PageHeader";
import TypeBadge, { TypeBadgeElementEnum } from "@/components/TypeBadge";
import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import PokemonCard from "../../components/PokemonCard";
import { decodeTeam, encodeTeam, MAX_LEVEL, SavedPartyPokemon } from "../data/teamExport";
import { Ability } from "../data/tectonic/Ability";
import { Item } from "../data/tectonic/Item";
import { Move } from "../data/tectonic/Move";
import { Pokemon } from "../data/tectonic/Pokemon";
import { PokemonType } from "../data/tectonic/PokemonType";
import { TectonicData } from "../data/tectonic/TectonicData";
import { calcBestMoveMatchup, calcTypeMatchup } from "../data/typeChart";
import { PartyPokemon } from "../data/types/PartyPokemon";
import { isNull } from "../data/util";
import TypeChartCell from "../pokedex/components/TypeChartCell";
import AtkTotalCell from "./components/AtkTotalCell";
import DefTotalCell from "./components/DefTotalCell";
import MatchupMonCell from "./components/MatchupMonCell";

const TeamBuilder: NextPage = () => {
    const [cards, setCards] = useState<PartyPokemon[]>(Array(6).fill(new PartyPokemon()));
    const [teamName, setTeamName] = useState<string>("");
    const [savedTeams, setSavedTeams] = useState<string[]>([]);
    const [loadedTeam, setLoadedTeam] = useState<string>("");
    const [teamCode, setTeamCode] = useState<string>("");

    const [filters, setFilters] = useState<PokemonFilterType[]>([]);
    const [currentFilter, setCurrentFilter] = useState<PokemonFilterType>(AVAILABLE_FILTERS[0]);
    const [filterPokemon, setFilterPokemon] = useState<Pokemon>(Pokemon.NULL);

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

    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const teamParam = params.get("team");
            if (teamParam) {
                setTeamCode(teamParam);
                // unrolled importTeam function to avoid rerenders
                try {
                    setCards(decodeTeam(teamParam));
                    // skip the alert on page load unless there's an error
                    // alert("Team imported successfully!");
                } catch (error) {
                    console.error("Import error:", error);
                    alert("Invalid team code! Please check and try again.");
                }
            }
        }
    }, []);

    function updateCards(index: number, card: Partial<PartyPokemon>) {
        const newCards = [...cards];
        newCards[index] = new PartyPokemon({ ...cards[index], ...card });
        setCards(newCards);
    }

    // Mutant type is secret and irrelevant to defensive matchups
    const realTypes = Object.values(TectonicData.types).filter((t) => t.isRealType);
    const validCards = cards.filter((c) => !isNull(c.species));
    const tribeCounts = Object.fromEntries(Object.values(TectonicData.tribes).map((t) => [t.id, 0]));
    for (const card of cards) {
        // count as all tribes if wild card equipped
        if (card.items.some((i) => i.id === "WILDCARD")) {
            for (const tribe in TectonicData.tribes) {
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
                    species: TectonicData.pokemon[c.pokemon] || Pokemon.NULL,
                    moves: c.moves.map((m) => TectonicData.moves[m] || Move.NULL),
                    ability: TectonicData.abilities[c.ability] || Ability.NULL,
                    items: c.items.map((i) => TectonicData.items[i] || Item.NULL),
                    itemType: c.itemType ? TectonicData.types[c.itemType] || PokemonType.NULL : PokemonType.NULL,
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

    const mons = Object.values(TectonicData.pokemon);
    const filteredPokemon = useMemo(() => {
        const filtered = mons.filter((mon) => {
            return filters.every((filter) => {
                return filter.apply(mon, filter.value);
            });
        });
        return filtered;
    }, [filters, mons]);

    function addNextPokemon() {
        if (isNull(filterPokemon)) {
            alert("You must select a Pokémon to use this!");
            return;
        }
        if (cards.filter((p) => !isNull(p.species)).length > 5) {
            alert("You must have an empty Pokémon slot to use this!");
            return;
        }
        const slotIndex = cards.findIndex((p) => isNull(p.species));
        const newCards = [...cards];
        newCards[slotIndex] = new PartyPokemon({ species: filterPokemon });
        setCards(newCards);
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <Head>
                <title>Pokémon Tectonic Team Builder</title>
                <meta name="description" content="Analyse team composition for the fangame Pokémon Tectonic" />
            </Head>
            <PageHeader currentPage={PageType.Builder} />

            <main className="container mx-auto px-4 pb-6">
                <div className="flex flex-col justify-center items-center mb-10 relative">
                    <div>
                        <FilterInput
                            currentFilter={currentFilter}
                            filters={filters}
                            onAddFilter={handleAddFilter}
                            removeFilter={removeFilter}
                            setCurrentFilter={setCurrentFilter}
                        />
                        <div className="flex flex-row">
                            <Dropdown
                                value={filterPokemon.id}
                                onChange={(e) => setFilterPokemon(TectonicData.pokemon[e.target.value] || Pokemon.NULL)}
                            >
                                <option value="">Select Pokémon</option>
                                {filteredPokemon.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name}
                                    </option>
                                ))}
                            </Dropdown>
                            <BasicButton onClick={addNextPokemon}>Add Next Pokemon</BasicButton>
                        </div>
                    </div>
                    <div className="flex flex-row justify-center items-center gap-4 mt-6">
                        <input
                            type="text"
                            placeholder="Team name"
                            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                        />
                        <BasicButton onClick={saveTeam}>Save Team</BasicButton>
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
                        <BasicButton onClick={importTeam}>Import Team</BasicButton>
                        <BasicButton onClick={exportTeam}>Export Team</BasicButton>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 w-full">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div
                                key={index}
                                className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 flex flex-col items-center w-60"
                            >
                                <PokemonCard data={cards[index]} update={(c) => updateCards(index, c)} battle={false} />
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

                    <h2 className="my-4 text-2xl font-bold text-gray-800 dark:text-gray-100">Defensive Matchups</h2>
                    <table className="mx-auto divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th></th>
                                {realTypes.map((type) => (
                                    <TypeBadge
                                        key={type.id}
                                        types={[type]}
                                        element={TypeBadgeElementEnum.TABLE_HEADER}
                                    />
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {validCards.map((c, index) => (
                                <tr key={index}>
                                    <MatchupMonCell c={c} useMoves={false} />
                                    {realTypes.map((type) => (
                                        <TypeChartCell
                                            key={type.id}
                                            mult={calcTypeMatchup(
                                                { type: type },
                                                { type1: c.types.type1, type2: c.types.type2, ability: c.ability }
                                            )}
                                        />
                                    ))}
                                </tr>
                            ))}
                            <tr className="text-end text-xl text-gray-500 dark:text-gray-300 bg-gray-50 dark:bg-gray-700">
                                <td className="pr-2 border border-gray-600">Weaknesses</td>
                                {realTypes.map((type) => (
                                    <DefTotalCell key={type.id} cards={validCards} type={type} total={"weak"} />
                                ))}
                            </tr>

                            <tr className="text-end text-xl text-gray-500 dark:text-gray-300 bg-gray-50 dark:bg-gray-700">
                                <td className="pr-2 border border-gray-600">Resistances</td>
                                {realTypes.map((type) => (
                                    <DefTotalCell key={type.id} cards={validCards} type={type} total={"strong"} />
                                ))}
                            </tr>
                        </tbody>
                    </table>

                    <h2 className="my-4 text-2xl font-bold text-gray-800 dark:text-gray-100">Offensive Coverage</h2>
                    <table className="mx-auto divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th></th>
                                {realTypes.map((type) => (
                                    <TypeBadge
                                        key={type.id}
                                        types={[type]}
                                        element={TypeBadgeElementEnum.TABLE_HEADER}
                                    />
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {validCards.map((c, index) => (
                                <tr key={index}>
                                    <MatchupMonCell c={c} useMoves={true} />
                                    {realTypes.map((type) => (
                                        <TypeChartCell key={type.id} mult={calcBestMoveMatchup(c, { type1: type })} />
                                    ))}
                                </tr>
                            ))}
                            <tr className="text-end text-xl text-gray-500 dark:text-gray-300 bg-gray-50 dark:bg-gray-700">
                                <td className="pr-2 border border-gray-600">Weak</td>
                                {realTypes.map((type) => (
                                    <AtkTotalCell key={type.id} cards={validCards} type={type} total={"se"} />
                                ))}
                            </tr>

                            <tr className="text-end text-xl text-gray-500 dark:text-gray-300 bg-gray-50 dark:bg-gray-700">
                                <td className="pr-2 border border-gray-600">Resisted</td>
                                {realTypes.map((type) => (
                                    <AtkTotalCell key={type.id} cards={validCards} type={type} total={"nve"} />
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
};

export default TeamBuilder;
