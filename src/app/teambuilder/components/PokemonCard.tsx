"use client";

import { moves, nullMove } from "@/app/data/moves";
import { nullPokemon, pokemon } from "@/app/data/pokemon";
import { Move } from "@/app/data/types/Move";
import { Pokemon } from "@/app/data/types/Pokemon";
import { isNull } from "@/app/data/util";
import Dropdown from "@/components/DropDown";
import TypeBadge from "@/components/TypeBadge";
import Image from "next/image";
import { useState } from "react";

export default function PokemonCard() {
    const [currentPokemon, setCurrentPokemon] = useState<Pokemon>(nullPokemon);
    const [currentMoves, setCurrentMoves] = useState<Move[]>(Array(4).fill(nullMove));
    return (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 flex flex-col items-center w-60">
            <Dropdown value={currentPokemon.id} onChange={(e) => setCurrentPokemon(pokemon[e.target.value])}>
                <option value="">Select Pokémon</option>
                {Object.values(pokemon).map((p) => (
                    <option key={p.id} value={p.id}>
                        {p.name}
                    </option>
                ))}
            </Dropdown>
            {!isNull(currentPokemon) && (
                <div>
                    <div className="text-center flex flex-col items-center">
                        <Image
                            src={currentPokemon.getImage()}
                            alt={currentPokemon.name}
                            height="160"
                            width="160"
                            className="my-2"
                        />
                        <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{currentPokemon.name}</p>
                        <TypeBadge type1={currentPokemon.type1} type2={currentPokemon.type2} />
                    </div>
                    <div className="w-full mt-4">
                        {Array.from({ length: 4 }).map((_, moveIndex) => (
                            <div key={moveIndex} className="flex items-center space-x-2">
                                <div className="flex-1">
                                    <Dropdown
                                        onChange={(e) => {
                                            const newMoves = [...currentMoves];
                                            const moveId = e.target.value;
                                            if (moveId in moves) {
                                                newMoves[moveIndex] = moves[moveId];
                                            } else {
                                                newMoves[moveIndex] = nullMove;
                                            }

                                            setCurrentMoves(newMoves);
                                        }}
                                        value={currentMoves[moveIndex].id}
                                    >
                                        <option value="">Select Move {moveIndex + 1}</option>
                                        {currentPokemon.allMoves().map((m) => (
                                            <option key={m.id} value={m.id}>
                                                {m.name}
                                            </option>
                                        ))}
                                    </Dropdown>
                                </div>
                                <div className="w-12 flex justify-center">
                                    {!isNull(currentMoves[moveIndex]) && (
                                        <TypeBadge type1={currentMoves[moveIndex].type} />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
