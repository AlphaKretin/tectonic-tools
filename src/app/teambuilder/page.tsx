"use client";

import InlineLink from "@/components/InlineLink";
import InternalLink from "@/components/InternalLink";
import type { NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import { nullMove } from "../data/moves";
import { nullPokemon } from "../data/pokemon";
import { Move } from "../data/types/Move";
import { Pokemon } from "../data/types/Pokemon";
import PokemonCard from "./components/PokemonCard";

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
                </div>
            </main>
        </div>
    );
};

export default TeamBuilder;
