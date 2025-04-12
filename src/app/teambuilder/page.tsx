"use client";

import Dropdown from "@/components/DropDown";
import InlineLink from "@/components/InlineLink";
import InternalLink from "@/components/InternalLink";
import TypeBadge from "@/components/TypeBadge";
import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import { abilities, nullAbility } from "../data/abilities";
import { pokemonTribes, pokemonTypes } from "../data/basicData";
import { items, nullItem } from "../data/items";
import { moves, nullMove } from "../data/moves";
import { nullPokemon, pokemon } from "../data/pokemon";
import { Ability } from "../data/types/Ability";
import { Item } from "../data/types/Item";
import { Move } from "../data/types/Move";
import { Pokemon } from "../data/types/Pokemon";
import AtkTableCell from "./components/AtkTableCell";
import AtkTotalCell from "./components/AtkTotalCell";
import DefTableCell from "./components/DefTableCell";
import DefTotalCell from "./components/DefTotalCell";
import PokemonCard from "./components/PokemonCard";
import TableHeader from "./components/TableHeader";

export interface CardData {
    pokemon: Pokemon;
    moves: Move[];
    ability: Ability;
    item: Item;
    form: number;
}

interface SavedCardData {
    pokemon: keyof typeof pokemon;
    moves: Array<keyof typeof moves>;
    ability: keyof typeof abilities;
    item: keyof typeof items;
    form: number;
}

const nullCard = {
    pokemon: nullPokemon,
    moves: Array(4).fill(nullMove),
    ability: nullAbility,
    item: nullItem,
    form: 0,
};

const indices = {
    pokemon: Object.fromEntries(Object.keys(pokemon).map((id, i) => [id, i])),
    ability: Object.fromEntries(Object.keys(abilities).map((id, i) => [id, i])),
    item: Object.fromEntries(Object.keys(items).map((id, i) => [id, i])),
    move: Object.fromEntries(Object.keys(moves).map((id, i) => [id, i])),
};

const keys = {
    pokemon: Object.keys(pokemon),
    ability: Object.keys(abilities),
    item: Object.keys(items),
    move: Object.keys(moves),
};

const TeamBuilder: NextPage = () => {
    const [cards, setCards] = useState<CardData[]>(Array(6).fill(nullCard));
    const [teamName, setTeamName] = useState<string>("");
    const [savedTeams, setSavedTeams] = useState<string[]>([]);
    const [loadedTeam, setLoadedTeam] = useState<string>("");
    const [teamCode, setTeamCode] = useState<string>("");

    useEffect(() => {
        if (typeof window !== "undefined") {
            setSavedTeams(Object.keys(localStorage));
        }
    }, []);

    function updateCards(index: number, card: CardData) {
        const newCards = [...cards];
        newCards[index] = card;
        setCards(newCards);
    }

    // Mutant type is secret and irrelevant to defensive matchups
    const nonMutantTypes = pokemonTypes.slice(0, pokemonTypes.length - 1);

    const tribeCounts = Object.fromEntries(pokemonTribes.map((t) => [t, 0]));
    for (const card of cards) {
        for (const tribe of card.pokemon.tribes) {
            tribeCounts[tribe]++;
        }
    }

    const filteredTribes = Object.keys(tribeCounts)
        .filter((tribe) => tribeCounts[tribe] > 1)
        .sort((a, b) => tribeCounts[b] - tribeCounts[a]);

    function saveTeamToData() {
        const savedCards: SavedCardData[] = cards.map((c) => {
            return {
                pokemon: c.pokemon.id,
                moves: c.moves.map((m) => m.id),
                ability: c.ability.id,
                item: c.item.id,
                form: c.form,
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
        alert("Character saved successfully!");
    }

    const encodeChunk = (data: SavedCardData): string => {
        const indexList = [
            indices.pokemon[data.pokemon],
            indices.ability[data.ability],
            indices.item[data.item],
            data.form,
            indices.move[data.moves[0]],
            indices.move[data.moves[1]],
            indices.move[data.moves[2]],
            indices.move[data.moves[3]],
        ];

        const buffer = new ArrayBuffer(indexList.length * 2); // Each number is 16 bits (2 bytes)
        const view = new DataView(buffer);

        indexList.forEach((value, i) => {
            view.setUint16(i * 2, value); // Store each number as 16 bits
        });

        return Buffer.from(buffer).toString("base64");
    };

    function exportTeam() {
        const savedCards: SavedCardData[] = cards.map((card) => ({
            pokemon: card.pokemon.id,
            ability: card.ability.id,
            item: card.item.id,
            form: card.form,
            moves: card.moves.map((m) => m.id),
        }));

        const chunks = savedCards.map(encodeChunk);
        const code = chunks.join("!"); // Using ! as separator
        setTeamCode(code);
        navigator.clipboard.writeText(code);
        alert(`Team copied to clipboard!`);
    }

    function loadTeamFromData(data: SavedCardData[]) {
        setCards(
            data.map((c) => {
                return {
                    pokemon: pokemon[c.pokemon] || nullPokemon,
                    moves: c.moves.map((m) => moves[m] || nullMove),
                    ability: abilities[c.ability] || nullAbility,
                    item: items[c.item] || nullItem,
                    form: c.form,
                };
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
                const savedCards = JSON.parse(savedCardsJson) as SavedCardData[];
                loadTeamFromData(savedCards);
            } catch (e) {
                console.error(e);
                alert("Error while loading team!");
            }
        }
    }

    const decodeChunk = (chunk: string): SavedCardData => {
        const buffer = Buffer.from(chunk, "base64");
        const view = new DataView(buffer.buffer);

        const indexList = [];
        for (let i = 0; i < buffer.byteLength; i += 2) {
            indexList.push(view.getUint16(i));
        }

        return {
            pokemon: keys.pokemon[indexList[0]],
            ability: keys.ability[indexList[1]],
            item: keys.item[indexList[2]],
            form: indexList[3],
            moves: [keys.move[indexList[4]], keys.move[indexList[5]], keys.move[indexList[6]], keys.move[indexList[7]]],
        };
    };

    function importTeam() {
        try {
            const chunks = teamCode.split("!");

            const loadedCards = chunks.map(decodeChunk).map((card) => ({
                pokemon: pokemon[card.pokemon] || nullPokemon,
                ability: abilities[card.ability] || nullAbility,
                item: items[card.item] || nullItem,
                form: card.form,
                moves: card.moves.map((m) => moves[m] || nullMove),
            }));

            setCards(loadedCards);
            alert("Team imported successfully!");
        } catch (error) {
            console.error("Import error:", error);
            alert("Invalid team code! Please check and try again.");
        }
    }

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
                            <PokemonCard key={index} data={cards[index]} update={(c) => updateCards(index, c)} />
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
                                        {nonMutantTypes.map((type) => (
                                            <tr
                                                key={type}
                                                className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <TypeBadge type1={type} />
                                                    </div>
                                                </td>
                                                {cards.map((card, index) => (
                                                    <DefTableCell key={index} type={type} card={card} />
                                                ))}
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
                                        {pokemonTypes.map((type) => (
                                            <tr
                                                key={type}
                                                className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <TypeBadge type1={type} />
                                                    </div>
                                                </td>
                                                {cards.map((card, index) => (
                                                    <AtkTableCell key={index} type={type} card={card} />
                                                ))}
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
