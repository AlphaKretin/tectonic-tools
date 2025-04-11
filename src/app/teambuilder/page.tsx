"use client";

import InlineLink from "@/components/InlineLink";
import InternalLink from "@/components/InternalLink";
import TypeBadge from "@/components/TypeBadge";
import type { NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import { pokemonTypes } from "../data/basicData";
import { nullMove } from "../data/moves";
import { nullPokemon } from "../data/pokemon";
import { Move } from "../data/types/Move";
import { Pokemon } from "../data/types/Pokemon";
import PokemonCard from "./components/PokemonCard";
import TableCell from "./components/TableCell";
import TableHeader from "./components/TableHeader";
import TotalCell from "./components/WeakCell";

export interface CardData {
    pokemon: Pokemon;
    moves: Move[];
}

const nullCard = {
    pokemon: nullPokemon,
    moves: Array(4).fill(nullMove),
};

const TeamBuilder: NextPage = () => {
    const [cards, setCards] = useState<CardData[]>(Array(6).fill(nullCard));

    function updateCards(index: number, card: CardData) {
        const newCards = [...cards];
        newCards[index] = card;
        setCards(newCards);
    }

    // Mutant type is secret and irrelevant to defensive matchups
    const nonMutantTypes = pokemonTypes.slice(0, pokemonTypes.length - 1);

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
                        This tool is a work in progress! It is currently in the first stages of construction. See the
                        to-do list and contribute on{" "}
                        <InlineLink url="https://github.com/AlphaKretin/tectonic-tools">GitHub</InlineLink>.
                    </p>
                    <p>
                        <InternalLink url="../">Return to homepage</InternalLink>
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 w-full">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <PokemonCard key={index} data={cards[index]} update={(c) => updateCards(index, c)} />
                        ))}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Defensive Matchups</h2>
                    <table className="table-auto border-collapse border border-gray-400 mt-8">
                        <thead>
                            <tr>
                                <th className="border border-gray-400 px-4 py-2 text-center">Type</th>
                                {cards.map((_, index) => (
                                    <th key={index} className="border border-gray-400 px-4 py-2 text-center">
                                        <TableHeader pokemon={cards[index].pokemon} />
                                    </th>
                                ))}
                                <th className="border border-gray-400 px-4 py-2 text-center">Total Weak</th>
                                <th className="border border-gray-400 px-4 py-2 text-center">Total Resist</th>
                            </tr>
                        </thead>
                        <tbody>
                            {nonMutantTypes.map((type) => (
                                <tr key={type}>
                                    <td className="border border-gray-400 px-4 py-2 text-center">
                                        <TypeBadge type1={type} />
                                    </td>
                                    {cards.map((card, index) => (
                                        <TableCell key={index} type={type} pokemon={card.pokemon} />
                                    ))}
                                    {/* Total Weak */}
                                    <TotalCell cards={cards} type={type} total="weak" />

                                    {/* Total Resist */}
                                    <TotalCell cards={cards} type={type} total="strong" />
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
};

export default TeamBuilder;
